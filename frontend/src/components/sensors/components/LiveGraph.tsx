"use client";

import React from "react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface DataPoint {
    time: string;
    value?: number;
    value1?: number;
    value2?: number;
    [key: string]: any;
}

interface LiveGraphProps {
    data: DataPoint[];
    lineName?: string;
    line1Name?: string;
    line2Name?: string;
    height?: number;
    title?: string;
    unit?: string;
    color?: string;
    dataKey?: string;
    type?: string;
}

export const LiveGraph: React.FC<LiveGraphProps> = ({
    data,
    lineName = "Value",
    line1Name,
    line2Name,
    height = 300,
    title,
}) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-slate-500 bg-slate-900 rounded-lg border border-slate-700">
                Waiting for data...
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                <XAxis
                    dataKey="time"
                    stroke="rgba(148,163,184,0.5)"
                    tick={{ fontSize: 12 }}
                    interval={Math.max(0, Math.floor(data.length / 6))}
                />
                <YAxis stroke="rgba(148,163,184,0.5)" tick={{ fontSize: 12 }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "rgba(15,23,42,0.95)",
                        border: "1px solid rgba(100,116,139,0.3)",
                        borderRadius: "8px",
                        padding: "8px",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                    formatter={(value: any) => (typeof value === "number" ? value.toFixed(2) : value)}
                />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                
                {line1Name && <Line type="monotone" dataKey="value1" stroke="#ef4444" name={line1Name} dot={false} strokeWidth={2} isAnimationActive={false} />}
                {line2Name && <Line type="monotone" dataKey="value2" stroke="#3b82f6" name={line2Name} dot={false} strokeWidth={2} isAnimationActive={false} />}
                {!line1Name && !line2Name && <Line type="monotone" dataKey="value" stroke="#06b6d4" name={lineName} dot={false} strokeWidth={2} isAnimationActive={false} />}
            </LineChart>
        </ResponsiveContainer>
    );
};
