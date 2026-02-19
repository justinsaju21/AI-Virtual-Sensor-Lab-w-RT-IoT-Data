"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LiveChart } from "@/components/charts/LiveChart";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Activity, Cpu, Info, Flame, Download, Sparkles, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { GraphExplainerModal } from "@/components/ai/GraphExplainerModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { useSignalProcessing } from "@/hooks/useSignalProcessing";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 50;

const THEORY = {
    physics: `The MQ2 is a **Metal Oxide Semiconductor (MOS) gas sensor** (chemiresistor).

**Core Material:** SnO₂ (Tin Dioxide) heated to 200-400°C.

**Detection Mechanism (Redox Reaction):**

**In Clean Air:**
1. Oxygen adsorbs on SnO₂ surface, trapping electrons.
2. Creates depletion layer → HIGH resistance.

**When Gas Present:**
1. Combustible gases react with adsorbed oxygen.
2. Electrons released back to SnO₂.
3. Depletion layer shrinks → LOW resistance.

Higher gas concentration → Lower resistance → Higher output voltage.`,

    math: `**Resistance Relationship:**
Rs / R₀ ∝ 1 / [Gas]^α

Where α ≈ 0.4-0.6

**Output Voltage:**
V_out = V_cc × (RL / (Rs + RL))

RL is typically 10kΩ load resistor.`,
};

const ARDUINO_CODE = `// Gas Sensor - MQ2
#define MQ2_PIN A0

void setup() {
  Serial.begin(115200);
  Serial.println("MQ2 preheating...");
  delay(20000); // 20 second preheat
  Serial.println("Ready!");
}

void loop() {
  int gasValue = analogRead(MQ2_PIN);
  
  Serial.print("Gas Level: ");
  Serial.println(gasValue);
  
  if (gasValue > 400) {
    Serial.println("WARNING: High gas!");
  }
  delay(1000);
}`;

const EXPERIMENTS = [
    {
        title: "Preheat and Baseline",
        instruction: "Wait 2-3 minutes for the sensor to warm up. Note the baseline reading in clean air.",
        observation: "What's the stable baseline value?",
        expected: "Baseline typically 100-300 in clean air. Sensor needs heating to operate correctly."
    },
    {
        title: "Lighter Gas Test (Caution!)",
        instruction: "Briefly release gas from a lighter (unlit!) near the sensor from 10cm away.",
        observation: "How quickly does the value rise? How high?",
        expected: "LPG should cause a rapid spike to 600-900+. Value should return to baseline after 30-60s."
    }
];

const COMMON_MISTAKES = [
    { title: "Value keeps rising", symptom: "Value increases steadily for 5-10 mins", cause: "Sensor is preheating (normal)", fix: "Wait 5-10 minutes for SnO₂ to reach operating temp." },
    { title: "Low Sensitivity", symptom: "Barely reacts to gas", cause: "Load resistor sensitivity too low or gas too far", fix: "Adjust onboard potentiometer if module has one." },
    { title: "Hot Sensor", symptom: "Sensor feels hot to touch", cause: "Heater element active", fix: "Normal. It needs heat to work. But if burning hot, check wiring." }
];

export default function GasPage() {
    const { isConnected, data } = useSocket();
    const [history, setHistory] = useState<DataPoint[]>([]);

    // Testing & AI State
    const [showQuiz, setShowQuiz] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);
    const [calibrationOffset, setCalibrationOffset] = useState(0);

    const rawValFromSocket = data?.sensors.mq2?.value ?? 0;
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
    const anomalies = useMistakeDetector({ sensorName: "Gas Sensor", data: history, expectedRange: { min: 50, max: 900 } }).filter((_, i) => !dismissedAnomalies.includes(i));
    const displayValue = (typeof calibratedValue === "number") ? calibratedValue.toFixed(0) : "--";

    const exportCSV = () => {
        const csv = "Time,Gas (ADC),Processed\n" + chartData.map(d => `${d.time},${d.value},${d.processingValue ?? ''}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "gas_data.csv"; a.click();
    };

    return (
        <>
            <SensorDetailLayout
                title="Gas Sensor (Smoke/LPG)"
                description="Chemiresistor detecting combustible gases via SnO₂ redox reaction."
                sensorId="MQ2"
                dataSnippet={{ value: displayValue, pin: "A0" }}
                theory={THEORY}
                arduinoCode={ARDUINO_CODE}
                experiments={EXPERIMENTS}
                commonMistakes={COMMON_MISTAKES}
                testingProps={{ showPanel: showTestingPanel, setShowPanel: setShowTestingPanel, renderPanel: () => <TestingControlPanel faultType={fault.type} setFault={setFault} filterType={filter.type} setFilter={setFilter} calibrationOffset={calibrationOffset} setCalibrationOffset={setCalibrationOffset} /> }}
            >
                {anomalies.map((anomaly, i) => <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />)}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="h-14 w-14 mb-3 rounded-full bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/20"><Flame className="h-7 w-7 text-red-400" /></div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Gas Level</span>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-5xl font-bold tracking-tighter ${fault.type !== 'none' ? 'text-amber-400' : 'text-white'}`}>{displayValue}</span>
                            </div>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            {calibrationOffset !== 0 && <span className="text-xs text-indigo-400 mt-1">Offset: {calibrationOffset > 0 ? '+' : ''}{calibrationOffset}</span>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-3">{isConnected ? "Live" : "Offline"}</Badge>
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-red-400" />Gas History</CardTitle>
                            <div className="flex gap-2">
                                <button onClick={() => setShowExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                                <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"><Download size={12} />CSV</button>
                            </div>
                        </CardHeader>
                        <CardContent><LiveChart data={chartData} color="#ef4444" gradientId="gasGrad" unit="" height={220} minDomain={0} maxDomain={1023} /></CardContent>
                    </Card>
                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl text-white font-medium hover:from-red-500/30 hover:to-orange-500/30 transition">
                        <Brain className="h-5 w-5 text-red-400" /> Take AI Quiz on Gas Sensors
                    </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><SpecRow label="Detects" value="LPG, Smoke, CO" /><SpecRow label="Range" value="200-10,000 ppm" /><SpecRow label="Preheat" value="~20 seconds" /></CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">VCC</td><td className="py-1.5 font-mono text-red-400">5V</td></tr><tr><td className="py-1.5 font-mono text-white">A0</td><td className="py-1.5 font-mono text-red-400">A0</td></tr><tr><td className="py-1.5 font-mono text-white">GND</td><td className="py-1.5 font-mono text-red-400">GND</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Gas Sensor" sensorId="MQ2" onClose={() => setShowQuiz(false)} />}
            {showExplainer && <GraphExplainerModal sensorName="Gas Sensor" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
