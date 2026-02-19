"use client";
import React from "react";
import { motion } from "framer-motion";
import { tokens, cardStyle } from "./Styles";
import SectionHeading from "./SectionHeading";

export default function TechStack() {
    const stacks = [
        { cat: "Frontend", items: ["Next.js 14", "TypeScript", "Framer Motion", "Recharts", "Lucide Icons", "Socket.io Client"] },
        { cat: "Cloud", items: ["Node.js 18+", "Express.js", "Socket.io", "Render Service", "Vercel Edge", "CORS"] },
        { cat: "Hardware", items: ["Arduino Mega", "ESP8266", "ADC Protocol", "I2C/SPI", "JSON Serializer", "Non-blocking Loop"] },
        { cat: "Sensors", items: ["DHT11", "BMP180", "MQ-Series Gas", "Ultrasonic HC-SR04", "PIR Motion", "PPG Sensor"] },
    ];

    return (
        <section id="tech" style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
            <SectionHeading pill="The Stack" title="Built with" gradientText="Modern Tech" subtitle="A multi-language ecosystem designed for scalability and real-world parity." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
                {stacks.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        style={{ ...cardStyle, padding: 32 }}
                    >
                        <h3 style={{ color: tokens.colors.cyan, fontSize: 13, fontWeight: 800, textTransform: "uppercase", marginBottom: 20 }}>{s.cat}</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {s.items.map((item, j) => (
                                <div key={j} style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{item}</div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
