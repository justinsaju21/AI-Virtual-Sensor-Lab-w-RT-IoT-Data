"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LiveChart } from "@/components/charts/LiveChart";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Activity, Cpu, Droplets, Info, Download, Sparkles, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { GraphExplainerModal } from "@/components/ai/GraphExplainerModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { useSignalProcessing } from "@/hooks/useSignalProcessing";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 50;

const THEORY = {
    physics: `The DHT22's humidity sensing element is a **capacitive polymer sensor**.

**How Capacitive Humidity Sensing Works:**
• Two electrodes are separated by a thin layer of hygroscopic polymer material.
• This polymer acts as the dielectric in a parallel-plate capacitor.

**The Key Principle:**
• When humidity increases, water vapor is absorbed into the polymer.
• Water has a high dielectric constant (~80) compared to dry polymer (~2-5).
• This absorption changes the dielectric constant of the polymer layer.
• Capacitance is proportional to dielectric constant: C = ε × (A/d)
• Therefore, capacitance ↑ as humidity ↑.

**Signal Processing:**
1. An oscillator circuit measures the capacitance.
2. The frequency of the oscillator changes with capacitance.
3. The internal MCU converts this frequency change to a humidity percentage.`,

    math: `**Capacitance Equation:**

C = ε₀ × εᵣ × (A / d)

Where:
• C = Capacitance (Farads)
• ε₀ = Permittivity of free space (8.854 × 10⁻¹² F/m)
• εᵣ = Relative permittivity (dielectric constant)
• A = Area of the capacitor plates (m²)
• d = Distance between plates (m)

**Typical Relationship:**
RH% ≈ k × (C_measured / C_reference)

Where k is a calibration constant stored in the sensor's EEPROM.`,
};

const ARDUINO_CODE = `// Humidity Reading - DHT22
#include <DHT.h>

#define DHT_PIN 2
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  delay(2000);
  
  float humidity = dht.readHumidity();
  
  if (isnan(humidity)) {
    Serial.println("Failed to read!");
    return;
  }
  
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");
}`;

const EXPERIMENTS = [
    {
        title: "Baseline Humidity",
        instruction: "Observe the humidity reading for 2 minutes without any interference.",
        observation: "What is the ambient humidity? Is it stable?",
        expected: "Indoor humidity typically ranges from 30-60% RH. Minor fluctuations are normal."
    },
    {
        title: "Breath Test",
        instruction: "Breathe gently on the sensor from 5cm away for 3-5 seconds.",
        observation: "How much did humidity increase? How long until it returns to baseline?",
        expected: "Humidity may spike to 70-90% briefly. Recovery takes 30-60 seconds due to sensor lag."
    },
    {
        title: "Dry Environment",
        instruction: "If available, place the sensor near an air conditioner vent (not directly in airflow).",
        observation: "Is the humidity lower near the AC?",
        expected: "AC tends to reduce humidity. You may see values drop to 25-40% RH."
    }
];

const COMMON_MISTAKES = [
    { title: "Stuck at 99.9%", symptom: "Humidity reads max value constantly", cause: "Condensation on sensor or short circuit", fix: "Dry sensor with gentle air. Check for water bridges on pins." },
    { title: "Reading 0%", symptom: "Humidity reads 0% constantly", cause: "Wiring issue or damaged sensor", fix: "Check data pin connection. replace sensor if persistent." },
    { title: "Slow Response", symptom: "Takes long time to change value", cause: "Polymer absorption taking time", fix: "Normal for this sensor type. Don't use for rapid changes." }
];

