"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LiveChart } from "@/components/charts/LiveChart";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Activity, Cpu, Info, Wine, Download, Sparkles, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { GraphExplainerModal } from "@/components/ai/GraphExplainerModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { useSignalProcessing } from "@/hooks/useSignalProcessing";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 50;

const THEORY = {
    physics: `The MQ3 is optimized for **ethanol (alcohol)** detection.

**Same principle as MQ2 (Chemiresistor):**
• SnO₂ heated to ~200°C.
• Alcohol molecules react with adsorbed oxygen.
• Resistance drops when alcohol present.

MQ3's formulation is tuned for ethanol sensitivity.`,
    math: `**Resistance Relationship:**
Rs / R₀ = A × (ppm)^B

Detection range: 0.04 - 4 mg/L breath alcohol.
Legal limit (0.08% BAC) ≈ 0.35 mg/L.`,
};

const ARDUINO_CODE = `// Alcohol Sensor - MQ3
#define MQ3_PIN A2

void setup() {
  Serial.begin(115200);
  Serial.println("MQ3 preheating...");
  delay(20000);
  Serial.println("Ready!");
}

void loop() {
  int alcoholValue = analogRead(MQ3_PIN);
  Serial.print("Alcohol: ");
  Serial.println(alcoholValue);
  delay(1000);
}`;

const EXPERIMENTS = [
    { title: "Baseline", instruction: "Note the reading in clean air after warm-up.", observation: "What's the baseline?", expected: "100-300 in clean air." },
    { title: "Hand Sanitizer", instruction: "Apply hand sanitizer 30cm away and note the spike.", observation: "How sensitive is it?", expected: "Alcohol vapor should spike the reading significantly." }
];

const COMMON_MISTAKES = [
    { title: "Value keeps drifting", symptom: "Value won't stabilize", cause: "Alcohol residue or preheating", fix: "Ventilate the area fresh air. Wait 5 mins for heater to stabilize." },
    { title: "Always Max Value", symptom: "Stuck at 1023", cause: "Short circuit or saturation", fix: "Move away from alcohol source. Check wiring for shorts." }
];

export default function MQ3Page() {
    const { isConnected, data } = useSocket();
    const [history, setHistory] = useState<DataPoint[]>([]);

    // Testing & AI State
    const [showQuiz, setShowQuiz] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);
    const [calibrationOffset, setCalibrationOffset] = useState(0);

    const rawValFromSocket = data?.sensors.mq3?.value ?? 0;
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
    const anomalies = useMistakeDetector({ sensorName: "Alcohol Sensor", data: history, expectedRange: { min: 50, max: 900 } }).filter((_, i) => !dismissedAnomalies.includes(i));
    const displayValue = (typeof calibratedValue === "number") ? calibratedValue.toFixed(0) : "--";

    const exportCSV = () => {
        const csv = "Time,Alcohol (ADC),Processed\n" + chartData.map(d => `${d.time},${d.value},${d.processingValue ?? ''}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "alcohol_data.csv"; a.click();
    };

    return (
        <>
            <SensorDetailLayout title="Alcohol Sensor (MQ3)" description="Chemiresistor optimized for ethanol vapor detection." sensorId="MQ3" dataSnippet={{ value: displayValue, pin: "A2" }} theory={THEORY} arduinoCode={ARDUINO_CODE} experiments={EXPERIMENTS} commonMistakes={COMMON_MISTAKES} testingProps={{ showPanel: showTestingPanel, setShowPanel: setShowTestingPanel, renderPanel: () => <TestingControlPanel faultType={fault.type} setFault={setFault} filterType={filter.type} setFilter={setFilter} calibrationOffset={calibrationOffset} setCalibrationOffset={setCalibrationOffset} /> }}>
                {anomalies.map((anomaly, i) => <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />)}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl" />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="h-14 w-14 mb-3 rounded-full bg-amber-500/10 flex items-center justify-center ring-1 ring-amber-500/20"><Wine className="h-7 w-7 text-amber-400" /></div>
                            <span className="text-xs text-slate-500 uppercase mb-1">Alcohol Level</span>
                            <span className={`text-4xl font-bold ${fault.type !== 'none' ? 'text-amber-300' : 'text-white'}`}>{displayValue}</span>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            {calibrationOffset !== 0 && <span className="text-xs text-indigo-400 mt-1">Offset: {calibrationOffset > 0 ? '+' : ''}{calibrationOffset}</span>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-3">{isConnected ? "Live" : "Offline"}</Badge>
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-amber-400" />Alcohol History</CardTitle>
                            <div className="flex gap-2">
                                <button onClick={() => setShowExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                                <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"><Download size={12} />CSV</button>
                            </div>
                        </CardHeader>
                        <CardContent><LiveChart data={chartData} color="#f59e0b" gradientId="mq3Grad" unit="" height={220} minDomain={0} maxDomain={1023} /></CardContent>
                    </Card>
                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-white font-medium hover:from-amber-500/30 hover:to-orange-500/30 transition">
                        <Brain className="h-5 w-5 text-amber-400" /> Test Knowledge
                    </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><SpecRow label="Target" value="Ethanol" /><SpecRow label="Range" value="0.04-4 mg/L" /></CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">A0</td><td className="py-1.5 font-mono text-amber-400">A2</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Alcohol Sensor" sensorId="MQ3" onClose={() => setShowQuiz(false)} />}
            {showExplainer && <GraphExplainerModal sensorName="Alcohol Sensor" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
