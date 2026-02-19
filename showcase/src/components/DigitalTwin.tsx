"use client";

import React from "react";
import { motion } from "framer-motion";
import { Waves, CloudOff, Infinity, Sparkles } from "lucide-react";

export default function DigitalTwin() {
    return (
        <section className="max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-16"
            >
                <p className="text-sm font-mono text-purple-400 mb-3 tracking-widest uppercase">Simulation Engine</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white">
                    The <span className="gradient-text">Digital Twin</span>
                </h2>
                <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
                    Works even when hardware is offline. Physics-based mathematical models replicate real sensor behavior with configurable noise profiles.
                </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Left: explanation */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="space-y-6"
                >
                    {[
                        {
                            icon: Waves,
                            title: "Physics-Based Simulation",
                            desc: "Temperature follows sinusoidal day/night cycles. Gas sensors exhibit logarithmic drift. Heartbeat uses a realistic PPG waveform with dicrotic notch.",
                            color: "text-blue-400",
                        },
                        {
                            icon: Sparkles,
                            title: "Gaussian Noise Injection",
                            desc: "Every signal includes configurable noise profiles that mimic real-world electromagnetic interference, quantization error, and thermal drift.",
                            color: "text-purple-400",
                        },
                        {
                            icon: CloudOff,
                            title: "Zero Hardware Required",
                            desc: "Students can perform full experiments — fault injection, DSP filtering, AI diagnostics — entirely from their browser without physical equipment.",
                            color: "text-cyan-400",
                        },
                        {
                            icon: Infinity,
                            title: "Infinite Scalability",
                            desc: "Unlike a physical lab limited by hardware kits, the virtual mode supports unlimited concurrent users across the globe.",
                            color: "text-emerald-400",
                        },
                    ].map((item, i) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-4 glass p-4 hover:bg-white/[0.06] transition-all"
                        >
                            <item.icon className={`w-6 h-6 ${item.color} shrink-0 mt-0.5`} />
                            <div>
                                <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Right: visual mockup of waveforms */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: 0.2 }}
                    className="glass-strong p-6 glow-purple flex flex-col justify-center"
                >
                    <div className="space-y-6">
                        {/* Simulated waveform visualization */}
                        <div>
                            <p className="text-xs font-mono text-purple-400 mb-2">Temperature — Sinusoidal Model</p>
                            <div className="h-16 bg-white/[0.02] rounded-lg overflow-hidden relative">
                                <svg viewBox="0 0 400 60" className="w-full h-full" preserveAspectRatio="none">
                                    <path d="M 0 30 Q 25 10 50 30 Q 75 50 100 30 Q 125 10 150 30 Q 175 50 200 30 Q 225 10 250 30 Q 275 50 300 30 Q 325 10 350 30 Q 375 50 400 30" stroke="#a855f7" strokeWidth="2" fill="none" opacity="0.8" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-mono text-cyan-400 mb-2">Gas Sensor — Noise + Drift</p>
                            <div className="h-16 bg-white/[0.02] rounded-lg overflow-hidden">
                                <svg viewBox="0 0 400 60" className="w-full h-full" preserveAspectRatio="none">
                                    <path d="M 0 45 L 20 40 L 40 42 L 60 38 L 80 35 L 100 37 L 120 30 L 140 33 L 160 28 L 180 25 L 200 27 L 220 22 L 240 20 L 260 23 L 280 18 L 300 15 L 320 17 L 340 12 L 360 14 L 380 10 L 400 8" stroke="#00f2fe" strokeWidth="2" fill="none" opacity="0.8" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-mono text-emerald-400 mb-2">Heartbeat — PPG Waveform</p>
                            <div className="h-16 bg-white/[0.02] rounded-lg overflow-hidden">
                                <svg viewBox="0 0 400 60" className="w-full h-full" preserveAspectRatio="none">
                                    <path d="M 0 40 L 20 40 L 30 38 L 40 10 L 50 45 L 60 35 L 70 40 L 100 40 L 110 38 L 120 10 L 130 45 L 140 35 L 150 40 L 180 40 L 190 38 L 200 10 L 210 45 L 220 35 L 230 40 L 260 40 L 270 38 L 280 10 L 290 45 L 300 35 L 310 40 L 340 40 L 350 38 L 360 10 L 370 45 L 380 35 L 400 40" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.8" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-center text-slate-600 mt-4 font-mono">mockDataGenerator.js — Real-time output</p>
                </motion.div>
            </div>
        </section>
    );
}
