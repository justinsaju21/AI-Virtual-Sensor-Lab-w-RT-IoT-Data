"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Cpu, Info, RotateCw, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";

const THEORY = {
    "physics": "The SW-520D Tilt Sensor (or ball switch) is a purely mechanical digital sensor based on gravity and contact mechanics. Inside its small, sealed gold-plated or black cylindrical housing sits two stationary conductive pins and one or two free-rolling gold-plated metal balls. When the sensor is held upright, gravity forces the balls to the bottom of the cylinder, where they physically bridge the gap between the two conductive pins, completing the electrical circuit. If the sensor is tilted past a certain angle (typically >15 degrees), gravity pulls the balls away from the pins, abruptly breaking the circuit.",
    "math": "**Kinematics & Bouncing:**\nAs a physical mechanism, the sensor is susceptible to 'contact bounce'. \nIf the module is mounted in a vibrating environment or precisely on the threshold angle, the microscopic bouncing of the ball creates a rapid sequence of HIGH/LOW voltage spikes. Software *debouncing*—waiting 10-50ms after a state change—is mathematically required to read a clean, stable state.",
    "circuit": "**Hardware Architecture:**\n- **Component:** The SW-520D itself is literally just a localized gravity switch.\n- **Interface:** It requires a Pull-Up or Pull-Down resistor exactly like a standard push-button. In the standard Arduino configuration, `INPUT_PULLUP` is used. Upright (closed) = 0V (LOW). Tilted (open) = 5V (HIGH).\n- **Warning:** Highly sensitive to vibration and lateral G-forces."
};
const EXPERIMENTS = [
    {
        "title": "Vibration & Impact Alarm",
        "instruction": "Hold the sensor perfectly upright. Flick it hard with a finger, or place it on a desk and hit the desk surface with a fist.",
        "observation": "A flurry of TILTED and UPRIGHT messages spam the serial monitor rapidly.",
        "expected": "The sudden kinetic force momentarily bounces the ball off the contacts. Demonstrates a ball-tilt sensor can function as a crude vibration alarm."
    }
];

const COMMON_MISTAKES = [
    {
        "title": "Constant Flapping in Breadboard",
        "symptom": "Sensor never settles into stable reading even sitting still on a flat surface.",
        "cause": "The sensor is physically wobbling in the breadboard socket, or was not inserted perfectly vertical.",
        "fix": "The sensor relies purely on gravity. It must be fixed perpendicular to the protected object's intended orientation."
    },
    {
        "title": "Random 0s and 1s When Tilted",
        "symptom": "When tilted (open circuit), reads garbage values instead of a clean HIGH.",
        "cause": "Without INPUT_PULLUP, the open pin is floating and picks up random electromagnetic noise from the room.",
        "fix": "Always use: pinMode(TILT_PIN, INPUT_PULLUP). Or add a physical 10kΩ resistor from the pin to 5V."
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
    Serial.println("Tilted!");
  } else {
    Serial.println("Level");
  }
  delay(200);
}`;

const EXPERIMENTS = [
    { title: "Trigger Angle", instruction: "Slowly tilt the sensor until it triggers.", observation: "At what angle does it change state?", expected: "Typically triggers at 15-45° depending on sensor." }
];



export default function TiltPage() {
    const { isConnected, data } = useSocket();
    const [showQuiz, setShowQuiz] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);

    // Convert boolean to number
    const rawVal = data?.sensors.tilt?.active ? 1 : 0;
    const { injectedValue, fault, setFault } = useFaultInjector(rawVal);
    const isTilted = injectedValue !== null && injectedValue > 0.5;

    // Mock history
    const [history, setHistory] = useState<{ time: string, value: number }[]>([]);
    useEffect(() => {
        if (data) {
            const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false, minute: "2-digit", second: "2-digit" });
            setHistory(prev => [...prev, { time: timestamp, value: rawVal }].slice(-20));
        }
    }, [data, rawVal]);

    const anomalies = useMistakeDetector({ sensorName: "Tilt Sensor", data: history, expectedRange: { min: 0, max: 1 } }).filter((_, i) => !dismissedAnomalies.includes(i));

    return (
        <>
            <SensorDetailLayout
                title="Tilt Sensor"
                description="Ball switch detects orientation changes via gravity."
                sensorId="SW-520D"
                dataSnippet={{ value: isTilted, pin: "D12" }}
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
                        <div className={`absolute top-0 right-0 w-32 h-32 ${isTilted ? "bg-amber-500/30 animate-pulse" : "bg-slate-500/20"} rounded-full blur-2xl`} />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className={`h-16 w-16 mb-4 rounded-full flex items-center justify-center ring-2 transition-all ${isTilted ? "bg-amber-500/20 ring-amber-500/50 rotate-45" : "bg-slate-500/10 ring-slate-500/20"}`}><RotateCw className={`h-8 w-8 ${isTilted ? "text-amber-400" : "text-slate-400"}`} /></div>
                            <span className={`text-xl font-bold ${isTilted ? "text-amber-400" : "text-slate-400"}`}>{isTilted ? "Tilted!" : "Level"}</span>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-4">{isConnected ? "Active" : "Offline"}</Badge>
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2"><CardHeader><CardTitle>Status</CardTitle></CardHeader><CardContent><div className="h-[200px] flex items-center justify-center border border-dashed border-white/10 rounded-lg"><p className="text-slate-500">Tilt is binary. Icon rotates when tilted.</p></div></CardContent></Card>
                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-white font-medium hover:from-amber-500/30 hover:to-orange-500/30 transition">
                        <Brain className="h-5 w-5 text-amber-400" /> Quiz: Mechanics
                    </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><SpecRow label="Type" value="Ball Switch" /><SpecRow label="Angle" value="15-45°" /></CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">Signal</td><td className="py-1.5 font-mono text-amber-400">D12 (pull-up)</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Tilt Sensor" sensorId="SW-520D" onClose={() => setShowQuiz(false)} defaultQuestions={SENSOR_QUIZZES["tilt"]} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
