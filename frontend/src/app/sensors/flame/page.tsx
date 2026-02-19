"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Cpu, Info, Flame, Sparkles, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";

const THEORY = {
    physics: `Flame sensors detect fire by sensing **infrared radiation** emitted by flames.

**Why Flames Emit IR:**
• Flames produce electromagnetic radiation across a wide spectrum.
• Hot combustion gases (CO₂, H₂O) emit characteristic IR wavelengths.
• The KY-026 uses an IR photodiode sensitive to 760-1100nm.`,
    circuit: `**Module:** IR receiver + LM393 comparator + sensitivity pot.
• AO: Analog intensity output (Lower value = stronger fire).
• DO: Digital threshold output.`,
};

const ARDUINO_CODE = `// Flame Sensor - KY-026
#define FLAME_PIN A4
#define DO_PIN 7

void setup() {
  Serial.begin(115200);
  pinMode(DO_PIN, INPUT);
}

void loop() {
  int flameValue = analogRead(FLAME_PIN);
  bool detected = digitalRead(DO_PIN) == LOW; // Active LOW
  
  Serial.print("Flame: ");
  Serial.print(flameValue);
  if (detected) Serial.print(" [FIRE!]");
  Serial.println();
  delay(500);
}`;

const EXPERIMENTS = [
    { title: "Lighter Test (Caution!)", instruction: "Hold an unlit lighter 30cm away, then briefly ignite.", observation: "How quickly does it detect the flame?", expected: "Detection should be nearly instant within range." }
];

const COMMON_MISTAKES = [
    { title: "Sunlight Triggering", symptom: "Detects fire when sunny", cause: "Sun emits heavy IR radiation", fix: "Shield sensor from direct sunlight." },
    { title: "Inverse Logic", symptom: "Value drops when fire present", cause: "Photodiode conductivity increases with light", fix: "This is normal behavior. Logic: IF val < 200 THEN Fire." }
];

export default function FlamePage() {
    const { isConnected, data } = useSocket();
    const [showQuiz, setShowQuiz] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);

    const rawVal = data?.sensors.flame?.value ?? 1023; // Default 1023 (no fire)
    const { injectedValue, fault, setFault } = useFaultInjector(rawVal);

    // Logic: Low value (< 200) means fire
    const detected = typeof injectedValue === "number" && injectedValue < 200;

    // Mock history
    const [history, setHistory] = useState<{ time: string, value: number }[]>([]);
    useEffect(() => {
        if (data && typeof injectedValue === 'number') {
            const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false, minute: "2-digit", second: "2-digit" });
            setHistory(prev => [...prev, { time: timestamp, value: injectedValue }].slice(-20));
        }
    }, [data, injectedValue]);

    const anomalies = useMistakeDetector({ sensorName: "Flame Sensor", data: history, expectedRange: { min: 0, max: 1023 } }).filter((_, i) => !dismissedAnomalies.includes(i));

    return (
        <>
            <SensorDetailLayout
                title="Flame Sensor"
                description="Detects fire via IR radiation from flames."
                sensorId="KY-026"
                dataSnippet={{ value: injectedValue, pin: "A4" }}
                theory={THEORY}
                arduinoCode={ARDUINO_CODE}
                experiments={EXPERIMENTS}
                commonMistakes={COMMON_MISTAKES}
                testingProps={{
                    showPanel: showTestingPanel,
                    setShowPanel: setShowTestingPanel,
                    renderPanel: () => <TestingControlPanel faultType={fault.type} setFault={setFault} filterType="none" setFilter={() => { }} calibrationOffset={0} setCalibrationOffset={() => { }} />
                }}
            >
                {anomalies.map((anomaly, i) => <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />)}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${detected ? "bg-orange-500/40 animate-pulse" : "bg-slate-500/20"} rounded-full blur-2xl`} />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className={`h-16 w-16 mb-4 rounded-full flex items-center justify-center ring-2 ${detected ? "bg-orange-500/30 ring-orange-500/50 animate-pulse" : "bg-slate-500/10 ring-slate-500/20"}`}><Flame className={`h-8 w-8 ${detected ? "text-orange-400" : "text-slate-400"}`} /></div>
                            <span className={`text-xl font-bold ${detected ? "text-orange-400" : "text-slate-400"}`}>{detected ? "FLAME!" : "No Flame"}</span>
                            <span className="text-lg text-white mt-1">Raw: {injectedValue}</span>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-3">{isConnected ? "Monitoring" : "Offline"}</Badge>
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2"><CardHeader><CardTitle>Detection</CardTitle></CardHeader><CardContent><div className="h-[200px] flex items-center justify-center border border-dashed border-white/10 rounded-lg"><p className="text-slate-500">Flame detection shown by indicator. Low value = fire detected.</p></div></CardContent></Card>
                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl text-white font-medium hover:from-orange-500/30 hover:to-red-500/30 transition">
                        <Brain className="h-5 w-5 text-orange-400" /> Quiz: IR & Fire
                    </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><SpecRow label="Range" value="~100cm" /><SpecRow label="Wavelength" value="760-1100nm" /><SpecRow label="Angle" value="~60°" /></CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">AO</td><td className="py-1.5 font-mono text-orange-400">A4</td></tr><tr><td className="py-1.5 font-mono text-white">DO</td><td className="py-1.5 font-mono text-orange-400">D7</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Flame Sensor" sensorId="KY-026" onClose={() => setShowQuiz(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
