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
import { Thermometer, Droplets, Info, Download, Sparkles, Brain, Cpu } from "lucide-react";
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
• Uses a **capacitive polymer sensor** (different from DHT22's resistance method)
• Water vapor is absorbed by the hygroscopic polymer layer
• The polymer acts as a dielectric in a parallel-plate capacitor
• Higher humidity = higher capacitance = higher sensor output
• Accuracy: ±5% RH, Range: 20-90% RH

**Key Difference from DHT22:**
The DHT11 uses a simpler capacitive method vs DHT22's resistance-based approach, making it cheaper but less accurate.`,

    math: `**Temperature Conversion (NTC Thermistor):**

Steinhart-Hart Equation:
1/T = A + B·ln(R) + C·(ln(R))³

Where:
• T = Temperature in Kelvin
• R = Resistance in Ohms
• A, B, C = Calibration constants stored in sensor EEPROM

**Humidity Calibration:**
RH% = 0.31 × Sensor_Output - 0.31 × 10⁶/(Sensor_Output² + 42 × 10⁶)

**Dew Point Approximation:**
Tdew = (b × α(T, RH)) / (a - α(T, RH))

Where α(T, RH) = ((a × T) / (b + T)) + ln(RH/100)
• a = 17.27, b = 237.7
• Used to predict condensation temperature`,

    circuit: `**DHT11 Hardware Architecture:**

• **Pin 1 (VCC):** 3.3-5V power supply
• **Pin 2 (DATA):** Single-wire digital interface (requires pull-up resistor 10kΩ minimum)
• **Pin 3:** Not connected
• **Pin 4 (GND):** Ground

**Communication Protocol (Single-Wire):**
1. Master (Arduino) pulls DATA line LOW for 18ms (trigger)
2. DHT11 responds by pulling LOW for 80μs, then HIGH for 80μs
3. DHT11 transmits 40 bits total:
   • 1st 16 bits: Humidity (integer + decimal)
   • 2nd 16 bits: Temperature (integer + decimal)
   • Last 8 bits: Checksum
4. Bits are encoded as:
   • LOW 50μs + HIGH 26-28μs = '0'
   • LOW 50μs + HIGH 70μs = '1'

**Pull-up Resistor Requirement:**
The DHT11 integrates 15kΩ pull-up resistor internally, but an external 10kΩ pull-up is recommended for line lengths > 3 meters.`
};

const EXPERIMENTS = [
    {
        title: "Breath Humidity Test",
        instruction: "Blow warm breath onto the DHT11 sensor for 3-5 seconds and observe the response.",
        observation: "Humidity should spike to 80-95% and temperature will slightly increase due to warm air.",
        expected: "Demonstrates both sensors' responsiveness to environmental changes."
    },
    {
        title: "Temperature vs Altitude",
        instruction: "Note the temperature reading at sea level, then move to a higher altitude (or place sensor near AC vent).",
        observation: "Temperature changes correlate with location changes; humidity also shifts.",
        expected: "Temperature varies ~0.6°C per 100m altitude change (dry adiabatic rate)."
    },
    {
        title: "Humidity Saturation Test",
        instruction: "Place sensor in a sealed container with damp cloth. Measure humidity over 10 minutes.",
        observation: "Humidity gradually increases toward 100% as air becomes saturated.",
        expected: "Shows how humidity sensor responds to increasing vapor concentration."
    }
];

const COMMON_MISTAKES = [
    {
        title: "Wrong Pin Assignment",
        symptom: "Sensor always reads NaN or 0 values, or readings are inconsistent.",
        cause: "DHTPIN constant in Arduino code doesn't match actual wiring.",
        fix: "Verify pin number: Check both Arduino code and physical breadboard. Update #define DHTPIN X to match."
    },
    {
        title: "Missing Pull-up Resistor",
        symptom: "Works intermittently, occasional NaN readings, checksums fail.",
        cause: "No external pull-up resistor on DATA line (especially on wire > 30cm).",
        fix: "Add 10kΩ resistor between DATA pin and +5V. For long wires, consider 4.7kΩ."
    },
    {
        title: "Polling Too Fast",
        symptom: "Correct wiring but get 'NaN' or stale values continuously.",
        cause: "Reading DHT11 faster than once per 1000ms. DHT11 needs time to stabilize.",
        fix: "Use delay(2000) or longer between measurements. Maximum polling: 0.5Hz."
    },
    {
        title: "Capacitor Not Installed",
        symptom: "Readings work but are noisy or unstable, especially with 5V supply.",
        cause: "Missing 100nF ceramic capacitor across VCC-GND near sensor.",
        fix: "Add 100nF / 0.1μF capacitor between VCC and GND pins, close to sensor."
    }
];

