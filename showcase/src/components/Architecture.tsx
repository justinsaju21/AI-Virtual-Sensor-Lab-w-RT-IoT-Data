"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Wifi, Cloud, Monitor, ArrowRight } from "lucide-react";

const layers = [
    {
        icon: Cpu,
        label: "Edge Layer",
        tech: "Arduino Mega 2560",
        protocol: "Analog / Digital GPIO",
        desc: "The Data Acquisition Core. Reads 17 sensors simultaneously using 16 analog and 54 digital pins. Serializes all readings into a compact JSON object using ArduinoJson.",
        color: "text-blue-400",
        bg: "from-blue-500/10 to-blue-500/0",
        glow: "shadow-blue-500/10",
    },
    {
        icon: Wifi,
        label: "Gateway Layer",
        tech: "ESP8266 WiFi Module",
        protocol: "UART Serial → HTTP POST",
        desc: "The Network Bridge. Receives JSON via 115200 baud Serial, connects to WiFi, and fires HTTP POST requests to the cloud backend. Decouples networking from sensor logic.",
        color: "text-cyan-400",
        bg: "from-cyan-500/10 to-cyan-500/0",
        glow: "shadow-cyan-500/10",
    },
    {
        icon: Cloud,
        label: "Cloud Layer",
        tech: "Node.js + Socket.io (Render)",
        protocol: "WebSocket Broadcast",
        desc: "The Real-Time Hub. Receives hardware data via REST or generates Digital Twin simulation data. Broadcasts to all connected clients at 5Hz via persistent WebSocket connections.",
        color: "text-emerald-400",
        bg: "from-emerald-500/10 to-emerald-500/0",
        glow: "shadow-emerald-500/10",
    },
    {
        icon: Monitor,
        label: "Client Layer",
        tech: "Next.js + Recharts (Vercel)",
        protocol: "Socket.io Client",
        desc: "The Intelligence Dashboard. Renders real-time oscilloscopic charts, applies DSP filters, runs AI diagnostics, and provides an interactive learning environment for students.",
        color: "text-purple-400",
        bg: "from-purple-500/10 to-purple-500/0",
        glow: "shadow-purple-500/10",
    },
];

export default function Architecture() {
    const [active, setActive] = useState<number | null>(null);

    return (
        <section id="architecture" className="max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-16"
            >
                <p className="text-sm font-mono text-cyan-400 mb-3 tracking-widest uppercase">How It Works</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white">
                    Four-Layer <span className="gradient-text">Architecture</span>
                </h2>
                <p className="text-slate-500 mt-4 max-w-xl mx-auto">Click on any layer to explore its role in the data pipeline</p>
            </motion.div>

            {/* Layer cards */}
            <div className="grid md:grid-cols-4 gap-4">
                {layers.map((layer, i) => (
                    <motion.div
                        key={layer.label}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => setActive(active === i ? null : i)}
                        className={`glass p-5 cursor-pointer transition-all duration-300 hover:bg-white/[0.06] ${active === i ? "ring-1 ring-white/20 bg-white/[0.06]" : ""}`}
                    >
                        <layer.icon className={`w-8 h-8 ${layer.color} mb-4`} />
                        <h3 className="text-sm font-bold text-white mb-1">{layer.label}</h3>
                        <p className="text-xs font-mono text-slate-500 mb-3">{layer.tech}</p>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-600">
                            <ArrowRight className="w-3 h-3" />
                            {layer.protocol}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Connection bar */}
            <div className="flex items-center justify-between px-4 md:px-8 my-4">
                {[0, 1, 2].map(i => (
                    <div key={i} className="flex-1 h-[2px] bg-gradient-to-r from-cyan-500/30 to-purple-500/30 mx-4 rounded-full" />
                ))}
            </div>

            {/* Detail panel */}
            <AnimatePresence>
                {active !== null && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-strong p-6 md:p-8 mt-4">
                            <div className="flex items-center gap-3 mb-4">
                                {React.createElement(layers[active].icon, { className: `w-6 h-6 ${layers[active].color}` })}
                                <h3 className="text-lg font-bold text-white">{layers[active].label}</h3>
                                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400">{layers[active].tech}</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed">{layers[active].desc}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
