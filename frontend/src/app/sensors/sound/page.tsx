"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LiveChart } from "@/components/charts/LiveChart";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Activity, Cpu, Info, Mic, Download, Sparkles, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { GraphExplainerModal } from "@/components/ai/GraphExplainerModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { useSignalProcessing } from "@/hooks/useSignalProcessing";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 50;

const THEORY = {
    physics: `Sound sensors use an **Electret Condenser Microphone (ECM)**.

**How ECM Works:**
• Thin metallized diaphragm + metal backplate form a capacitor.
• Electret material holds permanent charge.
• Sound waves vibrate diaphragm, changing capacitance.
• C = Q/V: fixed charge → varying voltage = audio signal.

**The Module (KY-038):**
• Contains mic + LM393 comparator.
• AO: Raw analog output.
• DO: Digital output when threshold exceeded.`,
    circuit: `**Signal Path:**
Mic → Amplifier → Comparator → Digital Out
                ↓
           Analog Out (A2)`,
};

const ARDUINO_CODE = `// Sound Sensor - KY-038
#define MIC_PIN A3
#define DO_PIN 5

void setup() {
  Serial.begin(115200);
  pinMode(DO_PIN, INPUT);
}

void loop() {
  int soundLevel = analogRead(MIC_PIN);
  bool loud = digitalRead(DO_PIN) == HIGH;
  
  Serial.print("Sound: ");
  Serial.print(soundLevel);
  if (loud) Serial.print(" [LOUD!]");
  Serial.println();
  delay(100);
}`;

const EXPERIMENTS = [
    { title: "Baseline Noise", instruction: "Observe the reading in a quiet room.", observation: "What's the baseline level?", expected: "Quiet room: 300-500 range." },
    { title: "Clap Test", instruction: "Clap your hands near the sensor.", observation: "How high does the spike go?", expected: "Loud sounds should spike to 900+ briefly." }
];

const COMMON_MISTAKES = [
    { title: "No Response", symptom: "Value barely changes with sound", cause: "Microphone sensitivity screw is too low", fix: "Turn blue potentiometer CW until LED flickers." },
    { title: "Too Noisy", symptom: "Jagged lines even in silence", cause: "Power supply noise or bad connection", fix: "Add capacitor to power rails. Check GND." }
];

export default function SoundPage() {
    const { isConnected, data } = useSocket();
    const [history, setHistory] = useState<DataPoint[]>([]);

    // Testing & AI
    const [showQuiz, setShowQuiz] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);
    const [calibrationOffset, setCalibrationOffset] = useState(0);

    const rawVal = data?.sensors.mic?.level ?? 0;
    const { injectedValue, fault, setFault } = useFaultInjector(rawVal);
    const calibratedValue = (typeof injectedValue === 'number') ? injectedValue + calibrationOffset : injectedValue;
    const { filter, setFilter, processedData } = useSignalProcessing(history.map(d => d.value));

    useEffect(() => {
        if (data && typeof calibratedValue === 'number') {
            const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false, minute: "2-digit", second: "2-digit" });
            setHistory((prev) => [...prev, { time: timestamp, value: calibratedValue }].slice(-MAX_DATA_POINTS));
        }
    }, [data, calibratedValue]);

    const chartData = history.map((point, i) => ({ ...point, processingValue: processedData[i] }));
    const anomalies = useMistakeDetector({ sensorName: "Sound Sensor", data: history, expectedRange: { min: 300, max: 800 } }).filter((_, i) => !dismissedAnomalies.includes(i));
    const displayValue = (typeof calibratedValue === "number") ? calibratedValue.toFixed(0) : "--";

    const exportCSV = () => {
        const csv = "Time,Sound (ADC),Processed\n" + chartData.map(d => `${d.time},${d.value},${d.processingValue ?? ''}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "sound_data.csv"; a.click();
    };

    return (
        <>
            <SensorDetailLayout
                title="Sound Sensor"
                description="Electret microphone with LM393 comparator for sound detection."
                sensorId="KY-038"
                dataSnippet={{ value: displayValue, pin: "A3" }}
                theory={THEORY}
                arduinoCode={ARDUINO_CODE}
                experiments={EXPERIMENTS}
                commonMistakes={COMMON_MISTAKES}
                testingProps={{ showPanel: showTestingPanel, setShowPanel: setShowTestingPanel, renderPanel: () => <TestingControlPanel faultType={fault.type} setFault={setFault} filterType={filter.type} setFilter={setFilter} calibrationOffset={calibrationOffset} setCalibrationOffset={setCalibrationOffset} /> }}
            >
                {anomalies.map((anomaly, i) => <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />)}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl" />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="h-14 w-14 mb-3 rounded-full bg-pink-500/10 flex items-center justify-center ring-1 ring-pink-500/20"><Mic className="h-7 w-7 text-pink-400" /></div>
                            <span className="text-xs font-medium text-slate-500 uppercase mb-1">Sound Level</span>
                            <span className={`text-5xl font-bold ${fault.type !== 'none' ? 'text-amber-300' : 'text-white'}`}>{displayValue}</span>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-3">{isConnected ? "Live" : "Offline"}</Badge>
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-pink-400" />Sound History</CardTitle>
                            <div className="flex gap-2">
                                <button onClick={() => setShowExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                                <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"><Download size={12} />CSV</button>
                            </div>
                        </CardHeader>
                        <CardContent><LiveChart data={chartData} color="#ec4899" gradientId="soundGrad" unit="" height={220} minDomain={0} maxDomain={1023} /></CardContent>
                    </Card>
                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-xl text-white font-medium hover:from-pink-500/30 hover:to-rose-500/30 transition">
                        <Brain className="h-5 w-5 text-pink-400" /> Quiz: Audio Sampling
                    </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><SpecRow label="Mic Type" value="Electret" /><SpecRow label="Comparator" value="LM393" /><SpecRow label="Outputs" value="Analog + Digital" /></CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">AO</td><td className="py-1.5 font-mono text-pink-400">A3</td></tr><tr><td className="py-1.5 font-mono text-white">DO</td><td className="py-1.5 font-mono text-pink-400">D5</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Sound Sensor" sensorId="KY-038" onClose={() => setShowQuiz(false)} />}
            {showExplainer && <GraphExplainerModal sensorName="Sound Sensor" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
