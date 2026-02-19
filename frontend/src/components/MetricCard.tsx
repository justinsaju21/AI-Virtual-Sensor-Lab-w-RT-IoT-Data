"use client";

import React from "react";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";

interface MetricCardProps {
    title: string;
    value: string | number;
    unit?: string;
    icon: React.ReactNode;
    iconColor?: string;
    status?: "ok" | "warning" | "error" | "info";
    subtitle?: string;
    className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    unit,
    icon,
    iconColor = "text-cyan-400",
    status = "ok",
    subtitle,
    className = "",
}) => {
    const statusVariant = status === "ok" ? "success" : status === "warning" ? "warning" : status === "info" ? "info" : "error";
    const statusText = status === "ok" ? "Online" : status === "warning" ? "Warning" : status === "info" ? "Active" : "Error";

    return (
        <Card variant="gradient" className={`group ${className}`}>
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className={`rounded-xl bg-white/5 p-3 ring-1 ring-white/10 ${iconColor}`}>
                        {icon}
                    </div>
                    <Badge variant={statusVariant} pulse size="sm">
                        {statusText}
                    </Badge>
                </div>

                {/* Content */}
                <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</p>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
                        {unit && <span className="text-base font-medium text-slate-500">{unit}</span>}
                    </div>
                    {subtitle && (
                        <p className="mt-2 text-xs text-slate-600">{subtitle}</p>
                    )}
                </div>
            </div>
        </Card>
    );
};
