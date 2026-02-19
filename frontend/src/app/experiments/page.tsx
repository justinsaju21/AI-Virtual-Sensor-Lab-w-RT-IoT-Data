"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Beaker, Clock, ArrowRight, Thermometer, Droplets, Flame, Sun } from "lucide-react";
import Link from "next/link";

const experiments = [
    {
        id: 1,
        title: "Temperature vs Time Analysis",
        description: "Observe how ambient temperature changes throughout the day and identify patterns.",
        sensor: "DHT22",
        duration: "30 min",
        difficulty: "Beginner",
        icon: <Thermometer className="h-5 w-5 text-orange-400" />,
        color: "orange",
    },
    {
        id: 2,
        title: "Humidity Response Test",
        description: "Breathe on the sensor and observe the humidity spike and recovery time.",
        sensor: "DHT22",
        duration: "15 min",
        difficulty: "Beginner",
        icon: <Droplets className="h-5 w-5 text-blue-400" />,
        color: "blue",
    },
    {
        id: 3,
        title: "Gas Sensor Calibration",
        description: "Understand MQ-2 sensor warm-up characteristics and baseline readings.",
        sensor: "MQ-2",
        duration: "45 min",
        difficulty: "Intermediate",
        icon: <Flame className="h-5 w-5 text-red-400" />,
        color: "red",
    },
    {
        id: 4,
        title: "Light Level Mapping",
        description: "Map light intensity at different distances from a light source.",
        sensor: "LDR",
        duration: "20 min",
        difficulty: "Beginner",
        icon: <Sun className="h-5 w-5 text-yellow-400" />,
        color: "yellow",
    },
];

export default function ExperimentsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <Beaker className="h-5 w-5 text-cyan-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Virtual Experiments</h1>
                    <Badge variant="info" size="md">Coming Soon</Badge>
                </div>
                <p className="text-slate-500">Guided hands-on experiments using real sensor data</p>
            </div>

            {/* Experiments Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {experiments.map((exp) => (
                    <Card key={exp.id} variant="gradient" className="group cursor-pointer">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`h-12 w-12 rounded-xl bg-${exp.color}-500/20 flex items-center justify-center`}>
                                    {exp.icon}
                                </div>
                                <Badge variant="default" size="sm">
                                    {exp.difficulty}
                                </Badge>
                            </div>

                            <h3 className="text-lg font-semibold text-white mb-2">{exp.title}</h3>
                            <p className="text-sm text-slate-400 mb-4">{exp.description}</p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {exp.duration}
                                    </span>
                                    <span>Sensor: {exp.sensor}</span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Info Card */}
            <Card variant="default">
                <CardContent className="text-center py-8">
                    <Beaker className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">More Experiments Coming Soon</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        We're developing more guided experiments to help you understand sensor behavior,
                        data analysis, and IoT concepts through hands-on learning.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
