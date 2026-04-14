"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LiveChart } from "@/components/charts/LiveChart";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Activity, Cpu, Info, CloudFog, Download, Sparkles, Brain } from "lucide-react";
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
    "physics": `**MQ2 Gas Sensor**

**How It Works:**
MQ2 uses a tin oxide semiconductor layer that changes resistance when exposed to gas. The higher the gas concentration, the lower the resistance. Output is measured as analog voltage (0-5V).

**Sensor Types:**
MQ2 detects multiple gases: LPG (Liquefied Petroleum Gas), Methane, Smoke, Alcohol, Propane, and Hydrogen. Typical sensitivity range: 50-900 ppm for most gases.`,
    "math": "**Calibration:**\nMQ2 requires warm-up time (1-2 minutes) and calibration in clean air. Resistance in clean air (R0) is used as reference for calculating gas concentration.",
    "circuit": "**Hardware Architecture:**\n- **Response Time:** Response time typically 10-15 seconds to reach 90% reading. Recovery time varies by gas type. Device requires heat (heating coil) for operation (~500mW power)."
};

const EXPERIMENTS = [
    {
        "title": "Detect Smoke",
        "instruction": "Test MQ2 response to smoke and measure sensitivity. Place sensor in clean air. Light incense stick and hold smoke near sensor. Record reading changes.",
        "observation": "Rapid increase in readings with smoke, slow recovery to baseline.",
        "expected": "Response time typically 10-15 seconds."
    }
];

const COMMON_MISTAKES = [
    {
        "title": "Not allowing sensor warm-up time",
        "symptom": "Readings are unreliable.",
        "cause": "MQ2 needs 1-2 minutes warm-up after power-on.",
        "fix": "Always wait before taking measurements."
    },
    {
        "title": "Skipping calibration",
        "symptom": "Incorrect ppm calculations.",
        "cause": "Baseline R0 not established.",
        "fix": "Must calibrate in clean air to establish R0 baseline."
    },
    {
        "title": "Ignoring humidity effects",
        "symptom": "High humidity can cause false positives.",
        "cause": "Environmental factors influence reading.",
        "fix": "Use compensated readings or environmental corrections."
    },
    {
        "title": "Not powering heating coil",
        "symptom": "Doesn't work.",
        "cause": "MQ2 has internal heating element which must be powered.",
        "fix": "Verify pins: AO (analog), DO (digital), VCC, GND all connected."
    }
];

const ARDUINO_CODE = `// Gas Sensor - MQ2
#define MQ2_PIN A0

void setup() {
  Serial.begin(115200);
  Serial.println("MQ2 preheating...");
  delay(20000);
  Serial.println("Ready!");
}

void loop() {
  int gasValue = analogRead(MQ2_PIN);
  Serial.print("Gas: ");
  Serial.println(gasValue);
  delay(1000);
}`;

export default function MQ2Page() {
    const { isConnected, data } = useSocket();
    const [history, setHistory] = useState<DataPoint[]>([]);

    // Testing & AI State
    const [showQuiz, setShowQuiz] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);
    const [calibrationOffset, setCalibrationOffset] = useState(0);

    const rawValFromSocket = data?.sensors.mq2?.raw ?? 150;
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
                title="Gas Sensor (MQ2)" 
                description="General purpose gas sensor for Smoke, LPG, etc." 
                sensorId="mq2" 
                dataSnippet={{ value: displayValue, pin: "A0" }} 
                theory={THEORY} 
                arduinoCode={ARDUINO_CODE} 
                experiments={EXPERIMENTS} 
                commonMistakes={COMMON_MISTAKES} 
                isReal={!!data?.sensors?.mq2?.isReal}
                testingProps={{ 
                    showPanel: showTestingPanel, 
                    setShowPanel: setShowTestingPanel, 
                    renderPanel: () => <TestingControlPanel faultType={fault.type} setFault={setFault} filterType={filter.type} setFilter={setFilter} calibrationOffset={calibrationOffset} setCalibrationOffset={setCalibrationOffset} /> 
                }}
            >
                {anomalies.map((anomaly, i) => <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />)}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl" />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="h-14 w-14 mb-3 rounded-full bg-orange-500/10 flex items-center justify-center ring-1 ring-orange-500/20"><CloudFog className="h-7 w-7 text-orange-400" /></div>
                            <span className="text-xs text-slate-500 uppercase mb-1">Gas Level</span>
                            <span className={`text-4xl font-bold ${fault.type !== 'none' ? 'text-orange-300' : 'text-white'}`}>{displayValue}</span>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            {calibrationOffset !== 0 && <span className="text-xs text-indigo-400 mt-1">Offset: {calibrationOffset > 0 ? '+' : ''}{calibrationOffset}</span>}
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-orange-400" />Gas Concentration History</CardTitle>
                            <div className="flex gap-2">
                                <button onClick={() => setShowExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                                <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"><Download size={12} />CSV</button>
                            </div>
                        </CardHeader>
                        <CardContent><LiveChart data={chartData} color="#f97316" gradientId="mq2Grad" unit="" height={220} minDomain={0} maxDomain={1023} /></CardContent>
                    </Card>
                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-xl text-white font-medium hover:from-orange-500/30 hover:to-amber-500/30 transition">
                        <Brain className="h-5 w-5 text-orange-400" /> Test Knowledge</button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><SpecRow label="Target" value="Smoke, LPG, etc" /><SpecRow label="Range" value="50-900 ppm" /></CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">A0</td><td className="py-1.5 font-mono text-orange-400">A0</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Gas Sensor" sensorId="MQ2" onClose={() => setShowQuiz(false)} defaultQuestions={SENSOR_QUIZZES["mq2"] as any} />}
            {showExplainer && <GraphExplainerModal sensorName="Gas Sensor" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
