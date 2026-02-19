"use client";

import React from "react";

interface BadgeProps {
    children: React.ReactNode;
    variant?: "success" | "warning" | "error" | "info" | "default";
    size?: "sm" | "md";
    pulse?: boolean;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = "default",
    size = "sm",
    pulse = false,
    className = "",
}) => {
    const variants: Record<string, string> = {
        success: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25",
        warning: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25",
        error: "bg-red-500/15 text-red-400 ring-1 ring-red-500/25",
        info: "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/25",
        default: "bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/25",
    };

    const sizes: Record<string, string> = {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-xs",
    };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
            {pulse && (
                <span className="relative flex h-1.5 w-1.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${variant === "success" ? "bg-emerald-400" :
                            variant === "warning" ? "bg-amber-400" :
                                variant === "error" ? "bg-red-400" :
                                    variant === "info" ? "bg-cyan-400" : "bg-slate-400"
                        }`}></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${variant === "success" ? "bg-emerald-500" :
                            variant === "warning" ? "bg-amber-500" :
                                variant === "error" ? "bg-red-500" :
                                    variant === "info" ? "bg-cyan-500" : "bg-slate-500"
                        }`}></span>
                </span>
            )}
            {children}
        </span>
    );
};
