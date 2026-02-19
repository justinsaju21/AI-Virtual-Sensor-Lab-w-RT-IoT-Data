"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Cpu, Info, Hand, Sparkles, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";

const THEORY = {
    physics: `Capacitive touch sensors detect **electric field disturbance**.

**TTP223 Principle:**
• Creates small electric field around conductive pad.
• Your finger acts as a capacitor plate.
• Touching increases capacitance → IC detects change → output toggles.

Works through plastic, glass, and thin wood!`,
};

const ARDUINO_CODE = `// Touch Sensor - TTP223
#define TOUCH_PIN 6

void setup() {
  Serial.begin(115200);
  pinMode(TOUCH_PIN, INPUT);
}

void loop() {
  if (digitalRead(TOUCH_PIN) == HIGH) {
    Serial.println("Touched!");
  } else {
    Serial.println("Not touched");
  }
  delay(100);
}`;

const EXPERIMENTS = [
    { title: "Through Material", instruction: "Place thin paper over the sensor and try to touch.", observation: "Does it still detect?", expected: "Capacitive sensors work through non-conductive materials." }
];

const COMMON_MISTAKES = [
    { title: "Ghost Touches", symptom: "Triggers without touch", cause: "Noisy power or nearby metal", fix: "Move away from metal objects. Add 100nF cap to VCC/GND." },
    { title: "Low Sensitivity", symptom: "Needs hard press", cause: "Thick covering material", fix: "TTP223 auto-calibrates on power up. Don't touch during startup." }
];

export default function TouchPage() {
    const { isConnected, data } = useSocket();
    const [showQuiz, setShowQuiz] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);

    // Convert boolean to number
    const rawVal = data?.sensors.touch?.active ? 1 : 0;
    const { injectedValue, fault, setFault } = useFaultInjector(rawVal);
    const isTouched = injectedValue !== null && injectedValue > 0.5;

    // Mock history
    const [history, setHistory] = useState<{ time: string, value: number }[]>([]);
    useEffect(() => {
        if (data) {
            const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false, minute: "2-digit", second: "2-digit" });
            setHistory(prev => [...prev, { time: timestamp, value: rawVal }].slice(-20));
        }
    }, [data, rawVal]);

    const anomalies = useMistakeDetector({ sensorName: "Touch Sensor", data: history, expectedRange: { min: 0, max: 1 } }).filter((_, i) => !dismissedAnomalies.includes(i));


    return (
        <>
            <SensorDetailLayout
                title="Touch Sensor"
                description="Capacitive touch detection via electric field change."
                sensorId="TTP223"
                dataSnippet={{ value: isTouched, pin: "D6" }}
                theory={THEORY}
                arduinoCode={ARDUINO_CODE}
                experiments={EXPERIMENTS}
                commonMistakes={COMMON_MISTAKES}
                testingProps={{ showPanel: showTestingPanel, setShowPanel: setShowTestingPanel, renderPanel: () => <TestingControlPanel faultType={fault.type} setFault={setFault} filterType="none" setFilter={() => { }} calibrationOffset={0} setCalibrationOffset={() => { }} /> }}
            >
                {anomalies.map((anomaly, i) => <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />)}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${isTouched ? "bg-teal-500/30 animate-pulse" : "bg-slate-500/20"} rounded-full blur-2xl`} />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className={`h-16 w-16 mb-4 rounded-full flex items-center justify-center ring-2 ${isTouched ? "bg-teal-500/20 ring-teal-500/50" : "bg-slate-500/10 ring-slate-500/20"}`}><Hand className={`h-8 w-8 ${isTouched ? "text-teal-400" : "text-slate-400"}`} /></div>
                            <span className={`text-xl font-bold ${isTouched ? "text-teal-400" : "text-slate-400"}`}>{isTouched ? "Touched!" : "Not Touched"}</span>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-4">{isConnected ? "Active" : "Offline"}</Badge>
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2"><CardHeader><CardTitle>Status</CardTitle></CardHeader><CardContent><div className="h-[200px] flex items-center justify-center border border-dashed border-white/10 rounded-lg"><p className="text-slate-500">Touch detection is binary.</p></div></CardContent></Card>
                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-teal-500/30 rounded-xl text-white font-medium hover:from-teal-500/30 hover:to-emerald-500/30 transition">
                        <Brain className="h-5 w-5 text-teal-400" /> Quiz: Capacitance
                    </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><SpecRow label="Type" value="Capacitive" /><SpecRow label="Response" value="~60ms" /></CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">I/O</td><td className="py-1.5 font-mono text-teal-400">D6</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Touch Sensor" sensorId="TTP223" onClose={() => setShowQuiz(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
