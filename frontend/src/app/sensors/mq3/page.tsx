"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LiveChart } from "@/components/charts/LiveChart";
import { SensorDetailLayout } from "@/components/sensors/SensorDetailLayout";
import { Activity, Cpu, Info, Wine, Download, Sparkles, Brain } from "lucide-react";
import { useMistakeDetector, MistakeAlert } from "@/components/ai/MistakeDetector";
import { AIQuizModal } from "@/components/ai/AIQuizModal";
import { GraphExplainerModal } from "@/components/ai/GraphExplainerModal";
import { useFaultInjector } from "@/hooks/useFaultInjector";
import { useSignalProcessing } from "@/hooks/useSignalProcessing";
import { TestingControlPanel } from "@/components/testing/TestingControlPanel";
import { SENSOR_QUIZZES } from "@/config/quizzes";

interface DataPoint { time: string; value: number; processingValue?: number; }
const MAX_DATA_POINTS = 50;

const THEORY = {
    "physics": "The MQ-3 is a specialized electro-chemical gas sensor tuned aggressively for ethanol (alcohol vapor) detection. Like the MQ-2, it uses a Tin Dioxide (SnO₂) semiconductor heating element. However, the exact chemical doping and the temperature at which the micro-ceramic tube is maintained are precisely calibrated to maximize the catalytic reaction with ethanol molecules. When exposed to alcohol vapor in breath or air, the ethanol reacts with oxygen adsorbed on the SnO₂ surface, lowering the potential barrier at the grain boundaries and increasing electron mobility, which translates to a sharp drop in electrical resistance.",
    "math": "**Resistance to BAC (Blood Alcohol Content):**\nThe relationship between ethanol concentration in mg/L and sensor resistance:\n\n$ R_s / R_0 = A \\times (ppm)^B $\n\nWith proper calibration in clean air ($R_0$), breath alcohol (mg/L) can be mathematically approximated. \n*Note: Output is heavily dependent on precise heater temperature, requiring a 24-48 hour initial burn-in period.*",
    "circuit": "**Hardware Architecture:**\n- **Heater Matrix:** Consumes ~150mA at 5V to maintain the specific high-temperature reaction zone.\n- **Load Resistor ($R_L$):** Typically 200k\\Omega for the MQ-3 (compared to 10k-47k\\Omega for the MQ-2). This higher resistor value shifts the voltage divider curve to better amplify the high-resistance changes specific to low ethanol concentrations."
};
const EXPERIMENTS = [
    {
        "title": "Hand Sanitizer Vapor Test",
        "instruction": "Rub alcohol hand sanitizer onto hands. Cup them around sensor and breathe out gently onto them.",
        "observation": "The analog reading spikes violently toward 800–1023 within 1–2 seconds.",
        "expected": "Confirms the sensor's extreme sensitivity to ethanol vapor. Takes several minutes to recover and drop back to baseline as alcohol evaporates."
    }
];

const COMMON_MISTAKES = [
    {
        "title": "Using Immediately After Power-On",
        "symptom": "Readings are unstable, jumping by 200+ units randomly.",
        "cause": "The internal heater has not yet reached its operating temperature.",
        "fix": "Always wait at least 3–5 minutes after power-on before trusting any readings. For lab precision, 10 minutes is better."
    },
    {
        "title": "False Positives from Breath Humidity",
        "symptom": "Blowing normal air (without alcohol) causes the reading to spike from 150 to 190.",
        "cause": "Human breath is warm and humid. The MQ-3 has slight cross-sensitivity to temperature and water vapor.",
        "fix": "Count only large spikes (e.g., 200 to 500+) as alcohol. Small bumps from exhaling are moisture artifacts."
    }
];


const ARDUINO_CODE = `// Alcohol Sensor - MQ3
#define MQ3_PIN A1

void setup() {
  Serial.begin(115200);
  Serial.println("MQ3 preheating...");
  delay(20000);
  Serial.println("Ready!");
}

void loop() {
  int alcoholValue = analogRead(MQ3_PIN);
  Serial.print("Alcohol: ");
  Serial.println(alcoholValue);
  delay(1000);
}`;





