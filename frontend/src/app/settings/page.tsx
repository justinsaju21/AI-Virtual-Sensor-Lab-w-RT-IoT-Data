"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Settings, Wifi, Bell, Moon, Globe, Database, Shield } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-6 max-w-2xl">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-slate-700 flex items-center justify-center">
                        <Settings className="h-5 w-5 text-slate-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                </div>
                <p className="text-slate-500">Configure your virtual lab preferences</p>
            </div>

            {/* Connection Settings */}
            <Card variant="default">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-cyan-400" />
                        Connection Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white">Backend URL</p>
                            <p className="text-xs text-slate-500">WebSocket server endpoint</p>
                        </div>
                        <code className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg text-cyan-400">
                            localhost:5000
                        </code>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white">Auto Reconnect</p>
                            <p className="text-xs text-slate-500">Automatically reconnect on disconnect</p>
                        </div>
                        <Badge variant="success">Enabled</Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Display Settings */}
            <Card variant="default">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Moon className="h-4 w-4 text-purple-400" />
                        Display Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white">Theme</p>
                            <p className="text-xs text-slate-500">Application color theme</p>
                        </div>
                        <Badge variant="default">Dark Mode</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white">Chart Animation</p>
                            <p className="text-xs text-slate-500">Enable smooth chart transitions</p>
                        </div>
                        <Badge variant="success">Enabled</Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Data Settings */}
            <Card variant="default">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-emerald-400" />
                        Data Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white">Data Points</p>
                            <p className="text-xs text-slate-500">Maximum chart history length</p>
                        </div>
                        <span className="text-sm font-mono text-white">50 points</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white">Update Interval</p>
                            <p className="text-xs text-slate-500">Sensor data refresh rate</p>
                        </div>
                        <span className="text-sm font-mono text-white">2 seconds</span>
                    </div>
                </CardContent>
            </Card>

            {/* About */}
            <Card variant="default">
                <CardContent className="p-5 text-center">
                    <p className="text-sm text-slate-500">Virtual Sensor Laboratory v1.0.0</p>
                    <p className="text-xs text-slate-600 mt-1">Built with Next.js, Socket.io, and Recharts</p>
                </CardContent>
            </Card>
        </div>
    );
}
