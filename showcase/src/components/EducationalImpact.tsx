"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Globe, Briefcase } from "lucide-react";

const pillars = [
    {
        icon: Shield,
        title: "Safe Experimentation",
        desc: "Students inject faults, corrupt signals, and push systems to failure — without destroying real equipment. Repeat any experiment infinitely.",
        color: "text-emerald-400",
    },
    {
        icon: Globe,
        title: "Remote Accessibility",
        desc: "Access the full lab from any browser, anywhere. No scheduling conflicts, no hardware checkout. 24/7 availability for asynchronous learning.",
        color: "text-blue-400",
    },
    {
        icon: Briefcase,
        title: "Industry-Relevant Skills",
        desc: "Students gain hands-on experience with IoT protocols, DSP, fault tolerance, and AI diagnostics — skills directly transferable to industry roles.",
        color: "text-purple-400",
    },
];

export default function EducationalImpact() {
    return (
        <section className="max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-16"
            >
                <p className="text-sm font-mono text-emerald-400 mb-3 tracking-widest uppercase">Why It Matters</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white">
                    Educational <span className="gradient-text-emerald">Impact</span>
                </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
                {pillars.map((p, i) => (
                    <motion.div
                        key={p.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.15 }}
                        className="glass p-6 md:p-8 text-center hover:bg-white/[0.06] transition-all group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                            <p.icon className={`w-7 h-7 ${p.color}`} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-3">{p.title}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
