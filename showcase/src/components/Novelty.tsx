"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, Eye, Brain, Layers } from "lucide-react";

const novelties = [
    { icon: Layers, title: "Hybrid Digital Twin", desc: "Seamless switching between physical hardware and mathematical simulation on a single platform.", color: "text-cyan-400" },
    { icon: Eye, title: "Observation-Centric Learning", desc: "Students don't just read values — they observe behavior, inject faults, and understand physics.", color: "text-purple-400" },
    { icon: Brain, title: "AI Diagnostics", desc: "Rule-based inference engine for real-time engineering mistake detection and guided troubleshooting.", color: "text-emerald-400" },
    { icon: Lightbulb, title: "Scalable Architecture", desc: "Cloud-native design supports 1000+ concurrent users without hardware bottlenecks.", color: "text-amber-400" },
];

export default function Novelty() {
    return (
        <section className="max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-16"
            >
                <p className="text-sm font-mono text-purple-400 mb-3 tracking-widest uppercase">Research Contribution</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white">
                    What Makes This <span className="gradient-text">Novel</span>
                </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {novelties.map((n, i) => (
                    <motion.div
                        key={n.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="glass p-5 text-center hover:bg-white/[0.06] transition-all group"
                    >
                        <n.icon className={`w-8 h-8 ${n.color} mx-auto mb-4 group-hover:scale-110 transition-transform`} />
                        <h3 className="text-sm font-bold text-white mb-2">{n.title}</h3>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{n.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
