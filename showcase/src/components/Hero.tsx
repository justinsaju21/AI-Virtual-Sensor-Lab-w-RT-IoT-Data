"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import { ExternalLink, Activity, Cpu, Wifi, Brain } from "lucide-react";
import { tokens, gradientText, cardStyle } from "./Styles";

interface WaveLetterProps {
    char: string;
    index: number;
    progress: MotionValue<number>;
    style?: React.CSSProperties;
}

const WaveLetter = ({ char, index, progress, style }: WaveLetterProps) => {
    // Each letter has a unique phase offset mapped to the scroll progress
    const y = useTransform(
        progress,
        [0, 0.5, 1],
        [
            Math.sin(index * 0.4) * 15,
            Math.sin(index * 0.4 + 2) * 30,
            Math.sin(index * 0.4 + 4) * 45
        ]
    );

    const opacity = useTransform(progress, [0, 0.9], [1, 0]);

    return (
        <motion.span
            style={{
                display: "inline-block",
                whiteSpace: char === " " ? "pre" : "normal",
                y,
                opacity,
                ...style
            }}
        >
            {char}
        </motion.span>
    );
};

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 80,
        damping: 30,
        restDelta: 0.001
    });

    const features = [
        { icon: <Activity color={tokens.colors.cyan} />, title: "Real-Time Data", desc: "5Hz Live Stream" },
        { icon: <Brain color={tokens.colors.purple} />, title: "AI Analytics", desc: "Predictive Health" },
        { icon: <Wifi color={tokens.colors.blue} />, title: "Cloud Native", desc: "Edge to Portal" },
        { icon: <Cpu color={tokens.colors.green} />, title: "17+ Sensors", desc: "Dual-MCU Protocol" },
    ];

    const firstLine = "AI-Enabled IoT";
    const secondLine = "Virtual Laboratory";

    return (
        <section
            ref={containerRef}
            style={{
                minHeight: "140vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                padding: "160px 24px 100px",
                backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
                backgroundSize: "64px 64px",
            }}
        >
            {/* Background Decor */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.1, 0.06] }}
                transition={{ duration: 8, repeat: Infinity }}
                style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 800, height: 800, background: `radial-gradient(circle, ${tokens.colors.cyan}44 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }}
            />

            <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, textAlign: "center", width: "100%" }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, ...cardStyle, padding: "8px 24px", borderRadius: 999, marginBottom: 32 }}
                >
                    <span className="pulse-dot" style={{ background: tokens.colors.green }} />
                    <span style={{ fontSize: 13, color: tokens.colors.textSecondary, fontFamily: "monospace", letterSpacing: "0.05em" }}>
                        v2.0 — SCROLL-ACTIVE WAVE ENGINE
                    </span>
                </motion.div>

                <h1
                    style={{
                        fontSize: "clamp(2.5rem, 6vw, 5rem)",
                        fontWeight: 900,
                        lineHeight: 1.1,
                        marginBottom: 24,
                        letterSpacing: "-0.03em",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        {firstLine.split("").map((c, i) => (
                            <WaveLetter key={i} char={c} index={i} progress={smoothProgress} style={{ color: "#fff" }} />
                        ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        {secondLine.split("").map((c, i) => (
                            <WaveLetter key={i} char={c} index={i + firstLine.length} progress={smoothProgress} style={gradientText} />
                        ))}
                    </div>
                </h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ fontSize: "clamp(1.1rem, 2vw, 1.4rem)", color: tokens.colors.textSecondary, marginBottom: 36, maxWidth: 800, margin: "0 auto 40px", lineHeight: 1.6 }}
                >
                    Experience hardware precision in a scalable virtual environment.
                    Use your scroll to interact with the laboratory's core metadata.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", marginBottom: 70 }}
                >
                    <a href="https://ai-virtual-sensor-lab-w-rt-iot-data.vercel.app" target="_blank" style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "16px 32px", background: `linear-gradient(135deg, ${tokens.colors.cyan}, ${tokens.colors.blue})`, color: "#030712", fontWeight: 700, borderRadius: 12, textDecoration: "none", boxShadow: `0 20px 40px ${tokens.colors.cyan}33`
                    }}>
                        Explore Live Lab <ExternalLink size={18} />
                    </a>
                    <a href="#architecture" style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "16px 32px", ...cardStyle, color: "#fff", fontWeight: 600, textDecoration: "none"
                    }}>
                        View Stack Details
                    </a>
                </motion.div>

                {/* Feature Strip */}
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 20,
                            width: "100%",
                            flexWrap: "nowrap"
                        }}
                    >
                        {features.map((item, i) => (
                            <div key={i} style={{
                                ...cardStyle,
                                padding: "24px 20px",
                                textAlign: "left",
                                flex: 1,
                                minWidth: 0
                            }}>
                                <div style={{ marginBottom: 16 }}>{item.icon}</div>
                                <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 4, whiteSpace: "nowrap" }}>{item.title}</h3>
                                <p style={{ color: tokens.colors.textMuted, fontSize: 12, fontFamily: "monospace" }}>{item.desc}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
