"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Menu, X, Cpu, ExternalLink } from "lucide-react";
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
        { name: "Hardware", href: "#tech" },
        { name: "Digital Twin", href: "#twin" },
        { name: "Diagnostics", href: "#intelligence" },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-3 border-b border-white/10 bg-slate-950/80 backdrop-blur-md" : "py-5 border-b border-transparent bg-transparent"}`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <a href="#" className="flex items-center gap-3 no-underline group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.3)] bg-gradient-to-br from-cyan-400 to-purple-500 group-hover:scale-105 transition-transform">
                        <Cpu size={18} color="#030712" />
                    </div>
                    <span className="text-white font-extrabold text-lg tracking-tight group-hover:text-cyan-400 transition-colors">
                        VirtSensorLab
                    </span>
                </a>

                {/* Desktop Nav - Tailwind Hidden/Flex */}
                <div className="hidden md:flex items-center gap-8">
                    <div className="flex gap-6">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-slate-400 text-sm font-medium hover:text-white transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href="/ppt"
                            className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-sm font-semibold transition-all hover:scale-105"
                        >
                            Presentation
                        </a>
                        <a
                            href="https://ai-virtual-sensor-lab-w-rt-iot-data.vercel.app"
                            target="_blank"
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 rounded-lg text-sm font-bold shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-105 transition-all"
                        >
                            Live Demo <ExternalLink size={14} />
                        </a>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden text-white hover:text-cyan-400 transition-colors"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden overflow-hidden bg-slate-950 border-b border-white/10 absolute top-full left-0 right-0 px-6 py-4 flex flex-col gap-4 shadow-2xl"
                    >
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="text-slate-300 text-lg font-medium hover:text-white transition-colors py-2 border-b border-white/5"
                            >
                                {link.name}
                            </a>
                        ))}
                        <div className="flex flex-col gap-3 mt-2">
                            <a
                                href="/ppt"
                                className="w-full py-3 text-center bg-white/5 border border-white/10 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                            >
                                View Presentation
                            </a>
                            <a
                                href="https://ai-virtual-sensor-lab-w-rt-iot-data.vercel.app"
                                className="w-full py-3 text-center bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 rounded-lg font-bold shadow-lg hover:shadow-cyan-500/20 transition-all"
                            >
                                Launch Live Demoo
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
