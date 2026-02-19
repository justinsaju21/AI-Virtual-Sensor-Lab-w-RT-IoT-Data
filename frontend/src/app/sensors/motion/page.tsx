"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Cpu, Info, Move, Sparkles, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";

const THEORY = {
    physics: `The PIR sensor detects motion via **infrared radiation changes**.

**Pyroelectric Effect:**
• Uses lithium tantalate material that generates charge when IR changes.

**Dual-Element Design:**
• Two pyroelectric elements side-by-side.
• Stationary: both see same IR → no signal.
• Movement: one detects first → differential pulse triggers output.`,
    circuit: `**HC-SR501 Module:**
• VCC: 5V power
• OUT: Digital HIGH when motion detected
• GND: Ground

**Adjustments:**
• Sensitivity potentiometer
• Time delay potentiometer (1-300s)`,
};

const ARDUINO_CODE = `// Motion Sensor - PIR HC-SR501
#define PIR_PIN 7

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
}

void loop() {
  if (digitalRead(PIR_PIN) == HIGH) {
    Serial.println("Motion detected!");
  } else {
    Serial.println("No motion");
  }
  delay(500);
}`;

const EXPERIMENTS = [
    { title: "Detection Range Test", instruction: "Walk toward the sensor from 5 meters away.", observation: "At what distance did it trigger?", expected: "Typical range is 5-7 meters." },
    { title: "Pet vs Human", instruction: "Have a pet walk by if available.", observation: "Does it detect smaller heat sources?", expected: "PIR detects change in IR pattern - smaller sources may not trigger." }
];

const COMMON_MISTAKES = [
    { title: "False Positives", symptom: "Triggers randomly without motion", cause: "Sunlight, WiFi, or HVAC currents", fix: "Shield sensor from direct heat/light sources." },
    { title: "Stuck High", symptom: "Always detects motion", cause: "Time Delay pot maxed or continuous motion", fix: "Turn Time Delay potentiometer CCW to varying minimum." }
];

export default function MotionPage() {
    const { isConnected, data } = useSocket();
    const [showQuiz, setShowQuiz] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);

    // Convert boolean to number for fault injection (0 or 1)
    const rawVal = data?.sensors.ir?.detected ? 1 : 0;
    const { injectedValue, fault, setFault } = useFaultInjector(rawVal);

    // Convert back to boolean
    const isMotionDetected = injectedValue !== null && injectedValue > 0.5;
    const motionState = isMotionDetected ? "Motion Detected!" : "No Motion";

    // Mock history for mistake detector (just last few states)
    const [history, setHistory] = useState<{ time: string, value: number }[]>([]);
    useEffect(() => {
        if (data) {
            const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false, minute: "2-digit", second: "2-digit" });
            setHistory(prev => [...prev, { time: timestamp, value: rawVal }].slice(-20));
        }
    }, [data, rawVal]);

    const anomalies = useMistakeDetector({ sensorName: "Motion Sensor", data: history, expectedRange: { min: 0, max: 1 } }).filter((_, i) => !dismissedAnomalies.includes(i));

    return (
        <>
            <SensorDetailLayout
                title="Motion Sensor (PIR)"
                description="Detects motion via pyroelectric infrared sensing."
                sensorId="HC-SR501"
                dataSnippet={{ value: rawVal, pin: "D3" }}
                theory={THEORY}
                arduinoCode={ARDUINO_CODE}
                experiments={EXPERIMENTS}
                commonMistakes={COMMON_MISTAKES}
                testingProps={{
                    showPanel: showTestingPanel,
                    setShowPanel: setShowTestingPanel,
                    renderPanel: () => (
                        // Disable filter/calibration for binary sensor
                        <TestingControlPanel
                            faultType={fault.type} setFault={setFault}
                            filterType="none" setFilter={() => { }}
                            calibrationOffset={0} setCalibrationOffset={() => { }}
                        />
                    )
                }}
            >
                {anomalies.map((anomaly, i) => <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />)}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${isMotionDetected ? "bg-green-500/30 animate-pulse" : "bg-slate-500/20"} rounded-full blur-2xl`} />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className={`h-16 w-16 mb-4 rounded-full flex items-center justify-center ring-2 ${isMotionDetected ? "bg-green-500/20 ring-green-500/50" : "bg-slate-500/10 ring-slate-500/20"}`}><Move className={`h-8 w-8 ${isMotionDetected ? "text-green-400" : "text-slate-400"}`} /></div>
                            <span className={`text-xl font-bold ${isMotionDetected ? "text-green-400" : "text-slate-400"}`}>{motionState}</span>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-4">{isConnected ? "Monitoring" : "Offline"}</Badge>
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2"><CardHeader><CardTitle>Status</CardTitle></CardHeader><CardContent><div className="h-[200px] flex items-center justify-center border border-dashed border-white/10 rounded-lg"><p className="text-slate-500">Motion is binary ON/OFF. No chart needed.</p></div></CardContent></Card>
                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-500/30 rounded-xl text-white font-medium hover:from-green-500/30 hover:to-teal-500/30 transition">
                        <Brain className="h-5 w-5 text-green-400" /> Quiz: Pyroelectric Effect
                    </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><SpecRow label="Range" value="~7 meters" /><SpecRow label="FOV" value="~120°" /><SpecRow label="Delay" value="1-300s adjustable" /></CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">VCC</td><td className="py-1.5 font-mono text-green-400">5V</td></tr><tr><td className="py-1.5 font-mono text-white">OUT</td><td className="py-1.5 font-mono text-green-400">D3</td></tr><tr><td className="py-1.5 font-mono text-white">GND</td><td className="py-1.5 font-mono text-green-400">GND</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Motion Sensor" sensorId="PIR" onClose={() => setShowQuiz(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
