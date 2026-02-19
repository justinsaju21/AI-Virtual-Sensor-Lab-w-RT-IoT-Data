"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Cpu, Info, Radar, Sparkles, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";

const THEORY = {
    physics: `Proximity sensors detect nearby objects without contact.

**Types:**
1. **IR Proximity:** LED + photodiode, measures reflected light.
2. **Capacitive:** Electric field disturbance detection.
3. **Inductive:** Eddy current detection in metals.
4. **Ultrasonic:** Time-of-flight measurement.

Most hobby sensors use IR reflection.`,
};

const ARDUINO_CODE = `// Proximity Sensor
#define PROX_PIN 5

void setup() {
  Serial.begin(115200);
  pinMode(PROX_PIN, INPUT);
}

void loop() {
  if (digitalRead(PROX_PIN) == LOW) {
    Serial.println("Object near!");
  } else {
    Serial.println("Clear");
  }
  delay(200);
}`;

const EXPERIMENTS = [
    { title: "Range Test", instruction: "Move your hand toward the sensor slowly.", observation: "At what distance does it detect?", expected: "Typical range 2-30cm for IR types." }
];

const COMMON_MISTAKES = [
    { title: "Blind Spot", symptom: "Fails detection when too close", cause: "IR reflection angle geometry", fix: "Keep object at least 2cm away from sensor." },
    { title: "Interference", symptom: "Erratic switching", cause: "Other IR sources (Remotes, Sun)", fix: "Isolate from other IR sources." }
];

export default function ProximityPage() {
    const { isConnected, data } = useSocket();
    const [showQuiz, setShowQuiz] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);

    // Logic: Active LOW usually, but check data
    const rawVal = data?.sensors.proximity?.active ? 1 : 0;
    const { injectedValue, fault, setFault } = useFaultInjector(rawVal);
    const isDetected = injectedValue !== null && injectedValue > 0.5;

    // Mock history
    const [history, setHistory] = useState<{ time: string, value: number }[]>([]);
    useEffect(() => {
        if (data) {
            const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false, minute: "2-digit", second: "2-digit" });
            setHistory(prev => [...prev, { time: timestamp, value: rawVal }].slice(-20));
        }
    }, [data, rawVal]);

    const anomalies = useMistakeDetector({ sensorName: "Proximity Sensor", data: history, expectedRange: { min: 0, max: 1 } }).filter((_, i) => !dismissedAnomalies.includes(i));

    return (
        <>
            <SensorDetailLayout
                title="Proximity Sensor"
                description="Non-contact object detection via IR reflection or capacitance."
                sensorId="E18-D80NK"
                dataSnippet={{ value: isDetected, pin: "D5" }}
                theory={THEORY}
                arduinoCode={ARDUINO_CODE}
                experiments={EXPERIMENTS}
                commonMistakes={COMMON_MISTAKES}
                testingProps={{ showPanel: showTestingPanel, setShowPanel: setShowTestingPanel, renderPanel: () => <TestingControlPanel faultType={fault.type} setFault={setFault} filterType="none" setFilter={() => { }} calibrationOffset={0} setCalibrationOffset={() => { }} /> }}
            >
                {anomalies.map((anomaly, i) => <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />)}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${isDetected ? "bg-lime-500/30 animate-pulse" : "bg-slate-500/20"} rounded-full blur-2xl`} />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className={`h-16 w-16 mb-4 rounded-full flex items-center justify-center ring-2 ${isDetected ? "bg-lime-500/20 ring-lime-500/50" : "bg-slate-500/10 ring-slate-500/20"}`}><Radar className={`h-8 w-8 ${isDetected ? "text-lime-400" : "text-slate-400"}`} /></div>
                            <span className={`text-xl font-bold ${isDetected ? "text-lime-400" : "text-slate-400"}`}>{isDetected ? "Object Near!" : "Clear"}</span>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-4">{isConnected ? "Active" : "Offline"}</Badge>
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2"><CardHeader><CardTitle>Status</CardTitle></CardHeader><CardContent><div className="h-[200px] flex items-center justify-center border border-dashed border-white/10 rounded-lg"><p className="text-slate-500">Proximity detection shown by indicator.</p></div></CardContent></Card>
                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-lime-500/20 to-green-500/20 border border-lime-500/30 rounded-xl text-white font-medium hover:from-lime-500/30 hover:to-green-500/30 transition">
                        <Brain className="h-5 w-5 text-lime-400" /> Quiz: Proximity Sensing
                    </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><SpecRow label="Types" value="IR / Capacitive" /><SpecRow label="Range" value="2-80cm" /></CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">OUT</td><td className="py-1.5 font-mono text-lime-400">D5</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Proximity Sensor" sensorId="E18-D80NK" onClose={() => setShowQuiz(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
