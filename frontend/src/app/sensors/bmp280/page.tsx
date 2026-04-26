"use client";

import { useAI } from "@/contexts/AIContext";
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
import { Gauge, Thermometer, Info, Download, Sparkles, Brain, Cpu } from "lucide-react";
import { SENSOR_QUIZZES } from "@/config/quizzes";

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 50;

const THEORY = {
    physics: `**BMP280: Precision Barometric Pressure & Temperature Sensor**

**Pressure Measurement - Piezo-Resistive MEMS:**
• Uses a micro-electromechanical systems (MEMS) piezo-resistive element
• Atmospheric pressure deforms the membrane, changing its electrical resistance
• Built-in temperature compensation ensures accuracy across temperature ranges
• Accuracy: ±1 hPa, Range: 300-1100 hPa (sea level to ~9000m altitude)

**Temperature Measurement:**
• Secondary thermistor for temperature compensation of pressure readings
• Ensures pressure readings are temperature-corrected
• Accuracy: ±1°C, Range: -40 to +85°C

**Key Physics:**
• Altitude can be calculated from barometric pressure using: h = 44330 × (1 - (P/P0)^(1/5.255))
• Where P0 = sea level pressure (1013.25 hPa)
• Temperature coefficient: ~0.5-1% per °C for uncorrected sensors`,

    math: `**Barometric Formula:**

h = 44330 × (1 - (P / P₀)^(1/5.255))

Where:
• h = Height above sea level (meters)
• P = Barometric pressure (hPa)
• P₀ = Reference sea level pressure (1013.25 hPa)

**Altitude Change Per Pressure Change:**
Δh ≈ 8.43 × ln(P₁/P₂) meters

**Example:**
• At sea level: 1013.25 hPa
• At 1000m elevation: ~891 hPa
• Pressure difference: 122.25 hPa`,

    circuit: `**BMP280 I2C Connection:**

Pin Configuration:
• VCC: 3.3V (sensor operates at 3.3V only)
• GND: Ground
• SCL: I2C Clock (pull-up to 3.3V via 10kΩ resistor)
• SDA: I2C Data (pull-up to 3.3V via 10kΩ resistor)
• SDO: I2C Address Select (pull to GND for 0x76, or VCC for 0x77)

**I2C Communication:**
• Address: 0x76 (default) or 0x77 (if SDO pulled HIGH)
• Fast mode: up to 400 kHz
• Decimation settings: ultra-low power, low power, standard, high resolution, ultra-high resolution`
};

const EXPERIMENTS = [
    {
        title: "Sea Level Calibration",
        instruction: "Note the current pressure reading. In code, set sea-level reference to this exact value.",
        observation: "Pressures higher than reference indicate below sea level; lower pressures indicate higher elevation.",
        expected: "Establishes your local baseline for accurate altitude calculations."
    },
    {
        title: "Altitude Measurement",
        instruction: "Move sensor to different elevations (up/down stairs, different floors, tall building).",
        observation: "Pressure decreases as you go higher; temperature may also change with elevation.",
        expected: "Pressure drop of ~12 hPa per 100 meters elevation increase."
    }
];

const COMMON_MISTAKES = [
    {
        title: "Wrong I2C Address",
        symptom: "I2C scanner shows device, but Wire.read() hangs or returns 0.",
        cause: "Code uses wrong I2C address (0x76 vs 0x77). SDO pin not correctly configured.",
        fix: "Check SDO pin connection. If floating, defaults to 0x77. Run I2C scanner: if shows 0x76, use that."
    },
    {
        title: "No Pull-up Resistors",
        symptom: "I2C communication works but is unreliable, or doesn't work at all.",
        cause: "Missing 10kΩ pull-up resistors on SDA and SCL lines.",
        fix: "Add 10kΩ resistors between each line (SDA, SCL) and 3.3V."
    },
    {
        title: "5V Supply with 3.3V Sensor",
        symptom: "Sensor gets hot, then stops responding completely.",
        cause: "Connected to 5V instead of 3.3V. BMP280 is not 5V tolerant.",
        fix: "Use 3.3V output from Arduino or use level shifter if only 5V available."
    }
];

