"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LiveChart } from "@/components/charts/LiveChart";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Activity, Cpu, Info, Gamepad2, Download, Sparkles, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { GraphExplainerModal } from "@/components/ai/GraphExplainerModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { useSignalProcessing } from "@/hooks/useSignalProcessing";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";

interface DataPoint { time: string; value: number; processingValue?: number; }
interface JoystickPoint { time: string; x: number; y: number; }
const MAX_DATA_POINTS = 50;

const THEORY = {
    physics: `Analog joysticks use **two potentiometers** for X/Y position.

**How it works:**
• X potentiometer changes with left/right.
• Y potentiometer changes with up/down.
• Both form voltage dividers.

At center: V_out ≈ V_in/2 ≈ 512 on 10-bit ADC.`,
    math: `**deadzone:**
if (abs(x - 512) < 50) x = 512; // Treat as centered

**Mapping:**
speed = map(joystickValue, 0, 1023, -255, 255);`,
};

const ARDUINO_CODE = `// Joystick - KY-023
#define JOY_X A6
#define JOY_Y A7
#define JOY_SW 11

void setup() {
  Serial.begin(115200);
  pinMode(JOY_SW, INPUT_PULLUP);
}

void loop() {
  int x = analogRead(JOY_X);
  int y = analogRead(JOY_Y);
  bool btn = digitalRead(JOY_SW) == LOW;
  
  Serial.print("X: "); Serial.print(x);
  Serial.print(" Y: "); Serial.print(y);
  if (btn) Serial.print(" [PRESSED]");
  Serial.println();
  delay(100);
}`;

const EXPERIMENTS = [
    { title: "Center Calibration", instruction: "Note the X/Y values with joystick at rest.", observation: "Are they exactly 512?", expected: "Usually slightly off. Real applications use a deadzone." }
];

const COMMON_MISTAKES = [
    { title: "Drift", symptom: "Cursor moves when joystick is centered", cause: "Potentiometer tolerance", fix: "Implement a 'deadzone' in software (e.g., ignore 490-530)." },
    { title: "Floating Values", symptom: "Random jumps", cause: "Missing GND connection or VCC", fix: "Check 5V and GND wires." }
];

export default function JoystickPage() {
    const { isConnected, data } = useSocket();
    const [historyX, setHistoryX] = useState<DataPoint[]>([]);

    // Testing & AI
    const [showQuiz, setShowQuiz] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);
    const [calibrationOffset, setCalibrationOffset] = useState(0);

    const rawX = data?.sensors.joystick?.x ?? 512;
    const rawY = data?.sensors.joystick?.y ?? 512;
    const button = data?.sensors.joystick?.btn ?? false;

    // Inject fault into X-Axis only for demonstration
    const { injectedValue, fault, setFault } = useFaultInjector(rawX);
    const calibratedX = (typeof injectedValue === 'number') ? injectedValue + calibrationOffset : injectedValue;

    const { filter, setFilter, processedData } = useSignalProcessing(historyX.map(d => d.value));

    useEffect(() => {
        if (data && typeof calibratedX === 'number') {
            const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false, minute: "2-digit", second: "2-digit" });
            setHistoryX((prev) => [...prev, { time: timestamp, value: calibratedX }].slice(-MAX_DATA_POINTS));
        }
    }, [data, calibratedX]);

    const chartData = historyX.map((point, i) => ({ ...point, processingValue: processedData[i] }));
    const anomalies = useMistakeDetector({ sensorName: "Joystick", data: historyX, expectedRange: { min: 0, max: 1023 } }).filter((_, i) => !dismissedAnomalies.includes(i));

    const displayX = (typeof calibratedX === "number") ? calibratedX.toFixed(0) : "--";
    const displayY = rawY.toFixed(0);

    const exportCSV = () => {
        const csv = "Time,X,Processed\n" + chartData.map(d => `${d.time},${d.value},${d.processingValue ?? ''}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "joystick_data.csv"; a.click();
    };

    return (
        <>
            <SensorDetailLayout
                title="Joystick"
                description="Dual-axis analog joystick with potentiometers."
                sensorId="KY-023"
                dataSnippet={{ x: displayX, y: displayY, button, pins: ["A6", "A7", "D11"] }}
                theory={THEORY}
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
                {anomalies.map((anomaly, i) => <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />)}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/20 rounded-full blur-2xl" />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="h-14 w-14 mb-3 rounded-full bg-violet-500/10 flex items-center justify-center ring-1 ring-violet-500/20"><Gamepad2 className="h-7 w-7 text-violet-400" /></div>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div><span className={`text-2xl font-bold ${fault.type !== 'none' ? 'text-amber-300' : 'text-white'}`}>{displayX}</span><span className="block text-xs text-slate-500">X</span></div>
                                <div><span className="text-2xl font-bold text-white">{displayY}</span><span className="block text-xs text-slate-500">Y</span></div>
                            </div>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            <Badge variant={button ? "warning" : isConnected ? "success" : "default"} size="sm" className="mt-4">{button ? "Pressed" : isConnected ? "Live" : "Offline"}</Badge>
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-violet-400" />X-Axis History</CardTitle>
                            <div className="flex gap-2">
                                <button onClick={() => setShowExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                                <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"><Download size={12} />CSV</button>
                            </div>
                        </CardHeader>
                        <CardContent><LiveChart data={chartData} color="#8b5cf6" gradientId="joyGrad" unit="" height={220} minDomain={0} maxDomain={1023} /></CardContent>
                    </Card>
                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-xl text-white font-medium hover:from-violet-500/30 hover:to-purple-500/30 transition">
                        <Brain className="h-5 w-5 text-violet-400" /> Quiz: Potentiometers
                    </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><SpecRow label="Axes" value="X, Y (analog)" /><SpecRow label="Button" value="Digital push" /></CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">VRx</td><td className="py-1.5 font-mono text-violet-400">A6</td></tr><tr><td className="py-1.5 font-mono text-white">VRy</td><td className="py-1.5 font-mono text-violet-400">A7</td></tr><tr><td className="py-1.5 font-mono text-white">SW</td><td className="py-1.5 font-mono text-violet-400">D11</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Joystick" sensorId="KY-023" onClose={() => setShowQuiz(false)} />}
            {showExplainer && <GraphExplainerModal sensorName="Joystick" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
