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
import { Gauge, Info, Download, Sparkles, Brain, Cpu, Activity } from "lucide-react";
import { SENSOR_QUIZZES } from "@/config/quizzes";

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 50;

const THEORY = {
    physics: `The BMP280 is an absolute barometric pressure and temperature sensor designed by Bosch. It utilizes piezoresistive MEMS technology.`,
    math: `**Barometric Formula:** $ h = 44330 \times (1 - (P/P_0)^{1/5.255}) $`,
    circuit: `**I2C Protocol:** Communicates fully formatted, digitized data via I2C (address 0x76 or 0x77).`
};

const EXPERIMENTS = [
    {
        title: "Floor-to-Ceiling Altitude Test",
        instruction: "Raise the sensor to ceiling height.",
        observation: "Altitude reading increases.",
        expected: "Shows how pressure changes with height."
    }
];

const COMMON_MISTAKES = [
    {
        title: "Wrong I2C Address",
        symptom: "Could not find BMP280.",
        cause: "Address in code doesn't match hardware.",
        fix: "Try 0x76 or 0x77."
    }
];

const ARDUINO_CODE = `// BMP280 Pressure Sensor
#include <Adafruit_BMP280.h>
Adafruit_BMP280 bmp;

void setup() {
  Serial.begin(115200);
  if (!bmp.begin(0x76)) while(1);
}

void loop() {
  Serial.print("Pressure: ");
  Serial.println(bmp.readPressure() / 100.0);
  delay(1000);
}`;

export default function BMP280Page() {
    const { isConnected, data } = useSocket();
    const [history, setHistory] = useState<DataPoint[]>([]);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);
    const [calibrationOffset, setCalibrationOffset] = useState(0);

    // 1. Raw Input
    const rawPressure = data?.sensors.bmp280?.pressure ?? 0;
    const rawTemp = data?.sensors.bmp280?.temperature ?? 0;

    // 2. Fault Injection (Pressure focus)
    const { injectedValue, fault, setFault } = useFaultInjector(rawPressure);

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
        sensorName: "BMP280",
        data: history,
        expectedRange: { min: 900, max: 1100 }
    }).filter((_, i) => !dismissedAnomalies.includes(i));

    const displayPressure = (typeof calibratedValue === "number") ? calibratedValue.toFixed(1) : "--";
    const displayTemp = rawTemp.toFixed(1);

    const exportCSV = () => {
        const csv = "Time,Pressure (hPa),Processed\n" + chartData.map(d => `${d.time},${d.value},${d.processingValue ?? ''}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "bmp280_data.csv"; a.click(); URL.revokeObjectURL(url);
    };

    return (
        <>
            <SensorDetailLayout
                title="BMP280 Pressure Sensor"
                description="Barometric pressure and temperature sensor with altitude estimation."
                sensorId="BMP280" isReal={!!data?.sensors?.bmp280?.isReal}
                dataSnippet={{ pressure: displayPressure, temp: displayTemp, pin: "I2C" }}
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
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="h-14 w-14 mb-3 rounded-full bg-sky-500/10 flex items-center justify-center ring-1 ring-sky-500/20">
                                <Gauge className="h-7 w-7 text-sky-400" />
                            </div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Pressure</span>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-5xl font-bold tracking-tighter ${fault.type !== 'none' ? 'text-amber-400' : 'text-white'}`}>
                                    {displayPressure}
                                </span>
                                <span className="text-xl text-slate-500 font-medium">hPa</span>
                            </div>
                            <div className="mt-2 text-sm text-slate-400">Temp: {displayTemp}°C</div>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            {calibrationOffset !== 0 && <span className="text-xs text-indigo-400 mt-1">Offset: {calibrationOffset > 0 ? '+' : ''}{calibrationOffset} hPa</span>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-4">{isConnected ? "Active" : "Offline"}</Badge>
                        </CardContent>
                    </Card>

                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-sky-400" />Pressure History</CardTitle>
                            <div className="flex gap-2">
                                <button onClick={() => setShowExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                                <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"><Download size={12} />CSV</button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <LiveChart data={chartData} color="#0ea5e9" gradientId="bmpGrad" unit="hPa" height={220} minDomain={980} maxDomain={1040} />
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500/20 to-cyan-500/20 border border-sky-500/30 rounded-xl text-white font-medium hover:from-sky-500/30 hover:to-cyan-500/30 transition">
                        <Brain className="h-5 w-5 text-sky-400" /> Test Knowledge
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <SpecRow label="Range" value="300-1100 hPa" />
                            <SpecRow label="Accuracy" value="±0.12 hPa" />
                        </CardContent>
                    </Card>
                    <Card variant="default">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-white/10 text-slate-500"><th className="py-1.5 text-left">Pin</th><th className="py-1.5 text-left">Arduino</th></tr></thead>
                                <tbody className="divide-y divide-white/5">
                                    <tr><td className="py-1.5 font-mono text-white">VCC</td><td className="py-1.5 font-mono text-sky-400">3.3V</td></tr>
                                    <tr><td className="py-1.5 font-mono text-white">SDA/SCL</td><td className="py-1.5 font-mono text-sky-400">I2C</td></tr>
                                    <tr><td className="py-1.5 font-mono text-white">GND</td><td className="py-1.5 font-mono text-sky-400">GND</td></tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            </SensorDetailLayout>

            {showQuiz && <AIQuizModal sensorName="BMP280 Sensor" sensorId="BMP280" onClose={() => setShowQuiz(false)} defaultQuestions={SENSOR_QUIZZES["pressure"]} />}
            {showExplainer && <GraphExplainerModal sensorName="BMP280 Sensor" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}

const SpecRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>
);