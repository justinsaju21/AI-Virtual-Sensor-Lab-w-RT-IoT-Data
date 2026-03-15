"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LiveChart } from "@/components/charts/LiveChart";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Activity, Cpu, Info, Radar, Download, Sparkles, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { GraphExplainerModal } from "@/components/ai/GraphExplainerModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { useSignalProcessing } from "@/hooks/useSignalProcessing";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";
import { SENSOR_QUIZZES } from "@/config/quizzes";

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 50;

const THEORY = {
    "physics": "The HC-SR04 operates heavily on the principles of acoustic wave propagation and reflection. It houses a piezoelectric ultrasonic transmitter (the 'T' speaker) and receiver (the 'R' microphone). The physics are identical to bat echolocation. When triggered, the transmitter physically deforms a piezoelectric crystal at a high frequency, emitting an inaudible 40,000 Hz sound wave burst. This high-frequency acoustic wave propagates through the air at the speed of sound. If it strikes a solid object, the pressure wave rebounds. The receiver crystal gets compressed by the returning echo wave, generating a tiny voltage spike.",
    "math": "**Time-of-Flight (ToF) Kinematics:**\nThe distance to an object is calculated by measuring the total time the sound takes to travel to the object and back.\n\n$ Distance = \\frac{Time \\times Speed\\:Of\\:Sound}{2} $\n\n- Speed of sound at 20°C: ~343 meters/second, or **0.0343 cm/microsecond**.\n- Since the burst traveled *to* the object and *back*, we divide the total time by 2.\n- Algorithm: `Distance(cm) = (Duration(us) * 0.0343) / 2`",
    "circuit": "**Hardware Architecture:**\n- **Trigger Pin:** The Arduino sends a 10-microsecond HIGH pulse on this pin to command the module to fire.\n- **Echo Pin:** The HC-SR04 pulls this pin HIGH the moment the sound bursts, and pulls it LOW the moment the echo is received. The Arduino relies on `pulseIn()` to measure the exact microsecond duration of this HIGH state.\n- **Piezo Transducers:** Operates completely indepedently of light, making it effective in total darkness, but utterly useless in a vacuum or high-noise environments."
};
const EXPERIMENTS = [
    {
        "title": "Minimum Range Dead Zone",
        "instruction": "Bring a flat book closer and closer to the sensor face.",
        "observation": "Around 2cm, readings become erratic, jump to 0, or give wildly wrong values.",
        "expected": "Below 2cm, the sound cone angle means the echo bounces at an angle outside the receiver's narrow cylinder — a fundamental physical limitation."
    },
    {
        "title": "Surface Material Absorption Test",
        "instruction": "Measure the distance to a flat wooden board at 30cm, then repeat with a fluffy pillow at the same distance.",
        "observation": "The wood gives a perfect reading. The pillow gives erratic results or 'Out of range'.",
        "expected": "Soft, porous materials absorb ultrasonic energy. HC-SR04 only works reliably against hard, flat, sound-reflective surfaces."
    }
];

const COMMON_MISTAKES = [
    {
        "title": "pulseIn() Freezes the Arduino",
        "symptom": "Code stops entirely when pointing at the open sky or an empty room.",
        "cause": "pulseIn(ECHO_PIN, HIGH) with no timeout waits up to 1 second for an echo that never comes.",
        "fix": "Always include the timeout: pulseIn(ECHO_PIN, HIGH, 30000);"
    },
    {
        "title": "Constant 0 cm Output",
        "symptom": "Always reads 0 regardless of distance.",
        "cause": "TRIG and ECHO pins swapped in wiring vs code.",
        "fix": "Verify the TRIG pin (output) and ECHO pin (input) are not reversed in both the physical wiring and the #define statements."
    }
];


const ARDUINO_CODE = `// Ultrasonic Distance - HC-SR04
#define TRIG_PIN 3
#define ECHO_PIN 4

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration == 0) return;
  
  float dist = duration * 0.034 / 2;
  
  Serial.print("Distance: ");
  Serial.print(dist);
  Serial.println(" cm");
  delay(500);
}`;





