"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { LiveGraph } from "../components/LiveGraph";
import { ThresholdSlider } from "../components/ThresholdSlider";
import { TheoryPanel } from "../components/TheoryPanel";
import { Badge } from "@/components/ui/Badge";
import { Flame, AlertTriangle } from "lucide-react";

interface MQ2Detection {
    time: string;
    value: number;
}

interface MQ2ViewProps {
    data: {
        raw: number;
        isReal?: boolean;
    };
    history?: MQ2Detection[];
}

export const MQ2View: React.FC<MQ2ViewProps> = ({ data, history = [] }) => {
    const [threshold, setThreshold] = useState(300);
    const [baseline, setBaseline] = useState<number | null>(null);

    const detectingStatus =
        data.raw > 500 ? "danger" : data.raw > 300 ? "warning" : "safe";

    const theoryContent = [
        {
            title: "How MQ2 Works",
            content: `The **MQ2 Gas Sensor** uses a **heated metal oxide (SnO2)** element that changes resistance when exposed to combustible gases.

**Detection Mechanism**:
- A resistance heater generates ~5V heat across the sensor element
- A sensing circuit measures the resistance in a voltage divider
- When gas is present, resistance changes → output voltage changes
- The ADC converts this to a 0-1023 raw value

**Detectable Gases**:
- **LPG** (Liquefied Petroleum Gas)
- **Smoke** (combustion products)
- **Alcohol** vapor
- **Propane**
- **Methane** (natural gas)`,
        },
        {
            title: "Calibration Process",
            content: `To get meaningful PPM readings, the sensor must be **calibrated**:

1. **Fresh Air Setup**: Run sensor in fresh air for 5 minutes to warm up
2. **Baseline Recording**: Note the clean air reading (typically 200-300 ADC)
3. **Conversion**: Apply calibration curve to convert ADC → PPM
4. **Storage**: Sensor needs 24+ hours warm-up time after power-on

**Calibration Formula** (approximate):
\`\`\`
PPM = 116.6020 × (RS/RO)^(-2.769) 
where RS = sensor resistance
      RO = sensor resistance in fresh air
\`\`\``,
        },
        {
            title: "Safety Thresholds",
            content: `**NFPA/Safety Standards**:

| Range | Status | Action |
|-------|--------|--------|
| 0-100 | Safe | Normal operation |
| 100-300 | Monitor | Ensure ventilation |
| 300-500 | Warning | Investigate source |
| >500 | Danger | Evacuate & alert |

**Real-World Context**:
- Smoke detector threshold: ~400-500 ppm
- Industrial alarm: ~300-500 ppm
- Natural gas leak: ~500-1000 ppm`,
        },
        {
            title: "Practical Applications",
            content: `- **Fire Alarm**: Triggered when smoke (combustion products) detected
- **Gas Leak Detection**: Alerts to LPG/Propane/Methane leaks
- **Air Quality Monitor**: Detects pollution levels
- **Fermentation Monitor**: Tracks CO₂ levels during brewing
- **Safety System**: Automatic ventilation trigger
- **Industrial Safety**: Workplace hazard monitoring`,
        },
    ];

    const calibrate = () => {
        setBaseline(data.raw);
        alert(`Baseline set to ${data.raw} ADC. Keep sensor in fresh air for accurate readings.`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Flame className="h-6 w-6 text-red-400" />
                    MQ2 Sensor
                </h2>
                <p className="text-slate-400">Gas & Smoke Detection</p>
            </div>

            {/* Current Status */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Raw Value */}
                <Card variant="default">
                    <CardHeader>
                        <CardTitle className="text-sm">Raw ADC Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="text-4xl font-bold text-white font-mono">
                                {data.raw}
                            </div>
                            <div className="relative h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full overflow-hidden">
                                <div
                                    className="absolute h-full bg-white/30 transition-all"
                                    style={{
                                        width: `${(data.raw / 1023) * 100}%`,
                                    }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>0</span>
                                <span>512</span>
                                <span>1023</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Detection Status */}
                <Card variant="default">
                    <CardHeader>
                        <CardTitle className="text-sm">Detection Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div
                                className={`px-4 py-3 rounded-lg flex items-center gap-3 ${
                                    detectingStatus === "danger"
                                        ? "bg-red-500/20 border border-red-500/50"
                                        : detectingStatus === "warning"
                                          ? "bg-yellow-500/20 border border-yellow-500/50"
                                          : "bg-green-500/20 border border-green-500/50"
                                }`}
                            >
                                <AlertTriangle
                                    className={`h-5 w-5 ${
                                        detectingStatus === "danger"
                                            ? "text-red-400"
                                            : detectingStatus === "warning"
                                              ? "text-yellow-400"
                                              : "text-green-400"
                                    }`}
                                />
                                <div>
                                    <p className="font-semibold text-white">
                                        {detectingStatus === "danger"
                                            ? "⚠️ DANGER"
                                            : detectingStatus === "warning"
                                              ? "⚠️ WARNING"
                                              : "✓ SAFE"}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {detectingStatus === "danger"
                                            ? "Gas/Smoke detected - evacuate area"
                                            : detectingStatus === "warning"
                                              ? "Elevated levels - check ventilation"
                                              : "Air quality normal"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={calibrate}
                                className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
                            >
                                📍 Set Fresh Air Baseline
                            </button>
                            {baseline !== null && (
                                <div className="text-xs text-slate-400">
                                    Baseline recorded: {baseline} ADC
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Threshold Control */}
            <ThresholdSlider
                label="Alert Threshold"
                value={threshold}
                onChange={setThreshold}
                min={100}
                max={800}
                step={10}
                unit="ADC"
                description="Gas detection alert triggers when value exceeds this threshold"
                zones={[
                    { min: 0, max: 300, label: "Safe", color: "from-green-500 to-emerald-600" },
                    {
                        min: 300,
                        max: 500,
                        label: "Warning",
                        color: "from-yellow-500 to-amber-600",
                    },
                    { min: 500, max: 1023, label: "Danger", color: "from-red-500 to-rose-600" },
                ]}
            />

            {/* Historical Data */}
            {history.length > 0 && (
                <LiveGraph
                    data={history}
                    title="Gas Level Trend"
                    dataKey="value"
                    unit="ADC"
                    color="#ef4444"
                    type="line"
                />
            )}

            {/* Sensor Info */}
            <Card variant="default">
                <CardHeader>
                    <CardTitle className="text-sm">Sensor Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Detectable Gases</p>
                            <p className="text-sm font-semibold text-white">LPG, Smoke, Alcohol</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Response Time</p>
                            <p className="text-sm font-semibold text-white">~5-10 seconds</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Heating Time</p>
                            <p className="text-sm font-semibold text-white">1-2 minutes warmup</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Sensitivity</p>
                            <p className="text-sm font-semibold text-white">Adjustable</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Theory */}
            <TheoryPanel sections={theoryContent} />
        </div>
    );
};
