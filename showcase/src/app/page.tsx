"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Cpu, Wifi, Brain, Zap, Shield, Database,
  ArrowRight, Layers, Smartphone, Settings, BarChart3,
  Globe, Terminal as TerminalIcon
} from "lucide-react";
import { tokens, cardStyle, gradientText, glass } from "../components/Styles";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProblemSolution from "../components/ProblemSolution";
import SectionHeading from "../components/SectionHeading";
import Waveform from "../components/Waveform";
import DashboardPreview from "../components/DashboardPreview";
import TechStack from "../components/TechStack";
import MarketingImpact from "../components/MarketingImpact";

/* ─── Architecture View ─── */
function Architecture() {
  const [active, setActive] = useState(0);
  const layers = [
    {
      icon: <Zap size={32} />,
      title: "Edge Layer",
      tech: "Arduino Mega 2560",
      desc: "Hardware core managing 17 sensor channels concurrently. 115200 baud UART protocol.",
      details: ["16 Analog ADC Ports", "54 Digital GPIOs", "Real-time sampling at 50ms intervals"]
    },
    {
      icon: <Wifi size={32} />,
      title: "Gateway",
      tech: "ESP8266 NodeMCU",
      desc: "The WiFi bridge. Packages sensor payloads into JSON and handles HTTP POST orchestration.",
      details: ["Non-blocking WiFi stack", "Auto-reconnect logic", "REST Ingestion Engine"]
    },
    {
      icon: <Database size={32} />,
      title: "Cloud Hub",
      tech: "Node.js (Render)",
      desc: "Central processing hub managing WebSocket broadcasts and Digital Twin generation.",
      details: ["Socket.io v4 Server", "Mock Data Generator", "High-availability clustering"]
    },
    {
      icon: <Smartphone size={32} />,
      title: "Client Layer",
      tech: "Next.js 14 App Router",
      desc: "The UI engine. Renders oscilloscopic charts, AI diagnostics, and fault-handling logic.",
      details: ["Framer Motion visuals", "Recharts signal analysis", "AI Inference engine"]
    }
  ];

  return (
    <section id="architecture" style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <SectionHeading pill="System Design" title="Modular" gradientText="Architecture" subtitle="Four distinct layers engineered for low-latency, high-reliability IoT data flow." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 32 }}>
        {layers.map((layer, i) => (
          <motion.div
            key={i}
            onClick={() => setActive(i)}
            whileHover={{ y: -5 }}
            style={{
              ...cardStyle,
              padding: 24,
              cursor: "pointer",
              borderColor: active === i ? tokens.colors.cyan : tokens.colors.border,
              background: active === i ? "rgba(0, 242, 254, 0.03)" : tokens.colors.cardBg,
              transition: "all 0.3s ease"
            }}
          >
            <div style={{ color: active === i ? tokens.colors.cyan : tokens.colors.textMuted, marginBottom: 20 }}>{layer.icon}</div>
            <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{layer.title}</h3>
            <p style={{ color: tokens.colors.cyan, fontSize: 11, fontFamily: "monospace", textTransform: "uppercase" }}>{layer.tech}</p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{ ...cardStyle, padding: "40px", background: "rgba(255,255,255,0.02)" }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 40 }}>
            <div style={{ flex: "1 1 300px" }}>
              <h4 style={{ color: tokens.colors.cyan, fontSize: 13, fontWeight: 800, textTransform: "uppercase", marginBottom: 12 }}>Detailed Overview</h4>
              <p style={{ color: tokens.colors.textSecondary, fontSize: 18, lineHeight: 1.6, marginBottom: 24 }}>{layers[active].desc}</p>
              <div style={{ display: "flex", gap: 12 }}>
                {layers[active].details.map((d, i) => (
                  <span key={i} style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", padding: "4px 12px", borderRadius: 6, color: tokens.colors.textMuted }}>{d}</span>
                ))}
              </div>
            </div>
            <div style={{ flex: "0 0 200px", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.1 }}>
              {layers[active].icon}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

/* ─── Digital Twin ─── */
function DigitalTwinView() {
  return (
    <section id="twin" style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto", borderTop: `1px solid ${tokens.colors.border}` }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 60, alignItems: "center" }}>
        <div>
          <SectionHeading
            align="left"
            pill="Mathematical Core"
            title="The"
            gradientText="Digital Twin Engine"
            subtitle="Physics-accurate sensor models that behave like real components, even when hardware is offline."
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {[
              { title: "Sinusoidal Models", desc: "Day/night environmental cycles with gaussian noise." },
              { title: "PPG Waveforms", desc: "Complex heart pulse geometry including dicrotic notches." },
              { title: "Logarithmic Drift", desc: "Modeling sensor degradation and gas concentration curves." }
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 16 }}>
                <div style={{ width: 24, height: 24, borderRadius: 12, border: `2px solid ${tokens.colors.purple}`, flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{item.title}</h4>
                  <p style={{ color: tokens.colors.textSecondary, fontSize: 14 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          style={{ ...cardStyle, padding: 32, boxShadow: `0 40px 100px ${tokens.colors.purple}11` }}
        >
          <Waveform label="Temperature (24h Cycle)" color={tokens.colors.cyan} path="M0 30 Q25 10 50 30 Q75 50 100 30 Q125 10 150 30 Q175 50 200 30 Q225 10 250 30 Q275 50 300 30" />
          <Waveform label="PPG Cardiac Signature" color={tokens.colors.red} path="M0 40 L15 40 L22 38 L28 5 L35 50 L42 32 L50 40 L80 40 L87 38 L93 5 L100 50 L107 32 L115 40 L145 40 L152 38 L158 5 L165 50 L172 32 L180 40" />
          <Waveform label="Gas (MQ-2) Concentration" color={tokens.colors.green} path="M0 50 L20 45 L50 48 L80 40 L110 42 L140 35 L170 38 L200 30 L230 32 L300 10" />
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Diagnostics ─── */
function Diagnostics() {
  const tools = [
    { icon: <Shield size={24} />, title: "Fault Injection", color: tokens.colors.red, items: ["Short Circuits", "Open Circuits", "EMI Noise"] },
    { icon: <Brain size={24} />, title: "AI Assistant", color: tokens.colors.purple, items: ["Floating Pins", "Correlation", "Anomaly Detection"] },
    { icon: <Activity size={24} />, title: "DSP Filters", color: tokens.colors.cyan, items: ["Moving Average", "Kalman Filter", "Debouncing"] },
    { icon: <BarChart3 size={24} />, title: "Analytics", color: tokens.colors.green, items: ["CSV Export", "PDF Reporting", "Live Trends"] }
  ];

  return (
    <section id="intelligence" style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto", background: "rgba(255,255,255,0.01)" }}>
      <SectionHeading pill="The Intelligence Lab" title="Advanced" gradientText="Diagnostics" subtitle="Equipping students with professional-grade analysis tools." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
        {tools.map((tool, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10 }}
            style={{ ...cardStyle, padding: 32, borderTop: `4px solid ${tool.color}` }}
          >
            <div style={{ color: tool.color, marginBottom: 20 }}>{tool.icon}</div>
            <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{tool.title}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tool.items.map((item, j) => (
                <div key={j} style={{ color: tokens.colors.textMuted, fontSize: 13, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: tool.color }} />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer style={{ padding: "80px 24px 40px", borderTop: `1px solid ${tokens.colors.border}`, textAlign: "center" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <h3 style={{ color: "#fff", fontWeight: 800, fontSize: 24, marginBottom: 16 }}>VirtSensorLab</h3>
        <p style={{ color: tokens.colors.textMuted, fontSize: 14, lineHeight: 1.6, marginBottom: 40 }}>
          An AI-Enabled IoT Digital Twin platform for high-density sensor acquisition and diagnostic education.
          Built with Hardware Precision & Cloud Scalability.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 40 }}>
          <a href="#" style={{ color: tokens.colors.textSecondary, textDecoration: "none", fontSize: 14 }}>Documentation</a>
          <a href="#" style={{ color: tokens.colors.textSecondary, textDecoration: "none", fontSize: 14 }}>Hardware Guide</a>
          <a href="#" style={{ color: tokens.colors.textSecondary, textDecoration: "none", fontSize: 14 }}>GitHub</a>
        </div>
        <p style={{ color: tokens.colors.textMuted, fontSize: 12, fontFamily: "monospace" }}>© 2026 SEM6 Project — AI-Enabled Virtual Laboratoy</p>
      </div>
    </footer>
  );
}

export default function Page() {
  return (
    <main style={{ background: tokens.colors.bg, color: "#fff", minHeight: "100vh" }}>
      <Navbar />
      <Hero />
      <ProblemSolution />
      <Architecture />
      <DigitalTwinView />
      <Diagnostics />
      <DashboardPreview />
      <MarketingImpact />
      <TechStack />
      <Footer />
    </main>
  );
}
