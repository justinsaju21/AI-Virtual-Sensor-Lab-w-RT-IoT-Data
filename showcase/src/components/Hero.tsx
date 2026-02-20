"use client";
import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Activity, Cpu, Wifi, Brain } from "lucide-react";
import { tokens, gradientText, cardStyle } from "./Styles";

export default function Hero() {
    const features = [
        { icon: <Activity color={tokens.colors.cyan} />, title: "Real-Time Data", desc: "5Hz Live Stream" },
        { icon: <Brain color={tokens.colors.purple} />, title: "AI Analytics", desc: "Predictive Health" },
        { icon: <Wifi color={tokens.colors.blue} />, title: "Cloud Native", desc: "Edge to Portal" },
        { icon: <Cpu color={tokens.colors.green} />, title: "17+ Sensors", desc: "Dual-MCU Protocol" },
    ];

    return (
        <section
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                padding: "140px 24px 80px",
            }}
        >
            {/* Radial glow */}
            <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: "absolute",
                    top: "15%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 900,
                    height: 900,
                    background: `radial-gradient(circle, ${tokens.colors.cyan}33 0%, ${tokens.colors.purple}11 40%, transparent 70%)`,
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />

            <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, textAlign: "center", width: "100%" }}>
                {/* Status badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        ...cardStyle,
                        padding: "8px 24px",
                        borderRadius: 999,
                        marginBottom: 36,
                    }}
                >
                    <span className="pulse-dot" style={{ background: tokens.colors.green }} />
                    <span
                        style={{
                            fontSize: 13,
                            color: tokens.colors.textSecondary,
                            fontFamily: "monospace",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            fontWeight: 600,
                        }}
                    >
                        v2.0 — AI Infused Digital Twin Active
                    </span>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    style={{
                        fontSize: "clamp(2.8rem, 6.5vw, 5.5rem)",
                        fontWeight: 900,
                        lineHeight: 1.08,
                        marginBottom: 28,
                        letterSpacing: "-0.03em",
                    }}
                >
                    <span style={{ color: "#fff" }}>AI-Enabled IoT</span>
                    <br />
                    <span style={gradientText}>Virtual Laboratory</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.6 }}
                    style={{
                        fontSize: "clamp(1.05rem, 2vw, 1.3rem)",
                        color: tokens.colors.textSecondary,
                        maxWidth: 680,
                        margin: "0 auto 44px",
                        lineHeight: 1.65,
                    }}
                >
                    A hybrid Digital Twin platform that bridges real hardware precision with
                    virtual scalability. Built for the future of engineering education.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 16,
                        justifyContent: "center",
                        marginBottom: 64,
                    }}
                >
                    <a
                        href="https://ai-virtual-sensor-lab-w-rt-iot-data.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "16px 32px",
                            background: `linear-gradient(135deg, ${tokens.colors.cyan}, ${tokens.colors.blue})`,
                            color: "#030712",
                            fontWeight: 700,
                            borderRadius: 14,
                            textDecoration: "none",
                            boxShadow: `0 16px 40px ${tokens.colors.cyan}33`,
                            transition: "transform 0.2s, box-shadow 0.2s",
                            fontSize: 15,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = `0 20px 50px ${tokens.colors.cyan}44`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = `0 16px 40px ${tokens.colors.cyan}33`;
                        }}
                    >
                        Explore Live Lab <ExternalLink size={16} />
                    </a>
                    <a
                        href="#architecture"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "16px 32px",
                            ...cardStyle,
                            color: "#fff",
                            fontWeight: 600,
                            textDecoration: "none",
                            transition: "background 0.2s",
                            fontSize: 15,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = tokens.colors.cardBg)}
                    >
                        View Stack Details
                    </a>
                </motion.div>

                {/* Feature Strip */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    style={{ maxWidth: 1000, margin: "0 auto" }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: 16,
                        }}
                    >
                        {features.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 + i * 0.08 }}
                                style={{
                                    ...cardStyle,
                                    padding: "24px 20px",
                                    textAlign: "left",
                                    transition: "background 0.2s, border-color 0.2s",
                                    cursor: "default",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = tokens.colors.cardBg;
                                    e.currentTarget.style.borderColor = tokens.colors.border;
                                }}
                            >
                                <div style={{ marginBottom: 14 }}>{item.icon}</div>
                                <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{item.title}</h3>
                                <p style={{ color: tokens.colors.textMuted, fontSize: 12, fontFamily: "monospace" }}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
