"use client";
import React from "react";
import { motion } from "framer-motion";
import { tokens } from "./Styles";

interface Props {
    pill: string;
    pillColor?: string;
    title: string;
    subtitle?: string;
    gradientText?: string;
    align?: "center" | "left";
}

export default function SectionHeading({ pill, pillColor, title, subtitle, gradientText: grad, align = "center" }: Props) {
    return (
        <div style={{ textAlign: align, marginBottom: 60, maxWidth: align === "center" ? 700 : "none", margin: align === "center" ? "0 auto 60px" : "0 0 60px" }}>
            <motion.span
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: pillColor || tokens.colors.cyan,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    fontFamily: "monospace",
                    marginBottom: 16,
                    display: "block"
                }}
            >
                {pill}
            </motion.span>
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: 20 }}
            >
                {title} {grad && <span style={{
                    background: `linear-gradient(135deg, ${tokens.colors.cyan}, ${tokens.colors.blue}, ${tokens.colors.purple})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                }}>{grad}</span>}
            </motion.h2>
            {subtitle && (
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    style={{ fontSize: 18, color: tokens.colors.textSecondary, lineHeight: 1.6 }}
                >
                    {subtitle}
                </motion.p>
            )}
        </div>
    );
}