export default function HumidityPage() {
    const { isConnected, data } = useSocket();
    const [history, setHistory] = useState<DataPoint[]>([]);

    // Testing & AI State
    const [showQuiz, setShowQuiz] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);
    const [calibrationOffset, setCalibrationOffset] = useState(0);

    // 1. Raw Input
    const rawValFromSocket = data?.sensors.dht11?.humidity ?? data?.sensors.dht22?.humidity ?? 0;

    // 2. Fault Injection
    const { injectedValue, fault, setFault } = useFaultInjector(rawValFromSocket);

    // 3. Calibration
    const calibratedValue = (typeof injectedValue === 'number') ? injectedValue + calibrationOffset : injectedValue;

    // 4. Signal Processing stream
    const { filter, setFilter, processedData } = useSignalProcessing(history.map(d => d.value));

    useEffect(() => {
        if (data && typeof calibratedValue === 'number') {
            const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false, minute: "2-digit", second: "2-digit" });
            setHistory((prev) => [...prev, { time: timestamp, value: calibratedValue }].slice(-MAX_DATA_POINTS));
        }
    }, [data, calibratedValue]);

    // Merge Processed Data
    const chartData = history.map((point, i) => ({
        ...point,
        processingValue: processedData[i]
    }));

    // Anomaly Detection
    const anomalies = useMistakeDetector({
        sensorName: "Humidity Sensor",
        data: history,
        expectedRange: { min: 20, max: 90 }
    }).filter((_, i) => !dismissedAnomalies.includes(i));

    const displayValue = (typeof calibratedValue === "number") ? calibratedValue.toFixed(1) : "--";

    const exportCSV = () => {
        const csv = "Time,Humidity (%),Processed\n" + chartData.map(d => `${d.time},${d.value},${d.processingValue ?? ''}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "humidity_data.csv"; a.click();
    };

    return (
        <>
            <SensorDetailLayout
                title="Humidity Sensor"
                description="Measures relative humidity using a capacitive polymer sensor. Dielectric constant changes with absorbed moisture."
                sensorId="DHT22 / AM2302"
                dataSnippet={{ value: displayValue, unit: "%", type: "Digital", pin: "D2" }}
                theory={THEORY}
                arduinoCode={ARDUINO_CODE}
                experiments={EXPERIMENTS}
                commonMistakes={COMMON_MISTAKES}
                testingProps={{
                    showPanel: showTestingPanel,
                    setShowPanel: setShowTestingPanel,
                    renderPanel: () => (
                        <TestingControlPanel
                            faultType={fault.type} setFault={setFault}
                            filterType={filter.type} setFilter={setFilter}
                            calibrationOffset={calibrationOffset} setCalibrationOffset={setCalibrationOffset}
                        />
                    )
                }}
            >
                {anomalies.map((anomaly, i) => (
                    <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />
                ))}

                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="h-14 w-14 mb-3 rounded-full bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/20">
                                <Droplets className="h-7 w-7 text-blue-400" />
                            </div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Humidity</span>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-5xl font-bold tracking-tighter ${fault.type !== 'none' ? 'text-amber-400' : 'text-white'}`}>
                                    {displayValue}
                                </span>
                                <span className="text-xl text-slate-500 font-medium">%</span>
                            </div>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            {calibrationOffset !== 0 && <span className="text-xs text-indigo-400 mt-1">Offset: {calibrationOffset > 0 ? '+' : ''}{calibrationOffset}%</span>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-3">{isConnected ? "Live" : "Offline"}</Badge>
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-blue-400" />Humidity History</CardTitle>
                            <div className="flex gap-2">
                                <button onClick={() => setShowExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                                <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"><Download size={12} />CSV</button>
                            </div>
                        </CardHeader>
                        <CardContent><LiveChart data={chartData} color="#3b82f6" gradientId="humidityDetailGrad" unit="%" height={220} minDomain={0} maxDomain={100} /></CardContent>
                    </Card>
                </div>

                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-xl text-white font-medium hover:from-cyan-500/30 hover:to-purple-500/30 transition">
                        <Brain className="h-5 w-5 text-cyan-400" /> Take AI Quiz on Humidity Sensors
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <SpecRow label="Range" value="0% - 100% RH" />
                            <SpecRow label="Accuracy" value="±2% RH" />
                            <SpecRow label="Response" value="~6 seconds" />
                        </CardContent>
                    </Card>
                    <Card variant="default">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader>
                        <CardContent>
                            <table className="w-full text-sm"><thead><tr className="border-b border-white/10 text-slate-500"><th className="py-1.5 text-left">Pin</th><th className="py-1.5 text-left">Arduino</th></tr></thead>
                                <tbody className="divide-y divide-white/5">
                                    <tr><td className="py-1.5 font-mono text-white">VCC</td><td className="py-1.5 font-mono text-blue-400">5V</td></tr>
                                    <tr><td className="py-1.5 font-mono text-white">DATA</td><td className="py-1.5 font-mono text-blue-400">D2</td></tr>
                                    <tr><td className="py-1.5 font-mono text-white">GND</td><td className="py-1.5 font-mono text-blue-400">GND</td></tr>
                                </tbody></table>
                        </CardContent>
                    </Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Humidity Sensor" sensorId="DHT22" onClose={() => setShowQuiz(false)} />}
            {showExplainer && <GraphExplainerModal sensorName="Humidity Sensor" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