const ARDUINO_CODE = `// BMP280 Pressure & Temperature Sensor I2C
#include <Wire.h>
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp280;
const float SEALEVELPRESSURE_HPA = 1013.25;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  
  if (!bmp280.begin(0x76)) { // Address 0x76 (SDO to GND)
    Serial.println("Could not find BMP280");
    while (1);
  }
  
  // Set timing mode: oversampling
  bmp280.setSampling(Adafruit_BMP280::MODE_NORMAL,    // Operating mode
                     Adafruit_BMP280::SAMPLING_X2,    // Temp sampling
                     Adafruit_BMP280::SAMPLING_X16,   // Pressure sampling
                     Adafruit_BMP280::FILTER_X16,     // Filter coeffs
                     Adafruit_BMP280::STANDBY_MS_500); // Standby time
}

void loop() {
  delay(1000);
  
  Serial.print("Temperature = ");
  Serial.print(bmp280.readTemperature());
  Serial.println(" °C");
  
  Serial.print("Pressure = ");
  Serial.print(bmp280.readPressure() / 100.0F);
  Serial.println(" hPa");
  
  float altitude = bmp280.readAltitude(SEALEVELPRESSURE_HPA);
  Serial.print("Altitude = ");
  Serial.print(altitude);
  Serial.println(" meters");
  
  Serial.println("---");
}`;

