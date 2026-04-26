"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LiveChart } from "@/components/charts/LiveChart";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { GraphExplainerModal } from "@/components/ai/GraphExplainerModal";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { useSignalProcessing } from "@/hooks/useSignalProcessing";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";
import { Target, Info, Download, Sparkles, Brain, Cpu, Activity } from "lucide-react";
import { SENSOR_QUIZZES } from "@/config/quizzes";

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 50;

const THEORY = {
    physics: `The Inductive Proximity Sensor detects metallic objects without physical contact. It generates an oscillating electromagnetic field.`,
    math: `**Eddy Currents:** When metal enters the field, eddy currents are induced in the metal, which dampens the oscillator's amplitude.`,
    circuit: `**NPN/PNP Output:** These sensors typically act as an open-collector switch (Active LOW or HIGH depending on model).`
};

const EXPERIMENTS = [
    {
        title: "Metal Detection Test",
        instruction: "Bring a screwdriver head near the sensor face.",
        observation: "LED turns on at ~4mm distance.",
        expected: "Shows detection of ferrous metals."
    }
];

const COMMON_MISTAKES = [
    {
        title: "Non-Metallic Objects",
        symptom: "Sensor fails to trigger with plastic or wood.",
        cause: "Inductive sensors only work with metals (conductive materials).",
        fix: "Use a capacitive sensor for non-metals."
    }
];

const ARDUINO_CODE = `// Proximity Sensor
#define PROX_PIN 8

void setup() {
  Serial.begin(115200);
  pinMode(PROX_PIN, INPUT_PULLUP);
}

void loop() {
  if (digitalRead(PROX_PIN) == LOW) {
    Serial.println("Metal Detected!");
  }
  delay(100);
}`;

export default function ProximityPage() {
    const { isConnected, data } = useSocket();
    const [history, setHistory] = useState<DataPoint[]>([]);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);
    const [calibrationOffset, setCalibrationOffset] = useState(0);

    // 1. Raw Input
    const rawVal = data?.sensors.proximity?.active ? 1 : 0;

    // 2. Fault Injection
    const { injectedValue, fault, setFault } = useFaultInjector(rawVal);

    // 3. Calibration
    const calibratedValue = (typeof injectedValue === 'number') ? injectedValue + calibrationOffset : injectedValue;

    // 4. Signal Processing
    const { filter, setFilter, processedData } = useSignalProcessing(history.map(d => d.value));

    useEffect(() => {
        if (data && typeof calibratedValue === 'number') {
            const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false, minute: "2-digit", second: "2-digit" });
            setHistory((prev) => [...prev, { time: timestamp, value: calibratedValue }].slice(-MAX_DATA_POINTS));
        }
    }, [data, calibratedValue]);

    const chartData = history.map((point, i) => ({
        ...point,
        processingValue: processedData[i]
    }));

    const anomalies = useMistakeDetector({
        sensorName: "Proximity Sensor",
        data: history,
        expectedRange: { min: 0, max: 1 }
    }).filter((_, i) => !dismissedAnomalies.includes(i));

    const isDetected = (typeof calibratedValue === "number") ? calibratedValue > 0.5 : false;

    const exportCSV = () => {
        const csv = "Time,Proximity (State),Processed\n" + chartData.map(d => `${d.time},${d.value},${d.processingValue ?? ''}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "proximity_data.csv"; a.click(); URL.revokeObjectURL(url);
    };

    return (
        <>
            <SensorDetailLayout
                title="Proximity Sensor"
                description="Detects metallic objects via electromagnetic induction."
                sensorId="LJ12A3-4-Z" isReal={!!data?.sensors?.proximity?.isReal}
                dataSnippet={{ status: isDetected ? "Detected" : "Clear", pin: "D8" }}
                theory={THEORY as any}
                arduinoCode={ARDUINO_CODE}
                experiments={EXPERIMENTS}
                commonMistakes={COMMON_MISTAKES}
                testingProps={{
                    showPanel: showTestingPanel,
                    setShowPanel: setShowTestingPanel,
                    renderPanel: () => (
                        <TestingControlPanel
                            faultType={fault.type} setFault={setFault}
                            filterType={filter.type} setFilter={setFilter}
                            calibrationOffset={calibrationOffset} setCalibrationOffset={setCalibrationOffset}
                        />
                    )
                }}
            >
                {anomalies.map((anomaly, i) => (
                    <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />
                ))}

                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${isDetected ? "bg-violet-500/30 animate-pulse" : "bg-slate-500/20"} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2`} />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className={`h-14 w-14 mb-3 rounded-full flex items-center justify-center ring-1 ${isDetected ? "bg-violet-500/20 ring-violet-500/50" : "bg-slate-500/10 ring-slate-500/20"}`}>
                                <Target className={`h-7 w-7 ${isDetected ? "text-violet-400" : "text-slate-400"}`} />
                            </div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Metal Proximity</span>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-4xl font-bold tracking-tighter ${isDetected ? "text-violet-400" : (fault.type !== 'none' ? 'text-amber-400' : 'text-white')}`}>
                                    {isDetected ? "NEAR" : "FAR"}
                                </span>
                            </div>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-4">{isConnected ? "Active" : "Offline"}</Badge>
                        </CardContent>
                    </Card>

                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-violet-400" />Activity History</CardTitle>
                            <div className="flex gap-2">
                                <button onClick={() => setShowExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                                <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"><Download size={12} />CSV</button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <LiveChart data={chartData} color="#8b5cf6" gradientId="proxGrad" unit="" height={220} minDomain={-0.1} maxDomain={1.1} type="stepAfter" />
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-xl text-white font-medium hover:from-violet-500/30 hover:to-purple-500/30 transition">
                        <Brain className="h-5 w-5 text-violet-400" /> Test Knowledge
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <SpecRow label="Sense Distance" value="4mm ±10%" />
                            <SpecRow label="Type" value="Inductive NPN" />
                        </CardContent>
                    </Card>
                    <Card variant="default">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-white/10 text-slate-500"><th className="py-1.5 text-left">Pin</th><th className="py-1.5 text-left">Arduino</th></tr></thead>
                                <tbody className="divide-y divide-white/5">
                                    <tr><td className="py-1.5 font-mono text-white">VCC</td><td className="py-1.5 font-mono text-violet-400">5-36V</td></tr>
                                    <tr><td className="py-1.5 font-mono text-white">OUT</td><td className="py-1.5 font-mono text-violet-400">D8</td></tr>
                                    <tr><td className="py-1.5 font-mono text-white">GND</td><td className="py-1.5 font-mono text-violet-400">GND</td></tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            </SensorDetailLayout>

            {showQuiz && <AIQuizModal sensorName="Proximity Sensor" sensorId="LJ12A3" onClose={() => setShowQuiz(false)} defaultQuestions={SENSOR_QUIZZES["proximity"]} />}
            {showExplainer && <GraphExplainerModal sensorName="Proximity Sensor" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}

const SpecRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>
);
