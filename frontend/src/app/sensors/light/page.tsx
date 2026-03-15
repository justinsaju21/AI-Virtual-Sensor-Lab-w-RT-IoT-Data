"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LiveChart } from "@/components/charts/LiveChart";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Activity, Cpu, Info, Sun, Download, Sparkles, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { GraphExplainerModal } from "@/components/ai/GraphExplainerModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { useSignalProcessing } from "@/hooks/useSignalProcessing";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";
import { SENSOR_QUIZZES } from "@/config/quizzes";

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 50;

const THEORY = {
    "physics": "The Light Dependent Resistor (LDR), or Photoresistor, is built upon a high-resistance semiconductor block, typically Cadmium Sulfide (CdS). CdS is a direct bandgap semiconductor. In darkness, it has very few free electrons, resulting in massive electrical resistance (up to 1M\\Omega). When photons of light possessing energy greater than the semiconductor's bandgap (2.42 eV for CdS) strike the material, they excite electrons from the valence band into the conduction band. This massive influx of free charge carriers drastically drops the material's resistance, often down to ~100\\Omega in bright sunlight.",
    "math": "**Photo-Resistance Equation:**\nThe relationship between illuminance (Lux) and LDR resistance is log-linear:\n\n$ R = A \\cdot E^{-\\alpha} $\n\nWhere:\n- $R$: Resistance (Ohms)\n- $E$: Illuminance (Lux)\n- $A, \\alpha$: Material-specific constants.\n\nTo map ADC value to approximated Lux:\n$ V_{out} = 5V \\times \\frac{R_{fixed}}{LDR + R_{fixed}} $",
    "circuit": "**Hardware Architecture:**\n- **Voltage Divider:** The LDR module inherently places the photoresistor in series with a fixed 10k\\Omega reference resistor. This configuration transforms the changing resistance into a changing voltage that a microcontroller can read.\n- **Comparator:** Most modules also include an LM393 operational amplifier configured as a comparator to provide a digital HIGH/LOW output when brightness crosses a potentiometer-defined threshold."
};
const EXPERIMENTS = [
    {
        "title": "Shadow Smoothness Test",
        "instruction": "Hold your hand above the sensor so it casts a solid shadow. Slowly move it away.",
        "observation": "The analog reading drops smoothly as the shadow falls and rises when the light returns.",
        "expected": "Unlike active IR sensors, the LDR measures purely ambient light energy — demonstrating continuous, smooth analog behavior."
    },
    {
        "title": "Color Spectral Response Test",
        "instruction": "Shine a red LED directly on the LDR and record the peak value. Then shine a blue LED of equal brightness.",
        "observation": "The LDR will register a significantly higher reading under red/yellow light than blue light.",
        "expected": "CdS cells have a spectral response curve that heavily favors Green–Yellow–Red (500–600nm). They are nearly blind to deep blue or UV light."
    }
];

const COMMON_MISTAKES = [
    {
        "title": "Raw LDR Floating Without Divider",
        "symptom": "Analog reading randomly floats around 300, or always 1023 regardless of light.",
        "cause": "Plugging a raw 2-leg LDR directly between 5V and A0 without a 10kΩ pull-down resistor creates an incomplete voltage divider.",
        "fix": "Connect a 10kΩ resistor from the A0 junction to GND to complete the voltage divider circuit."
    },
    {
        "title": "Slow Response Time",
        "symptom": "Takes almost a full second to recover to dark reading after flashlight is turned off.",
        "cause": "CdS material latency — inherent physics of the material; electrons take time to recombine after photo-excitation.",
        "fix": "This is unavoidable. For high-speed optical applications, use a PIN Photodiode instead."
    }
];


const ARDUINO_CODE = `// Light Sensor - LDR
#define LDR_PIN A4

void setup() {
  Serial.begin(115200);
}

void loop() {
  int lightValue = analogRead(LDR_PIN);
  
  Serial.print("Light Level: ");
  Serial.println(lightValue);
  
  delay(500);
}`;





