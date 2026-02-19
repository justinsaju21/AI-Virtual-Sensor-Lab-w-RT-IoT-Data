"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Cpu, Info, Eye, Sparkles, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";

const THEORY = {
    physics: `IR Obstacle sensors use **infrared light reflection**.

**Detection:**
1. IR LED emits continuously (~940nm).
2. If object present, IR reflects back.
3. Photodiode detects reflection → output triggers.

**Factors:** Color/texture matters. White reflects more than black.`,
    circuit: `**Module:** IR LED + Photodiode + LM393 comparator + sensitivity pot.`,
};

const ARDUINO_CODE = `// IR Obstacle Sensor
#define IR_PIN 4

void setup() {
  Serial.begin(115200);
  pinMode(IR_PIN, INPUT);
}

void loop() {
  if (digitalRead(IR_PIN) == LOW) {
    Serial.println("Obstacle detected!");
  } else {
    Serial.println("Clear");
  }
  delay(200);
}`;

const EXPERIMENTS = [
    { title: "Color Test", instruction: "Compare detection of white paper vs black cloth.", observation: "Which is detected more reliably?", expected: "White/light objects reflect more IR and are detected more easily." }
];

const COMMON_MISTAKES = [
    { title: "Black Object Failure", symptom: "Fails to detect black objects", cause: "Black absorbs IR light", fix: "IR sensors cannot reliably detect pure black surfaces." },
    { title: "False Trigger", symptom: "Triggers in sunlight", cause: "Sunlight contains IR", fix: "Shield sensor from direct sunlight." }
];

export default function IRPage() {
    const { isConnected, data } = useSocket();
    const [showQuiz, setShowQuiz] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);

    // Logic: Active LOW (0 = Object)
    const rawVal = data?.sensors.ir?.detected ? 0 : 1;
    // Invert for display: 1 = Object, 0 = Clear (easier for fault injection logic)
    const normalizedVal = data?.sensors.ir?.detected ? 1 : 0;

    const { injectedValue, fault, setFault } = useFaultInjector(normalizedVal);
    const isDetected = injectedValue !== null && injectedValue > 0.5;

    // Mock history
    const [history, setHistory] = useState<{ time: string, value: number }[]>([]);
    useEffect(() => {
        if (data) {
            const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false, minute: "2-digit", second: "2-digit" });
            setHistory(prev => [...prev, { time: timestamp, value: normalizedVal }].slice(-20));
        }
    }, [data, normalizedVal]);

    const anomalies = useMistakeDetector({ sensorName: "IR Sensor", data: history, expectedRange: { min: 0, max: 1 } }).filter((_, i) => !dismissedAnomalies.includes(i));

    return (
        <>
            <SensorDetailLayout
                title="IR Obstacle Sensor"
                description="Detects objects via IR light reflection."
                sensorId="TCRT5000 / KY-032"
                dataSnippet={{ value: isDetected, pin: "D4" }}
                theory={THEORY}
                arduinoCode={ARDUINO_CODE}
                experiments={EXPERIMENTS}
                commonMistakes={COMMON_MISTAKES}
                testingProps={{ showPanel: showTestingPanel, setShowPanel: setShowTestingPanel, renderPanel: () => <TestingControlPanel faultType={fault.type} setFault={setFault} filterType="none" setFilter={() => { }} calibrationOffset={0} setCalibrationOffset={() => { }} /> }}
            >
                {anomalies.map((anomaly, i) => <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />)}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${isDetected ? "bg-red-500/30 animate-pulse" : "bg-slate-500/20"} rounded-full blur-2xl`} />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className={`h-16 w-16 mb-4 rounded-full flex items-center justify-center ring-2 ${isDetected ? "bg-red-500/20 ring-red-500/50" : "bg-slate-500/10 ring-slate-500/20"}`}><Eye className={`h-8 w-8 ${isDetected ? "text-red-400" : "text-slate-400"}`} /></div>
                            <span className={`text-xl font-bold ${isDetected ? "text-red-400" : "text-slate-400"}`}>{isDetected ? "Obstacle!" : "Clear"}</span>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-4">{isConnected ? "Active" : "Offline"}</Badge>
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2"><CardHeader><CardTitle>Status</CardTitle></CardHeader><CardContent><div className="h-[200px] flex items-center justify-center border border-dashed border-white/10 rounded-lg"><p className="text-slate-500">Binary detection shown by indicator.</p></div></CardContent></Card>
                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl text-white font-medium hover:from-red-500/30 hover:to-orange-500/30 transition">
                        <Brain className="h-5 w-5 text-red-400" /> Quiz: Light Reflection
                    </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><SpecRow label="Range" value="2-30cm" /><SpecRow label="Wavelength" value="~940nm" /></CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">OUT</td><td className="py-1.5 font-mono text-red-400">D4</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="IR Sensor" sensorId="TCRT5000" onClose={() => setShowQuiz(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
