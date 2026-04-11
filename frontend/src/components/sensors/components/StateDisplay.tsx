"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface StateDisplayProps {
    title: string;
    state: boolean | "detecting" | "error";
    activeLabel?: string;
    inactiveLabel?: string;
    activeColor?: string;
    lastChange?: Date;
    description?: string;
}

export const StateDisplay: React.FC<StateDisplayProps> = ({
    title,
    state,
    activeLabel = "ACTIVE",
    inactiveLabel = "INACTIVE",
    activeColor = "from-emerald-500 to-green-600",
    lastChange,
    description,
}) => {
    const isActive = state === true;
    const isError = state === "error";
    const isDetecting = state === "detecting";

    const colorClass = isError
        ? "from-red-500 to-rose-600"
        : isActive
          ? activeColor
          : "from-slate-500 to-slate-700";

    const Icon = isError ? AlertCircle : CheckCircle2;

    return (
        <Card variant="default">
            <CardHeader>
                <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* State Indicator */}
                    <div className="flex items-center gap-4">
                        <div className={`h-20 w-20 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                            <Icon
                                className={`h-10 w-10 ${
                                    isError ? "text-red-100" : isActive ? "text-white" : "text-slate-300"
                                }`}
                            />
                        </div>
                        <div className="flex-1">
                            <div className="text-2xl font-bold text-white">
                                {isDetecting ? "Detecting..." : isActive ? activeLabel : inactiveLabel}
                            </div>
                            {description && (
                                <p className="text-xs text-slate-400 mt-1">{description}</p>
                            )}
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-xs text-slate-500">Status</span>
                        <Badge
                            variant={isError ? "error" : isActive ? "success" : "default"}
                            size="sm"
                        >
                            {isError ? "ERROR" : isActive ? "DETECTED" : "CLEAR"}
                        </Badge>
                    </div>

                    {/* Last Change */}
                    {lastChange && (
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span className="text-xs text-slate-500">Last Change</span>
                            <span className="text-xs font-mono text-slate-300">
                                {lastChange.toLocaleTimeString()}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
