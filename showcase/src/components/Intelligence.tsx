"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Filter, Brain, GitBranch } from "lucide-react";

const features = [
    {
        icon: AlertTriangle,
        title: "Fault Injection Engine",
        desc: "Simulate hardware failures: Stuck-at-GND, Stuck-at-VCC, Open Circuit, Noise Burst, Calibration Drift. Teaches students how real systems break.",
        color: "text-red-400",
        border: "border-red-500/10",
        bg: "bg-red-500/5",
    },
    {
        icon: Filter,
        title: "DSP Filtering",
        desc: "Real-time Moving Average smoother and Dynamic Thresholding debouncer. Students visually observe the Raw vs. Processed signal on the same chart.",
        color: "text-blue-400",
        border: "border-blue-500/10",
        bg: "bg-blue-500/5",
    },
    {
        icon: Brain,
        title: "AI Mistake Detection",
        desc: "Rule-based inference engine monitors DataStream for common engineering errors: floating pins, phantom triggers, and inconsistent sensor correlations.",
        color: "text-purple-400",
        border: "border-purple-500/10",
        bg: "bg-purple-500/5",
    },
    {
        icon: GitBranch,
        title: "Cross-Sensor Correlation",
        desc: "If Gas Sensor reading spikes but Flame Sensor stays zero, the AI flags a calibration anomaly. Teaches multi-variable diagnostic thinking.",
        color: "text-amber-400",
        border: "border-amber-500/10",
        bg: "bg-amber-500/5",
    },
];

export default function Intelligence() {
    return (
        <section className="max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-16"
            >
                <p className="text-sm font-mono text-cyan-400 mb-3 tracking-widest uppercase">Intelligence Layer</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white">
                    Real-Time <span className="gradient-text">Analysis</span>
                </h2>
                <p className="text-slate-500 mt-4 max-w-xl mx-auto">Not just monitoring — active diagnostic intelligence that teaches engineering reasoning</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
                {features.map((f, i) => (
                    <motion.div
                        key={f.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={`glass p-6 md:p-8 hover:bg-white/[0.06] transition-all duration-300 group`}
                    >
                        <div className={`w-12 h-12 rounded-xl ${f.bg} ${f.border} border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                            <f.icon className={`w-6 h-6 ${f.color}`} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
