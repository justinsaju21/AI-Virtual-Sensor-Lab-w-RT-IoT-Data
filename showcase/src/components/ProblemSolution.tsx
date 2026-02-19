"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const problems = [
    "Limited access to physical hardware",
    "Risk of damaging real components",
    "No real-time sensor behavior visibility",
    "Zero debugging experience",
    "Not scalable to large batches",
];

const solutions = [
    "17-sensor digital twin system",
    "Safe virtual experimentation",
    "Real-time oscilloscopic charts",
    "Fault Injection & AI diagnostics",
    "Scalable to 1000+ students",
];

export default function ProblemSolution() {
    return (
        <section className="max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-16"
            >
                <p className="text-sm font-mono text-cyan-400 mb-3 tracking-widest uppercase">The Challenge</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white">
                    Traditional Labs Are{" "}
                    <span className="text-red-400">Broken</span>
                </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {/* Problems */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="glass p-6 md:p-8"
                >
                    <h3 className="text-lg font-semibold text-red-400 mb-6 flex items-center gap-2">
                        <X className="w-5 h-5" /> The Problem
                    </h3>
                    <div className="space-y-4">
                        {problems.map((p, i) => (
                            <motion.div
                                key={p}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10"
                            >
                                <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                <span className="text-sm text-slate-300">{p}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Solutions */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="glass p-6 md:p-8 glow-emerald"
                >
                    <h3 className="text-lg font-semibold text-emerald-400 mb-6 flex items-center gap-2">
                        <Check className="w-5 h-5" /> Our Solution
                    </h3>
                    <div className="space-y-4">
                        {solutions.map((s, i) => (
                            <motion.div
                                key={s}
                                initial={{ opacity: 0, x: 10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
                            >
                                <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                <span className="text-sm text-slate-300">{s}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
