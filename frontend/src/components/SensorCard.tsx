import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SensorCardProps {
    title: string;
    value: string | number;
    unit?: string;
    icon: React.ReactNode;
    status?: "ok" | "warning" | "error";
    className?: string;
    trend?: "up" | "down" | "stable";
}

// Utility for class merging
function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export const SensorCard: React.FC<SensorCardProps> = ({
    title,
    value,
    unit,
    icon,
    status = "ok",
    className,
    trend
}) => {
    return (
        <div className={cn(
            "relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg transition-all hover:bg-white/10 hover:shadow-xl hover:shadow-cyan-500/10 group",
            className
        )}>
            {/* Background Gradient Blob */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl group-hover:bg-cyan-400/30 transition-all duration-500" />

            <div className="relative z-10 flex items-start justify-between">
                <div className="rounded-lg bg-white/5 p-3 text-cyan-400 ring-1 ring-white/10">
                    {icon}
                </div>

                {status === 'ok' && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/40">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active
                    </span>
                )}
            </div>

            <div className="relative z-10 mt-4">
                <h3 className="text-sm font-medium text-slate-400">{title}</h3>
                <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
                    {unit && <span className="text-sm font-semibold text-slate-500">{unit}</span>}
                </div>
            </div>

            {/* Trend or footer info could go here */}
        </div>
    );
};
