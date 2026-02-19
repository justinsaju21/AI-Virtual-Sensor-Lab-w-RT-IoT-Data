"use client";

import React, { useState } from "react";
import { Sparkles, X, Loader2, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";

interface GraphExplainerModalProps {
    sensorName: string;
    data: { time: string; value: number }[];
    onClose: () => void;
}

export const GraphExplainerModal: React.FC<GraphExplainerModalProps> = ({ sensorName, data, onClose }) => {
    const [explanation, setExplanation] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        explainGraph();
    }, []);

    const explainGraph = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/api/ai-explain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sensorName, data: data.slice(-20) }),
            });

            if (!response.ok) throw new Error("Failed");
            const result = await response.json();
            setExplanation(result.explanation);
        } catch {
            // Fallback: local analysis
            const values = data.map(d => d.value);
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            const min = Math.min(...values);
            const max = Math.max(...values);
            const trend = values[values.length - 1] - values[0];

            let analysis = `**${sensorName} Pattern Analysis**\n\n`;
            analysis += `**Statistics:**\n`;
            analysis += `• Average: ${avg.toFixed(1)}\n`;
            analysis += `• Range: ${min.toFixed(1)} - ${max.toFixed(1)}\n`;
            analysis += `• Trend: ${trend > 5 ? "Rising ↑" : trend < -5 ? "Falling ↓" : "Stable →"}\n\n`;

            if (max - min > avg * 0.3) {
                analysis += `**Observation:** High variability detected. This could indicate:\n`;
                analysis += `• Environmental changes (door opening, AC cycling)\n`;
                analysis += `• Sensor noise or loose connections\n`;
                analysis += `• Normal operational fluctuations\n`;
            } else {
                analysis += `**Observation:** Readings are relatively stable, which suggests:\n`;
                analysis += `• Consistent environmental conditions\n`;
                analysis += `• Good sensor connection and calibration\n`;
            }

            setExplanation(analysis);
        } finally {
            setLoading(false);
        }
    };

    const values = data.map(d => d.value);
    const trend = values.length > 1 ? values[values.length - 1] - values[0] : 0;
    const TrendIcon = trend > 5 ? TrendingUp : trend < -5 ? TrendingDown : Minus;
    const trendColor = trend > 5 ? "text-emerald-400" : trend < -5 ? "text-red-400" : "text-slate-400";

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-cyan-400" />
                        <span className="font-semibold text-white">AI Graph Analysis</span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>

                {loading ? (
                    <div className="py-8 text-center">
                        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mx-auto mb-4" />
                        <p className="text-slate-400">Analyzing pattern...</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-white/5">
                            <TrendIcon className={`h-8 w-8 ${trendColor}`} />
                            <div>
                                <p className="text-sm text-slate-400">Overall Trend</p>
                                <p className={`font-semibold ${trendColor}`}>
                                    {trend > 5 ? "Increasing" : trend < -5 ? "Decreasing" : "Stable"}
                                </p>
                            </div>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap text-sm text-slate-300 bg-transparent p-0 font-sans">
                                {explanation}
                            </pre>
                        </div>
                    </>
                )}

                <button onClick={onClose} className="w-full mt-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition">
                    Close
                </button>
            </div>
        </div>
    );
};
