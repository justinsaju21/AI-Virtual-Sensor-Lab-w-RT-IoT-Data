"use client";

import React from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    AreaChart,
    Area
} from "recharts";

interface LiveChartProps {
    data: { time: string; value: number; processingValue?: number }[]; // Added processingValue
    color?: string;
    gradientId?: string;
    unit?: string;
    height?: number;
    minDomain?: number;
    maxDomain?: number;
}

export const LiveChart: React.FC<LiveChartProps> = ({
    data,
    color = "#00f2fe",
    gradientId = "chartGradient",
    unit = "",
    height = 300,
    minDomain = 0, // Default usually 0-100 or sensor specific
    maxDomain = 100 // Default usually 0-100 or sensor specific
}) => {
    // Determine Y-axis domain dynamically if not strictly set? 
    // For "Testing" features like stuck-at-0 or stuck-at-1023, 
    // we need the chart to handle the full range or auto-scale.
    // Let's stick to provided domains but allow auto if extremes are hit?
    // Actually, fixed domains are better for stable visualization unless specified.

    return (
        <div style={{ width: "100%", height, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis
                        dataKey="time"
                        stroke="rgba(255,255,255,0.3)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="rgba(255,255,255,0.3)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[minDomain, maxDomain]}
                        width={35}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(15, 23, 42, 0.9)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                        }}
                        itemStyle={{ color: "#fff" }}
                        labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                        formatter={(value: number, name: string) => [
                            value.toFixed(1) + unit,
                            name === "value" ? "Raw" : "Processed"
                        ]}
                    />

                    {/* Raw Data (Primary) */}
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#${gradientId})`}
                        isAnimationActive={false} // Performance
                    />

                    {/* Processed Data (Secondary Overlay) - Only if present */}
                    {data.length > 0 && data[0].processingValue !== undefined && (
                        <Line
                            type="monotone"
                            dataKey="processingValue"
                            stroke="#ffffff" // White for processed
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            isAnimationActive={false}
                        />
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
