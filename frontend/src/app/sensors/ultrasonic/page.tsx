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

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 50;

const THEORY = {
    physics: `The HC-SR04 uses **ultrasonic echolocation** to measure distance.

**Key Components:**
• **Transmitter (Tx):** 40kHz ultrasound.
• **Receiver (Rx):** Detects returning echo.

**Piezoelectric Effect:**
• Applying voltage vibrates crystal (sound generation).
• Sound vibration creates voltage (sound detection).

**Sensing Process:**
1. Trig: 10µs HIGH pulse.
2. Tx: Emits 8 bursts.
3. Sound travels, hits object, reflects.
4. Echo: Pin goes HIGH for duration of flight.`,

    math: `**Time-of-Flight:**
Distance = (Speed × Time) / 2

**Formula:**
d = t / 58.2  (cm, t in µs)

**Example:**
If echo pulse = 580µs:
d = 580 / 58.2 ≈ 10 cm`,

    protocol: `**Timing Sequence:**
1. Trigger: 10µs HIGH on TRIG pin
2. Sensor sends 8 × 40kHz pulses
3. ECHO goes HIGH until echo returns`,
};

const ARDUINO_CODE = `// Ultrasonic Distance - HC-SR04
#define TRIG_PIN 9
#define ECHO_PIN 10

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

const EXPERIMENTS = [
    { title: "Measure Fixed Object", instruction: "Place object at 20cm. Compare reading.", observation: "How accurate is it?", expected: "Within ±3mm. Some jitter normal." },
    { title: "Minimum Range", instruction: "Move closer until failure.", observation: "At what distance does it fail?", expected: "< 2cm, echoes return too fast." },
    { title: "Soft Surface", instruction: "Target a pillow or fabric.", observation: "Is reading stable?", expected: "Fabric absorbs sound, causing unstable or lost readings." }
];

const COMMON_MISTAKES = [
    { title: "Always 0cm", symptom: "Reading stuck at 0", cause: "Out of range (>4m) or bad wiring", fix: "Check Trig/Echo connections. Ensure object is within 4m." },
    { title: "Jittery Values", symptom: "Values jump ±5cm", cause: "Noisy power or angled target", fix: "Use flat target surface. Add capacitor to power rails." }
];

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
        const a = document.createElement("a"); a.href = url; a.download = "distance_data.csv"; a.click();
    };

    return (
        <>
            <SensorDetailLayout
                title="Ultrasonic Distance Sensor"
                description="Measures distance using 40kHz ultrasonic pulses and time-of-flight calculation."
                sensorId="HC-SR04"
                dataSnippet={{ value: displayValue, unit: "cm", trigPin: "D9", echoPin: "D10" }}
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
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">VCC</td><td className="py-1.5 font-mono text-purple-400">5V</td></tr><tr><td className="py-1.5 font-mono text-white">TRIG</td><td className="py-1.5 font-mono text-purple-400">D9</td></tr><tr><td className="py-1.5 font-mono text-white">ECHO</td><td className="py-1.5 font-mono text-purple-400">D10</td></tr><tr><td className="py-1.5 font-mono text-white">GND</td><td className="py-1.5 font-mono text-purple-400">GND</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Ultrasonic Sensor" sensorId="HC-SR04" onClose={() => setShowQuiz(false)} />}
            {showExplainer && <GraphExplainerModal sensorName="Ultrasonic Sensor" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
