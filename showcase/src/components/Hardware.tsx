"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cpu, Zap, Radio, Cable } from "lucide-react";

const specs = [
    { icon: Cpu, label: "ATmega2560", desc: "54 Digital + 16 Analog Pins", color: "text-blue-400" },
    { icon: Radio, label: "ESP8266", desc: "802.11 WiFi Bridge", color: "text-cyan-400" },
    { icon: Cable, label: "UART Serial", desc: "115200 Baud JSON Stream", color: "text-emerald-400" },
    { icon: Zap, label: "17 Sensors", desc: "Concurrent Acquisition", color: "text-amber-400" },
];

const sensors = [
    "Temperature", "Humidity", "Pressure", "Gas (MQ-2)", "Alcohol (MQ-3)",
    "Light (LDR)", "Ultrasonic", "PIR Motion", "Sound", "Flame",
    "IR Obstacle", "Hall Effect", "Proximity", "Touch", "Tilt",
    "Heartbeat", "Joystick",
];

export default function Hardware() {
    return (
        <section className="max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-16"
            >
                <p className="text-sm font-mono text-cyan-400 mb-3 tracking-widest uppercase">The Physical Core</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white">
                    Data Acquisition <span className="gradient-text">Engine</span>
                </h2>
                <p className="text-slate-500 mt-4 max-w-xl mx-auto">A dual-MCU architecture engineered for high-density concurrent sensor acquisition</p>
            </motion.div>

            {/* Spec cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {specs.map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="glass p-5 text-center hover:bg-white/[0.06] transition-all"
                    >
                        <s.icon className={`w-8 h-8 ${s.color} mx-auto mb-3`} />
                        <h3 className="text-sm font-bold text-white mb-1">{s.label}</h3>
                        <p className="text-xs text-slate-500 font-mono">{s.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Why Mega */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="glass-strong p-6 md:p-8 mb-12"
            >
                <h3 className="text-lg font-bold text-white mb-3">Why Arduino Mega 2560?</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    The Arduino Uno only has 6 analog pins and 14 digital pins — insufficient for 17 concurrent sensors.
                    The Mega provides <span className="text-white font-semibold">16 analog</span> and <span className="text-white font-semibold">54 digital</span> pins,
                    plus <span className="text-white font-semibold">4 hardware UARTs</span> — one dedicated to the ESP8266 bridge without blocking the main loop.
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">
                    The dual-MCU approach decouples the <span className="text-cyan-400">sensor sampling loop</span> from the <span className="text-purple-400">network stack</span>,
                    ensuring zero latency in data acquisition regardless of WiFi conditions.
                </p>
            </motion.div>

            {/* Sensor grid */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
            >
                <h3 className="text-center text-sm font-semibold text-slate-500 mb-6 tracking-widest uppercase">Full Sensor Suite</h3>
                <div className="flex flex-wrap justify-center gap-2">
                    {sensors.map((s, i) => (
                        <motion.span
                            key={s}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.03 }}
                            className="px-3 py-1.5 text-xs font-mono rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-default"
                        >
                            {s}
                        </motion.span>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}
