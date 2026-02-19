"use client";
import React from "react";
import { motion } from "framer-motion";
import {
    Users, TrendingUp, Handshake, Award,
    Lightbulb, Rocket, Target, Heart
} from "lucide-react";
import { tokens, cardStyle, gradientText } from "./Styles";
import SectionHeading from "./SectionHeading";

export default function MarketingImpact() {
    const points = [
        {
            icon: <Users color={tokens.colors.cyan} />,
            title: "1000+ Potential Students",
            desc: "Architected to handle massive concurrent lab sessions without physical hardware bottlenecks."
        },
        {
            icon: <TrendingUp color={tokens.colors.green} />,
            title: "95% Cost Reduction",
            desc: "Eliminates the need for individual hardware kits for every student in a university ecosystem."
        },
        {
            icon: <Handshake color={tokens.colors.blue} />,
            title: "B2B SaaS Ready",
            desc: "Designed as a white-label solution for educational institutions and technical training centers."
        },
        {
            icon: <Award color={tokens.colors.purple} />,
            title: "Academic Excellence",
            desc: "Bridges the gap between theoretical IoT concepts and industrial hardware implementation."
        }
    ];

    const valueProps = [
        { title: "Innovation", text: "First-of-its-kind hybrid Digital Twin for IoT education.", icon: <Lightbulb size={20} /> },
        { title: "Scalability", text: "Cloud-native infrastructure that grows with your institution.", icon: <Rocket size={20} /> },
        { title: "Precision", text: "Mathematical models grounded in real physics and data science.", icon: <Target size={20} /> },
        { title: "Safety", text: "Zero-risk environment for fault injection and high-voltage training.", icon: <Heart size={20} /> },
    ];

    return (
        <section style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto", borderTop: `1px solid ${tokens.colors.border}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 60, alignItems: "start" }}>
                <div>
                    <SectionHeading
                        align="left"
                        pill="Impact & Vision"
                        title="Beyond the"
                        gradientText="Codebase"
                        subtitle="VirtSensorLab isn't just a project—it's a paradigm shift in how we teach and learn embedded systems in the cloud era."
                    />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        {valueProps.map((prop, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.02 }}
                                style={{ ...cardStyle, padding: "20px", background: "rgba(255,255,255,0.02)" }}
                            >
                                <div style={{ color: tokens.colors.cyan, marginBottom: 12 }}>{prop.icon}</div>
                                <h4 style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{prop.title}</h4>
                                <p style={{ color: tokens.colors.textMuted, fontSize: 11, lineHeight: 1.5 }}>{prop.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
                    {points.map((point, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                                ...cardStyle,
                                padding: "32px",
                                display: "flex",
                                gap: 24,
                                alignItems: "center",
                                background: "linear-gradient(90deg, rgba(255,255,255,0.03), transparent)"
                            }}
                        >
                            <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                {point.icon}
                            </div>
                            <div>
                                <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{point.title}</h3>
                                <p style={{ color: tokens.colors.textSecondary, fontSize: 14, lineHeight: 1.6 }}>{point.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
