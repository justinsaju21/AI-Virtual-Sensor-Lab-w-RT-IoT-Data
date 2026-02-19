"use client";

import React from "react";
import { AlertTriangle, X, Lightbulb } from "lucide-react";

interface Anomaly {
    type: "spike" | "drop" | "drift" | "noise" | "stuck";
    severity: "warning" | "critical";
    title: string;
    description: string;
    possibleCauses: string[];
    suggestedFixes: string[];
}

interface MistakeDetectorProps {
    sensorName: string;
    data: { time: string; value: number }[];
    expectedRange?: { min: number; max: number };
}

export function useMistakeDetector({ sensorName, data, expectedRange }: MistakeDetectorProps): Anomaly[] {
    if (data.length < 5) return [];

    const values = data.map(d => d.value);
    const anomalies: Anomaly[] = [];

    // Check for stuck values
    const lastFive = values.slice(-5);
    if (lastFive.every(v => v === lastFive[0])) {
        anomalies.push({
            type: "stuck",
            severity: "warning",
            title: "Sensor readings appear stuck",
            description: `The last 5 readings are identical (${lastFive[0]}). This is unusual.`,
            possibleCauses: [
                "Sensor disconnected or not responding",
                "Loose wiring connection",
                "Sensor needs reinitialization"
            ],
            suggestedFixes: [
                "Check all wire connections",
                "Verify power supply to sensor",
                "Reset the Arduino"
            ]
        });
    }

    // Check for out-of-range
    if (expectedRange) {
        const latest = values[values.length - 1];
        if (latest < expectedRange.min || latest > expectedRange.max) {
            anomalies.push({
                type: "spike",
                severity: "critical",
                title: "Reading outside expected range",
                description: `Current value (${latest}) is outside the expected ${expectedRange.min}-${expectedRange.max} range.`,
                possibleCauses: [
                    "Environmental conditions extreme",
                    "Sensor calibration issue",
                    "Wiring problem causing incorrect readings"
                ],
                suggestedFixes: [
                    "Verify environmental conditions are normal",
                    "Recalibrate sensor if possible",
                    "Check wiring and connections"
                ]
            });
        }
    }

    // Check for high noise (standard deviation)
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev > avg * 0.2 && stdDev > 10) {
        anomalies.push({
            type: "noise",
            severity: "warning",
            title: "High noise detected",
            description: `Readings are fluctuating significantly (σ=${stdDev.toFixed(1)}).`,
            possibleCauses: [
                "Electrical interference from nearby devices",
                "Loose or long wiring acting as antenna",
                "Power supply instability"
            ],
            suggestedFixes: [
                "Shorten sensor wires if possible",
                "Add decoupling capacitor near sensor",
                "Move sensor away from motors/power supplies"
            ]
        });
    }

    return anomalies;
}

export const MistakeAlert: React.FC<{ anomaly: Anomaly; onDismiss: () => void }> = ({ anomaly, onDismiss }) => {
    return (
        <div className={`p-4 rounded-xl border ${anomaly.severity === "critical" ? "bg-red-500/10 border-red-500/30" : "bg-amber-500/10 border-amber-500/30"} mb-4`}>
            <div className="flex items-start gap-3">
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${anomaly.severity === "critical" ? "text-red-400" : "text-amber-400"}`} />
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-white">{anomaly.title}</h4>
                        <button onClick={onDismiss} className="text-slate-400 hover:text-white"><X size={16} /></button>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{anomaly.description}</p>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase mb-1">Possible Causes</p>
                            <ul className="text-xs text-slate-400 space-y-1">
                                {anomaly.possibleCauses.map((c, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                        <span className="text-amber-400">•</span> {c}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase mb-1 flex items-center gap-1">
                                <Lightbulb size={12} className="text-emerald-400" /> Suggested Fixes
                            </p>
                            <ul className="text-xs text-slate-400 space-y-1">
                                {anomaly.suggestedFixes.map((f, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                        <span className="text-emerald-400">•</span> {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
