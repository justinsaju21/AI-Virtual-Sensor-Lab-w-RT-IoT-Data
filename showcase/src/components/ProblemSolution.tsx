"use client";
import React from "react";
import { motion } from "framer-motion";
import { XCircle, CheckCircle2 } from "lucide-react";
import { tokens, cardStyle } from "./Styles";
import SectionHeading from "./SectionHeading";

export default function ProblemSolution() {
    const problems = ["Fragile & Expensive Kits", "Limited Lab Accessibility", "Zero Real-Time Visibility", "No Safe Fault Testing"];
    const solutions = ["Robust Digital Twin v2.0", "Infinite Cloud Scalability", "Oscilloscopic Live Streaming", "AI-Guided Fault Injection"];

    return (
        <section style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
            <SectionHeading
                pill="The Philosophy"
                title="Modern Problems Require"
                gradientText="Modern Solutions"
                subtitle="Moving beyond simulation. Moving beyond restrictive hardware. Bridging the gap."
            />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    style={{ ...cardStyle, padding: 40, border: `1px solid ${tokens.colors.red}22` }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                        <XCircle color={tokens.colors.red} size={24} />
                        <h3 style={{ color: tokens.colors.red, fontSize: 18, fontWeight: 700 }}>Legacy Methodology</h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {problems.map((p, i) => (
                            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", color: tokens.colors.textSecondary, fontSize: 15 }}>
                                <span style={{ color: tokens.colors.red, opacity: 0.5 }}>✕</span>
                                {p}
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    style={{ ...cardStyle, padding: 40, border: `1px solid ${tokens.colors.green}22`, background: "rgba(16, 185, 129, 0.03)" }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                        <CheckCircle2 color={tokens.colors.green} size={24} />
                        <h3 style={{ color: tokens.colors.green, fontSize: 18, fontWeight: 700 }}>The VirtSensorLab Edge</h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {solutions.map((s, i) => (
                            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", color: "#fff", fontSize: 15, fontWeight: 500 }}>
                                <span style={{ color: tokens.colors.green }}>✓</span>
                                {s}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
