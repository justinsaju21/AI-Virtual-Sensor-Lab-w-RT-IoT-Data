"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Menu, X, Cpu } from "lucide-react";
import { tokens, glass } from "./Styles";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Architecture", href: "#architecture" },
        { name: "Hardware", href: "#hardware" },
        { name: "Digital Twin", href: "#twin" },
        { name: "Diagnostics", href: "#intelligence" },
    ];

    return (
        <nav style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            padding: scrolled ? "12px 24px" : "20px 24px",
            transition: "all 0.3s ease",
            background: scrolled ? "rgba(3, 7, 18, 0.8)" : "transparent",
            ...glass,
            borderBottom: scrolled ? `1px solid ${tokens.colors.border}` : "1px solid transparent",
        }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                    <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: `linear-gradient(135deg, ${tokens.colors.cyan}, ${tokens.colors.purple})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 0 20px ${tokens.colors.cyan}44`
                    }}>
                        <Cpu size={18} color="#030712" />
                    </div>
                    <span style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>VirtSensorLab</span>
                </a>

                {/* Desktop Nav */}
                <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden md:flex">
                    {navLinks.map((link) => (
                        <a key={link.name} href={link.href} style={{
                            color: tokens.colors.textSecondary,
                            fontSize: 14,
                            fontWeight: 500,
                            textDecoration: "none",
                            transition: "color 0.2s",
                        }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = tokens.colors.textSecondary)}>
                            {link.name}
                        </a>
                    ))}
                    <a href="https://ai-virtual-sensor-lab-w-rt-iot-data.vercel.app" target="_blank" style={{
                        padding: "8px 18px",
                        background: `linear-gradient(135deg, ${tokens.colors.cyan}, ${tokens.colors.blue})`,
                        color: "#030712",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        textDecoration: "none",
                        boxShadow: `0 0 20px ${tokens.colors.cyan}33`
                    }}>
                        Live Demo
                    </a>
                </div>

                {/* Mobile Toggle */}
                <button onClick={() => setIsOpen(!isOpen)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }} className="md:hidden">
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            background: "#030712",
                            padding: "24px",
                            borderBottom: `1px solid ${tokens.colors.border}`,
                            display: "flex",
                            flexDirection: "column",
                            gap: 20
                        }}
                    >
                        {navLinks.map((link) => (
                            <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} style={{ color: "#fff", fontSize: 16, textDecoration: "none" }}>
                                {link.name}
                            </a>
                        ))}
                        <a href="https://ai-virtual-sensor-lab-w-rt-iot-data.vercel.app" style={{
                            padding: "12px",
                            background: `linear-gradient(135deg, ${tokens.colors.cyan}, ${tokens.colors.blue})`,
                            color: "#030712",
                            textAlign: "center",
                            borderRadius: 8,
                            fontWeight: 700,
                            textDecoration: "none"
                        }}>
                            Live Demo
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
