"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Cpu, Info, Radar, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";

const THEORY = {
    "physics": "Inductive proximity sensors operate purely on electromagnetism and Faraday's Law of Induction. The sensor head contains an oscillator circuit that drives an alternating current through an internal copper coil, generating a high-frequency alternating magnetic field out the front face. When a conductive metal object (like steel, aluminum, or copper) enters this field, the changing magnetic flux induces 'Eddy Currents' within the surface of the metal target. These eddy currents generate their own opposing magnetic field, which absorbs energy from the sensor's oscillator, causing the oscillation amplitude to collapse.",
    "math": "**Oscillator Damping (Eddy Currents):**\n$ P_{eddy} = \\frac{\\pi^2 \\cdot B^2 \\cdot d^2 \\cdot f^2}{6 \\cdot \\rho \\cdot D} $\n\nWhere:\n- $P_{eddy}$: Power dissipated in the target\n- $B$: Magnetic field density\n- $f$: Oscillator frequency\n- $\\rho$: Target resistivity\n\nThe sensor triggers precisely when the oscillator's energy drops below a designated threshold.",
    "circuit": "**Hardware Architecture:**\n- **Oscillator/Coil:** Generates the electromagnetic sensing field.\n- **Schmitt Trigger:** An internal flip-flop circuit monitors the oscillator's amplitude. When the amplitude collapses past the threshold, the Schmitt trigger snaps the output to a clean digital state.\n- **Industrial Housing:** Often packaged in a threaded metal body. The output is typically an NPN (sinks to ground) or PNP (sources voltage) industrial standard."
};
const EXPERIMENTS = [
    {
        "title": "Material Conductivity Sorter Test",
        "instruction": "Slowly lower the inductive sensor toward a steel block until it triggers — record the distance. Repeat with aluminum, then plastic.",
        "observation": "Steel triggers at ~4mm. Aluminum at ~1.5mm. Plastic never triggers.",
        "expected": "Demonstrates magnetic permeability vs eddy-current conductivity. Ferrous steel has huge eddy current losses. Aluminum is conductive but non-magnetic. Plastic is an insulator."
    }
];

const COMMON_MISTAKES = [
    {
        "title": "Destroying the Arduino with PNP Voltage",
        "symptom": "Arduino immediately stops working after connecting sensor.",
        "cause": "PNP sensor outputs 12V on its signal wire. Plugging directly into a 5V-rated Arduino logic pin.",
        "fix": "Use an NPN sensor (which only sinks to GND), or build a voltage divider (e.g., 10kΩ + 15kΩ) to reduce 12V signal."
    },
    {
        "title": "LED Works but Arduino Never Triggers",
        "symptom": "Sensor LED turns on when metal is nearby but digitalRead always returns HIGH.",
        "cause": "NPN sensor requires a pull-up. Using pinMode(INPUT) leaves the pin floating when sensor is not active.",
        "fix": "Change configuration code to: pinMode(PROX_PIN, INPUT_PULLUP);"
    }
];


const ARDUINO_CODE = `// Proximity Sensor (Demo Only - Not Connected)
// This sensor is simulated with mock data.
// To use a real proximity sensor (e.g., E18-D80NK):
#define PROX_PIN 11

void setup() {
  Serial.begin(115200);
  pinMode(PROX_PIN, INPUT_PULLUP);
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
                description="Non-contact object detection (Mock/Demo mode - no physical sensor connected)."
                sensorId="E18-D80NK"
                dataSnippet={{ value: isDetected, pin: "D11" }}
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
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><SpecRow label="Mode" value="Mock / Demo" /><SpecRow label="Types" value="IR / Capacitive" /><SpecRow label="Range" value="2-80cm (typical)" /></CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">OUT</td><td className="py-1.5 font-mono text-slate-400">D11 (not connected)</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Proximity Sensor" sensorId="E18-D80NK" onClose={() = defaultQuestions={SENSOR_QUIZZES["proximity"]} > setShowQuiz(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
