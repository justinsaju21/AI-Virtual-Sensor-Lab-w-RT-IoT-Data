"use client";
import React from "react";
import { motion } from "framer-motion";
import { tokens } from "./Styles";

interface Props {
    path: string;
    color: string;
    label: string;
}

export default function Waveform({ path, color, label }: Props) {
    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: tokens.colors.textMuted, letterSpacing: "0.05em" }}>{label}</span>
            </div>
            <div style={{
                height: 60,
                background: "rgba(0,0,0,0.2)",
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.03)"
            }}>
                <svg viewBox="0 0 300 60" style={{ width: "100%", height: "100%" }} preserveAspectRatio="none">
                    <motion.path
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        d={path}
                        stroke={color}
                        strokeWidth="1.5"
                        fill="none"
                        opacity="0.8"
                    />
                </svg>
            </div>
        </div>
    );
}
