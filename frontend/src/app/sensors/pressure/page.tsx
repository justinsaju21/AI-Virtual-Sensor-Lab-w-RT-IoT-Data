"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LiveChart } from "@/components/charts/LiveChart";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Activity, Cpu, Info, Gauge, Download, Sparkles, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { GraphExplainerModal } from "@/components/ai/GraphExplainerModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { useSignalProcessing } from "@/hooks/useSignalProcessing";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 50;

const THEORY = {
    physics: `The BMP180 measures pressure via **piezoresistive sensing**.

**Piezoresistive Effect:**
Silicon changes resistance when mechanically stressed.

**How it works:**
1. Atmospheric pressure flexes a silicon diaphragm.
2. Embedded piezoresistors change resistance.
3. Wheatstone bridge converts to voltage.
4. ADC digitizes; calibration data corrects output.`,
    math: `**Altitude from Pressure:**
h = 44330 × (1 - (P/P₀)^0.1903)

Where:
• P = measured pressure (hPa)
• P₀ = sea level pressure (1013.25 hPa)

Example: P = 900hPa → h ≈ 988m`,
};

const ARDUINO_CODE = `// Pressure Sensor - BMP180
#include <Wire.h>
#include <Adafruit_BMP085.h>

Adafruit_BMP085 bmp;

void setup() {
  Serial.begin(115200);
  if (!bmp.begin()) {
    Serial.println("BMP180 not found!");
    while(1);
  }
}

void loop() {
  float pressure = bmp.readPressure() / 100.0; // hPa
  float altitude = bmp.readAltitude();
  
  Serial.print("Pressure: ");
  Serial.print(pressure);
  Serial.print(" hPa, Alt: ");
  Serial.println(altitude);
  delay(1000);
}`;

const EXPERIMENTS = [
    { title: "Altitude Experiment", instruction: "Note the reading, then move up/down one floor of a building.", observation: "How much does altitude change?", expected: "Each floor (~3m) should show ~30-40 Pa change." }
];

const COMMON_MISTAKES = [
    { title: "Wrong Altitude", symptom: "Altitude shows negative or huge value", cause: "Incorrect Sea Level Pressure P0", fix: "Calibrate P0 for your current local weather." },
    { title: "I2C Error", symptom: "Sensor not found", cause: "Loose wiring or wrong address (0x77)", fix: "Check SDA/SCL connections. Use I2C scanner." }
];

export default function PressurePage() {
    const { isConnected, data } = useSocket();
    const [history, setHistory] = useState<DataPoint[]>([]);

    // Testing & AI
    const [showQuiz, setShowQuiz] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);
    const [calibrationOffset, setCalibrationOffset] = useState(0);

    const rawPressure = data?.sensors.bmp180?.pressure ? data.sensors.bmp180.pressure / 100 : 0;
    const rawAltitude = data?.sensors.bmp180?.altitude ?? 0;

    const { injectedValue, fault, setFault } = useFaultInjector(rawPressure);
    // Apply calibration to pressure
    const calibratedPressure = (typeof injectedValue === 'number') ? injectedValue + calibrationOffset : injectedValue;

    const { filter, setFilter, processedData } = useSignalProcessing(history.map(d => d.value));

    useEffect(() => {
        if (data && typeof calibratedPressure === 'number') {
            const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false, minute: "2-digit", second: "2-digit" });
            setHistory((prev) => [...prev, { time: timestamp, value: calibratedPressure }].slice(-MAX_DATA_POINTS));
        }
    }, [data, calibratedPressure]);

    const chartData = history.map((point, i) => ({ ...point, processingValue: processedData[i] }));
    const anomalies = useMistakeDetector({ sensorName: "Pressure Sensor", data: history, expectedRange: { min: 900, max: 1100 } }).filter((_, i) => !dismissedAnomalies.includes(i));

    const displayPressure = (typeof calibratedPressure === "number") ? calibratedPressure.toFixed(1) : "--";
    const displayAltitude = rawAltitude.toFixed(1);

    const exportCSV = () => {
        const csv = "Time,Pressure (hPa),Processed\n" + chartData.map(d => `${d.time},${d.value},${d.processingValue ?? ''}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "pressure_data.csv"; a.click();
    };

    return (
        <>
            <SensorDetailLayout
                title="Pressure Sensor"
                description="Piezoresistive barometric pressure with altitude calculation."
                sensorId="BMP180"
                dataSnippet={{ pressure: displayPressure, altitude: displayAltitude, address: "0x77" }}
                theory={THEORY}
                arduinoCode={ARDUINO_CODE}
                experiments={EXPERIMENTS}
                commonMistakes={COMMON_MISTAKES}
                testingProps={{ showPanel: showTestingPanel, setShowPanel: setShowTestingPanel, renderPanel: () => <TestingControlPanel faultType={fault.type} setFault={setFault} filterType={filter.type} setFilter={setFilter} calibrationOffset={calibrationOffset} setCalibrationOffset={setCalibrationOffset} /> }}
            >
                {anomalies.map((anomaly, i) => <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />)}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl" />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="h-14 w-14 mb-3 rounded-full bg-sky-500/10 flex items-center justify-center ring-1 ring-sky-500/20"><Gauge className="h-7 w-7 text-sky-400" /></div>
                            <span className="text-xs text-slate-500 uppercase mb-1">Pressure</span>
                            <span className={`text-4xl font-bold ${fault.type !== 'none' ? 'text-amber-300' : 'text-white'}`}>{displayPressure} hPa</span>
                            <span className="text-sm text-slate-400 mt-1">Alt: {displayAltitude} m</span>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            {calibrationOffset !== 0 && <span className="text-xs text-indigo-400 mt-1">Offset: {calibrationOffset > 0 ? '+' : ''}{calibrationOffset} hPa</span>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-3">{isConnected ? "Live" : "Offline"}</Badge>
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-sky-400" />Pressure History</CardTitle>
                            <div className="flex gap-2">
                                <button onClick={() => setShowExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                                <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"><Download size={12} />CSV</button>
                            </div>
                        </CardHeader>
                        <CardContent><LiveChart data={chartData} color="#0ea5e9" gradientId="pressureGrad" unit="hPa" height={220} minDomain={980} maxDomain={1040} /></CardContent>
                    </Card>
                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500/20 to-cyan-500/20 border border-sky-500/30 rounded-xl text-white font-medium hover:from-sky-500/30 hover:to-cyan-500/30 transition">
                        <Brain className="h-5 w-5 text-sky-400" /> Quiz: Barometric Pressure
                    </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><SpecRow label="Range" value="300-1100 hPa" /><SpecRow label="Accuracy" value="±0.12 hPa" /><SpecRow label="Interface" value="I2C" /></CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring (I2C)</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">SDA</td><td className="py-1.5 font-mono text-sky-400">20</td></tr><tr><td className="py-1.5 font-mono text-white">SCL</td><td className="py-1.5 font-mono text-sky-400">21</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Pressure Sensor" sensorId="BMP180" onClose={() => setShowQuiz(false)} />}
            {showExplainer && <GraphExplainerModal sensorName="Pressure Sensor" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
