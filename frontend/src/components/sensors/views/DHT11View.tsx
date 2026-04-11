"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Gauge } from "../components/Gauge";
import { LiveGraph } from "../components/LiveGraph";
import { TheoryPanel } from "../components/TheoryPanel";
import { Thermometer, Droplets } from "lucide-react";

interface DataPoint {
    time: string;
    temp: number;
    humidity: number;
}

interface DHT11ViewProps {
    data: {
        temp: number;
        humidity: number;
        stale?: boolean;
    };
    history?: DataPoint[];
}

export const DHT11View: React.FC<DHT11ViewProps> = ({ data, history = [] }) => {
    const [dewPoint, setDewPoint] = useState(0);

    // Calculate Dew Point using Magnus formula
    useEffect(() => {
        const calculateDewPoint = (T: number, RH: number) => {
            const a = 17.27;
            const b = 237.7;
            const numerator = (a * T) / (b + T) + Math.log(RH / 100);
            const dewPoint = (b * numerator) / (a - numerator);
            return dewPoint;
        };

        setDewPoint(calculateDewPoint(data.temp, data.humidity));
    }, [data.temp, data.humidity]);

    const comfortZones = [
        { min: 0, max: 18, label: "Cold", color: "from-blue-500 to-cyan-600" },
        { min: 18, max: 24, label: "Comfortable", color: "from-green-500 to-emerald-600" },
        { min: 24, max: 28, label: "Warm", color: "from-yellow-500 to-amber-600" },
        { min: 28, max: 50, label: "Hot", color: "from-orange-500 to-red-600" },
    ];

    const humidityZones = [
        { min: 0, max: 30, label: "Dry", color: "from-orange-500 to-red-600" },
        {
            min: 30,
            max: 60,
            label: "Comfortable",
            color: "from-green-500 to-emerald-600",
        },
        { min: 60, max: 100, label: "Humid", color: "from-blue-500 to-cyan-600" },
    ];

    const theoryContent = [
        {
            title: "How DHT11 Works",
            content: `The DHT11 is a **capacitive humidity sensor** combined with a **thermistor** for temperature measurement.

- **Humidity Sensor**: Measures the change in capacitance due to moisture absorption
- **Temperature Sensor**: Uses a thermistor (resistance changes with temperature)
- **Communication**: Uses a single-wire digital protocol
- **Response Time**: ~2 seconds minimum between reads
- **Accuracy**: ±2°C temperature, ±5% humidity`,
        },
        {
            title: "Dew Point Explained",
            content: `The **dew point** is the temperature at which water vapor in air becomes saturated and condenses into liquid water (dew).

**Formula used**: Magnus approximation
\`\`\`
Td = (b × α(T,RH)) / (a - α(T,RH))
where α(T,RH) = (a×T)/(b+T) + ln(RH/100)
\`\`\`

**Practical meaning**:
- If dew point = 15°C and ambient is 20°C → Water won't condense
- If dew point = 22°C and ambient is 20°C → Condensation will occur
- Higher dew point = more moisture in the air`,
        },
        {
            title: "Comfort Ranges",
            content: `Recommended conditions for human comfort (ASHRAE Standard):

- **Temperature**: 20-24°C (68-75°F)
- **Humidity**: 30-60%
- **Dew Point**: 8-15°C

Outside these ranges may cause:
- Discomfort
- Health issues (respiratory problems if too dry/humid)
- Material damage (wood warping, electronics corrosion)`,
        },
        {
            title: "Practical Applications",
            content: `- **HVAC Systems**: Monitor and control heating/cooling
- **Incubators**: Maintain precise temperature/humidity for eggs
- **Data Centers**: Ensure optimal environmental conditions
- **Agriculture**: Greenhouse climate control
- **Weather Stations**: Environmental monitoring
- **Moisture Detection**: Detect condensation risks`,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Thermometer className="h-6 w-6 text-orange-400" />
                    DHT11 Sensor
                </h2>
                <p className="text-slate-400">Temperature & Humidity Monitor</p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Gauge
                    value={data.temp}
                    min={0}
                    max={50}
                    title="Temperature"
                    unit="°C"
                    zones={comfortZones}
                    size="lg"
                />
                <Gauge
                    value={data.humidity}
                    min={0}
                    max={100}
                    title="Humidity"
                    unit="%"
                    zones={humidityZones}
                    size="lg"
                />
                <Gauge
                    value={dewPoint}
                    min={-20}
                    max={30}
                    title="Dew Point"
                    unit="°C"
                    zones={[
                        { min: -20, max: 8, label: "Safe", color: "from-green-500 to-emerald-600" },
                        {
                            min: 8,
                            max: 15,
                            label: "Comfortable",
                            color: "from-yellow-500 to-amber-600",
                        },
                        { min: 15, max: 30, label: "Risk", color: "from-red-500 to-rose-600" },
                    ]}
                    size="lg"
                />
            </div>

            {/* Historical Data */}
            {history.length > 0 && (
                <div className="grid gap-4 lg:grid-cols-2">
                    <LiveGraph
                        data={history}
                        title="Temperature Trend"
                        dataKey="temp"
                        unit="°C"
                        color="#f97316"
                    />
                    <LiveGraph
                        data={history}
                        title="Humidity Trend"
                        dataKey="humidity"
                        unit="%"
                        color="#06b6d4"
                    />
                </div>
            )}

            {/* Status Info */}
            <Card variant="default">
                <CardHeader>
                    <CardTitle className="text-sm">Sensor Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Status</p>
                            <p className="text-sm font-semibold text-white">
                                {data.stale ? "⚠️ Stale Data" : "✓ Active"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Accuracy</p>
                            <p className="text-sm font-semibold text-white">±2°C, ±5% RH</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Range</p>
                            <p className="text-sm font-semibold text-white">0-50°C, 0-100%</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Response Time</p>
                            <p className="text-sm font-semibold text-white">~2 seconds</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Theory */}
            <TheoryPanel sections={theoryContent} />
        </div>
    );
};