export default function BMP280Page() {
    const { data } = useSocket();
    const [pressureHistory, setPressureHistory] = useState<DataPoint[]>([]);
    const [tempHistory, setTempHistory] = useState<DataPoint[]>([]);
    const [activeTab, setActiveTab] = useState("live");
    const [showGraphExplainer, setShowGraphExplainer] = useState(false);
    const [showAIQuiz, setShowAIQuiz] = useState(false);
    const { injectedValue: faultPressure, fault: faultPressureConfig, setFault: setFaultPressure } = useFaultInjector(data?.sensors?.bmp280?.pressure ?? null);
    const isFaultyPressure = faultPressureConfig.type !== "none";
    const { injectedValue: faultTemp, fault: faultTempConfig, setFault: setFaultTemp } = useFaultInjector(data?.sensors?.bmp280?.temp ?? null);
    const isFaultyTemp = faultTempConfig.type !== "none";
    const pressureMistakes = useMistakeDetector({ sensorName: "Pressure", data: pressureHistory, expectedRange: { min: 900, max: 1100 } });

    useEffect(() => {
        if (!data) return;
        
        const timestamp = new Date(data.timestamp);
        const timeLabel = timestamp.toLocaleTimeString("en-US", {
            hour12: false,
            minute: "2-digit",
            second: "2-digit",
        });

        const pressure = isFaultyPressure ? null : (data?.sensors?.bmp280?.pressure ?? 0);
        const temp = isFaultyTemp ? null : (data?.sensors?.bmp280?.temp ?? 0);

        if (pressure !== null) {
            setPressureHistory((prev) => [...prev, { time: timeLabel, value: pressure }].slice(-MAX_DATA_POINTS));
        }
        if (temp !== null) {
            setTempHistory((prev) => [...prev, { time: timeLabel, value: temp }].slice(-MAX_DATA_POINTS));
        }
    }, [data, isFaultyPressure, isFaultyTemp]);

    const [showTestingPanel, setShowTestingPanel] = useState(false);



    const currentPressure = isFaultyPressure ? "N/A" : Math.round(data?.sensors?.bmp280?.pressure ?? 0);
    const currentTemp = isFaultyTemp ? "N/A" : data?.sensors?.bmp280?.temp?.toFixed(1) ?? "--";
    const altitude = currentPressure !== "N/A" ? (44330 * (1 - Math.pow((currentPressure as number) / 1013.25, 1 / 5.255))).toFixed(0) : "--";

    // AI context is handled by SensorDetailLayout directly.

    if (!data) return <div className="flex items-center justify-center h-96 text-slate-400">Loading sensor data...</div>;

    return (
        <SensorDetailLayout
            title="BMP280"
            description="Barometric Pressure & Temperature Sensor"
            sensorId="bmp280" isReal={!!data?.sensors?.bmp280?.isReal}
            dataSnippet={{ temp: currentTemp, pressure: currentPressure }}
            theory={THEORY as any}
            arduinoCode={ARDUINO_CODE}
            experiments={EXPERIMENTS}
            commonMistakes={COMMON_MISTAKES}
            testingProps={{
                showPanel: showTestingPanel,
                setShowPanel: setShowTestingPanel,
                renderPanel: () => <TestingControlPanel faultType={faultPressureConfig.type} setFault={setFaultPressure} filterType="none" setFilter={() => {}} calibrationOffset={0} setCalibrationOffset={() => {}} />
            }}
        >
            <div className="space-y-6">
                {pressureMistakes.length > 0 && (
                    <div className="space-y-2 mb-6">
                        {pressureMistakes.map((m, i) => <MistakeAlert key={i} anomaly={m} onDismiss={()=>{}} />)}
                    </div>
                )}

                {/* Pressure Block */}
                <div className="grid gap-6 md:grid-cols-3 mb-6">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl" />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="h-14 w-14 mb-3 rounded-full bg-sky-500/10 flex items-center justify-center ring-1 ring-sky-500/20"><Gauge className="h-7 w-7 text-sky-400" /></div>
                            <span className="text-xs text-slate-500 uppercase mb-1">Pressure</span>
                            <div className="flex items-baseline gap-1.5"><span className={`text-4xl font-bold ${isFaultyPressure ? 'text-sky-300' : 'text-white'}`}>{currentPressure}</span><span className="text-sm font-semibold text-slate-500">hPa</span></div>
                            {isFaultyPressure && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Faulty</Badge>}
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Gauge className="h-4 w-4 text-sky-400" />Pressure History</CardTitle>
                            <button onClick={() => setShowGraphExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                        </CardHeader>
                        <CardContent><LiveChart data={pressureHistory} color="#0ea5e9" gradientId="pressureGrad" unit="hPa" height={220} minDomain={900} maxDomain={1050} /></CardContent>
                    </Card>
                </div>

                {/* Temperature Block */}
                <div className="grid gap-6 md:grid-cols-3 mb-6">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl" />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="h-14 w-14 mb-3 rounded-full bg-orange-500/10 flex items-center justify-center ring-1 ring-orange-500/20"><Thermometer className="h-7 w-7 text-orange-400" /></div>
                            <span className="text-xs text-slate-500 uppercase mb-1">Temperature</span>
                            <div className="flex items-baseline gap-1.5"><span className={`text-4xl font-bold ${isFaultyTemp ? 'text-orange-300' : 'text-white'}`}>{currentTemp}</span><span className="text-sm font-semibold text-slate-500">°C</span></div>
                            {isFaultyTemp && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Faulty</Badge>}
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Thermometer className="h-4 w-4 text-orange-400" />Temperature History</CardTitle>
                        </CardHeader>
                        <CardContent><LiveChart data={tempHistory} color="#f97316" gradientId="tempGrad" unit="°C" height={220} minDomain={15} maxDomain={35} /></CardContent>
                    </Card>
                </div>

                {/* Altitude (calculated) */}
                <div className="flex justify-center mt-2 mb-4">
                    <div className="bg-white/5 border border-white/10 rounded-full px-6 py-2 flex items-center gap-3">
                        <span className="text-slate-400 text-sm">Calculated Altitude:</span>
                        <span className="text-purple-400 font-bold">{altitude} m</span>
                    </div>
                </div>

                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowAIQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500/20 to-orange-500/20 border border-sky-500/30 rounded-xl text-white font-medium hover:from-sky-500/30 hover:to-orange-500/30 transition">
                        <Brain className="h-5 w-5 text-sky-400" /> Test Knowledge
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">Target</span><span className="font-medium text-white">Pressure & Temp</span></div>
                        <div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">Range</span><span className="font-medium text-white">300-1100 hPa</span></div>
                    </CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">I2C</td><td className="py-1.5 font-mono text-sky-400">0x76 / 0x77</td></tr></tbody></table></CardContent></Card>
                </div>
            </div>

            {/* Modals */}
            {/* Added state variables in the script dynamically if not present, but they are in the component scope? Wait, `setShowAIQuiz` doesn't exist in bmp280! Let's just fix it by ensuring we added the state correctly. Wait, bmp280 didn't have showAIQuiz! I will patch that next. */}
            {typeof showAIQuiz !== 'undefined' && showAIQuiz && (
                <AIQuizModal sensorName="BMP280" sensorId="bmp280" onClose={() => setShowAIQuiz(false)} defaultQuestions={SENSOR_QUIZZES.bmp280 as any} />
            )}
            {showGraphExplainer && (
                <GraphExplainerModal sensorName="BMP280 Pressure" data={pressureHistory} onClose={() => setShowGraphExplainer(false)} />
            )}
        </SensorDetailLayout>
    );
}