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
import { Flame, Info, Download, Sparkles, Brain, Cpu, Activity } from "lucide-react";
import { SENSOR_QUIZZES } from "@/config/quizzes";

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 50;

const THEORY = {
    physics: `The Flame Sensor detects infrared light emitted by fire in the 760nm to 1100nm range. It uses a high-speed photodiode that is sensitive to IR radiation.`,
    math: `**Radiant Intensity:** IR intensity decreases with the square of the distance ($1/d^2$).`,
    circuit: `**Analog Output:** Provides a voltage proportional to the IR intensity. **Digital Output:** Triggers when intensity crosses a potentiometer threshold.`
};

const EXPERIMENTS = [
    {
        title: "Lighter Test",
        instruction: "Hold a lighter 10cm from the sensor and strike it.",
        observation: "Analog value drops sharply (Active LOW).",
        expected: "Shows how IR radiation from a flame triggers the photodiode."
    }
];

const COMMON_MISTAKES = [
    {
        title: "Sunlight Interference",
        symptom: "Sensor triggers even without fire.",
        cause: "Direct sunlight contains massive IR radiation.",
        fix: "Shield the sensor from direct sunlight or adjust sensitivity."
    }
];

const ARDUINO_CODE = `// Flame Sensor
#define FLAME_PIN A0

void setup() {
  Serial.begin(115200);
}

void loop() {
  int val = analogRead(FLAME_PIN);
  Serial.println(val);
  delay(100);
}`;

export default function FlamePage() {
    const { isConnected, data } = useSocket();
    const [history, setHistory] = useState<DataPoint[]>([]);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);
    const [calibrationOffset, setCalibrationOffset] = useState(0);

    // 1. Raw Input
    const rawVal = data?.sensors.flame?.raw ?? 1023; // High = No flame

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
        sensorName: "Flame Sensor",
        data: history,
        expectedRange: { min: 100, max: 1023 }
    }).filter((_, i) => !dismissedAnomalies.includes(i));

    const isDetected = (typeof calibratedValue === "number") ? calibratedValue < 500 : false;
    const displayValue = (typeof calibratedValue === "number") ? calibratedValue.toFixed(0) : "--";

    const exportCSV = () => {
        const csv = "Time,Flame (ADC),Processed\n" + chartData.map(d => `${d.time},${d.value},${d.processingValue ?? ''}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "flame_data.csv"; a.click(); URL.revokeObjectURL(url);
    };

    return (
        <>
            <SensorDetailLayout
                title="Flame Sensor"
                description="Infrared-based fire detection module."
                sensorId="KY-026" isReal={!!data?.sensors?.flame?.isReal}
                dataSnippet={{ value: displayValue, status: isDetected ? "FIRE!" : "Safe", pin: "A0" }}
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
                        <div className={`absolute top-0 right-0 w-32 h-32 ${isDetected ? "bg-red-500/30 animate-pulse" : "bg-slate-500/20"} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2`} />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className={`h-14 w-14 mb-3 rounded-full flex items-center justify-center ring-1 ${isDetected ? "bg-red-500/20 ring-red-500/50" : "bg-slate-500/10 ring-slate-500/20"}`}>
                                <Flame className={`h-7 w-7 ${isDetected ? "text-red-400" : "text-slate-400"}`} />
                            </div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Flame Level</span>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-5xl font-bold tracking-tighter ${isDetected ? "text-red-500" : (fault.type !== 'none' ? 'text-amber-400' : 'text-white')}`}>
                                    {displayValue}
                                </span>
                            </div>
                            <span className={`text-sm font-bold mt-1 ${isDetected ? "text-red-400" : "text-slate-500"}`}>{isDetected ? "FLAME DETECTED" : "Clear"}</span>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-4">{isConnected ? "Active" : "Offline"}</Badge>
                        </CardContent>
                    </Card>

                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-red-400" />Detection History</CardTitle>
                            <div className="flex gap-2">
                                <button onClick={() => setShowExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                                <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"><Download size={12} />CSV</button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <LiveChart data={chartData} color="#ef4444" gradientId="flameGrad" unit="" height={220} minDomain={0} maxDomain={1023} />
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl text-white font-medium hover:from-red-500/30 hover:to-orange-500/30 transition">
                        <Brain className="h-5 w-5 text-red-400" /> Test Knowledge
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <SpecRow label="Wave Range" value="760nm - 1100nm" />
                            <SpecRow label="Detection Angle" value="60°" />
                        </CardContent>
                    </Card>
                    <Card variant="default">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-white/10 text-slate-500"><th className="py-1.5 text-left">Pin</th><th className="py-1.5 text-left">Arduino</th></tr></thead>
                                <tbody className="divide-y divide-white/5">
                                    <tr><td className="py-1.5 font-mono text-white">VCC</td><td className="py-1.5 font-mono text-red-400">5V</td></tr>
                                    <tr><td className="py-1.5 font-mono text-white">A0</td><td className="py-1.5 font-mono text-red-400">A0</td></tr>
                                    <tr><td className="py-1.5 font-mono text-white">GND</td><td className="py-1.5 font-mono text-red-400">GND</td></tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            </SensorDetailLayout>

            {showQuiz && <AIQuizModal sensorName="Flame Sensor" sensorId="KY-026" onClose={() => setShowQuiz(false)} defaultQuestions={SENSOR_QUIZZES["flame"]} />}
            {showExplainer && <GraphExplainerModal sensorName="Flame Sensor" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}

const SpecRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>
);