export default function UltrasonicPage() {
    const { isConnected, data } = useSocket();
    const [history, setHistory] = useState<DataPoint[]>([]);

    // Testing & AI State
    const [showQuiz, setShowQuiz] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);
    const [calibrationOffset, setCalibrationOffset] = useState(0);

    const rawValFromSocket = data?.sensors.ultrasonic?.distance_cm ?? 0;
    const { injectedValue, fault, setFault } = useFaultInjector(rawValFromSocket);
    const calibratedValue = (typeof injectedValue === 'number') ? injectedValue + calibrationOffset : injectedValue;
    const { filter, setFilter, processedData } = useSignalProcessing(history.map(d => d.value));

    useEffect(() => {
        if (data && typeof calibratedValue === 'number') {
            const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false, minute: "2-digit", second: "2-digit" });
            setHistory((prev) => [...prev, { time: timestamp, value: calibratedValue }].slice(-MAX_DATA_POINTS));
        }
    }, [data, calibratedValue]);

    const chartData = history.map((point, i) => ({ ...point, processingValue: processedData[i] }));
    const anomalies = useMistakeDetector({ sensorName: "Ultrasonic Sensor", data: history, expectedRange: { min: 2, max: 400 } }).filter((_, i) => !dismissedAnomalies.includes(i));
    const displayValue = (typeof calibratedValue === "number") ? calibratedValue.toFixed(1) : "--";

    const exportCSV = () => {
        const csv = "Time,Distance (cm),Processed\n" + chartData.map(d => `${d.time},${d.value},${d.processingValue ?? ''}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "distance_data.csv"; a.click(); URL.revokeObjectURL(url);
    };

    return (
        <>
            <SensorDetailLayout
                title="Ultrasonic Distance Sensor"
                description="Measures distance using 40kHz ultrasonic pulses and time-of-flight calculation."
                sensorId="HC-SR04"
                dataSnippet={{ value: displayValue, unit: "cm", trigPin: "D3", echoPin: "D4" }}
                theory={THEORY}
                arduinoCode={ARDUINO_CODE}
                experiments={EXPERIMENTS}
                commonMistakes={COMMON_MISTAKES}
                testingProps={{ showPanel: showTestingPanel, setShowPanel: setShowTestingPanel, renderPanel: () => <TestingControlPanel faultType={fault.type} setFault={setFault} filterType={filter.type} setFilter={setFilter} calibrationOffset={calibrationOffset} setCalibrationOffset={setCalibrationOffset} /> }}
            >
                {anomalies.map((anomaly, i) => <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />)}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="h-14 w-14 mb-3 rounded-full bg-purple-500/10 flex items-center justify-center ring-1 ring-purple-500/20"><Radar className="h-7 w-7 text-purple-400" /></div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Distance</span>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-5xl font-bold tracking-tighter ${fault.type !== 'none' ? 'text-amber-400' : 'text-white'}`}>{displayValue}</span>
                                <span className="text-xl text-slate-500 font-medium">cm</span>
                            </div>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            {calibrationOffset !== 0 && <span className="text-xs text-indigo-400 mt-1">Offset: {calibrationOffset > 0 ? '+' : ''}{calibrationOffset}cm</span>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-3">{isConnected ? "Live" : "Offline"}</Badge>
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-purple-400" />Distance History</CardTitle>
                            <div className="flex gap-2">
                                <button onClick={() => setShowExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                                <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"><Download size={12} />CSV</button>
                            </div>
                        </CardHeader>
                        <CardContent><LiveChart data={chartData} color="#a855f7" gradientId="ultrasonicGrad" unit="cm" height={220} minDomain={0} maxDomain={200} /></CardContent>
                    </Card>
                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl text-white font-medium hover:from-purple-500/30 hover:to-pink-500/30 transition">
                        <Brain className="h-5 w-5 text-purple-400" /> Quiz: Ultrasonic Physics
                    </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><SpecRow label="Range" value="2 - 400 cm" /><SpecRow label="Accuracy" value="±3mm" /><SpecRow label="Frequency" value="40 kHz" /></CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">VCC</td><td className="py-1.5 font-mono text-purple-400">5V</td></tr><tr><td className="py-1.5 font-mono text-white">TRIG</td><td className="py-1.5 font-mono text-purple-400">D3</td></tr><tr><td className="py-1.5 font-mono text-white">ECHO</td><td className="py-1.5 font-mono text-purple-400">D4</td></tr><tr><td className="py-1.5 font-mono text-white">GND</td><td className="py-1.5 font-mono text-purple-400">GND</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Ultrasonic Sensor" sensorId="HC-SR04" onClose={() => setShowQuiz(false)} defaultQuestions={SENSOR_QUIZZES["ultrasonic"]} />}
            {showExplainer && <GraphExplainerModal sensorName="Ultrasonic Sensor" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
