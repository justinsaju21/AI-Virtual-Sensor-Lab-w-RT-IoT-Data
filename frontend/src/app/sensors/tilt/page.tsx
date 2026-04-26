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
import { RotateCw, Info, Download, Sparkles, Brain, Cpu, Activity } from "lucide-react";
import { SENSOR_QUIZZES } from "@/config/quizzes";

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 50;

const THEORY = {
    physics: `The Tilt Sensor (SW-520D) uses a small ball inside a cylinder to bridge two conductive pins. When tilted, gravity moves the ball, breaking the circuit.`,
    math: `**Angle of Trigger:** Typically triggers at angles >15°. Susceptible to mechanical 'bouncing' during movement.`,
    circuit: `**Pull-up Resistor:** Requires a pull-up resistor (internal or external) to provide a stable HIGH state when the circuit is open.`
};

const EXPERIMENTS = [
    {
        title: "Orientation Test",
        instruction: "Hold the sensor upright, then tilt it 90 degrees.",
        observation: "State changes from Level to Tilted.",
        expected: "Demonstrates gravity-based switching."
    }
];

const COMMON_MISTAKES = [
    {
        title: "Mechanical Bouncing",
        symptom: "Rapidly switches between Level/Tilted during vibration.",
        cause: "Ball bouncing inside the cylinder.",
        fix: "Implement software debouncing (e.g., Low Pass Filter)."
    }
];

const ARDUINO_CODE = `// Tilt Sensor
#define TILT_PIN 12

void setup() {
  Serial.begin(115200);
  pinMode(TILT_PIN, INPUT_PULLUP);
}

void loop() {
  if (digitalRead(TILT_PIN) == LOW) {
    Serial.println("Level");
  } else {
    Serial.println("Tilted!");
  }
  delay(100);
}`;

export default function TiltPage() {
    const { isConnected, data } = useSocket();
    const [history, setHistory] = useState<DataPoint[]>([]);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);
    const [calibrationOffset, setCalibrationOffset] = useState(0);

    // 1. Raw Input
    const rawVal = data?.sensors.tilt?.active ? 1 : 0;

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
        sensorName: "Tilt Sensor",
        data: history,
        expectedRange: { min: 0, max: 1 }
    }).filter((_, i) => !dismissedAnomalies.includes(i));

    const isTilted = (typeof calibratedValue === "number") ? calibratedValue > 0.5 : false;

    const exportCSV = () => {
        const csv = "Time,Tilt (State),Processed\n" + chartData.map(d => `${d.time},${d.value},${d.processingValue ?? ''}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "tilt_data.csv"; a.click(); URL.revokeObjectURL(url);
    };

    return (
        <>
            <SensorDetailLayout
                title="Tilt Sensor"
                description="Detects orientation changes via gravity-based ball switch."
                sensorId="SW-520D" isReal={!!data?.sensors?.tilt?.isReal}
                dataSnippet={{ status: isTilted ? "Tilted" : "Level", pin: "D12" }}
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
                        <div className={`absolute top-0 right-0 w-32 h-32 ${isTilted ? "bg-amber-500/30 animate-pulse" : "bg-slate-500/20"} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2`} />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className={`h-14 w-14 mb-3 rounded-full flex items-center justify-center ring-1 transition-all ${isTilted ? "bg-amber-500/20 ring-amber-500/50 rotate-45" : "bg-slate-500/10 ring-slate-500/20"}`}>
                                <RotateCw className={`h-7 w-7 ${isTilted ? "text-amber-400" : "text-slate-400"}`} />
                            </div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Status</span>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-4xl font-bold tracking-tighter ${isTilted ? "text-amber-400" : (fault.type !== 'none' ? 'text-amber-400' : 'text-white')}`}>
                                    {isTilted ? "TILTED" : "LEVEL"}
                                </span>
                            </div>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-4">{isConnected ? "Active" : "Offline"}</Badge>
                        </CardContent>
                    </Card>

                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-amber-400" />Orientation History</CardTitle>
                            <div className="flex gap-2">
                                <button onClick={() => setShowExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                                <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"><Download size={12} />CSV</button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <LiveChart data={chartData} color="#eab308" gradientId="tiltGrad" unit="" height={220} minDomain={-0.1} maxDomain={1.1} type="stepAfter" />
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-white font-medium hover:from-amber-500/30 hover:to-orange-500/30 transition">
                        <Brain className="h-5 w-5 text-amber-400" /> Test Knowledge
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <SpecRow label="Type" value="Ball Switch" />
                            <SpecRow label="Angle" value="15-45°" />
                        </CardContent>
                    </Card>
                    <Card variant="default">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-white/10 text-slate-500"><th className="py-1.5 text-left">Pin</th><th className="py-1.5 text-left">Arduino</th></tr></thead>
                                <tbody className="divide-y divide-white/5">
                                    <tr><td className="py-1.5 font-mono text-white">VCC</td><td className="py-1.5 font-mono text-amber-400">5V</td></tr>
                                    <tr><td className="py-1.5 font-mono text-white">OUT</td><td className="py-1.5 font-mono text-amber-400">D12</td></tr>
                                    <tr><td className="py-1.5 font-mono text-white">GND</td><td className="py-1.5 font-mono text-amber-400">GND</td></tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            </SensorDetailLayout>

            {showQuiz && <AIQuizModal sensorName="Tilt Sensor" sensorId="SW-520D" onClose={() => setShowQuiz(false)} defaultQuestions={SENSOR_QUIZZES["tilt"]} />}
            {showExplainer && <GraphExplainerModal sensorName="Tilt Sensor" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}

const SpecRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>
);
