"use client";
import React from "react";
import { motion } from "framer-motion";
import {
    Activity, Shield, Cpu, Database, Bell,
    Wifi, Signal, Clock, Server, Monitor, Zap
} from "lucide-react";
import { tokens, cardStyle, glass } from "./Styles";
import SectionHeading from "./SectionHeading";
import Waveform from "./Waveform";

export default function DashboardPreview() {
    const sensorCards = [
        { label: "DISTANCE", val: "48.4", unit: "cm", model: "HC-SR04", color: tokens.colors.purple, icon: <Activity size={14} /> },
        { label: "TEMPERATURE", val: "26", unit: "°C", model: "DHT11 Sensor", color: tokens.colors.red, icon: <Activity size={14} /> },
        { label: "HUMIDITY", val: "56.8", unit: "%", model: "DHT11 Sensor", color: tokens.colors.blue, icon: <Activity size={14} /> },
        { label: "ALCOHOL LEVEL", val: "113", unit: "raw", model: "MQ-3 Alcohol", color: tokens.colors.green, icon: <Activity size={14} /> },
        { label: "GAS/SMOKE", val: "217", unit: "ppm", model: "MQ-2 Sensor", color: tokens.colors.red, icon: <Activity size={14} /> },
        { label: "MAGNETIC FIELD", val: "Clear", unit: "", model: "Hall Sensor", color: tokens.colors.purple, icon: <Activity size={14} /> },
        { label: "SOUND LEVEL", val: "83", unit: "dB", model: "Microphone", color: tokens.colors.purple, icon: <Activity size={14} /> },
        { label: "IR OBSTACLE", val: "Clear", unit: "", model: "IR Sensor", color: tokens.colors.cyan, icon: <Activity size={14} /> },
    ];

    return (
        <section id="preview" style={{ padding: "100px 24px", maxWidth: 1280, margin: "0 auto" }}>
            <SectionHeading
                pill="Interface Parity"
                title="Production"
                gradientText="Sensor Dashboard"
                subtitle="The actual monitoring interface used by engineers and students to manage 15+ IoT data streams in real-time."
            />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                style={{
                    ...cardStyle,
                    padding: 0,
                    background: "#0a0f1a",
                    border: "1px solid rgba(255,255,255,0.05)",
                    boxShadow: "0 100px 200px rgba(0,0,0,0.7)",
                    overflow: "hidden",
                    borderRadius: 12
                }}
            >
                {/* Top Header Bar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Live Monitoring</span>
                        <span style={{ fontSize: 11, color: tokens.colors.textMuted }}>Real-time sensor data stream</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.03)", padding: "4px 12px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.05)" }}>
                            <Cpu size={12} color={tokens.colors.textMuted} />
                            <span style={{ fontSize: 11, color: tokens.colors.textMuted }}>virtual_lab_01</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(16,185,129,0.1)", padding: "4px 12px", borderRadius: 4, border: "1px solid rgba(16,185,129,0.2)" }}>
                            <div style={{ width: 6, height: 6, background: "#10b981", borderRadius: "50%" }} />
                            <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700 }}>Connected</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", height: 750 }} className="hidden-mobile">
                    {/* Dashboard Sidebar - Match screenshot colors */}
                    <div style={{ background: "#060a12", borderRight: "1px solid rgba(255,255,255,0.03)", padding: "24px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
                            <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${tokens.colors.cyan}, ${tokens.colors.blue})`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Cpu size={18} color="#000" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>VirtLab</div>
                                <div style={{ fontSize: 9, color: tokens.colors.textMuted }}>IoT Sensor Platform</div>
                            </div>
                        </div>

                        <div style={{ fontSize: 9, color: tokens.colors.textMuted, letterSpacing: "0.1em", marginBottom: 12, textTransform: "uppercase" }}>Monitoring</div>
                        <div style={{ padding: "10px 12px", borderRadius: 6, background: "linear-gradient(90deg, rgba(0,242,254,0.1), transparent)", color: tokens.colors.cyan, fontSize: 12, display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                            <Monitor size={14} /> Dashboard
                        </div>

                        <div style={{ fontSize: 9, color: tokens.colors.textMuted, letterSpacing: "0.1em", marginBottom: 12, textTransform: "uppercase" }}>Sensors</div>
                        {["Temperature", "Humidity", "Gas Sensor", "Alcohol (MQ3)", "Light Sensor", "Ultrasonic", "Motion", "Hall Effect", "Sound"].map((m, i) => (
                            <div key={i} style={{ padding: "8px 12px", color: tokens.colors.textSecondary, fontSize: 12, display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                                <Activity size={14} opacity={0.5} /> {m}
                            </div>
                        ))}
                    </div>

                    {/* Dashboard Main - Match Screenshot Layout */}
                    <div style={{ padding: "32px", overflowY: "auto", background: "#0a0f1a" }}>
                        <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                            <div>
                                <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Sensor Dashboard</h2>
                                <p style={{ fontSize: 12, color: tokens.colors.textMuted }}>Monitor 15 connected IoT sensors in real-time</p>
                            </div>
                            <div style={{ padding: "8px 16px", background: "rgba(16,185,129,0.05)", borderRadius: 6, border: "1px solid rgba(16,185,129,0.1)", display: "flex", alignItems: "center", gap: 8 }}>
                                <div className="pulse-dot" style={{ background: "#10b981", width: 6, height: 6 }} />
                                <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700 }}>Live Updates</span>
                            </div>
                        </div>

                        {/* Status Header Cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 40 }}>
                            {[
                                { icon: <Zap size={16} />, label: "STATUS", val: "All Systems Go", color: tokens.colors.green },
                                { icon: <Signal size={16} />, label: "SIGNAL", val: "-60 dBm", color: tokens.colors.blue },
                                { icon: <Clock size={16} />, label: "UPTIME", val: "2h 45m", color: tokens.colors.purple },
                                { icon: <Activity size={16} />, label: "SENSORS", val: "15 Active", color: "#f59e0b" },
                                { icon: <Server size={16} />, label: "DEVICE", val: "virt_lab_01", color: tokens.colors.cyan },
                            ].map((s, i) => (
                                <div key={i} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "16px", border: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
                                    <div>
                                        <div style={{ fontSize: 8, color: tokens.colors.textMuted, marginBottom: 2 }}>{s.label}</div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? s.color : "#fff" }}>{s.val}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, color: tokens.colors.textMuted, fontSize: 11, fontWeight: 700 }}>
                            <Activity size={14} /> LIVE READINGS
                        </div>

                        {/* Sensor Grid - Matching the screenshot exactly */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                            {sensorCards.map((s, i) => (
                                <div key={i} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 20, border: "1px solid rgba(255,255,255,0.04)", position: "relative" }}>
                                    <div style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 4, background: "rgba(16,185,129,0.05)", padding: "2px 8px", borderRadius: 99, border: "1px solid rgba(16,185,129,0.1)" }}>
                                        <div style={{ width: 4, height: 4, background: "#10b981", borderRadius: "50%" }} />
                                        <span style={{ fontSize: 8, color: "#10b981", fontWeight: 700 }}>Online</span>
                                    </div>
                                    <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.02)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, marginBottom: 16 }}>
                                        {s.icon}
                                    </div>
                                    <div style={{ fontSize: 9, color: tokens.colors.textMuted, marginBottom: 4 }}>{s.label}</div>
                                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                                        <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{s.val}</span>
                                        {s.unit && <span style={{ fontSize: 11, color: tokens.colors.textMuted }}>{s.unit}</span>}
                                    </div>
                                    <div style={{ fontSize: 9, color: tokens.colors.textMuted }}>{s.model}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
