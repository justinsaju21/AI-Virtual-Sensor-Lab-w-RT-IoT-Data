"use client";

import React from "react";
import { motion } from "framer-motion";
import { MonitorSmartphone } from "lucide-react";

export default function DashboardPreview() {
    return (
        <section className="max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-16"
            >
                <p className="text-sm font-mono text-emerald-400 mb-3 tracking-widest uppercase">Live Preview</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white">
                    The <span className="gradient-text-emerald">Dashboard</span>
                </h2>
                <p className="text-slate-500 mt-4 max-w-xl mx-auto">A production-grade monitoring interface built for engineering precision</p>
            </motion.div>

            {/* Dashboard mockup */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className="relative"
            >
                <div className="glass-strong p-4 md:p-6 glow-cyan">
                    {/* Browser chrome */}
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400/60" />
                            <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                            <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
                        </div>
                        <div className="flex-1 text-center text-xs font-mono text-slate-600">
                            ai-virtual-sensor-lab-w-rt-iot-data.vercel.app
                        </div>
                    </div>

                    {/* Dashboard mock */}
                    <div className="grid grid-cols-12 gap-3 min-h-[400px]">
                        {/* Sidebar */}
                        <div className="col-span-2 bg-white/[0.02] rounded-lg p-3 space-y-3">
                            <div className="flex items-center gap-2 mb-4">
                                <MonitorSmartphone className="w-4 h-4 text-cyan-400" />
                                <span className="text-[10px] font-bold text-white">VirtLab</span>
                            </div>
                            {["Dashboard", "Temperature", "Humidity", "Gas", "Ultrasonic", "Motion", "Sound", "Flame", "Settings"].map((item, i) => (
                                <div key={item} className={`text-[9px] font-mono px-2 py-1.5 rounded ${i === 0 ? "bg-cyan-500/10 text-cyan-400" : "text-slate-600 hover:text-slate-400"}`}>
                                    {item}
                                </div>
                            ))}
                        </div>

                        {/* Main content */}
                        <div className="col-span-10 space-y-3">
                            {/* Header */}
                            <div className="flex justify-between items-center bg-white/[0.02] rounded-lg px-4 py-2">
                                <div>
                                    <p className="text-xs font-semibold text-white">Live Monitoring</p>
                                    <p className="text-[9px] text-slate-600">Real-time sensor data stream</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="pulse-dot" style={{ width: 6, height: 6 }} />
                                    <span className="text-[9px] text-emerald-400">Connected</span>
                                </div>
                            </div>

                            {/* Cards grid */}
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { name: "Temperature", value: "24.5°C", color: "border-orange-500/20" },
                                    { name: "Humidity", value: "62.3%", color: "border-blue-500/20" },
                                    { name: "Gas (MQ-2)", value: "152 ppm", color: "border-red-500/20" },
                                    { name: "Ultrasonic", value: "47.2 cm", color: "border-cyan-500/20" },
                                ].map(card => (
                                    <div key={card.name} className={`bg-white/[0.02] border ${card.color} rounded-lg p-3`}>
                                        <p className="text-[9px] text-slate-500">{card.name}</p>
                                        <p className="text-sm font-bold text-white mt-1">{card.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Chart area */}
                            <div className="bg-white/[0.02] rounded-lg p-4 flex-1">
                                <p className="text-[10px] font-mono text-slate-500 mb-2">Real-Time Waveform — Raw vs Processed</p>
                                <svg viewBox="0 0 600 120" className="w-full h-32" preserveAspectRatio="none">
                                    {/* Raw (noisy) */}
                                    <path d="M 0 60 L 15 55 L 30 65 L 45 50 L 60 70 L 75 45 L 90 68 L 105 42 L 120 62 L 135 48 L 150 58 L 165 40 L 180 65 L 195 38 L 210 55 L 225 70 L 240 35 L 255 60 L 270 45 L 285 65 L 300 42 L 315 55 L 330 68 L 345 40 L 360 58 L 375 48 L 390 62 L 405 38 L 420 55 L 435 65 L 450 42 L 465 60 L 480 48 L 495 58 L 510 42 L 525 65 L 540 50 L 555 55 L 570 45 L 585 60 L 600 50" stroke="#00f2fe" strokeWidth="1.5" fill="none" opacity="0.4" />
                                    {/* Processed (smooth) */}
                                    <path d="M 0 58 Q 75 50 150 52 Q 225 48 300 50 Q 375 52 450 48 Q 525 50 600 52" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.9" />
                                </svg>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-0.5 bg-cyan-400/40 rounded" />
                                        <span className="text-[9px] text-slate-600">Raw</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-0.5 bg-white rounded" />
                                        <span className="text-[9px] text-slate-600">Processed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
