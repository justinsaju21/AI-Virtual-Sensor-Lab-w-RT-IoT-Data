"use client";

import React from "react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "gradient" | "glass";
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = "",
    variant = "default",
    hover = true
}) => {
    const baseStyles = "relative overflow-hidden rounded-2xl transition-all duration-300";

    const variants = {
        default: "bg-slate-900/50 border border-white/5",
        gradient: "bg-gradient-to-br from-slate-900/80 via-slate-800/50 to-slate-900/80 border border-white/5",
        glass: "bg-white/5 backdrop-blur-xl border border-white/10",
    };

    const hoverStyles = hover
        ? "hover:border-white/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5"
        : "";

    return (
        <div className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}>
            {children}
        </div>
    );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = "",
}) => {
    return <div className={`flex items-center justify-between p-5 pb-0 ${className}`}>{children}</div>;
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = "",
}) => {
    return <h3 className={`text-sm font-medium text-slate-300 ${className}`}>{children}</h3>;
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = "",
}) => {
    return <div className={`p-5 ${className}`}>{children}</div>;
};
