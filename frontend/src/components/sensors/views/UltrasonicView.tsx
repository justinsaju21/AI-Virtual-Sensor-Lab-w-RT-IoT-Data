"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { LiveGraph } from "../components/LiveGraph";
import { Gauge } from "../components/Gauge";
import { TheoryPanel } from "../components/TheoryPanel";
import { Radar } from "lucide-react";

interface DistancePoint {
    time: string;
    distance: number;
}

interface UltrasonicViewProps {
    data: {
        distance_cm: number;
        isReal?: boolean;
    };
    history?: DistancePoint[];
}

export const UltrasonicView: React.FC<UltrasonicViewProps> = ({ data, history = [] }) => {
    const [soundSpeed, setSoundSpeed] = useState(343); // m/s at 20°C
    const [temperature, setTemperature] = useState(20);
    const [estimatedAltitude, setEstimatedAltitude] = useState(0);

    // Calculate altitude from pressure (simplified)
    useEffect(() => {
        // Sound speed changes with temperature: v = 331.3 + 0.606 × T
        const newSoundSpeed = 331.3 + 0.606 * temperature;
        setSoundSpeed(newSoundSpeed);
    }, [temperature]);

    const theoryContent = [
        {
            title: "How Ultrasonic Works",
            content: `The **HC-SR04 Ultrasonic Sensor** measures distance using **sound waves**.

**Operating Principle**:
1. Trigger pin receives a 10µs pulse from microcontroller
2. Sensor emits 40kHz ultrasonic burst (40,000 cycles/second)
3. Sound wave travels to object and bounces back
4. Echo pin HIGH duration = time for sound to return
5. Distance calculated: **distance = (time × speed_of_sound) / 2**

**Why divide by 2?** The sound travels to the object AND back, so we divide by 2.`,
        },
        {
            title: "Distance Formula",
            content: `**Basic Formula**:
\`\`\`
Distance (cm) = (Time (µs) × Speed (cm/µs)) / 2
            = (Time (µs) × 0.0343) / 2 @ 20°C
\`\`\`

**Speed of Sound**:
\`\`\`
v = 331.3 + (0.606 × T)  [where T = temperature in °C]
\`\`\`

**Temperature Examples**:
- 0°C: 331.3 m/s
- 20°C: 343.2 m/s (standard)
- 40°C: 354.8 m/s

**Impact on Measurement**: ±1°C : ±0.2% error`,
        },
        {
            title: "Measurement Considerations",
            content: `**Effective Range**: 2cm - 4 meters

**Blind Zone**: <2cm (too close, sensor can't distinguish)

**Angle Sensitivity**: 
- Best: 0° (perpendicular to surface)
- Works: 0-15° (slight angle)
- Poor: >30° (misses reflections)

**Material Reflectivity**:
- **Good**: Hard surfaces (walls, metal, plastic)
- **Poor**: Soft/absorbent (fabric, foam, water)
- **Worst**: Sharp angles (sound reflects away)`,
        },
        {
            title: "Practical Applications",
            content: `- **Parking Sensors**: Detect proximity to obstacles
- **Obstacle Avoidance**: Robots detect walls/objects
- **Liquid Level**: Measure water/fuel tank levels
- **Distance Measurement**: Non-contact ranging
- **Altimeter**: With pressure sensor for altitude
- **Motion Triggering**: Detect approaching objects`,
        },
    ];

    const distanceZones = [
        { min: 0, max: 5, label: "Too Close", color: "from-red-500 to-rose-600" },
        { min: 5, max: 50, label: "Close", color: "from-orange-500 to-amber-600" },
        { min: 50, max: 200, label: "Mid Range", color: "from-yellow-500 to-lime-500" },
        { min: 200, max: 400, label: "Far", color: "from-green-500 to-emerald-600" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Radar className="h-6 w-6 text-purple-400" />
                    HC-SR04 Ultrasonic Sensor
                </h2>
                <p className="text-slate-400">Distance & Object Detection</p>
            </div>

            {/* Distance Display */}
            <Gauge
                value={Math.max(0, data.distance_cm)}
                min={0}
                max={400}
                title="Distance"
                unit="cm"
                zones={distanceZones}
                size="lg"
            />

            {/* Temperature & Sound Speed Adjustment */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card variant="default">
                    <CardHeader>
                        <CardTitle className="text-sm">Temperature Compensation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-500 mb-2 block">
                                    Ambient Temperature
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range"
                                        min="-10"
                                        max="50"
                                        value={temperature}
                                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                        className="flex-1 accent-purple-500"
                                    />
                                    <span className="text-sm font-mono text-white font-semibold w-12">
                                        {temperature}°C
                                    </span>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-white/5">
                                <p className="text-xs text-slate-500 mb-2">Sound Speed</p>
                                <p className="text-lg font-mono text-white">
                                    {soundSpeed.toFixed(1)} m/s
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {(soundSpeed / 10).toFixed(2)} cm/µs
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Formula Visualization */}
                <Card variant="default">
                    <CardHeader>
                        <CardTitle className="text-sm">Distance Calculation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 font-mono text-sm">
                            <div className="bg-slate-800/50 p-2 rounded text-cyan-300">
                                <p>distance = (time × speed) / 2</p>
                            </div>
                            <div className="text-slate-400">
                                <p>speed = {soundSpeed.toFixed(1)} m/s</p>
                                <p>speed = {(soundSpeed / 100000).toFixed(5)} cm/µs</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Historical Data */}
            {history.length > 0 && (
                <LiveGraph
                    data={history}
                    title="Distance History"
                    dataKey="distance"
                    unit="cm"
                    color="#a855f7"
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
                            <p className="text-xs text-slate-500 mb-1">Effective Range</p>
                            <p className="text-sm font-semibold text-white">2cm - 4m</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Accuracy</p>
                            <p className="text-sm font-semibold text-white">±0.3cm</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Frequency</p>
                            <p className="text-sm font-semibold text-white">40 kHz</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Response Time</p>
                            <p className="text-sm font-semibold text-white">~60ms</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Theory */}
            <TheoryPanel sections={theoryContent} />
        </div>
    );
};
