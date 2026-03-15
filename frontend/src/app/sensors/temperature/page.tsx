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
import { Activity, Cpu, Info, Thermometer, Download, Sparkles, Brain } from "lucide-react";

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 50;

const THEORY = {
    "physics": "The DHT11 is a basic, ultra-low-cost digital temperature and humidity sensor. Inside the plastic grating are two simple but effective components. \n1. **Humidity:** Measured via a moisture-holding substrate sandwiched between two electrodes. As the substrate absorbs water vapor from the air, it releases ions, drastically increasing the electrical conductivity (dropping resistance). \n2. **Temperature:** Measured via a standard NTC (Negative Temperature Coefficient) thermistor. As ambient heat increases, the semiconducting material's crystalline lattice allows electrons to flow much more freely, dropping its resistance.",
    "math": "**Thermodynamic Response:**\nBoth internal components are inherently nonlinear. The DHT11 relies on an internal 8-bit microcontroller. It reads the raw analog resistances from the humidity substrate and the thermistor, references an internal calibration lookup table, mathematically linearizes both values, and packages them into a pure digital signal.",
    "circuit": "**Hardware Architecture:**\n- **Custom 1-Wire Protocol:** Does NOT use standard I2C. The DHT11 uses a proprietary timing-based single-wire interface. The Arduino must pull the data line LOW for 18ms to 'wake' the sensor, which then replies with exactly 40 pulses of data. The length of each HIGH pulse determines if a bit is a `0` (28μs) or a `1` (70μs).\n- **Pull-up:** Always requires a 10k\\Omega pull-up resistor between the Data pin and 5V to maintain the idle HIGH state of the bus."
};
const EXPERIMENTS = [
    {
        "title": "Body Heat Finger-Touch Test",
        "instruction": "Let sensor settle for 2 minutes. Record reading. Then gently pinch the thermistor bead between thumb and index finger for 30 seconds.",
        "observation": "Temperature climbs steadily from room ambient toward 30-33 deg C.",
        "expected": "Demonstrates fast response. No environmental changes needed -- finger contact alone creates a clear measurable shift, impossible this quickly with DHT11."
    },
    {
        "title": "Response Speed Comparison vs DHT11",
        "instruction": "Mount NTC thermistor and DHT11 side-by-side. Blow hot air on both simultaneously and log timestamp of first detectable response.",
        "observation": "NTC registers a change within 100-300ms. DHT11 lags by at least 2-4 seconds.",
        "expected": "Proves the speed advantage of continuous analog sensing. For thermal runaway detection, NTC response speed is essential."
    }
];

const COMMON_MISTAKES = [
    {
        "title": "Temperature Reads NaN -- Arduino Crashes",
        "symptom": "Serial monitor shows 'inf', 'nan', or the Arduino resets unexpectedly.",
        "cause": "rawADC returns 0 due to a disconnected or open-circuit thermistor, causing division by zero in the resistance formula.",
        "fix": "Add a guard block: if (rawADC == 0) { return; } immediately after the analogRead line."
    },
    {
        "title": "Reading is Off by 30 Degrees",
        "symptom": "Room temperature reads 55 deg C or -10 deg C when it is clearly ~25 deg C.",
        "cause": "Wrong Beta constant. Different thermistors have values ranging from 3000 to 4500.",
        "fix": "Check your thermistor datasheet for its Beta value. Or perform a two-point calibration experiment with ice water and boiling water."
    },
    {
        "title": "Readings Fluctuate Rapidly",
        "symptom": "Temperature jumps erratically even in stable environment.",
        "cause": "Single-sample ADC reads are inherently noisy. Power supply ripple couples into the high-impedance analog circuit.",
        "fix": "Average 10 consecutive samples in a for-loop. This simple oversampling reduces noise dramatically."
    }
];


const ARDUINO_CODE = `// Temperature Reading - DHT22
#include <DHT.h>

#define DHT_PIN 2
#define DHT_TYPE DHT11

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
        const a = document.createElement("a"); a.href = url; a.download = "temperature_data.csv"; a.click(); URL.revokeObjectURL(url);
    };

    return (
        <>
            <SensorDetailLayout
                title="Temperature Sensor"
                description="The DHT22 uses an NTC thermistor whose resistance decreases as temperature increases."
                sensorId="DHT11"
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
            {showQuiz && <AIQuizModal sensorName="Temperature Sensor" sensorId="DHT11" onClose={() = defaultQuestions={SENSOR_QUIZZES["temperature"]} > setShowQuiz(false)} />}
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