const ARDUINO_CODE = `// DHT11 Temperature & Humidity Sensor
#include <DHT.h>

#define DHT_PIN 2
#define DHT_TYPE DHT11

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  delay(2000); // DHT11 requires min 1-2 seconds between reads
  
  // Read humidity (%)
  float humidity = dht.readHumidity();
  
  // Read temperature as Celsius
  float temperature = dht.readTemperature();
  
  // Check if any reads failed
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  
  // Calculate dew point (approximate Magnus formula)
  float dewPoint = calculateDewPoint(temperature, humidity);
  
  // Print all values
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.print(" °C, Humidity: ");
  Serial.print(humidity);
  Serial.print(" %, Dew Point: ");
  Serial.println(dewPoint);
}

// Magnus formula for dew point approximation
float calculateDewPoint(float T, float RH) {
  const float a = 17.27;
  const float b = 237.7;
  float alpha = ((a * T) / (b + T)) + log(RH / 100.0);
  float dewPoint = (b * alpha) / (a - alpha);
  return dewPoint;
}`;

export default function DHT11Page() {
    const { data } = useSocket();
    const [tempHistory, setTempHistory] = useState<DataPoint[]>([]);
    const [humidityHistory, setHumidityHistory] = useState<DataPoint[]>([]);
    const [activeTab, setActiveTab] = useState("live");
    const [showAIQuiz, setShowAIQuiz] = useState(false);
    const [showGraphExplainer, setShowGraphExplainer] = useState(false);
    const { injectedValue: faultTemp, fault: faultTempConfig, setFault: setFaultTemp } = useFaultInjector(data?.sensors?.dht11?.temp ?? null);
    const isFaultyTemp = faultTempConfig.type !== "none";
    const faultIndicatorTemp = faultTempConfig.type !== "none";
    const { injectedValue: faultHumidity, fault: faultHumidityConfig, setFault: setFaultHumidity } = useFaultInjector(data?.sensors?.dht11?.humidity ?? null);
    const isFaultyHumidity = faultHumidityConfig.type !== "none";
    const faultIndicatorHumidity = faultHumidityConfig.type !== "none";
    const { processedData: processedTempData } = useSignalProcessing(data?.sensors?.dht11?.temp ?? 0); const processedTemp = processedTempData[processedTempData.length-1] ?? 0;
    const tempMistakes = useMistakeDetector({ sensorName: "Temperature", data: tempHistory, expectedRange: { min: 20, max: 30 } });
    const humidityMistakes = useMistakeDetector({ sensorName: "Humidity", data: humidityHistory, expectedRange: { min: 30, max: 70 } });

    useEffect(() => {
        if (!data) return;
        
        const timestamp = new Date(data.timestamp);
        const timeLabel = timestamp.toLocaleTimeString("en-US", {
            hour12: false,
            minute: "2-digit",
            second: "2-digit",
        });

        const temp = isFaultyTemp ? null : (data?.sensors?.dht11?.temp ?? 0);
        const humidity = isFaultyHumidity ? null : (data?.sensors?.dht11?.humidity ?? 0);

        if (temp !== null) {
            setTempHistory((prev) => [...prev, { time: timeLabel, value: temp, processingValue: processedTemp }].slice(-MAX_DATA_POINTS));
        }
        if (humidity !== null) {
            setHumidityHistory((prev) => [...prev, { time: timeLabel, value: humidity }].slice(-MAX_DATA_POINTS));
        }
    }, [data, isFaultyTemp, isFaultyHumidity, processedTemp]);

    const [showTestingPanel, setShowTestingPanel] = useState(false);



    const currentTemp = isFaultyTemp ? "N/A" : data?.sensors?.dht11?.temp?.toFixed(1) ?? "--";
    const currentHumidity = isFaultyHumidity ? "N/A" : data?.sensors?.dht11?.humidity?.toFixed(1) ?? "--";

    // AI context is handled by SensorDetailLayout directly.

    if (!data) return <div className="flex items-center justify-center h-96 text-slate-400">Loading sensor data...</div>;

    return (
        <SensorDetailLayout
            title="DHT11 Temp & Humidity"
            description="Temperature & Humidity Sensor"
            sensorId="dht11"
            dataSnippet={{ temp: currentTemp, humidity: currentHumidity }}
            theory={THEORY as any}
            arduinoCode={ARDUINO_CODE}
            experiments={EXPERIMENTS}
            commonMistakes={COMMON_MISTAKES}
            isReal={!!data?.sensors?.dht11?.isReal}
            testingProps={{
                showPanel: showTestingPanel,
                setShowPanel: setShowTestingPanel,
                renderPanel: () => <TestingControlPanel faultType={faultTempConfig.type} setFault={setFaultTemp} filterType="none" setFilter={() => {}} calibrationOffset={0} setCalibrationOffset={() => {}} />
            }}
        >
            <div className="space-y-6">
                {/* Mistake Alerts */}
                {(tempMistakes.length > 0 || humidityMistakes.length > 0) && (
                    <div className="space-y-2 mb-6">
                        {tempMistakes.map((m, i) => <MistakeAlert key={`temp-${i}`} anomaly={m} onDismiss={()=>{}} />)}
                        {humidityMistakes.map((m, i) => <MistakeAlert key={`humidity-${i}`} anomaly={m} onDismiss={()=>{}} />)}
                    </div>
                )}

                {/* Temp Block */}
                <div className="grid gap-6 md:grid-cols-3 mb-6">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl" />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="h-14 w-14 mb-3 rounded-full bg-orange-500/10 flex items-center justify-center ring-1 ring-orange-500/20"><Thermometer className="h-7 w-7 text-orange-400" /></div>
                            <span className="text-xs text-slate-500 uppercase mb-1">Temperature</span>
                            <div className="flex items-baseline gap-1.5"><span className={`text-4xl font-bold ${faultIndicatorTemp ? 'text-orange-300' : 'text-white'}`}>{currentTemp}</span><span className="text-sm font-semibold text-slate-500">°C</span></div>
                            {faultIndicatorTemp && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Faulty</Badge>}
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Thermometer className="h-4 w-4 text-orange-400" />Temperature History</CardTitle>
                            <button onClick={() => setShowGraphExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                        </CardHeader>
                        <CardContent><LiveChart data={tempHistory} color="#f97316" gradientId="tempGrad" unit="°C" height={220} minDomain={15} maxDomain={35} /></CardContent>
                    </Card>
                </div>

                {/* Humidity Block */}
                <div className="grid gap-6 md:grid-cols-3 mb-6">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="h-14 w-14 mb-3 rounded-full bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/20"><Droplets className="h-7 w-7 text-blue-400" /></div>
                            <span className="text-xs text-slate-500 uppercase mb-1">Humidity</span>
                            <div className="flex items-baseline gap-1.5"><span className={`text-4xl font-bold ${faultIndicatorHumidity ? 'text-blue-300' : 'text-white'}`}>{currentHumidity}</span><span className="text-sm font-semibold text-slate-500">%</span></div>
                            {faultIndicatorHumidity && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Faulty</Badge>}
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Droplets className="h-4 w-4 text-blue-400" />Humidity History</CardTitle>
                        </CardHeader>
                        <CardContent><LiveChart data={humidityHistory} color="#3b82f6" gradientId="humidityGrad" unit="%" height={220} minDomain={0} maxDomain={100} /></CardContent>
                    </Card>
                </div>

                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowAIQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-blue-500/20 border border-orange-500/30 rounded-xl text-white font-medium hover:from-orange-500/30 hover:to-blue-500/30 transition">
                        <Brain className="h-5 w-5 text-orange-400" /> Test Knowledge
                    </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">Target</span><span className="font-medium text-white">Temperature & Humidity</span></div>
                        <div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">Range</span><span className="font-medium text-white">0-50°C, 20-90% RH</span></div>
                    </CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-orange-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">DATA</td><td className="py-1.5 font-mono text-orange-400">Pin 2</td></tr></tbody></table></CardContent></Card>
                </div>
            </div>

            {/* Modals */}
            {showAIQuiz && (
                <AIQuizModal sensorName="DHT11 Temp & Humidity" sensorId="dht11" onClose={() => setShowAIQuiz(false)} defaultQuestions={SENSOR_QUIZZES.dht11 as any} />
            )}
            {showGraphExplainer && (
                <GraphExplainerModal sensorName="DHT11 Temperature" data={tempHistory} onClose={() => setShowGraphExplainer(false)} />
            )}
        </SensorDetailLayout>
    );
}