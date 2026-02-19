"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Activity, Cpu, Wifi, Brain } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ padding: "2rem 1.5rem" }}>
            {/* Radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto text-center">
                {/* Status badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
                >
                    <span className="pulse-dot" />
                    <span className="text-sm text-slate-400 font-medium">System Live — Virtual Mode Active</span>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
                >
                    <span className="text-white">AI-Enabled IoT</span>
                    <br />
                    <span className="gradient-text">Virtual Sensor Laboratory</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-4 leading-relaxed"
                >
                    Hybrid Digital Twin Virtual Lab for Scalable IoT Education
                </motion.p>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.45 }}
                    className="text-sm md:text-base text-slate-500 mb-10 font-mono"
                >
                    Real hardware. Real-time data. AI-driven diagnostics.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                >
                    <a
                        href="https://ai-virtual-sensor-lab-w-rt-iot-data.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold transition-all hover:shadow-[0_0_30px_rgba(0,242,254,0.3)] hover:scale-105"
                    >
                        View Live System
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                    <a
                        href="#architecture"
                        className="flex items-center gap-2 px-6 py-3 rounded-xl glass text-slate-300 font-semibold transition-all hover:bg-white/10 hover:scale-105"
                    >
                        Explore Architecture
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </motion.div>

                {/* Floating architecture preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="relative max-w-4xl mx-auto"
                >
                    <div className="glass-strong p-6 md:p-8 glow-cyan">
                        <div className="grid grid-cols-4 gap-3 md:gap-4">
                            {[
                                { icon: Cpu, label: "Edge", sub: "Arduino Mega", color: "text-blue-400" },
                                { icon: Wifi, label: "Gateway", sub: "ESP8266 WiFi", color: "text-cyan-400" },
                                { icon: Activity, label: "Cloud", sub: "Node.js + Socket.io", color: "text-emerald-400" },
                                { icon: Brain, label: "Client", sub: "Next.js + AI", color: "text-purple-400" },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 1 + i * 0.1 }}
                                    className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                                >
                                    <item.icon className={`w-6 h-6 md:w-8 md:h-8 ${item.color}`} />
                                    <span className="text-xs md:text-sm font-semibold text-white">{item.label}</span>
                                    <span className="text-[10px] md:text-xs text-slate-500 font-mono text-center">{item.sub}</span>
                                </motion.div>
                            ))}
                        </div>
                        {/* Connection lines */}
                        <div className="flex items-center justify-between px-8 md:px-12 mt-3">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="flex-1 h-[2px] bg-gradient-to-r from-cyan-500/40 to-purple-500/40 mx-2 rounded-full" />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
