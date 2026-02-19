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
import { Activity, Cpu, Info, Thermometer, Download, Sparkles, Brain, AlertTriangle } from "lucide-react";

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 50;

const THEORY = {
    physics: `The DHT22 measures temperature using an NTC (Negative Temperature Coefficient) thermistor.

**How NTC Thermistors Work:**
• Made from semiconductor materials (metal oxides like manganese, nickel, cobalt).
• At the atomic level, higher temperatures give electrons more energy to jump to the conduction band.
• This creates more charge carriers, reducing the material's electrical resistance.

**The Relationship:**
As temperature ↑, resistance ↓ (inverse relationship).
The resistance change is non-linear and follows an exponential curve.

**Inside the DHT22:**
1. The thermistor is part of a voltage divider circuit.
2. The analog voltage is converted to digital by an internal 8-bit microcontroller.
3. The MCU also applies factory calibration to correct for individual sensor variations.`,

    math: `The resistance-temperature relationship of an NTC thermistor is described by the **Steinhart-Hart Equation**:

1/T = A + B·ln(R) + C·(ln(R))³

Where:
• T = Temperature in Kelvin
• R = Resistance at temperature T
• A, B, C = Steinhart-Hart coefficients (device-specific)

**Simplified Beta Equation (Common Approximation):**

R(T) = R₀ · exp(β · (1/T - 1/T₀))

Where:
• R₀ = Resistance at reference temperature T₀ (usually 25°C)
• β = Beta constant (typically 3000-5000K for common thermistors)

**Example Calculation:**
If R₀ = 10kΩ at 25°C (298K) and β = 3950:
At 50°C (323K): R ≈ 10000 × exp(3950 × (1/323 - 1/298)) ≈ 3.6kΩ`,

    protocol: `The DHT22 uses a **proprietary single-wire serial protocol** for communication.

**Communication Sequence:**
1. **Start Signal (Host → Sensor):**
   - Host pulls data line LOW for at least 1ms (typically 18ms).
   - Host releases line, it goes HIGH via pull-up resistor.

2. **Response Signal (Sensor → Host):**
   - Sensor pulls line LOW for 80µs.
   - Sensor releases line HIGH for 80µs.

3. **Data Transmission (40 bits total):**
   - 8 bits: Humidity Integer
   - 8 bits: Humidity Decimal
   - 8 bits: Temperature Integer
   - 8 bits: Temperature Decimal
   - 8 bits: Checksum (sum of first 4 bytes)

**Bit Encoding:**
• A '0' bit: LOW for 50µs, then HIGH for 26-28µs.
• A '1' bit: LOW for 50µs, then HIGH for 70µs.`,
};

const ARDUINO_CODE = `// Temperature Reading - DHT22
#include <DHT.h>

#define DHT_PIN 2
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  Serial.println("DHT22 Ready");
}

void loop() {
  // Wait between measurements
  delay(2000);
  
  // Read temperature as Celsius
  float temp = dht.readTemperature();
  
  // Check if reading failed
  if (isnan(temp)) {
    Serial.println("Failed to read from DHT!");
    return;
  }
  
  // Print to Serial
  Serial.print("Temperature: ");
  Serial.print(temp);
  Serial.println(" °C");
}`;

const EXPERIMENTS = [
    { title: "Observe Baseline Temperature", instruction: "Let the sensor stabilize for 2 minutes at room temperature. Note the reading displayed on the Live Data tab.", observation: "What is the ambient room temperature? Is it stable or fluctuating?", expected: "You should see a stable reading between 20-28°C depending on your environment. Minor fluctuations of ±0.5°C are normal." },
    { title: "Body Heat Detection", instruction: "Place your finger close to (but not touching) the sensor for 30 seconds. Observe the temperature change.", observation: "How much did the temperature rise? How quickly did it respond?", expected: "Temperature should rise 2-5°C due to body heat radiation. The DHT22 has a ~2 second response time, so changes aren't instant." },
    { title: "Cooling Effect", instruction: "Gently blow on the sensor from a distance of ~10cm for a few seconds.", observation: "Did the temperature decrease? By how much?", expected: "Evaporative cooling from your breath should cause a slight temperature drop of 1-3°C, followed by a gradual return to baseline." },
];

