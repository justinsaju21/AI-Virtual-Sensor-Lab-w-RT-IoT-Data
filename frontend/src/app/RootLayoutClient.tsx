"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useSocket } from "@/hooks/useSocket";

import { AIProvider } from "@/contexts/AIContext";
import { AITutorWidget } from "@/components/assistant/AITutorWidget";

export default function RootLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { isConnected, data } = useSocket();

    // Fix hydration mismatch by only rendering after mount
    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch - render a skeleton during SSR
    if (!mounted) {
        return (
            <div className="min-h-screen bg-slate-950 text-white">
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-pulse text-slate-500">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <AIProvider>
            <div className="min-h-screen bg-slate-950 text-white">
                {/* Animated Background */}
                <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                    {/* Primary gradient orbs */}
                    <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-cyan-500/15 to-blue-500/5 blur-[120px] animate-pulse" />
                    <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-500/15 to-pink-500/5 blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
                    <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-[100px]" />

                    {/* Grid pattern overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.02]"
                        style={{
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                            backgroundSize: '50px 50px'
                        }}
                    />
                </div>

                {/* Sidebar */}
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />

                {/* Main Content Area */}
                <div
                    className={`relative z-10 min-h-screen transition-all duration-300 ease-out ${sidebarCollapsed ? "ml-20" : "ml-64"
                        }`}
                >
                    <Header
                        isConnected={isConnected}
                        systemInfo={data?.system}
                        deviceId={data?.device_id}
                    />
                    <main className="p-4 pt-2 lg:p-6 lg:pt-4">{children}</main>

                    {/* AI Assistant Widget */}
                    <AITutorWidget />
                </div>
            </div>
        </AIProvider>
    );
}
