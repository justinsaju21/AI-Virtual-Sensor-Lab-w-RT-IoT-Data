"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LiveChart } from "@/components/charts/LiveChart";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Activity, Cpu, Info, Heart, Download, Sparkles, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { GraphExplainerModal } from "@/components/ai/GraphExplainerModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { useSignalProcessing } from "@/hooks/useSignalProcessing";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 100;

const THEORY = {
    "physics": "The MAX30102 operates on the principle of Photoplethysmography (PPG). It physically combines a red LED (660nm), an infrared LED (880nm), and a highly sensitive photodetector into a single module. As the heart beats, a pulse of oxygen-rich blood surges through the capillary bed in the finger. Oxygenated hemoglobin (HbO₂) absorbs more IR light and lets more Red light pass through, while deoxygenated hemoglobin (Hb) absorbs more Red light. By rapidly alternating the LEDs and measuring the reflected light, the sensor detects the volumetric change in the blood vessels, generating a pulsatile AC waveform.",
    "math": "**SpO2 & Heart Rate Calculation:**\nHeart Rate is determined by measuring the time interval between consecutive peaks of the AC pulsatile waveform.\n\n$ BPM = \\frac{60}{Time\\:Between\\:Peaks\\:(seconds)} $\n\nBlood Oxygen (SpO2%) is calculated using the Ratio of Ratios (R) between the Red and IR AC/DC components:\n\n$ R = \\frac{AC_{Red} / DC_{Red}}{AC_{IR} / DC_{IR}} $\n$ SpO_2 = 104 - 17 \\times R $",
    "circuit": "**Hardware Architecture:**\n- **MAX30102 Silicon:** An integrated pulse oximetry and heart-rate monitor biosensor module. It includes internal LEDs, photodetectors, optical elements, and low-noise electronics with ambient light rejection.\n- **Interface:** Communicates via the I2C protocol at up to 400kHz.\n- **Voltage:** The core operates at 1.8V, driven by an onboard 1.8V LDO voltage regulator, while the I2C lines are logic-level shifted to safely interface with 5V Arduino boards."
};
const EXPERIMENTS = [
    {
        "title": "Breathing Rhythm Test (RSA)",
        "instruction": "Sit still and breathe normally for 60 seconds. Record average BPM. Then hold your breath for 20 seconds, followed by rapid deep breathing.",
        "observation": "Heart rate naturally fluctuates with the breathing cycle. Rapid breathing briefly increases BPM.",
        "expected": "Demonstrates Respiratory Sinus Arrhythmia (RSA) — the normal physiological coupling between breathing and heart rate."
    },
    {
        "title": "Ambient Light Saturation Test",
        "instruction": "Take a stable reading in a dim room. Then shine a bright smartphone flashlight directly at the sensor and fingertip.",
        "observation": "The raw IR waveform distorts or becomes flat. BPM detection becomes impossible.",
        "expected": "Intense external light floods the photodetector (optical saturation), drowning out the tiny LED reflections."
    }
];

const COMMON_MISTAKES = [
    {
        "title": "Wandering Baseline / Erratic BPM",
        "symptom": "Heartbeat graph shoots up and down randomly. BPM oscillates wildly.",
        "cause": "Pressing too hard on the sensor squeezes blood out of capillaries. Any finger movement changes optical distance.",
        "fix": "Rest the finger gently but consistently on the glass. Do not press, squeeze, or move."
    },
    {
        "title": "No BPM Calculated",
        "symptom": "IR reads 0 or outputs 80,000 but no beat is ever detected.",
        "cause": "Finger not covering both the LED and detector, or LED power amplitude set too low for skin thickness.",
        "fix": "Reposition finger to cover the entire sensor face. Increase amplitude in code and warm up cold hands first."
    },
    {
        "title": "I²C Bus Freezing",
        "symptom": "Serial monitor outputs data for 3 seconds then stops permanently.",
        "cause": "I²C bus pulled down by loose wiring during finger repositioning, or insufficient power supply.",
        "fix": "Solder headers firmly. Add 4.7kΩ pull-up resistors to SDA and SCL if the breakout board lacks them."
    }
];