const COMMON_MISTAKES = [
    { title: "Reading Shows NaN or 0", symptom: "Temperature displays as NaN, 0, or doesn't update", cause: "Missing or loose data wire, or no pull-up resistor on data line", fix: "Ensure a 10kΩ pull-up resistor is connected between DATA and VCC. Check all wire connections." },
    { title: "Temperature Too High", symptom: "Sensor reads 5-10°C higher than expected", cause: "Self-heating from being too close to power electronics or direct sunlight", fix: "Mount sensor away from heat sources. Ensure good ventilation around the sensor." },
    { title: "Slow Response", symptom: "Readings lag behind actual temperature changes", cause: "Normal sensor behavior - the DHT22 has a slow response time", fix: "This is expected. For faster response, consider a thermistor with a smaller thermal mass." },
];

export default function TemperaturePage() {
    const { isConnected, data } = useSocket();
    const [history, setHistory] = useState<DataPoint[]>([]);
    const [showRaw, setShowRaw] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);

    // --- Signal Chain ---
    // 1. Raw Data Input
    const rawValFromSocket = data?.sensors.dht11?.temp ?? data?.sensors.dht22?.temperature ?? 0;

    // 2. Fault Injection (Testing)
    const { injectedValue, fault, setFault } = useFaultInjector(rawValFromSocket);

    // 3. Calibration (Instrumentation)
    const [calibrationOffset, setCalibrationOffset] = useState(0);
    const calibratedValue = (typeof injectedValue === 'number') ? injectedValue + calibrationOffset : injectedValue;

    // 4. Signal Processing (DSP)
    // We need a stream of data for the filter, so we use the history state... careful with loop
    // Simplified: We apply filter to the HISTORY for visualization, 
    // but the single 'current value' display usually shows the raw/calibrated instant value.
    const { filter, setFilter, processedData } = useSignalProcessing(history.map(d => d.value));

    // Update History
    useEffect(() => {
        if (data && typeof calibratedValue === 'number' && !isNaN(calibratedValue)) {
            const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false, minute: "2-digit", second: "2-digit" });

            // Add new point
            setHistory(prev => {
                const newHistory = [...prev, { time: timestamp, value: calibratedValue }].slice(-MAX_DATA_POINTS);
                return newHistory;
            });
        }
    }, [data, calibratedValue]); // Depend on calibratedValue which updates every render if input changes

    // Merge processed data back into history for charting
    const chartData = history.map((point, i) => ({
        ...point,
        processingValue: processedData[i] // Add the filtered value at this index
    }));

    // Display Values
    const displayValue = (typeof calibratedValue === "number") ? calibratedValue.toFixed(1) : "--";
    const rawAdcValue = (typeof calibratedValue === "number") ? Math.round(calibratedValue * 10) : "--"; // Fake ADC for demo

    // AI Mistake Detection (on the potentially faulted stream!)
    const anomalies = useMistakeDetector({
        sensorName: "Temperature Sensor",
        data: history,
        expectedRange: { min: -10, max: 60 }
    }).filter((_, i) => !dismissedAnomalies.includes(i));

    const exportCSV = () => {
        const csv = "Time,Temperature (°C),Processed\n" + chartData.map(d => `${d.time},${d.value},${d.processingValue ?? ''}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "temperature_data.csv"; a.click();
    };

    return (
        <>
            <SensorDetailLayout
                title="Temperature Sensor"
                description="The DHT22 uses an NTC thermistor whose resistance decreases as temperature increases."
                sensorId="DHT22 / AM2302"
                dataSnippet={{ value: displayValue, unit: "°C", type: "Digital", pin: "D2" }}
                theory={THEORY}
                arduinoCode={ARDUINO_CODE}
                experiments={EXPERIMENTS}
                commonMistakes={COMMON_MISTAKES}
                testingProps={{
                    showPanel: showTestingPanel,
                    setShowPanel: setShowTestingPanel,
                    renderPanel: () => (
                        <TestingControlPanel
                            faultType={fault.type}
                            setFault={setFault}
                            filterType={filter.type}
                            setFilter={setFilter}
                            calibrationOffset={calibrationOffset}
                            setCalibrationOffset={setCalibrationOffset}
                        />
                    )
                }}
            >
                {/* AI Anomaly Alerts */}
                {anomalies.map((anomaly, i) => (
                    <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />
                ))}

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Value Card */}
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="h-14 w-14 mb-3 rounded-full bg-orange-500/10 flex items-center justify-center ring-1 ring-orange-500/20">
                                <Thermometer className="h-7 w-7 text-orange-400" />
                            </div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                                {showRaw ? "Raw Value (ADC)" : "Temperature"}
                            </span>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-5xl font-bold tracking-tighter ${fault.type !== 'none' ? 'text-amber-400' : 'text-white'}`}>
                                    {showRaw ? rawAdcValue : displayValue}
                                </span>
                                <span className="text-xl text-slate-500 font-medium">{showRaw ? "" : "°C"}</span>
                            </div>

                            {/* Fault Indicator */}
                            {fault.type !== 'none' && (
                                <Badge variant="warning" size="sm" className="mt-2 animate-pulse">
                                    ⚠ Fault: {fault.type}
                                </Badge>
                            )}

                            {calibrationOffset !== 0 && (
                                <span className="text-xs text-indigo-400 mt-1">Offset: {calibrationOffset > 0 ? '+' : ''}{calibrationOffset}</span>
                            )}

                            <div className="flex gap-2 mt-4">
                                <button onClick={() => setShowRaw(!showRaw)} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 transition-colors">
                                    {showRaw ? "Show Calibrated" : "Show Raw"}
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chart */}
                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-orange-400" />Temperature History</CardTitle>
                            <div className="flex gap-2">
                                <button onClick={() => setShowExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20">
                                    <Sparkles size={12} />AI Explain
                                </button>
                                <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10">
                                    <Download size={12} />CSV
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <LiveChart
                                data={chartData}
                                color="#f97316"
                                gradientId="tempDetailGrad"
                                unit="°C"
                                height={220}
                                minDomain={0}
                                maxDomain={50}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* AI Quiz Button */}
                <div className="flex justify-center">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-xl text-white font-medium hover:from-cyan-500/30 hover:to-purple-500/30 transition">
                        <Brain className="h-5 w-5 text-cyan-400" />
                        Take AI Quiz on Temperature Sensors
                    </button>
                </div>

                {/* Specs & Wiring */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Technical Specs</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <SpecRow label="Range" value="-40°C to +80°C" />
                            <SpecRow label="Accuracy" value="±0.5°C" />
                            <SpecRow label="Resolution" value="0.1°C" />
                            <SpecRow label="Voltage" value="3.3V - 5.5V" />
                            <SpecRow label="Sampling" value="0.5 Hz (every 2s)" />
                        </CardContent>
                    </Card>
                    <Card variant="default">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader>
                        <CardContent>
                            <table className="w-full text-sm"><thead><tr className="border-b border-white/10 text-slate-500"><th className="py-1.5 text-left">Pin</th><th className="py-1.5 text-left">Arduino</th><th className="py-1.5 text-left">Function</th></tr></thead>
                                <tbody className="divide-y divide-white/5">
                                    <tr><td className="py-1.5 font-mono text-white">VCC</td><td className="py-1.5 font-mono text-orange-400">5V</td><td className="py-1.5 text-slate-400">Power</td></tr>
                                    <tr><td className="py-1.5 font-mono text-white">DATA</td><td className="py-1.5 font-mono text-orange-400">D2</td><td className="py-1.5 text-slate-400">Signal (10kΩ pull-up)</td></tr>
                                    <tr><td className="py-1.5 font-mono text-white">GND</td><td className="py-1.5 font-mono text-orange-400">GND</td><td className="py-1.5 text-slate-400">Ground</td></tr>
                                </tbody></table>
                        </CardContent>
                    </Card>
                </div>
            </SensorDetailLayout>

            {/* AI Modals */}
            {showQuiz && <AIQuizModal sensorName="Temperature Sensor" sensorId="DHT22" onClose={() => setShowQuiz(false)} />}
            {showExplainer && <GraphExplainerModal sensorName="Temperature Sensor" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}

const SpecRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-1 border-b border-white/5 last:border-0">
        <span className="text-slate-500">{label}</span>
        <span className="font-medium text-white">{value}</span>
    </div>
);
