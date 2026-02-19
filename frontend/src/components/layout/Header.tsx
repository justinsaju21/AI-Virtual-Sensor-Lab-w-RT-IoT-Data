"use client";

import React from "react";
import { Wifi, WifiOff, Clock, Cpu, Signal, Activity } from "lucide-react";
import { Badge } from "../ui/Badge";
import { SystemInfo } from "@/types/sensorData";

interface HeaderProps {
    systemInfo?: SystemInfo;
    isConnected: boolean;
    deviceId?: string;
}

export const Header: React.FC<HeaderProps> = ({ systemInfo, isConnected, deviceId }) => {
    const formatUptime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    };

    return (
        <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-6">
                {/* Left: Page Info */}
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-lg font-semibold text-white">Live Monitoring</h1>
                        <p className="text-xs text-slate-500">Real-time sensor data stream</p>
                    </div>
                </div>

                {/* Right: Status & Controls */}
                <div className="flex items-center gap-4">
                    {/* System Stats */}
                    {systemInfo && isConnected && (
                        <div className="hidden md:flex items-center gap-6 mr-4">
                            <div className="flex items-center gap-2">
                                <Signal className="h-4 w-4 text-blue-400" />
                                <span className="text-xs text-slate-400">Signal</span>
                                <span className="text-xs font-mono font-medium text-white">{systemInfo.wifi_rssi}dBm</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-purple-400" />
                                <span className="text-xs text-slate-400">Uptime</span>
                                <span className="text-xs font-mono font-medium text-white">{formatUptime(systemInfo.uptime_ms)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-emerald-400" />
                                <span className="text-xs text-slate-400">Rate</span>
                                <span className="text-xs font-mono font-medium text-white">0.5Hz</span>
                            </div>
                        </div>
                    )}

                    {/* Device ID */}
                    {deviceId && (
                        <div className="hidden lg:flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 border border-white/5">
                            <Cpu className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-xs font-mono text-slate-300">{deviceId}</span>
                        </div>
                    )}

                    {/* Connection Status */}
                    <div className={`
            flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium
            transition-all duration-300
            ${isConnected
                            ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                            : "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
                        }
          `}>
                        {isConnected ? (
                            <>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span>Connected</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="h-3.5 w-3.5" />
                                <span>Disconnected</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
