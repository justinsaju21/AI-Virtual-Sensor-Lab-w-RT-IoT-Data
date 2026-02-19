"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Cpu, Info, Magnet, Sparkles, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";

const THEORY = {
    physics: `Hall Effect sensors detect **magnetic fields**.

**The Hall Effect:**
When current flows through a conductor in a perpendicular magnetic field:
1. Lorentz force deflects charge carriers to one side.
2. Charge separation creates a measurable "Hall Voltage."
3. V_H proportional to magnetic field strength.`,
    math: `**Hall Voltage:**
V_H = (I × B) / (q × n × d)

Where:
• I = Current
• B = Magnetic field
• q = Charge
• d = Thickness`,
};

const ARDUINO_CODE = `// Hall Effect Sensor
#define HALL_PIN 3

void setup() {
  Serial.begin(115200);
  pinMode(HALL_PIN, INPUT);
}

void loop() {
  if (digitalRead(HALL_PIN) == LOW) {
    Serial.println("Magnet detected!");
  } else {
    Serial.println("No magnet");
  }
  delay(200);
}`;

const EXPERIMENTS = [
    { title: "Magnet Polarity", instruction: "Try both poles of a magnet near the sensor.", observation: "Does it detect both poles equally?", expected: "Most Hall sensors trigger on South pole. Flip the magnet to test." }
];

const COMMON_MISTAKES = [
    { title: "Wrong Pole", symptom: "No detection with magnet", cause: "Unipolar sensors only detect South pole", fix: "Flip the magnet over." },
    { title: "Latching Behavior", symptom: "Stays ON after magnet removed", cause: "Using a Latching Hall Sensor", fix: "Use a Non-Latching (Switch) type or expose to North pole to reset." }
];

export default function HallPage() {
    const { isConnected, data } = useSocket();
    const [showQuiz, setShowQuiz] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);

    // Logic: Active LOW usually
    const rawVal = data?.sensors.hall?.active ? 1 : 0;
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

    const anomalies = useMistakeDetector({ sensorName: "Hall Sensor", data: history, expectedRange: { min: 0, max: 1 } }).filter((_, i) => !dismissedAnomalies.includes(i));

    return (
        <>
            <SensorDetailLayout
                title="Hall Effect Sensor"
                description="Detects magnetic fields via Lorentz force on charge carriers."
                sensorId="A3144 / KY-003"
                dataSnippet={{ value: isDetected, pin: "D3" }}
                theory={THEORY}
                arduinoCode={ARDUINO_CODE}
                experiments={EXPERIMENTS}
                commonMistakes={COMMON_MISTAKES}
                testingProps={{ showPanel: showTestingPanel, setShowPanel: setShowTestingPanel, renderPanel: () => <TestingControlPanel faultType={fault.type} setFault={setFault} filterType="none" setFilter={() => { }} calibrationOffset={0} setCalibrationOffset={() => { }} /> }}
            >
                {anomalies.map((anomaly, i) => <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />)}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${isDetected ? "bg-indigo-500/30 animate-pulse" : "bg-slate-500/20"} rounded-full blur-2xl`} />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className={`h-16 w-16 mb-4 rounded-full flex items-center justify-center ring-2 ${isDetected ? "bg-indigo-500/20 ring-indigo-500/50" : "bg-slate-500/10 ring-slate-500/20"}`}><Magnet className={`h-8 w-8 ${isDetected ? "text-indigo-400" : "text-slate-400"}`} /></div>
                            <span className={`text-xl font-bold ${isDetected ? "text-indigo-400" : "text-slate-400"}`}>{isDetected ? "Magnet Detected!" : "No Magnet"}</span>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-4">{isConnected ? "Active" : "Offline"}</Badge>
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2"><CardHeader><CardTitle>Status</CardTitle></CardHeader><CardContent><div className="h-[200px] flex items-center justify-center border border-dashed border-white/10 rounded-lg"><p className="text-slate-500">Hall sensor is binary. The indicator shows magnet proximity.</p></div></CardContent></Card>
                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 rounded-xl text-white font-medium hover:from-indigo-500/30 hover:to-violet-500/30 transition">
                        <Brain className="h-5 w-5 text-indigo-400" /> Quiz: Electromagnetism
                    </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><SpecRow label="Type" value="Latching / Non-Latching" /><SpecRow label="Trigger" value="South pole" /><SpecRow label="Output" value="Open Collector" /></CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">VCC</td><td className="py-1.5 font-mono text-indigo-400">5V</td></tr><tr><td className="py-1.5 font-mono text-white">OUT</td><td className="py-1.5 font-mono text-indigo-400">D3</td></tr><tr><td className="py-1.5 font-mono text-white">GND</td><td className="py-1.5 font-mono text-indigo-400">GND</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Hall Sensor" sensorId="A3144" onClose={() => setShowQuiz(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
