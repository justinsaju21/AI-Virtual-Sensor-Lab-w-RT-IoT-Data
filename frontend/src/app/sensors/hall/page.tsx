"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Cpu, Info, Magnet, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";
import { SENSOR_QUIZZES } from "@/config/quizzes";

const THEORY = {
    "physics": "The A3144 Hall Effect sensor detects the presence of magnetic fields based on the Hall Effect principle—discovered by Edwin Hall in 1879. When a current-carrying semiconductor is placed in a perpendicular magnetic field, the Lorentz force deflects the charge carriers (electrons or holes) to one side of the material. This separation of charge creates a measurable transverse voltage (the Hall Voltage) across the semiconductor. The A3144 is a *Unipolar Switch*, meaning it specifically activates when a south magnetic pole of sufficient strength acts upon its face.",
    "math": "**The Lorentz Force & Hall Voltage:**\n$ V_H = \\frac{I \\cdot B}{n \\cdot e \\cdot d} $\n\nWhere:\n- $V_H$: Hall Voltage\n- $I$: Current passing through the sensor\n- $B$: Magnetic Flux Density (Teslas or Gauss)\n- $n$: Charge carrier density\n- $d$: Thickness of the semiconductor",
    "circuit": "**Hardware Architecture:**\n- **A3144 IC:** Contains the Hall element, an internal voltage regulator, a small signal amplifier, a Schmitt trigger (for clean digital switching), and an Open-Collector output transistor.\n- **Pull-up Resistor:** Because the output is open-collector, a 10k\\Omega pull-up resistor is required between the signal pin and VCC. When a magnetic field triggers the sensor, the internal transistor sinks the signal line to GND (Active LOW)."
};
const EXPERIMENTS = [
    {
        "title": "Pole Polarity Identification",
        "instruction": "Approach the sensor face with the NORTH pole of a bar magnet. Record the analog direction. Then flip the magnet and approach with the SOUTH pole.",
        "observation": "North pole: analog rises above 512. South pole: analog falls below 512.",
        "expected": "The sign of the Hall Voltage reverses with field direction. This directional sensitivity is how brushless motor controllers determine rotor magnet orientation."
    },
    {
        "title": "Distance-to-Field-Strength Mapping",
        "instruction": "Move a neodymium magnet from 20cm to 1cm, recording the analog value at each centimeter.",
        "observation": "Value moves slowly from 512 at first, then rapidly accelerates within the last 5cm.",
        "expected": "Magnetic flux density follows an inverse-square law. This characteristic response curve is used in contactless position sensors."
    }
];

const COMMON_MISTAKES = [
    {
        "title": "Digital Output Never Triggers",
        "symptom": "Analog clearly moves away from 512 but DO pin stays HIGH even with a strong magnet.",
        "cause": "Potentiometer sensitivity threshold is set too high for your magnet's field strength.",
        "fix": "Slowly rotate the blue potentiometer clockwise until DO triggers with a neodymium magnet at 2-3cm."
    },
    {
        "title": "Analog Pegged at 0 or 1023 Constantly",
        "symptom": "Output is stuck at maximum or minimum with the magnet far away.",
        "cause": "A very strong magnet placed directly on the sensor is saturating the Hall element beyond its linear sensing range.",
        "fix": "Move the magnet 5-10cm back. Saturation beyond the linear range is normal Hall element behavior and does not damage the sensor."
    },
    {
        "title": "AI Warning During Joystick Calibration",
        "symptom": "AI Mistake Detector flags: Hall Effect active while calibrating the Joystick.",
        "cause": "A magnetic screwdriver or nearby magnet is simultaneously triggering the Hall sensor while the student calibrates the joystick.",
        "fix": "Remove all magnetic objects from the bench before Joystick zero-calibration."
    }
];


const ARDUINO_CODE = `// Hall Effect Sensor
#define HALL_PIN 6

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
                dataSnippet={{ value: isDetected, pin: "D6" }}
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
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">VCC</td><td className="py-1.5 font-mono text-indigo-400">5V</td></tr><tr><td className="py-1.5 font-mono text-white">OUT</td><td className="py-1.5 font-mono text-indigo-400">D6</td></tr><tr><td className="py-1.5 font-mono text-white">GND</td><td className="py-1.5 font-mono text-indigo-400">GND</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Hall Sensor" sensorId="A3144" onClose={() => setShowQuiz(false)} defaultQuestions={SENSOR_QUIZZES["hall"]} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