export default function MQ3Page() {
    const { isConnected, data } = useSocket();
    const [history, setHistory] = useState<DataPoint[]>([]);

    // Testing & AI State
    const [showQuiz, setShowQuiz] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [showTestingPanel, setShowTestingPanel] = useState(false);
    const [dismissedAnomalies, setDismissedAnomalies] = useState<number[]>([]);
    const [calibrationOffset, setCalibrationOffset] = useState(0);

    const rawValFromSocket = data?.sensors.mq3?.raw ?? 0;
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
    const anomalies = useMistakeDetector({ sensorName: "Alcohol Sensor", data: history, expectedRange: { min: 50, max: 900 } }).filter((_, i) => !dismissedAnomalies.includes(i));
    const displayValue = (typeof calibratedValue === "number") ? calibratedValue.toFixed(0) : "--";

    const exportCSV = () => {
        const csv = "Time,Alcohol (ADC),Processed\n" + chartData.map(d => `${d.time},${d.value},${d.processingValue ?? ''}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "alcohol_data.csv"; a.click(); URL.revokeObjectURL(url);
    };

    return (
        <>
            <SensorDetailLayout title="Alcohol Sensor (MQ3)" description="Chemiresistor optimized for ethanol vapor detection." sensorId="MQ3" dataSnippet={{ value: displayValue, pin: "A1" }} theory={THEORY} arduinoCode={ARDUINO_CODE} experiments={EXPERIMENTS} commonMistakes={COMMON_MISTAKES} testingProps={{ showPanel: showTestingPanel, setShowPanel: setShowTestingPanel, renderPanel: () => <TestingControlPanel faultType={fault.type} setFault={setFault} filterType={filter.type} setFilter={setFilter} calibrationOffset={calibrationOffset} setCalibrationOffset={setCalibrationOffset} /> }}>
                {anomalies.map((anomaly, i) => <MistakeAlert key={i} anomaly={anomaly} onDismiss={() => setDismissedAnomalies([...dismissedAnomalies, i])} />)}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card variant="gradient" className="md:col-span-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl" />
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="h-14 w-14 mb-3 rounded-full bg-amber-500/10 flex items-center justify-center ring-1 ring-amber-500/20"><Wine className="h-7 w-7 text-amber-400" /></div>
                            <span className="text-xs text-slate-500 uppercase mb-1">Alcohol Level</span>
                            <span className={`text-4xl font-bold ${fault.type !== 'none' ? 'text-amber-300' : 'text-white'}`}>{displayValue}</span>
                            {fault.type !== 'none' && <Badge variant="warning" size="sm" className="mt-2 animate-pulse">⚠ Fault: {fault.type}</Badge>}
                            {calibrationOffset !== 0 && <span className="text-xs text-indigo-400 mt-1">Offset: {calibrationOffset > 0 ? '+' : ''}{calibrationOffset}</span>}
                            <Badge variant={isConnected ? "success" : "default"} size="sm" className="mt-3">{isConnected ? "Live" : "Offline"}</Badge>
                        </CardContent>
                    </Card>
                    <Card variant="default" className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-amber-400" />Alcohol History</CardTitle>
                            <div className="flex gap-2">
                                <button onClick={() => setShowExplainer(true)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"><Sparkles size={12} />AI Explain</button>
                                <button onClick={exportCSV} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"><Download size={12} />CSV</button>
                            </div>
                        </CardHeader>
                        <CardContent><LiveChart data={chartData} color="#f59e0b" gradientId="mq3Grad" unit="" height={220} minDomain={0} maxDomain={1023} /></CardContent>
                    </Card>
                </div>
                <div className="flex justify-center mt-4 mb-4">
                    <button onClick={() => setShowQuiz(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-white font-medium hover:from-amber-500/30 hover:to-orange-500/30 transition">
                        <Brain className="h-5 w-5 text-amber-400" /> Test Knowledge
                    </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-4 w-4 text-cyan-400" />Specs</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><SpecRow label="Target" value="Ethanol" /><SpecRow label="Range" value="0.04-4 mg/L" /></CardContent></Card>
                    <Card variant="default"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-400" />Wiring</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><tbody className="divide-y divide-white/5"><tr><td className="py-1.5 font-mono text-white">A0</td><td className="py-1.5 font-mono text-amber-400">A1</td></tr></tbody></table></CardContent></Card>
                </div>
            </SensorDetailLayout>
            {showQuiz && <AIQuizModal sensorName="Alcohol Sensor" sensorId="MQ3" onClose={() => setShowQuiz(false)} defaultQuestions={SENSOR_QUIZZES["mq3"]} />}
            {showExplainer && <GraphExplainerModal sensorName="Alcohol Sensor" data={chartData} onClose={() => setShowExplainer(false)} />}
        </>
    );
}
const SpecRow = ({ label, value }: { label: string; value: string }) => (<div className="flex justify-between py-1 border-b border-white/5 last:border-0"><span className="text-slate-500">{label}</span><span className="font-medium text-white">{value}</span></div>);
