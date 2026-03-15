"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Cpu, Info, Hand, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";

const THEORY = {
    "physics": "The TTP223 is a dedicated capacitive touch sensor controller. Unlike resistive touchscreens that require physical pressure, capacitive touch senses the electrical properties of the human body. The sensor pad acts as one plate of a virtual capacitor, and the surrounding ground plane acts as the other. A constant high-frequency electrical charge is applied to the pad, establishing a baseline capacitance. The human body is mostly saltwater and acts as a massive conductive dielectric. When a finger approaches (even through 2-3mm of plastic or glass), it bleeds off a tiny amount of the electric field to human-ground, increasing the total capacitance of the node.",
    "math": "**Capacitive Loading Equation:**\n$ C_{total} = C_{parasitic} + C_{finger} $\n\nThe TTP223 chip constantly measures the precise RC discharging time of the pad footprint. If $C_{total}$ suddenly increases by a margin greater than the programmed baseline threshold, the chip interprets it as a valid touch event.",
    "circuit": "**Hardware Architecture:**\n- **TTP223 IC:** A highly integrated ASIC. It constantly re-calibrates its baseline to ignore environmental factors like temperature drift or humidity changes.\n- **Power Draw:** Engineered for battery-powered IoT, it draws an incredibly microscopic 1.5uA in standby mode.\n- **Pads A & B:** Small solder jumpers on the back of the module allow you to configure the output state. You can toggle between Active-HIGH vs Active-LOW, and Momentary vs Latch (Toggle switch) configurations directly in hardware."
};
const EXPERIMENTS = [
    {
        "title": "Hidden Switch Test (Dielectric Penetration)",
        "instruction": "Place a piece of printer paper over the copper face of the sensor. Touch the paper above the sensor. Then try thick cardboard, then a thin piece of glass.",
        "observation": "The sensor triggers through the paper and glass. It may fail on thick cardboard.",
        "expected": "Capacitance is based on electric fields, which penetrate non-conductive materials (dielectrics). Exactly how smartphone screens work."
    }
];

const COMMON_MISTAKES = [
    {
        "title": "False Positives in Damp Environments",
        "symptom": "Button presses itself when humidity is high or water is near the sensor.",
        "cause": "Water is conductive. A bead of water bridging across the copper pad instantly mimics a human finger's capacitive effect.",
        "fix": "For water-prone environments, standard conformal coatings help but consider using waterproof industrial capacitive sensors instead."
    },
    {
        "title": "Sensor Ignores Finger After Power-On",
        "symptom": "Touching the sensor has no effect for the first half second, or permanently if touched at startup.",
        "cause": "The TTP223 performs a 0.5-second automatic baseline calibration at power-on. It calibrates your finger as the 'empty' baseline.",
        "fix": "Keep hands away from the sensor, power cycle, and wait 1 second before touching."
    }
];


const ARDUINO_CODE = `// Touch Sensor - TTP223
#define TOUCH_PIN 5

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
                dataSnippet={{ value: isTouched, pin: "D5" }}
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
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">I/O</td><td className="py-1.5 font-mono text-teal-400">D5</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Touch Sensor" sensorId="TTP223" onClose={() = defaultQuestions={SENSOR_QUIZZES["touch"]} > setShowQuiz(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
