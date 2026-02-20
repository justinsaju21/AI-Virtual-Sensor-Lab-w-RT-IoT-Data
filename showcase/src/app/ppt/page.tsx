"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight, ChevronLeft, Home, Cpu, Target, AlertTriangle, Lightbulb, Layers,
    HardDrive, Code2, GitBranch, Brain, Users, Play, CheckCircle2, Rocket, BookOpen, Award, FileText, List, Calendar, Layout, Search, User,
    X, Wifi, Activity, Zap, ThumbsUp
} from "lucide-react";
import Link from "next/link";
import { tokens } from "@/components/Styles";

interface Slide {
    id: string;
    type?: "title" | "content";
    icon?: React.ReactNode;
    badge?: string;
    badgeColor?: string;
    title?: string;
    subtitle?: string;
    content: React.ReactNode;
}

const slides: Slide[] = [
    // 1. Title Page
    {
        id: "title",
        type: "title",
        content: (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", height: "100%", justifyContent: "center" }}>
                <div style={{
                    padding: "16px 24px", background: "rgba(0,242,254,0.1)", border: "1px solid rgba(0,242,254,0.2)",
                    borderRadius: 99, marginBottom: 40, display: "inline-flex", alignItems: "center", gap: 12
                }}>
                    <Cpu size={24} color="#00f2fe" />
                    <span style={{ color: "#00f2fe", fontWeight: 700, letterSpacing: "0.05em", fontSize: 14 }}>SIXTH SEMESTER PROJECT</span>
                </div>

                <h1 style={{
                    fontSize: "clamp(3rem, 5vw, 4.5rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 20,
                    background: "linear-gradient(135deg, #fff 0%, #94a3b8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>
                    AI-Enabled IoT<br />Virtual Laboratory
                </h1>

                <p style={{ fontSize: 20, color: "#94a3b8", marginBottom: 60, maxWidth: 600 }}>
                    Hybrid Digital Twin Framework for Real-Time Sensor Data Acquisition & Remote Engineering Education
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, width: "100%", maxWidth: 900 }}>
                    {/* Team */}
                    <div style={{ textAlign: "right", paddingRight: 40, borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                        <h3 style={{ color: "#4facfe", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 16, textTransform: "uppercase" }}>Project Associates</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {[
                                { name: "Justin Jacob Saju", id: "RA2311053010097" },
                                { name: "Agnihotram Chinmayanand", id: "RA2311053010116" },
                                { name: "B.V.Balanilavan", id: "RA2311053010123" }
                            ].map(member => (
                                <div key={member.id}>
                                    <div style={{ color: "#fff", fontSize: 18, fontWeight: 600 }}>{member.name}</div>
                                    <div style={{ color: "#64748b", fontSize: 14, fontFamily: "monospace" }}>{member.id}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Guide */}
                    <div style={{ textAlign: "left", paddingLeft: 10, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <h3 style={{ color: "#10b981", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 16, textTransform: "uppercase" }}>Project Guide</h3>
                        <div>
                            <div style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>Dr. Elamaran E</div>
                            <div style={{ color: "#64748b", fontSize: 16 }}>Associate Professor</div>
                            <div style={{ color: "#64748b", fontSize: 14 }}>Department of Electronics & Communication</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    // 2. Contents
    {
        id: "contents",
        icon: <List size={28} />,
        badge: "AGENDA",
        badgeColor: "#a855f7",
        title: "Presentation Contents",
        content: (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {[
                    "Introduction",
                    "Literature Review",
                    "Problem Identification",
                    "Objectives",
                    "System Architecture",
                    "Methodology",
                    "Development Timeline",
                    "Results & Interface",
                    "Future Scope",
                    "Conclusion",
                    "References"
                ].map((item, i) => (
                    <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                            padding: "18px 24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 12, display: "flex", alignItems: "center", gap: 16
                        }}
                    >
                        <span style={{
                            width: 28, height: 28, borderRadius: "50%", background: "rgba(168,85,247,0.1)", color: "#a855f7",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700
                        }}>{i + 1}</span>
                        <span style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 500 }}>{item}</span>
                    </motion.div>
                ))}
            </div>
        )
    },
    // 3. Introduction
    {
        id: "intro",
        icon: <BookOpen size={28} />,
        badge: "INTRODUCTION",
        badgeColor: "#00f2fe",
        title: "Introduction",
        content: (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <p style={{ fontSize: 18, color: "#94a3b8", lineHeight: 1.8 }}>
                    The Internet of Things (IoT) has transformed the way physical systems interact with digital platforms.
                    However, traditional engineering laboratories face several limitations in the modern era of remote learning.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ padding: 24, background: "rgba(0,242,254,0.05)", borderRadius: 16, border: "1px solid rgba(0,242,254,0.1)" }}>
                        <h3 style={{ color: "#00f2fe", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>The Gap</h3>
                        <p style={{ color: "#94a3b8", fontSize: 15 }}>Physical labs restrict access, incur high maintenance costs, and limit student experimentation due to safety risks.</p>
                    </div>
                    <div style={{ padding: 24, background: "rgba(16,185,129,0.05)", borderRadius: 16, border: "1px solid rgba(16,185,129,0.1)" }}>
                        <h3 style={{ color: "#10b981", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>The Proposition</h3>
                        <p style={{ color: "#94a3b8", fontSize: 15 }}>An AI-enabled virtual sensor laboratory that provides real-time interaction with sensor data through a web-based Digital Twin platform.</p>
                    </div>
                </div>
            </div>
        ),
    },
    // 4. Literature Review
    {
        id: "litreview",
        icon: <Search size={28} />,
        badge: "LITERATURE REVIEW",
        badgeColor: "#f59e0b",
        title: "Existing Research",
        content: (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                    {
                        title: "Internet of Things Based Remote Laboratory for Engineering Education",
                        insight: "Highlights the necessity of remote access but often lacks AI-driven feedback mechanisms."
                    },
                    {
                        title: "Engineering End-to-End Remote Labs Using IoT-Based Retrofitting",
                        insight: "Discusses retrofitting legacy equipment but faces scalability issues in multi-user environments."
                    },
                    {
                        title: "Virtual IoT Sensor Networks through Hybrid Architectures",
                        insight: "Proposes mixed-reality setups but often focuses on simulation over real-time hardware synchronization."
                    }
                ].map((paper, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        style={{ padding: 20, background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 12 }}
                    >
                        <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                            <FileText size={18} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} />
                            <h4 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 600, fontStyle: "italic" }}>"{paper.title}"</h4>
                        </div>
                        <p style={{ color: "#94a3b8", fontSize: 14, paddingLeft: 30 }}>Analysis: {paper.insight}</p>
                    </motion.div>
                ))}
            </div>
        )
    },
    // 5. Problem Identification
    {
        id: "problem",
        icon: <AlertTriangle size={28} />,
        badge: "PROBLEM IDENTIFICATION",
        badgeColor: "#f87171",
        title: "Identifying the Core Issues",
        content: (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div style={{ padding: 24, background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 16 }}>
                    <h3 style={{ color: "#f87171", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Legacy Limitations</h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                        {["Limited Hardware Availability", "High Risk of Component Damage", "Zero Real-Time Visibility", "No AI-Assisted Debugging"].map(item => (
                            <li key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <AlertTriangle size={14} color="#f87171" />
                                <span style={{ color: "#cbd5e1", fontSize: 15 }}>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div style={{ padding: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }}>
                    <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Simulation Drawbacks</h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                        {["Idealized Physics (No Noise)", "Lack of Calibration Training", "Disconnected from Industry Standards", "Passive Learning Experience"].map(item => (
                            <li key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <X size={14} color="#94a3b8" />
                                <span style={{ color: "#cbd5e1", fontSize: 15 }}>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        ),
    },
    // 6. Objectives
    {
        id: "objectives",
        icon: <Target size={28} />,
        badge: "OBJECTIVES",
        badgeColor: "#4facfe",
        title: "Project Objectives",
        content: (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                    "Develop a virtual laboratory for IoT sensors with sub-100ms latency",
                    "Integrate real-time hardware data with Digital Twin simulation",
                    "Provide AI-based assistance using Rule-Based Inference Engines",
                    "Enable safe remote experimentation with Fault Injection capabilities",
                    "Create a scalable learning platform supporting multiple users"
                ].map((item, i) => (
                    <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.1 }}
                        style={{
                            padding: "18px 24px", background: "rgba(79,172,254,0.05)", border: "1px solid rgba(79,172,254,0.15)",
                            borderRadius: 12, display: "flex", alignItems: "center", gap: 16
                        }}
                    >
                        <Target size={20} color="#4facfe" style={{ flexShrink: 0 }} />
                        <span style={{ color: "#e2e8f0", fontSize: 16 }}>{item}</span>
                    </motion.div>
                ))}
            </div>
        ),
    },
    // 7. Block Diagram
    {
        id: "blockdiagram",
        icon: <Layers size={28} />,
        badge: "BLOCK DIAGRAM",
        badgeColor: "#a855f7",
        title: "System Architecture",
        content: (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
                {/* Horizontal Flow Diagram Implementation */}
                <div style={{ display: "flex", alignItems: "center", gap: 20, width: "100%", justifyContent: "center" }}>

                    {/* Edge */}
                    <div style={{ padding: 20, background: "rgba(0,242,254,0.1)", border: "1px solid rgba(0,242,254,0.2)", borderRadius: 12, textAlign: "center", width: 180 }}>
                        <HardDrive size={24} color="#00f2fe" style={{ margin: "0 auto 10px" }} />
                        <div style={{ color: "#fff", fontWeight: 700, marginBottom: 4 }}>Edge Layer</div>
                        <div style={{ color: "#94a3b8", fontSize: 12 }}>Arduino Mega 2560<br />Sensors (17+)</div>
                    </div>

                    <div style={{ height: 2, width: 40, background: "#334155" }} />

                    {/* Gateway */}
                    <div style={{ padding: 20, background: "rgba(79,172,254,0.1)", border: "1px solid rgba(79,172,254,0.2)", borderRadius: 12, textAlign: "center", width: 180 }}>
                        <Wifi size={24} color="#4facfe" style={{ margin: "0 auto 10px" }} />
                        <div style={{ color: "#fff", fontWeight: 700, marginBottom: 4 }}>Gateway Layer</div>
                        <div style={{ color: "#94a3b8", fontSize: 12 }}>ESP8266 WiFi<br />UART Bridge</div>
                    </div>

                    <div style={{ height: 2, width: 40, background: "#334155" }} />

                    {/* Cloud */}
                    <div style={{ padding: 20, background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: 12, textAlign: "center", width: 180 }}>
                        <Layers size={24} color="#a855f7" style={{ margin: "0 auto 10px" }} />
                        <div style={{ color: "#fff", fontWeight: 700, marginBottom: 4 }}>Cloud Layer</div>
                        <div style={{ color: "#94a3b8", fontSize: 12 }}>Node.js Backend<br />Socket.io Stream</div>
                    </div>

                    <div style={{ height: 2, width: 40, background: "#334155" }} />

                    {/* Client */}
                    <div style={{ padding: 20, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, textAlign: "center", width: 180 }}>
                        <Layout size={24} color="#10b981" style={{ margin: "0 auto 10px" }} />
                        <div style={{ color: "#fff", fontWeight: 700, marginBottom: 4 }}>Client Layer</div>
                        <div style={{ color: "#94a3b8", fontSize: 12 }}>Next.js Dashboard<br />AI Diagnostics</div>
                    </div>
                </div>

                <div style={{ padding: "16px 32px", background: "rgba(255,255,255,0.03)", borderRadius: 12, textAlign: "center", maxWidth: 640, marginTop: 10 }}>
                    <p style={{ color: "#94a3b8", fontSize: 14 }}>
                        <strong>Hardware Used:</strong> Arduino Mega 2560, ESP8266, DHT11 (Temp/Hum), MQ-2 (Gas), LDR, HC-SR04 (Ultrasonic), PIR Motion, Pulse Sensor.
                    </p>
                </div>
            </div>
        )
    },
    // 8. Methodology
    {
        id: "methodology",
        icon: <GitBranch size={28} />,
        badge: "METHODOLOGY",
        badgeColor: "#10b981",
        title: "Hybrid Digital Twin Logic",
        content: (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Protocol */}
                <div style={{ padding: 24, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 14 }}>
                    <h3 style={{ color: "#10b981", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>1. Communication Protocol</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 8 }}>
                            <span style={{ color: "#cbd5e1" }}>Hardware → Gateway</span>
                            <span style={{ color: "#94a3b8", fontFamily: "monospace" }}>UART (Serial 115200)</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 8 }}>
                            <span style={{ color: "#cbd5e1" }}>Gateway → Cloud</span>
                            <span style={{ color: "#94a3b8", fontFamily: "monospace" }}>HTTP POST (JSON)</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#cbd5e1" }}>Cloud → Client</span>
                            <span style={{ color: "#94a3b8", fontFamily: "monospace" }}>Socket.io (WebSocket)</span>
                        </div>
                    </div>
                </div>

                {/* AI Logic */}
                <div style={{ padding: 24, background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.15)", borderRadius: 14 }}>
                    <h3 style={{ color: "#a855f7", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>2. AI Supervisory Logic</h3>
                    <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 16 }}>The inference engine applies rule-based logic to detect anomalies.</p>
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: 12, borderRadius: 8 }}>
                        <code style={{ fontSize: 13, color: "#e2e8f0", fontFamily: "monospace" }}>
                            if (V_sensor == 0 && V_vcc == 5) &#123;<br />
                            &nbsp;&nbsp;return "Floating Pin Error";<br />
                            &#125;
                        </code>
                    </div>
                </div>

                {/* Fault Injection */}
                <div style={{ gridColumn: "1 / -1", padding: 20, background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 14 }}>
                    <h3 style={{ color: "#f59e0b", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>3. Learning by Failure: Fault Injection</h3>
                    <p style={{ color: "#94a3b8", fontSize: 14 }}>
                        The system intentionally injects faults (Noise, Drift, Open Circuit) into Digital Twin data to train students on debugging without damaging real hardware.
                    </p>
                </div>
            </div>
        )
    },
    // 9. Timeline (Fixed Grid Layout)
    {
        id: "timeline",
        icon: <Calendar size={28} />,
        badge: "TIMELINE",
        badgeColor: "#00f2fe",
        title: "Development Phases",
        content: (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                    { phase: "Phase 1: Conceptualization", task: "Literature survey, Requirement analysis, Architecture design" },
                    { phase: "Phase 2: Frontend Implementation", task: "Next.js Dashboard, UI/UX Design, Charting Library integration" },
                    { phase: "Phase 3: Backend & Simulation", task: "Node.js Server, Digital Twin Logic, Mathematical Modelling" },
                    { phase: "Phase 4: Hardware Integration", task: "Arduino Sensor Interfacing, ESP8266 WiFi Bridging" },
                    { phase: "Phase 5: Intelligence & Optimization", task: "AI Inference Engine, Fault Injection, Latency Optimization" },
                    { phase: "Phase 6: Testing & Deployment", task: "Vercel/Render Deployment, End-to-End Latency Testing" }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        style={{
                            padding: "18px 20px", background: "rgba(255,255,255,0.03)", borderLeft: `3px solid ${i < 4 ? "#10b981" : "#f59e0b"}`,
                            borderRadius: "0 8px 8px 0", display: "flex", flexDirection: "column"
                        }}
                    >
                        <span style={{ color: i < 4 ? "#10b981" : "#f59e0b", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{item.phase}</span>
                        <span style={{ color: "#e2e8f0", fontSize: 15, lineHeight: 1.4 }}>{item.task}</span>
                    </motion.div>
                ))}
            </div>
        )
    },
    // 10. Result
    {
        id: "result",
        icon: <Layout size={28} />,
        badge: "RESULTS",
        badgeColor: "#4facfe",
        title: "Interface Overview",
        content: (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Feature 1 */}
                <div style={{ padding: 24, background: "rgba(79,172,254,0.05)", borderRadius: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <Activity color="#4facfe" size={20} />
                        <h4 style={{ color: "#fff", fontWeight: 700 }}>Real-Time Oscilloscope</h4>
                    </div>
                    <p style={{ color: "#94a3b8", fontSize: 14 }}>
                        Live 5Hz charting of sensor data with sub-100ms latency. Supports Zoom, Pan, and Auto-Scaling for granular signal analysis.
                    </p>
                </div>

                {/* Feature 2 */}
                <div style={{ padding: 24, background: "rgba(168,85,247,0.05)", borderRadius: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <Brain color="#a855f7" size={20} />
                        <h4 style={{ color: "#fff", fontWeight: 700 }}>AI Diagnostics Panel</h4>
                    </div>
                    <p style={{ color: "#94a3b8", fontSize: 14 }}>
                        Side-panel assistant that provides real-time feedback: "Sensor Drifting", "Noise Detected", or "Connection Stable".
                    </p>
                </div>

                {/* Feature 3 */}
                <div style={{ padding: 24, background: "rgba(16,185,129,0.05)", borderRadius: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <Layout color="#10b981" size={20} />
                        <h4 style={{ color: "#fff", fontWeight: 700 }}>Universal Dashboard</h4>
                    </div>
                    <p style={{ color: "#94a3b8", fontSize: 14 }}>
                        A unified grid layout displaying 17+ sensors simultaneously with status indicators (Online/Offline) and easy navigation.
                    </p>
                </div>

                {/* Feature 4 */}
                <div style={{ padding: 24, background: "rgba(245,158,11,0.05)", borderRadius: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <BookOpen color="#f59e0b" size={20} />
                        <h4 style={{ color: "#fff", fontWeight: 700 }}>Educational Modules</h4>
                    </div>
                    <p style={{ color: "#94a3b8", fontSize: 14 }}>
                        Integrated theory tabs, coding snippets (Arduino/Python), and "Common Mistakes" guides for each sensor.
                    </p>
                </div>
            </div>
        )
    },
    // 11. Future Scope
    {
        id: "future",
        icon: <Rocket size={28} />,
        badge: "FUTURE ENHANCEMENTS",
        badgeColor: "#a855f7",
        title: "Future Scope",
        content: (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {[
                    { title: "Multi-User Collaboration", desc: "Collaborative experiments in real-time", icon: <Users size={22} /> },
                    { title: "LMS Integration", desc: "Integration with Learning Management Systems", icon: <BookOpen size={22} /> },
                    { title: "Personalized AI Learning", desc: "Advanced AI-based adaptive pedagogy", icon: <Brain size={22} /> },
                    { title: "Multi-Node Hardware", desc: "Cloud-connected multiple hardware nodes", icon: <Layers size={22} /> },
                ].map((item, i) => (
                    <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.12 }}
                        style={{
                            padding: 24, background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.12)",
                            borderRadius: 16, display: "flex", gap: 16, alignItems: "flex-start"
                        }}
                    >
                        <div style={{ color: "#a855f7", flexShrink: 0, marginTop: 2 }}>{item.icon}</div>
                        <div>
                            <h4 style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{item.title}</h4>
                            <p style={{ color: "#94a3b8", fontSize: 14 }}>{item.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        ),
    },
    // 12. Conclusion
    {
        id: "conclusion",
        icon: <Award size={28} />,
        badge: "CONCLUSION",
        badgeColor: "#10b981",
        title: "Project Conclusion",
        content: (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, textAlign: "center", paddingTop: 20 }}>
                <p style={{ color: "#94a3b8", fontSize: 19, lineHeight: 1.8, maxWidth: 700 }}>
                    The proposed system provides a <span style={{ color: "#10b981", fontWeight: 700 }}>scalable, intelligent, and safe virtual laboratory</span> that integrates:
                </p>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
                    {[
                        { label: "Real Hardware", color: "#00f2fe" },
                        { label: "Digital Twin Simulation", color: "#a855f7" },
                        { label: "AI-Assisted Learning", color: "#10b981" },
                    ].map((item) => (
                        <div key={item.label} style={{
                            padding: "16px 32px", background: `${item.color}10`, border: `2px solid ${item.color}40`,
                            borderRadius: 14, color: item.color, fontWeight: 700, fontSize: 16
                        }}>{item.label}</div>
                    ))}
                </div>
                <p style={{ color: "#e2e8f0", fontSize: 17, lineHeight: 1.7, maxWidth: 650, marginTop: 8 }}>
                    This bridges the gap between theoretical knowledge and practical experimentation in modern engineering education.
                </p>
            </div>
        ),
    },
    // 13. References
    {
        id: "references",
        icon: <BookOpen size={28} />,
        badge: "REFERENCES",
        badgeColor: "#94a3b8",
        title: "References",
        content: (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                    "Internet of Things Based Remote Laboratory for Engineering Education (Elsevier, 2024)",
                    "Virtual IoT Sensor Networks through Hybrid Architectures (IEEE Access)",
                    "Engineering End-to-End Remote Labs Using IoT-Based Retrofitting (Springer)",
                    "ACM Transactions on Computing Education - Special Issue on Remote Labs",
                    "Next.js Documentation - Server Side Rendering Patterns",
                    "Arduino Mega 2560 Datasheet & ESP8266 AT Command Reference"
                ].map((ref, i) => (
                    <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span style={{ color: "#64748b", fontFamily: "monospace", fontSize: 13, marginTop: 4 }}>[{i + 1}]</span>
                        <p style={{ color: "#cbd5e1", fontSize: 15, lineHeight: 1.5 }}>{ref}</p>
                    </div>
                ))}
            </div>
        )
    },
    // 14. Thank You
    {
        id: "thankyou",
        type: "title",
        content: (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", height: "100%", justifyContent: "center" }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    style={{ marginBottom: 40 }}
                >
                    <div style={{
                        width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #00f2fe, #4facfe, #a855f7)",
                        display: "flex", alignItems: "center", justifyContent: "center", padding: 4, margin: "0 auto 30px"
                    }}>
                        <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#030712", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ThumbsUp size={32} color="#fff" />
                        </div>
                    </div>
                    <h1 style={{
                        fontSize: "clamp(3.5rem, 6vw, 6rem)", fontWeight: 900, lineHeight: 1, marginBottom: 20,
                        background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                    }}>
                        Thank You!
                    </h1>
                </motion.div>

                <p style={{ fontSize: 20, color: "#94a3b8", marginBottom: 60, maxWidth: 600 }}>
                    Any Questions?
                </p>


            </div>
        )
    }
];

export default function PresentationPage() {
    const [current, setCurrent] = useState(0);
    const total = slides.length;

    const goNext = useCallback(() => setCurrent((p) => Math.min(p + 1, total - 1)), [total]);
    const goPrev = useCallback(() => setCurrent((p) => Math.max(p - 1, 0)), []);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
            if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [goNext, goPrev]);

    const slide = slides[current];

    return (
        <div style={{
            minHeight: "100vh", background: "#030712", color: "#fff", display: "flex", flexDirection: "column",
            fontFamily: "var(--font-inter), system-ui, sans-serif"
        }}>
            {/* Top Bar */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0
            }}>
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#94a3b8", fontSize: 14 }}>
                    <Home size={16} /> Back to Showcase
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Cpu size={16} color="#00f2fe" />
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>VirtSensorLab</span>
                    <span style={{ color: "#475569", margin: "0 8px" }}>|</span>
                    <span style={{ color: "#94a3b8", fontSize: 13 }}>Final Year Project</span>
                </div>
                <span style={{ color: "#475569", fontSize: 13, fontFamily: "monospace" }}>
                    {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
            </div>

            {/* Progress Bar */}
            <div style={{ height: 3, background: "rgba(255,255,255,0.04)", flexShrink: 0 }}>
                <motion.div
                    animate={{ width: `${((current + 1) / total) * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ height: "100%", background: "linear-gradient(90deg, #00f2fe, #4facfe, #a855f7)", borderRadius: "0 2px 2px 0" }}
                />
            </div>

            {/* Slide Content */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 60px", overflow: "hidden" }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={slide.id}
                        initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        style={{ maxWidth: 1000, width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}
                    >
                        {slide.type !== "title" && (
                            <>
                                {/* Badge */}
                                <div style={{
                                    display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 18px", marginBottom: 20,
                                    background: `${slide.badgeColor}10`, border: `1px solid ${slide.badgeColor}30`, borderRadius: 999, alignSelf: "flex-start"
                                }}>
                                    <div style={{ color: slide.badgeColor }}>{slide.icon}</div>
                                    <span style={{ color: slide.badgeColor, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", fontFamily: "monospace" }}>
                                        {slide.badge}
                                    </span>
                                </div>

                                {/* Title */}
                                <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, marginBottom: 8, letterSpacing: "-0.02em", color: "#fff" }}>
                                    {slide.title}
                                </h1>
                                {slide.subtitle && (
                                    <p style={{ fontSize: 20, color: "#94a3b8", marginBottom: 40 }}>{slide.subtitle}</p>
                                )}
                                {!slide.subtitle && <div style={{ marginBottom: 40 }} />}
                            </>
                        )}

                        {/* Content */}
                        {slide.content}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Nav */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "20px 40px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0
            }}>
                {/* Slide dots */}
                <div style={{ display: "flex", gap: 6 }}>
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            style={{
                                width: i === current ? 28 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer",
                                background: i === current ? "linear-gradient(90deg, #00f2fe, #a855f7)" : "rgba(255,255,255,0.1)",
                                transition: "all 0.3s ease"
                            }}
                        />
                    ))}
                </div>

                {/* Arrows */}
                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        onClick={goPrev}
                        disabled={current === 0}
                        style={{
                            width: 44, height: 44, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
                            background: current === 0 ? "transparent" : "rgba(255,255,255,0.04)",
                            color: current === 0 ? "#333" : "#fff", cursor: current === 0 ? "default" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
                        }}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={goNext}
                        disabled={current === total - 1}
                        style={{
                            width: 44, height: 44, borderRadius: 12, border: "none",
                            background: current === total - 1 ? "rgba(255,255,255,0.04)" : "linear-gradient(135deg, #00f2fe, #4facfe)",
                            color: current === total - 1 ? "#333" : "#030712", cursor: current === total - 1 ? "default" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, transition: "all 0.2s"
                        }}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
