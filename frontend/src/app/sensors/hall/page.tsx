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
import { Magnet, Info, Download, Sparkles, Brain, Cpu, Activity } from "lucide-react";
import { SENSOR_QUIZZES } from "@/config/quizzes";

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 50;

const THEORY = {
    physics: `The Hall Effect Sensor detects magnetic fields using the Hall effect principle. When a magnetic field is applied perpendicular to a current-carrying conductor, a voltage (Hall voltage) is generated across the conductor.`,
    math: `**Hall Voltage:** $ V_H = R_H \cdot (I \cdot B / d) $. Where $R_H$ is the Hall coefficient, $I$ is current, $B$ is magnetic flux density, and $d$ is thickness.`,
    circuit: `**Polarity Sensitivity:** Most Hall sensors are sensitive to either the South or North pole of a magnet, while some are omnipolar.`
};

const EXPERIMENTS = [
    {
        title: "Magnet Polarity Test",
        instruction: "Bring a magnet near the sensor face. Flip the magnet and try again.",
        observation: "Sensor triggers only for one side of the magnet (if unipolar).",
        expected: "Demonstrates sensitivity to magnetic field orientation."
    }
];

const COMMON_MISTAKES = [
    {
        title: "Weak Magnetic Field",
        symptom: "Sensor fails to trigger even when magnet is near.",
        cause: "Magnet is too weak or too far from the sensing element.",
        fix: "Use a stronger neodymium magnet or bring it closer."
    }
];

const ARDUINO_CODE = `// Hall Effect Sensor
#define HALL_PIN 3

void setup() {
  Serial.begin(115200);
  pinMode(HALL_PIN, INPUT);
}

void loop() {
  if (digitalRead(HALL_PIN) == LOW) {
    Serial.println("Magnet Detected!");
  }
  delay(100);
}`;

export default function HallPage() {
    const { isConnected, data } = useSocket();
    const [history, setHistory] = useState<DataPoint[]>([]);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);
    const [calibrationOffset, setCalibrationOffset] = useState(0);

    // 1. Raw Input
    const rawVal = data?.sensors.hall?.active ? 1 : 0;

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
        sensorName: "Hall Sensor",
        data: history,
        expectedRange: { min: 0, max: 1 }
    }).filter((_, i) => !dismissedAnomalies.includes(i));

    const isDetected = (typeof calibratedValue === "number") ? calibratedValue > 0.5 : false;

    const exportCSV = () => {
        const csv = "Time,Magnetic (State),Processed\n" + chartData.map(d => `${d.time},${d.value},${d.processingValue ?? ''}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "hall_data.csv"; a.click(); URL.revokeObjectURL(url);
    };

    return (
        <>
            <SensorDetailLayout
                title="Hall Effect Sensor"
                description="Detects magnetic fields and proximity of magnets."
                sensorId="KY-003" isReal={!!data?.sensors?.hall?.isReal}
                dataSnippet={{ status: isDetected ? "Magnetic" : "Normal", pin: "D3" }}
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
                        <div className={`absolute top-0 right-0 w-32 h-32 ${isDetected ? "bg-indigo-500/30 animate-pulse" : "bg-slate-500/20"} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2`} />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className={`h-14 w-14 mb-3 rounded-full flex items-center justify-center ring-1 ${isDetected ? "bg-indigo-500/20 ring-indigo-500/50" : "bg-slate-500/10 ring-slate-500/20"}`}>
                                <Magnet className={`h-7 w-7 ${isDetected ? "text-indigo-400" : "text-slate-400"}`} />
                            </div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Status</span>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-4xl font-bold tracking-tighter ${isDetected ? "text-indigo-400" : (fault.type !== 'none' ? 'text-amber-400' : 'text-white')}`}>
                                    {isDetected ? "MAGNETIC" : "CLEAR"}
                                </span>
                            </div>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-4">{isConnected ? "Active" : "Offline"}</Badge>
                        </CardContent>
                    </Card>

                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-indigo-400" />Magnetic Intensity</CardTitle>
                            <div className="flex gap-2">
                                <button onClick={() => setShowExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                                <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"><Download size={12} />CSV</button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <LiveChart data={chartData} color="#6366f1" gradientId="hallGrad" unit="" height={220} minDomain={-0.1} maxDomain={1.1} type="stepAfter" />
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 rounded-xl text-white font-medium hover:from-indigo-500/30 hover:to-violet-500/30 transition">
                        <Brain className="h-5 w-5 text-indigo-400" /> Test Knowledge
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <SpecRow label="Response Time" value="2μs" />
                            <SpecRow label="Type" value="Digital Switch" />
                        </CardContent>
                    </Card>
                    <Card variant="default">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-white/10 text-slate-500"><th className="py-1.5 text-left">Pin</th><th className="py-1.5 text-left">Arduino</th></tr></thead>
                                <tbody className="divide-y divide-white/5">
                                    <tr><td className="py-1.5 font-mono text-white">VCC</td><td className="py-1.5 font-mono text-indigo-400">5V</td></tr>
                                    <tr><td className="py-1.5 font-mono text-white">OUT</td><td className="py-1.5 font-mono text-indigo-400">D3</td></tr>
                                    <tr><td className="py-1.5 font-mono text-white">GND</td><td className="py-1.5 font-mono text-indigo-400">GND</td></tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            </SensorDetailLayout>

            {showQuiz && <AIQuizModal sensorName="Hall Effect Sensor" sensorId="KY-003" onClose={() => setShowQuiz(false)} defaultQuestions={SENSOR_QUIZZES["hall"]} />}
            {showExplainer && <GraphExplainerModal sensorName="Hall Effect Sensor" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}

const SpecRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>
);
