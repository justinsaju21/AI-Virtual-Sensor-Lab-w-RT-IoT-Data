"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LiveChart } from "@/components/charts/LiveChart";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Activity, Cpu, Info, Heart, Download, Sparkles, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { GraphExplainerModal } from "@/components/ai/GraphExplainerModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { useSignalProcessing } from "@/hooks/useSignalProcessing";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 100;

const THEORY = {
    physics: `Heartbeat sensors use **Photoplethysmography (PPG)**.

**How PPG Works:**
1. LED shines light into skin tissue.
2. Blood absorbs light; more blood = more absorption.
3. With each heartbeat, arteries expand, absorbing more light.
4. Photodiode measures reflected light intensity.
5. Variation in signal = heart rate.

**Why Green Light?**
Green (~530nm) is well absorbed by hemoglobin.`,
    math: `**BPM Calculation:**
BPM = 60 / (Time between peaks in seconds)

Example: Peaks every 0.8s → BPM = 75`,
};

const ARDUINO_CODE = `// Heartbeat Sensor - Pulse Sensor
#define PULSE_PIN A5

void setup() {
  Serial.begin(115200);
}

void loop() {
  int signal = analogRead(PULSE_PIN);
  Serial.println(signal);
  delay(20); // Fast sampling for waveform
}`;

const EXPERIMENTS = [
    { title: "Resting Heart Rate", instruction: "Place finger on sensor, wait 30s until stable.", observation: "What's your resting BPM?", expected: "Normal: 60-100 BPM at rest." }
];

const COMMON_MISTAKES = [
    { title: "No Heartbeat", symptom: "Flat line", cause: "Too much pressure squeezed out blood", fix: "Touch sensor gently. Don't press hard." },
    { title: "Noisy Signal", symptom: "Erratic spikes", cause: "Finger movement or ambient light", fix: "Keep finger steady. Shield from bright overhead light." }
];

export default function HeartbeatPage() {
    const { isConnected, data } = useSocket();
    const [history, setHistory] = useState<DataPoint[]>([]);

    // Testing & AI
    const [showQuiz, setShowQuiz] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);
    const [calibrationOffset, setCalibrationOffset] = useState(0);

    const rawVal = data?.sensors.heartbeat?.value ?? 0;
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
    const anomalies = useMistakeDetector({ sensorName: "Pulse Sensor", data: history, expectedRange: { min: 300, max: 900 } }).filter((_, i) => !dismissedAnomalies.includes(i));
    const displayValue = (typeof calibratedValue === "number") ? calibratedValue.toFixed(0) : "--";

    const exportCSV = () => {
        const csv = "Time,PPG,Processed\n" + chartData.map(d => `${d.time},${d.value},${d.processingValue ?? ''}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "heartbeat_data.csv"; a.click();
    };

    return (
        <>
            <SensorDetailLayout
                title="Heartbeat Sensor"
                description="Detects heart rate via photoplethysmography."
                sensorId="Pulse Sensor"
                dataSnippet={{ value: displayValue, pin: "A5" }}
                theory={THEORY}
                arduinoCode={ARDUINO_CODE}
                experiments={EXPERIMENTS}
                commonMistakes={COMMON_MISTAKES}
                testingProps={{ showPanel: showTestingPanel, setShowPanel: setShowTestingPanel, renderPanel: () => <TestingControlPanel faultType={fault.type} setFault={setFault} filterType={filter.type} setFilter={setFilter} calibrationOffset={calibrationOffset} setCalibrationOffset={setCalibrationOffset} /> }}
            >
                {anomalies.map((anomaly, i) => <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />)}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl" />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="h-14 w-14 mb-3 rounded-full bg-rose-500/10 flex items-center justify-center ring-1 ring-rose-500/20"><Heart className="h-7 w-7 text-rose-400 animate-pulse" /></div>
                            <span className="text-xs text-slate-500 uppercase mb-1">PPG Signal</span>
                            <span className={`text-5xl font-bold ${fault.type !== 'none' ? 'text-amber-300' : 'text-white'}`}>{displayValue}</span>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-3">{isConnected ? "Live" : "Offline"}</Badge>
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-rose-400" />PPG Waveform</CardTitle>
                            <div className="flex gap-2">
                                <button onClick={() => setShowExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                                <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"><Download size={12} />CSV</button>
                            </div>
                        </CardHeader>
                        <CardContent><LiveChart data={chartData} color="#f43f5e" gradientId="heartGrad" unit="" height={220} minDomain={400} maxDomain={800} /></CardContent>
                    </Card>
                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500/20 to-red-500/20 border border-pink-500/30 rounded-xl text-white font-medium hover:from-pink-500/30 hover:to-red-500/30 transition">
                        <Brain className="h-5 w-5 text-rose-400" /> Quiz: Photoplethysmography
                    </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><SpecRow label="Method" value="PPG" /><SpecRow label="LED" value="Green ~530nm" /></CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">Signal</td><td className="py-1.5 font-mono text-rose-400">A5</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Heartbeat Sensor" sensorId="Pulse" onClose={() => setShowQuiz(false)} />}
            {showExplainer && <GraphExplainerModal sensorName="Heartbeat Sensor" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
