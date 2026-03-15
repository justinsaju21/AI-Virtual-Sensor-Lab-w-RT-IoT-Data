"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LiveChart } from "@/components/charts/LiveChart";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Activity, Cpu, Info, Flame, Download, Sparkles, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { GraphExplainerModal } from "@/components/ai/GraphExplainerModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { useSignalProcessing } from "@/hooks/useSignalProcessing";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 50;

const THEORY = {
    "physics": "The MQ-2 is an electro-chemical gas sensor (Chemiresistor) designed to detect combustible gases like LPG, Propane, Methane, and general smoke. At its core is a micro-tubular ceramic structure coated with Tin Dioxide (SnO₂), enclosed in stainless steel mesh. An internal heating coil warms the SnO₂ to approximately 200°C. In clean air, oxygen molecules adsorb onto the SnO₂ surface, trapping electrons and maintaining high electrical resistance. When combustible gases are present, they react with the adsorbed oxygen, releasing the trapped electrons back into the conduction band, which rapidly drops the sensor's internal resistance.",
    "math": "**Resistance to PPM Conversion:**\nThe relationship between gas concentration (ppm) and sensor resistance is logarithmic.\n\n$ R_s / R_0 = A \\cdot (ppm)^B $\n\nWhere:\n- $R_s$: Sensor resistance at a given gas concentration.\n- $R_0$: Sensor resistance in clean air.\n- $A$ & $B$: Gas-specific constants derived from the datasheet's sensitivity curves.",
    "circuit": "**Hardware Architecture:**\n- **Heater (H pins):** Draws ~800mW at 5V to maintain the 200°C reaction temperature.\n- **Sensing Element (A/B pins):** Forms a voltage divider with an external load resistor ($R_L$, typically 5k-47k\\Omega).\n- **Comparator:** Like most modules, an onboard LM393 chip compares the analog voltage against a potentiometer-set threshold to trigger a digital HIGH alert."
};
const EXPERIMENTS = [
    {
        "title": "Butane Gas Test (Unlit Lighter)",
        "instruction": "Press a standard butane lighter button WITHOUT striking the flint so only unlit gas escapes. Hold 2cm from the metal mesh for 2 seconds.",
        "observation": "Analog reading immediately spikes from ~150 to 600+ within 1–2 seconds.",
        "expected": "Confirms the SnO₂ reaction to butane gas. Removing the lighter shows the reading slowly returns to baseline as gas dissipates."
    },
    {
        "title": "Warm-Up Heat Observation",
        "instruction": "Lightly touch the metal mesh case with a finger 5 minutes after powering on.",
        "observation": "The metal case will be distinctly warm to the touch.",
        "expected": "The internal heating coil draws ~150mA to maintain ceramic core at operating temperature (~300°C internal). This heat is necessary for the reaction."
    }
];

const COMMON_MISTAKES = [
    {
        "title": "Inaccurate PPM Readings",
        "symptom": "Students try to convert 0–1023 directly to Parts Per Million but get wildly wrong results.",
        "cause": "The MQ-2 output is highly non-linear and extremely sensitive to ambient temperature and humidity.",
        "fix": "Use relative thresholds: Baseline ≈ 100, Warning ≈ 400+. True PPM calibration requires logarithmic curves."
    },
    {
        "title": "Sensor Baseline Drifts Downward Over Hours",
        "symptom": "Fresh out of the box, readings are 500+ in clean air. After days of use, they stabilize lower.",
        "cause": "Brand-new sensors have moisture and manufacturing impurities on the SnO₂ layer that burn off slowly.",
        "fix": "Leave the sensor powered on at 5V continuously for 24–48 hours ('burn-in') to bake off impurities and stabilize the baseline."
    }
];


const ARDUINO_CODE = `// Gas Sensor - MQ2
#define MQ2_PIN A0

void setup() {
  Serial.begin(115200);
  Serial.println("MQ2 preheating...");
  delay(20000); // 20 second preheat
  Serial.println("Ready!");
}

void loop() {
  int gasValue = analogRead(MQ2_PIN);
  
  Serial.print("Gas Level: ");
  Serial.println(gasValue);
  
  if (gasValue > 400) {
    Serial.println("WARNING: High gas!");
  }
  delay(1000);
}`;

const EXPERIMENTS = [
    {
        title: "Preheat and Baseline",
        instruction: "Wait 2-3 minutes for the sensor to warm up. Note the baseline reading in clean air.",
        observation: "What's the stable baseline value?",
        expected: "Baseline typically 100-300 in clean air. Sensor needs heating to operate correctly."
    },
    {
        title: "Lighter Gas Test (Caution!)",
        instruction: "Briefly release gas from a lighter (unlit!) near the sensor from 10cm away.",
        observation: "How quickly does the value rise? How high?",
        expected: "LPG should cause a rapid spike to 600-900+. Value should return to baseline after 30-60s."
    }
];