const ARDUINO_CODE = `// Heartbeat Sensor - MAX30102 (I2C)
#include <Wire.h>
#include "MAX30105.h"

MAX30105 particleSensor;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAX30102 not found!");
    while(1);
  }
  particleSensor.setup();
}

void loop() {
  long irValue = particleSensor.getIR();
  Serial.println(irValue);
  delay(20); // Fast sampling for waveform
}`;

const EXPERIMENTS = [
    { title: "Resting Heart Rate", instruction: "Place finger on sensor, wait 30s until stable.", observation: "What's your resting BPM?", expected: "Normal: 60-100 BPM at rest." }
];



export default function HeartbeatPage() {
    const { isConnected, data } = useSocket();
    const [history, setHistory] = useState<DataPoint[]>([]);

    // Testing & AI
    const [showQuiz, setShowQuiz] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);
    const [calibrationOffset, setCalibrationOffset] = useState(0);

    const rawVal = data?.sensors.max30102?.ir ?? 0;
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
    const anomalies = useMistakeDetector({ sensorName: "Pulse Sensor", data: history, expectedRange: { min: 300, max: 900 } }).filter((_, i) => !dismissedAnomalies.includes(i));
    const displayValue = (typeof calibratedValue === "number") ? calibratedValue.toFixed(0) : "--";

    const exportCSV = () => {
        const csv = "Time,PPG,Processed\n" + chartData.map(d => `${d.time},${d.value},${d.processingValue ?? ''}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "heartbeat_data.csv"; a.click(); URL.revokeObjectURL(url);
    };

    return (
        <>
            <SensorDetailLayout
                title="Heartbeat Sensor"
                description="Detects heart rate via photoplethysmography."
                sensorId="MAX30102"
                dataSnippet={{ value: displayValue, interface: "I2C (SDA/SCL)" }}
                theory={THEORY}
                arduinoCode={ARDUINO_CODE}
                experiments={EXPERIMENTS}
                commonMistakes={COMMON_MISTAKES}
                testingProps={{ showPanel: showTestingPanel, setShowPanel: setShowTestingPanel, renderPanel: () => <TestingControlPanel faultType={fault.type} setFault={setFault} filterType={filter.type} setFilter={setFilter} calibrationOffset={calibrationOffset} setCalibrationOffset={setCalibrationOffset} /> }}
            >
                {anomalies.map((anomaly, i) => <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />)}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl" />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="h-14 w-14 mb-3 rounded-full bg-rose-500/10 flex items-center justify-center ring-1 ring-rose-500/20"><Heart className="h-7 w-7 text-rose-400 animate-pulse" /></div>
                            <span className="text-xs text-slate-500 uppercase mb-1">PPG Signal</span>
                            <span className={`text-5xl font-bold ${fault.type !== 'none' ? 'text-amber-300' : 'text-white'}`}>{displayValue}</span>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-3">{isConnected ? "Live" : "Offline"}</Badge>
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-rose-400" />PPG Waveform</CardTitle>
                            <div className="flex gap-2">
                                <button onClick={() => setShowExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                                <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"><Download size={12} />CSV</button>
                            </div>
                        </CardHeader>
                        <CardContent><LiveChart data={chartData} color="#f43f5e" gradientId="heartGrad" unit="" height={220} minDomain={400} maxDomain={800} /></CardContent>
                    </Card>
                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500/20 to-red-500/20 border border-pink-500/30 rounded-xl text-white font-medium hover:from-pink-500/30 hover:to-red-500/30 transition">
                        <Brain className="h-5 w-5 text-rose-400" /> Quiz: Photoplethysmography
                    </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><SpecRow label="Method" value="PPG" /><SpecRow label="LED" value="Green ~530nm" /></CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">SDA</td><td className="py-1.5 font-mono text-rose-400">20</td></tr><tr><td className="py-1.5 font-mono text-white">SCL</td><td className="py-1.5 font-mono text-rose-400">21</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Heartbeat Sensor" sensorId="Pulse" onClose={() = defaultQuestions={SENSOR_QUIZZES["heartbeat"]} > setShowQuiz(false)} />}
            {showExplainer && <GraphExplainerModal sensorName="Heartbeat Sensor" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
