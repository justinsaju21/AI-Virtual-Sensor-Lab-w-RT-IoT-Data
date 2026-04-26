"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LiveChart } from "@/components/charts/LiveChart";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { GraphExplainerModal } from "@/components/ai/GraphExplainerModal";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { useSignalProcessing } from "@/hooks/useSignalProcessing";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";
import { Thermometer, Info, Download, Sparkles, Brain, Cpu, Activity } from "lucide-react";
import { SENSOR_QUIZZES } from "@/config/quizzes";

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 50;

const THEORY = {
    physics: `**DHT11: Low-Cost Digital Temperature & Humidity Sensor**

**Temperature Measurement - NTC Thermistor:**
• Uses a Negative Temperature Coefficient (NTC) thermistor
• As temperature increases, the thermistor resistance decreases
• The relationship is nonlinear, following Steinhart-Hart equation
• Accuracy: ±2°C, Range: 0-50°C

**Humidity Measurement - Capacitive Polymer:**
• Uses a **capacitive polymer sensor**
• Water vapor is absorbed by the hygroscopic polymer layer
• The polymer acts as a dielectric in a parallel-plate capacitor
• Higher humidity = higher capacitance = higher sensor output
• Accuracy: ±5% RH, Range: 20-90% RH`,

    math: `**Temperature Conversion (NTC Thermistor):**

Steinhart-Hart Equation:
1/T = A + B·ln(R) + C·(ln(R))³

Where:
• T = Temperature in Kelvin
• R = Resistance in Ohms
• A, B, C = Calibration constants stored in sensor EEPROM

**Humidity Calibration:**
RH% = 0.31 × Sensor_Output - 0.31 × 10⁶/(Sensor_Output² + 42 × 10⁶)`,

    circuit: `**DHT11 Hardware Architecture:**

• **Pin 1 (VCC):** 3.3-5V power supply
• **Pin 2 (DATA):** Single-wire digital interface (requires pull-up resistor 10kΩ minimum)
• **Pin 4 (GND):** Ground

**Communication Protocol (Single-Wire):**
1. Master (Arduino) pulls DATA line LOW for 18ms (trigger)
2. DHT11 responds by pulling LOW for 80μs, then HIGH for 80μs
3. DHT11 transmits 40 bits total.`
};

const EXPERIMENTS = [
    {
        title: "Breath Humidity Test",
        instruction: "Blow warm breath onto the DHT11 sensor for 3-5 seconds and observe the response.",
        observation: "Humidity should spike to 80-95% and temperature will slightly increase.",
        expected: "Demonstrates both sensors' responsiveness."
    }
];

const COMMON_MISTAKES = [
    {
        title: "Polling Too Fast",
        symptom: "Correct wiring but get 'NaN' values.",
        cause: "Reading DHT11 faster than once per 1000ms.",
        fix: "Use delay(2000) between measurements."
    }
];

const ARDUINO_CODE = `// DHT11 Sensor
#include <DHT.h>
#define DHT_PIN 2
#define DHT_TYPE DHT11
DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  delay(2000);
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (isnan(h) || isnan(t)) return;
  Serial.print("Temp: "); Serial.print(t);
  Serial.print(" C, Hum: "); Serial.print(h);
  Serial.println(" %");
}`;