export default function LightPage() {
    const { isConnected, data } = useSocket();
    const [history, setHistory] = useState<DataPoint[]>([]);
    const [showRaw, setShowRaw] = useState(true);

    // Testing & AI
    const [showQuiz, setShowQuiz] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);
    const [calibrationOffset, setCalibrationOffset] = useState(0);

    const rawVal = data?.sensors.ldr?.raw ?? 0;
    const { injectedValue, fault, setFault } = useFaultInjector(rawVal);
    const calibratedValue = (typeof injectedValue === 'number') ? injectedValue + calibrationOffset : injectedValue;
    const { filter, setFilter, processedData } = useSignalProcessing(history.map(d => d.value));

    useEffect(() => {
        if (data && typeof calibratedValue === 'number') {
            const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false, minute: "2-digit", second: "2-digit" });
            setHistory((prev) => [...prev, { time: timestamp, value: calibratedValue }].slice(-MAX_DATA_POINTS));
        }
    }, [data, calibratedValue]);

    const chartData = history.map((point, i) => ({ ...point, processingValue: processedData[i] }));
    const anomalies = useMistakeDetector({ sensorName: "Light Sensor", data: history, expectedRange: { min: 50, max: 950 } }).filter((_, i) => !dismissedAnomalies.includes(i));

    const displayValue = (typeof calibratedValue === "number") ? calibratedValue.toFixed(0) : "--";
    const percentage = typeof calibratedValue === "number" ? Math.round((calibratedValue / 1023) * 100) : "--";

    const exportCSV = () => {
        const csv = "Time,Light (raw),Processed\n" + chartData.map(d => `${d.time},${d.value},${d.processingValue ?? ''}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "light_data.csv"; a.click(); URL.revokeObjectURL(url);
    };

    return (
        <>
            <SensorDetailLayout
                title="Light Sensor (LDR)"
                description="Photoresistor that decreases resistance with increasing light intensity."
                sensorId="LDR / CdS Cell"
                dataSnippet={{ value: displayValue, unit: "raw", type: "Analog", pin: "A4" }}
                theory={THEORY}
                arduinoCode={ARDUINO_CODE}
                experiments={EXPERIMENTS}
                commonMistakes={COMMON_MISTAKES}
                testingProps={{ showPanel: showTestingPanel, setShowPanel: setShowTestingPanel, renderPanel: () => <TestingControlPanel faultType={fault.type} setFault={setFault} filterType={filter.type} setFilter={setFilter} calibrationOffset={calibrationOffset} setCalibrationOffset={setCalibrationOffset} /> }}
            >
                {anomalies.map((anomaly, i) => <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />)}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="h-14 w-14 mb-3 rounded-full bg-yellow-500/10 flex items-center justify-center ring-1 ring-yellow-500/20"><Sun className="h-7 w-7 text-yellow-400" /></div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{showRaw ? "Raw ADC" : "Light %"}</span>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-5xl font-bold tracking-tighter ${fault.type !== 'none' ? 'text-amber-300' : 'text-white'}`}>{showRaw ? displayValue : percentage}</span>
                                <span className="text-xl text-slate-500 font-medium">{showRaw ? "" : "%"}</span>
                            </div>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-3">{isConnected ? "Live" : "Offline"}</Badge>
                            <button onClick={() => setShowRaw(!showRaw)} className="mt-4 text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10">{showRaw ? "Show %" : "Show Raw"}</button>
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-yellow-400" />Light History</CardTitle>
                            <div className="flex gap-2">
                                <button onClick={() => setShowExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                                <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"><Download size={12} />CSV</button>
                            </div>
                        </CardHeader>
                        <CardContent><LiveChart data={chartData} color="#eab308" gradientId="lightGrad" unit="" height={220} minDomain={0} maxDomain={1023} /></CardContent>
                    </Card>
                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl text-white font-medium hover:from-yellow-500/30 hover:to-orange-500/30 transition">
                        <Brain className="h-5 w-5 text-yellow-400" /> Quiz: Photoconductivity
                    </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><SpecRow label="Type" value="Analog (10-bit ADC)" /><SpecRow label="Dark R" value="~1 MΩ" /><SpecRow label="Light R" value="~100Ω - 10kΩ" /></CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 text-white">LDR → 10kΩ → GND</td><td className="py-1.5 font-mono text-yellow-400">A4</td></tr><tr><td className="py-1.5 text-white">LDR → VCC</td><td className="py-1.5 font-mono text-yellow-400">5V</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Light Sensor" sensorId="LDR" onClose={() => setShowQuiz(false)} defaultQuestions={SENSOR_QUIZZES["light"]} />}
            {showExplainer && <GraphExplainerModal sensorName="Light Sensor" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
