"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Sliders } from "lucide-react";

interface ThresholdSliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    description?: string;
    zones?: { min: number; max: number; label: string; color: string }[];
}

export const ThresholdSlider: React.FC<ThresholdSliderProps> = ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    unit = "",
    description,
    zones = [],
}) => {
    const percentage = ((value - min) / (max - min)) * 100;

    const getZoneInfo = () => {
        return zones.find((z) => value >= z.min && value <= z.max);
    };

    const zone = getZoneInfo();

    return (
        <Card variant="default">
            <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                    <Sliders className="h-4 w-4" />
                    {label}
                </CardTitle>
                {description && (
                    <p className="text-xs text-slate-500 mt-1">{description}</p>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Visual Slider */}
                    <div className="space-y-2">
                        <div className="relative h-2 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full overflow-hidden">
                            {zones.map((z) => {
                                const zoneStart = ((z.min - min) / (max - min)) * 100;
                                const zoneEnd = ((z.max - min) / (max - min)) * 100;
                                const width = zoneEnd - zoneStart;

                                const colorMap: Record<string, string> = {
                                    "from-green-500 to-emerald-600": "bg-emerald-500",
                                    "from-yellow-500 to-amber-600": "bg-yellow-500",
                                    "from-orange-500 to-red-600": "bg-orange-500",
                                    "from-red-500 to-rose-600": "bg-red-500",
                                };

                                return (
                                    <div
                                        key={z.label}
                                        className={`absolute h-full ${colorMap[z.color] || "bg-cyan-500"}`}
                                        style={{
                                            left: `${zoneStart}%`,
                                            width: `${width}%`,
                                            opacity: 0.3,
                                        }}
                                    />
                                );
                            })}
                            {/* Progress Fill */}
                            <div
                                className="absolute h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>

                        {/* Slider Input */}
                        <input
                            type="range"
                            min={min}
                            max={max}
                            step={step}
                            value={value}
                            onChange={(e) => onChange(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
                        />
                    </div>

                    {/* Value Display */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-xs text-slate-500">Current Value</span>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-white font-mono">
                                {value.toFixed(2)}
                            </span>
                            {unit && <span className="text-sm text-slate-400">{unit}</span>}
                        </div>
                    </div>

                    {/* Zone Info */}
                    {zone && (
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span className="text-xs text-slate-500">Zone</span>
                            <span
                                className={`text-xs px-2 py-1 rounded-full font-semibold bg-gradient-to-r ${zone.color} text-white`}
                            >
                                {zone.label}
                            </span>
                        </div>
                    )}

                    {/* Range Display */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                        <span>{min}</span>
                        <span>{max}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
