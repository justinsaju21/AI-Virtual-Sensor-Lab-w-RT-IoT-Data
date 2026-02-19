"use client";

import React from "react";
import { Github, ExternalLink, BookOpen, Mail } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-white/5 mt-20">
            <div className="max-w-6xl mx-auto py-12 px-6">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <h3 className="text-lg font-bold text-white mb-2">IoT Virtual Sensor Lab</h3>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-md">
                            A scalable, intelligent, hardware-integrated virtual laboratory for modern engineering education. Built as a SEM6 capstone project.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">Resources</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="https://ai-virtual-sensor-lab-w-rt-iot-data.vercel.app" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-1.5">
                                    <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                                </a>
                            </li>
                            <li>
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-1.5">
                                    <Github className="w-3.5 h-3.5" /> GitHub Repository
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5" /> Documentation
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">Contact</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="mailto:you@email.com" className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" /> Email
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-6 text-center">
                    <p className="text-xs text-slate-600">
                        © {new Date().getFullYear()} AI-Enabled IoT Virtual Sensor Laboratory. Built with Next.js, Socket.io, & Arduino.
                    </p>
                </div>
            </div>
        </footer>
    );
}
