"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Cpu, Info, Move, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";
import { SENSOR_QUIZZES } from "@/config/quizzes";

const THEORY = {
    "physics": "The HC-SR501 Passive Infrared (PIR) sensor detects motion by mapping changes in the infrared radiation emitted by warm bodies (humans/animals). It features a specialized pyroelectric sensor split into two identical, electrically opposed halves. In a static environment, both halves receive the same ambient IR levels, canceling each other out to produce zero voltage. When a warm body walks past, it crosses the field of view of the first half, causing a positive voltage spike, and then crosses the second half, causing an equal negative spike. This differential AC waveform is what triggers the 'Motion Detected' logic.",
    "math": "**Differential Pyroelectric Effect:**\n$ \\Delta V = \\frac{p \\cdot A \\cdot \\Delta T}{C_v} $\n\nWhere:\n- $p$: Pyroelectric coefficient\n- $A$: Area of the crystal\n- $\\Delta T$: Rate of temperature change (from the moving body crossing sectors)\n- $C_v$: Heat capacity",
    "circuit": "**Hardware Architecture:**\n- **Fresnel Lens:** The iconic white dome isn't just a cover. It's an array of precisely molded Fresnel lenses that focus IR light onto the specific halves of the pyroelectric element, greatly expanding the detection range and angle to ~110 degrees up to 7 meters.\n- **BISS0001 IC:** A dedicated PIR motion detector control chip that handles the micro-volt amplification, filtering, window comparison, and the timing logic for the HIGH output."
};
const EXPERIMENTS = [
    {
        "title": "Cross vs Direct Approach Test",
        "instruction": "Have a friend walk slowly ACROSS the sensor's view, then try walking STRAIGHT TOWARD the sensor face.",
        "observation": "Walking across triggers it almost instantly. Walking straight toward it takes much longer or fails entirely.",
        "expected": "The Fresnel lens creates discrete detection zones side-by-side. Moving across multiple zones rapidly creates strong differential signals."
    },
    {
        "title": "Glass Transparency Test",
        "instruction": "Have someone wave their hands vigorously while standing behind a closed glass window.",
        "observation": "The PIR likely will NOT trigger even though the person is clearly visible through the glass.",
        "expected": "Standard window glass is opaque to the specific 9µm far-infrared wavelengths emitted by the human body."
    }
];

const COMMON_MISTAKES = [
    {
        "title": "False Positives After Power-On",
        "symptom": "Sensor triggers continuously when the room is empty.",
        "cause": "The pyroelectric element is still stabilizing to the ambient room temperature during the 60-second warmup.",
        "fix": "Implement the 60-second startup delay in code. Do not allow motion near the sensor during this calibration window."
    },
    {
        "title": "HVAC False Positives",
        "symptom": "Security alarm triggers when nobody is home.",
        "cause": "Sensor mounted near an air vent, heater, or facing a sunny window — rapid hot/cold air changes look exactly like a moving body.",
        "fix": "Relocate sensor away from vents and sunlight exposure. Turn the sensitivity dial (Tx) counter-clockwise."
    }
];


const ARDUINO_CODE = `// Motion Sensor - PIR HC-SR501
#define PIR_PIN 10

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





export default function MotionPage() {
    const { isConnected, data } = useSocket();
    const [showQuiz, setShowQuiz] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);

    // Convert boolean to number for fault injection (0 or 1)
    const rawVal = data?.sensors.pir?.active ? 1 : 0;
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
                dataSnippet={{ value: rawVal, pin: "D10" }}
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
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">VCC</td><td className="py-1.5 font-mono text-green-400">5V</td></tr><tr><td className="py-1.5 font-mono text-white">OUT</td><td className="py-1.5 font-mono text-green-400">D10</td></tr><tr><td className="py-1.5 font-mono text-white">GND</td><td className="py-1.5 font-mono text-green-400">GND</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Motion Sensor" sensorId="PIR" onClose={() => setShowQuiz(false)} defaultQuestions={SENSOR_QUIZZES["motion"]} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