export default function DHT11Page() {
    const { isConnected, data } = useSocket();
    const [history, setHistory] = useState<DataPoint[]>([]);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);
    const [calibrationOffset, setCalibrationOffset] = useState(0);

    // 1. Raw Input
    const rawTemp = data?.sensors.dht11?.temperature ?? 0;
    const rawHumidity = data?.sensors.dht11?.humidity ?? 0;

    // 2. Fault Injection (Temp focus)
    const { injectedValue, fault, setFault } = useFaultInjector(rawTemp);

    // 3. Calibration
    const calibratedValue = (typeof injectedValue === 'number') ? injectedValue + calibrationOffset : injectedValue;

    // 4. Signal Processing
    const { filter, setFilter, processedData } = useSignalProcessing(history.map(d => d.value));

    useEffect(() => {
        if (data && typeof calibratedValue === 'number') {
            const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false, minute: "2-digit", second: "2-digit" });
            setHistory((prev) => [...prev, { time: timestamp, value: calibratedValue }].slice(-MAX_DATA_POINTS));
        }
    }, [data, calibratedValue]);

    const chartData = history.map((point, i) => ({
        ...point,
        processingValue: processedData[i]
    }));

    const anomalies = useMistakeDetector({
        sensorName: "DHT11",
        data: history,
        expectedRange: { min: 10, max: 40 }
    }).filter((_, i) => !dismissedAnomalies.includes(i));

    const displayTemp = (typeof calibratedValue === "number") ? calibratedValue.toFixed(1) : "--";
    const displayHumidity = rawHumidity.toFixed(1);

    const exportCSV = () => {
        const csv = "Time,Temp (C),Processed\n" + chartData.map(d => `${d.time},${d.value},${d.processingValue ?? ''}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "dht11_data.csv"; a.click(); URL.revokeObjectURL(url);
    };

    return (
        <>
            <SensorDetailLayout
                title="DHT11 Sensor"
                description="Digital temperature and humidity sensor using a thermistor and capacitive humidity sensor."
                sensorId="DHT11" isReal={!!data?.sensors?.dht11?.isReal}
                dataSnippet={{ temp: displayTemp, hum: displayHumidity, type: "Digital", pin: "D2" }}
                theory={THEORY as any}
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
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="h-14 w-14 mb-3 rounded-full bg-orange-500/10 flex items-center justify-center ring-1 ring-orange-500/20">
                                <Thermometer className="h-7 w-7 text-orange-400" />
                            </div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Temperature</span>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-5xl font-bold tracking-tighter ${fault.type !== 'none' ? 'text-amber-400' : 'text-white'}`}>
                                    {displayTemp}
                                </span>
                                <span className="text-xl text-slate-500 font-medium">°C</span>
                            </div>
                            <div className="mt-2 text-sm text-slate-400">Humidity: {displayHumidity}%</div>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            {calibrationOffset !== 0 && <span className="text-xs text-indigo-400 mt-1">Offset: {calibrationOffset > 0 ? '+' : ''}{calibrationOffset}°C</span>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-4">{isConnected ? "Active" : "Offline"}</Badge>
                        </CardContent>
                    </Card>

                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-orange-400" />Temperature History</CardTitle>
                            <div className="flex gap-2">
                                <button onClick={() => setShowExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                                <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"><Download size={12} />CSV</button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <LiveChart data={chartData} color="#f97316" gradientId="dht11Grad" unit="°C" height={220} minDomain={0} maxDomain={50} />
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl text-white font-medium hover:from-orange-500/30 hover:to-red-500/30 transition">
                        <Brain className="h-5 w-5 text-orange-400" /> Test Knowledge
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <SpecRow label="Temp Range" value="0-50°C" />
                            <SpecRow label="Hum Range" value="20-90%" />
                            <SpecRow label="Accuracy" value="±2°C / ±5%" />
                        </CardContent>
                    </Card>
                    <Card variant="default">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-white/10 text-slate-500"><th className="py-1.5 text-left">Pin</th><th className="py-1.5 text-left">Arduino</th></tr></thead>
                                <tbody className="divide-y divide-white/5">
                                    <tr><td className="py-1.5 font-mono text-white">VCC</td><td className="py-1.5 font-mono text-orange-400">5V</td></tr>
                                    <tr><td className="py-1.5 font-mono text-white">DATA</td><td className="py-1.5 font-mono text-orange-400">D2</td></tr>
                                    <tr><td className="py-1.5 font-mono text-white">GND</td><td className="py-1.5 font-mono text-orange-400">GND</td></tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            </SensorDetailLayout>

            {showQuiz && <AIQuizModal sensorName="DHT11 Sensor" sensorId="DHT11" onClose={() => setShowQuiz(false)} defaultQuestions={SENSOR_QUIZZES["dht11"]} />}
            {showExplainer && <GraphExplainerModal sensorName="DHT11 Sensor" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}

const SpecRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>
);