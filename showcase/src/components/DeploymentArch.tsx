"use client";

import React from "react";
import { motion } from "framer-motion";
import { Server, Globe, Zap } from "lucide-react";

export default function DeploymentArch() {
    return (
        <section className="max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-16"
            >
                <p className="text-sm font-mono text-cyan-400 mb-3 tracking-widest uppercase">Cloud Strategy</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white">
                    Deployment <span className="gradient-text">Architecture</span>
                </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="glass p-6 md:p-8"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Globe className="w-6 h-6 text-white" />
                        <h3 className="text-lg font-bold text-white">Frontend — Vercel</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-400">
                        <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" /> Global CDN with edge-optimized static assets</li>
                        <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" /> Automatic HTTPS certificate management</li>
                        <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" /> Git-push auto-deploy from GitHub</li>
                        <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" /> Preview deployments for every branch</li>
                    </ul>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: 0.15 }}
                    className="glass p-6 md:p-8"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Server className="w-6 h-6 text-emerald-400" />
                        <h3 className="text-lg font-bold text-white">Backend — Render</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-400">
                        <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> Persistent Web Service (not serverless)</li>
                        <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> WebSocket connections maintained 24/7</li>
                        <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> Background process for mock data generation</li>
                        <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> Environment-variable-driven configuration</li>
                    </ul>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="glass-strong p-5 text-center"
            >
                <p className="text-sm text-slate-400 font-mono">
                    <span className="text-white font-semibold">&quot;IoT requires persistent WebSockets — not serverless.&quot;</span>
                    <br />
                    <span className="text-slate-600">That&apos;s why we split: Vercel for speed, Render for persistence.</span>
                </p>
            </motion.div>
        </section>
    );
}
