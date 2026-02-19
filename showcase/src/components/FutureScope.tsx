"use client";

import React from "react";
import { motion } from "framer-motion";
import { Rocket, Users, Cloud, BookOpen } from "lucide-react";

const milestones = [
    { icon: BookOpen, title: "LMS Integration", desc: "Integration with university learning platforms for graded experiments and progress tracking." },
    { icon: Users, title: "Multi-User Lab Sessions", desc: "Collaborative real-time sessions where multiple students share the same sensor stream." },
    { icon: Cloud, title: "Cloud Hardware Clusters", desc: "Remote-controlled hardware racks where students can access physical boards over the internet." },
    { icon: Rocket, title: "Mobile Application", desc: "Native iOS/Android app for on-the-go sensor monitoring and experiment management." },
];

export default function FutureScope() {
    return (
        <section className="max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-16"
            >
                <p className="text-sm font-mono text-cyan-400 mb-3 tracking-widest uppercase">What&apos;s Next</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white">
                    Future <span className="gradient-text">Roadmap</span>
                </h2>
            </motion.div>

            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/30 via-purple-500/30 to-transparent hidden md:block" />

                <div className="space-y-6">
                    {milestones.map((m, i) => (
                        <motion.div
                            key={m.title}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15 }}
                            className="flex items-start gap-6 md:ml-12"
                        >
                            {/* Dot */}
                            <div className="hidden md:flex absolute left-4 w-5 h-5 rounded-full bg-white/5 border border-white/10 items-center justify-center" style={{ marginTop: `${i * 96 + 24}px` }}>
                                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                            </div>

                            <div className="glass p-5 flex-1 hover:bg-white/[0.06] transition-all flex items-start gap-4">
                                <m.icon className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-bold text-white mb-1">{m.title}</h3>
                                    <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
