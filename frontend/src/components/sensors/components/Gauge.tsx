"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface GaugeProps {
    value: number;
    min?: number;
    max?: number;
    title: string;
    unit?: string;
    zones?: { min: number; max: number; label: string; color: string }[];
    size?: "sm" | "md" | "lg";
}

export const Gauge: React.FC<GaugeProps> = ({
    value,
    min = 0,
    max = 100,
    title,
    unit = "",
    zones = [],
    size = "md",
}) => {
    const percentage = ((value - min) / (max - min)) * 100;
    const clampedPercentage = Math.max(0, Math.min(100, percentage));

    // Find current zone
    const currentZone = zones.find((z) => value >= z.min && value <= z.max);
    const zoneColor = currentZone?.color || "from-cyan-500 to-blue-600";

    const sizeClass = {
        sm: "h-24",
        md: "h-32",
        lg: "h-40",
    }[size];

    return (
        <Card variant="default">
            <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                    {title}
                    {currentZone && (
                        <Badge variant="default" size="sm">
                            {currentZone.label}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-4">
                    {/* Gauge Arc */}
                    <div className={`relative w-full ${sizeClass} flex items-center justify-center`}>
                        <svg viewBox="0 0 200 120" className="w-full h-full">
                            {/* Background Arc */}
                            <path
                                d="M 20 100 A 80 80 0 0 1 180 100"
                                stroke="rgba(100,116,139,0.2)"
                                strokeWidth="8"
                                fill="none"
                            />

                            {/* Zones */}
                            {zones.map((zone, idx) => {
                                const zoneMin = ((zone.min - min) / (max - min)) * 160;
                                const zoneMax = ((zone.max - min) / (max - min)) * 160;
                                const startAngle = (zoneMin - 80) * (Math.PI / 80);
                                const endAngle = (zoneMax - 80) * (Math.PI / 80);

                                const getStrokeColor = (color: string) => {
                                    const colorMap: Record<string, string> = {
                                        "from-green-500 to-emerald-600": "#10b981",
                                        "from-yellow-500 to-amber-600": "#eab308",
                                        "from-orange-500 to-red-600": "#ef4444",
                                        "from-red-500 to-rose-600": "#e11d48",
                                    };
                                    return colorMap[color] || "#06b6d4";
                                };

                                return (
                                    <path
                                        key={zone.label}
                                        d={`M ${100 + 80 * Math.cos(startAngle + Math.PI)} ${100 - 80 * Math.sin(startAngle + Math.PI)} A 80 80 0 0 1 ${100 + 80 * Math.cos(endAngle + Math.PI)} ${100 - 80 * Math.sin(endAngle + Math.PI)}`}
                                        stroke={getStrokeColor(zone.color)}
                                        strokeWidth="8"
                                        fill="none"
                                        opacity="0.3"
                                    />
                                );
                            })}

                            {/* Value Arc */}
                            <path
                                d={`M 20 100 A 80 80 0 0 1 ${20 + (clampedPercentage / 100) * 160} 100`}
                                stroke={
                                    currentZone
                                        ? currentZone.color === "from-green-500 to-emerald-600"
                                            ? "#10b981"
                                            : currentZone.color === "from-yellow-500 to-amber-600"
                                              ? "#eab308"
                                              : currentZone.color === "from-orange-500 to-red-600"
                                                ? "#ef4444"
                                                : "#e11d48"
                                        : "#06b6d4"
                                }
                                strokeWidth="8"
                                fill="none"
                            />

                            {/* Needle */}
                            <line
                                x1="100"
                                y1="100"
                                x2={100 + 60 * Math.cos((clampedPercentage / 100) * Math.PI - Math.PI / 2)}
                                y2={100 - 60 * Math.sin((clampedPercentage / 100) * Math.PI - Math.PI / 2)}
                                stroke={
                                    currentZone
                                        ? currentZone.color === "from-green-500 to-emerald-600"
                                            ? "#10b981"
                                            : currentZone.color === "from-yellow-500 to-amber-600"
                                              ? "#eab308"
                                              : currentZone.color === "from-orange-500 to-red-600"
                                                ? "#ef4444"
                                                : "#e11d48"
                                        : "#06b6d4"
                                }
                                strokeWidth="3"
                                strokeLinecap="round"
                            />

                            {/* Center Circle */}
                            <circle cx="100" cy="100" r="6" fill="white" />
                        </svg>
                    </div>

                    {/* Value Display */}
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                            {typeof value === "number" ? value.toFixed(1) : value}
                            <span className="text-sm text-slate-400 ml-1">{unit}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            {min} {unit} - {max} {unit}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
