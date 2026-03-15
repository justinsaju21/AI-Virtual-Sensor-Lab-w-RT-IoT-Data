"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Cpu, Info, Eye, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";

const THEORY = {
    "physics": "The E18-D80NK is an active photoelectric proximity sensor based on modulated infrared light reflection. It houses both an IR emitter and an IR receiver. The emitter continuously pulses IR light at a specific high frequency (typically 38kHz). Modulating the light prevents interference from continuous ambient light sources (like sunlight or indoor bulbs). When an object enters the sensor's range, the modulated IR light bounces off the object and scatters back into the receiver. The internal circuitry filters out non-38kHz light and measures the returned signal intensity.",
    "math": "**Inverse Square Law:**\nThe intensity of the reflected IR light decreases exponentially with distance.\n\n$ I_{reflected} \\propto \\frac{1}{d^2} $\n\nWhere:\n- $d$ is the distance to the target.\nDark or matte surfaces absorb IR, reducing the effective sensing range, while glossy or white surfaces reflect highly.",
    "circuit": "**Hardware Architecture:**\n- **Optics:** Lenses focus both the emitted and incoming IR light into a tight beam, giving it a reliable range of 3cm to 80cm.\n- **Trimpot:** A dedicated screw on the back adjusts the sensitivity (trigger threshold) of the internal comparator.\n- **Output Stage:** Features an NPN Open-Collector output. It requires an internal or external pull-up resistor. When an object is detected, the transistor turns on, pulling the signal line firmly to GND (Active LOW)."
};
const EXPERIMENTS = [
    {
        "title": "Reflectivity (Albedo) Test",
        "instruction": "Hold a bright white paper in front of the sensor and record the distance at which the green LED turns on. Repeat with a piece of matte black paper.",
        "observation": "White paper triggers from 10–15cm away. The black paper may need to get within 1–2cm or may not trigger at all.",
        "expected": "Demonstrates that dark matte surfaces absorb IR light instead of reflecting it. White shiny surfaces reflect excellently."
    }
];

const COMMON_MISTAKES = [
    {
        "title": "Sensor Always Triggered",
        "symptom": "Software constantly reads LOW even pointing into empty room.",
        "cause": "The sensitivity potentiometer screw is turned too high, making the receiver hypersensitive to tiny ambient IR reflections.",
        "fix": "Turn the blue potentiometer counter-clockwise until the green LED turns off. Then slowly clockwise until your hand at 5cm triggers it."
    },
    {
        "title": "Sunlight Blindness",
        "symptom": "Works perfectly indoors but triggers continuously outside.",
        "cause": "The sun emits massive broadband IR radiation, completely flooding the receiver and making it think an object is always present.",
        "fix": "Basic active IR modules cannot be used in direct sunlight. Advanced sensors solve this by pulsing the IR at 38kHz."
    }
];


const ARDUINO_CODE = `// IR Obstacle Sensor
#define IR_PIN 13

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



export default function IRPage() {
    const { isConnected, data } = useSocket();
    const [showQuiz, setShowQuiz] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);

    // Logic: Active LOW (0 = Object)
    // Invert for display: 1 = Object, 0 = Clear (easier for fault injection logic)
    const normalizedVal = data?.sensors.ir?.active ? 1 : 0;

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
                dataSnippet={{ value: isDetected, pin: "D13" }}
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
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">OUT</td><td className="py-1.5 font-mono text-red-400">D13</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="IR Sensor" sensorId="TCRT5000" onClose={() => setShowQuiz(false)} defaultQuestions={SENSOR_QUIZZES["ir"]} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
