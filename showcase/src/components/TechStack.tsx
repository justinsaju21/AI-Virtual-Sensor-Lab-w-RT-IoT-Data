"use client";

import React from "react";
import { motion } from "framer-motion";

const categories = [
    {
        title: "Hardware",
        items: ["Arduino Mega 2560", "ESP8266 (WiFi)", "DHT11/22", "BMP180 (I2C)", "MQ-2 / MQ-3", "HC-SR04"],
        color: "border-blue-500/20",
        glow: "text-blue-400",
    },
    {
        title: "Backend",
        items: ["Node.js", "Express.js", "Socket.io", "CORS", "ArduinoJson", "Mock Engine"],
        color: "border-emerald-500/20",
        glow: "text-emerald-400",
    },
    {
        title: "Frontend",
        items: ["Next.js 14", "TypeScript", "Tailwind CSS", "Recharts", "Lucide Icons", "App Router"],
        color: "border-purple-500/20",
        glow: "text-purple-400",
    },
    {
        title: "Deployment",
        items: ["Vercel (Frontend)", "Render (Backend)", "GitHub CI/CD", "HTTPS/TLS", "Environment Vars", "Auto-Deploy"],
        color: "border-cyan-500/20",
        glow: "text-cyan-400",
    },
];

export default function TechStack() {
    return (
        <section className="max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-16"
            >
                <p className="text-sm font-mono text-cyan-400 mb-3 tracking-widest uppercase">Under The Hood</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white">
                    Tech <span className="gradient-text">Stack</span>
                </h2>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-4">
                {categories.map((cat, i) => (
                    <motion.div
                        key={cat.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={`glass p-5 border ${cat.color}`}
                    >
                        <h3 className={`text-sm font-bold ${cat.glow} mb-4 tracking-widest uppercase`}>{cat.title}</h3>
                        <div className="space-y-2">
                            {cat.items.map(item => (
                                <div key={item} className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                                    <div className={`w-1.5 h-1.5 rounded-full ${cat.glow.replace("text-", "bg-")} opacity-60`} />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