export default function GasPage() {
    const { isConnected, data } = useSocket();
    const [history, setHistory] = useState<DataPoint[]>([]);

    // Testing & AI State
    const [showQuiz, setShowQuiz] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);
    const [calibrationOffset, setCalibrationOffset] = useState(0);

    const rawValFromSocket = data?.sensors.mq2?.raw ?? 0;
    const { injectedValue, fault, setFault } = useFaultInjector(rawValFromSocket);
    const calibratedValue = (typeof injectedValue === 'number') ? injectedValue + calibrationOffset : injectedValue;
    const { filter, setFilter, processedData } = useSignalProcessing(history.map(d => d.value));

    useEffect(() => {
        if (data && typeof calibratedValue === 'number') {
            const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false, minute: "2-digit", second: "2-digit" });
            setHistory((prev) => [...prev, { time: timestamp, value: calibratedValue }].slice(-MAX_DATA_POINTS));
        }
    }, [data, calibratedValue]);

    const chartData = history.map((point, i) => ({ ...point, processingValue: processedData[i] }));
    const anomalies = useMistakeDetector({ sensorName: "Gas Sensor", data: history, expectedRange: { min: 50, max: 900 } }).filter((_, i) => !dismissedAnomalies.includes(i));
    const displayValue = (typeof calibratedValue === "number") ? calibratedValue.toFixed(0) : "--";

    const exportCSV = () => {
        const csv = "Time,Gas (ADC),Processed\n" + chartData.map(d => `${d.time},${d.value},${d.processingValue ?? ''}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "gas_data.csv"; a.click(); URL.revokeObjectURL(url);
    };

    return (
        <>
            <SensorDetailLayout
                title="Gas Sensor (Smoke/LPG)"
                description="Chemiresistor detecting combustible gases via SnO₂ redox reaction."
                sensorId="MQ2"
                dataSnippet={{ value: displayValue, pin: "A0" }}
                theory={THEORY}
                arduinoCode={ARDUINO_CODE}
                experiments={EXPERIMENTS}
                commonMistakes={COMMON_MISTAKES}
                testingProps={{ showPanel: showTestingPanel, setShowPanel: setShowTestingPanel, renderPanel: () => <TestingControlPanel faultType={fault.type} setFault={setFault} filterType={filter.type} setFilter={setFilter} calibrationOffset={calibrationOffset} setCalibrationOffset={setCalibrationOffset} /> }}
            >
                {anomalies.map((anomaly, i) => <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />)}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="h-14 w-14 mb-3 rounded-full bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/20"><Flame className="h-7 w-7 text-red-400" /></div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Gas Level</span>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-5xl font-bold tracking-tighter ${fault.type !== 'none' ? 'text-amber-400' : 'text-white'}`}>{displayValue}</span>
                            </div>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            {calibrationOffset !== 0 && <span className="text-xs text-indigo-400 mt-1">Offset: {calibrationOffset > 0 ? '+' : ''}{calibrationOffset}</span>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-3">{isConnected ? "Live" : "Offline"}</Badge>
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-red-400" />Gas History</CardTitle>
                            <div className="flex gap-2">
                                <button onClick={() => setShowExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                                <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"><Download size={12} />CSV</button>
                            </div>
                        </CardHeader>
                        <CardContent><LiveChart data={chartData} color="#ef4444" gradientId="gasGrad" unit="" height={220} minDomain={0} maxDomain={1023} /></CardContent>
                    </Card>
                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl text-white font-medium hover:from-red-500/30 hover:to-orange-500/30 transition">
                        <Brain className="h-5 w-5 text-red-400" /> Take AI Quiz on Gas Sensors
                    </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><SpecRow label="Detects" value="LPG, Smoke, CO" /><SpecRow label="Range" value="200-10,000 ppm" /><SpecRow label="Preheat" value="~20 seconds" /></CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">VCC</td><td className="py-1.5 font-mono text-red-400">5V</td></tr><tr><td className="py-1.5 font-mono text-white">A0</td><td className="py-1.5 font-mono text-red-400">A0</td></tr><tr><td className="py-1.5 font-mono text-white">GND</td><td className="py-1.5 font-mono text-red-400">GND</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Gas Sensor" sensorId="MQ2" onClose={() = defaultQuestions={SENSOR_QUIZZES["gas"]} > setShowQuiz(false)} />}
            {showExplainer && <GraphExplainerModal sensorName="Gas Sensor" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
