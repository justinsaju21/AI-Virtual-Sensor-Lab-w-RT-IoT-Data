"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../hooks/useSocket";
import { SensorGroupCard } from "./SensorGroupCard";
import { SensorDetailModal } from "./sensors/SensorDetailModal";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { LiveChart } from "./charts/LiveChart";
import { useAI } from "@/contexts/AIContext";
import {
  sensorGroups,
  sensorCategories,
  SensorCategory,
  getCategoryLabel,
} from "@/config/sensorGroups";
import {
  Thermometer,
  Droplets,
  Flame,
  Sun,
  Activity,
  Radar,
  Wifi,
  WifiOff,
  Clock,
  Zap,
  TrendingUp,
  Server,
  BarChart3,
  Cpu,
} from "lucide-react";

interface DataPoint {
    time: string;
    value: number;
}

const MAX_DATA_POINTS = 30;

export const Dashboard = () => {
    const { isConnected, data, error } = useSocket();
    const { updateContext } = useAI();
    // History states for charts
    const [tempHistory, setTempHistory] = useState<DataPoint[]>([]);
    const [soundHistory, setSoundHistory] = useState<DataPoint[]>([]);
    // Modal state for sensor detail view
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
    // Category filter
    const [activeCategory, setActiveCategory] = useState<SensorCategory | "ALL">("ALL");
    // Live update rate counter
    const [updateRate, setUpdateRate] = useState<number>(0);
    const tickTimestamps = useRef<number[]>([]);

    useEffect(() => {
        if (data) {
            const timestamp = new Date(data.timestamp);
            const timeLabel = timestamp.toLocaleTimeString("en-US", {
                hour12: false,
                minute: "2-digit",
                second: "2-digit",
            });

            // Handle legacy DHT22 or new DHT11
            const temp = data.sensors.dht11?.temp ?? data.sensors.dht22?.temperature ?? 0;
            const sound = data.sensors.sound?.analog ?? data.sensors.mic?.level ?? 0;

            setTempHistory((prev) => [...prev, { time: timeLabel, value: temp }].slice(-MAX_DATA_POINTS));
            setSoundHistory((prev) => [...prev, { time: timeLabel, value: sound }].slice(-MAX_DATA_POINTS));

            // Measure actual update rate
            const now = Date.now();
            tickTimestamps.current = [...tickTimestamps.current, now].filter(t => now - t < 5000);
            const count = tickTimestamps.current.length;
            setUpdateRate(parseFloat((count / 5).toFixed(1)));
        }
    }, [data]);

    // Handle sensor group click - updates AI context and opens detail modal
    const handleSensorClick = (sensorId: string, sensorName: string, sensorData: any) => {
        updateContext({
            page: "dashboard",
            sensor: sensorName,
            dataSnippet: sensorData,
        });
        setSelectedSensorId(sensorId);
        setDetailModalOpen(true);
    };

    // Handle sensor navigation in modal
    const handleSensorNavigation = (direction: 'prev' | 'next') => {
        const allSensorIds = sensorGroups.map(g => g.id);
        const currentIndex = allSensorIds.indexOf(selectedSensorId || '');
        let nextIndex = currentIndex;
        
        if (direction === 'next') {
            nextIndex = (currentIndex + 1) % allSensorIds.length;
        } else {
            nextIndex = (currentIndex - 1 + allSensorIds.length) % allSensorIds.length;
        }
        
        setSelectedSensorId(allSensorIds[nextIndex]);
    };

    // Loading state
    if (!isConnected) {
        return (
            <div className="flex h-[70vh] flex-col items-center justify-center">
                <div className="relative mb-8">
                    <div className="h-24 w-24 rounded-full border-2 border-slate-800 border-t-cyan-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <WifiOff className="h-8 w-8 text-slate-600" />
                    </div>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Connecting to Hardware</h2>
                <p className="text-slate-500 text-sm">Establishing WebSocket connection...</p>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
        );
    }

    if (!data) return null;

    const formatUptime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m ${seconds}s`;
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Sensor Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">Monitor 17 connected IoT sensors in real-time</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                        {updateRate > 0 ? `${updateRate} Hz` : "--"}
                    </span>
                    <Badge variant="success" pulse size="md">
                        <Zap className="h-3 w-3 mr-1" />
                        Live Updates
                    </Badge>
                </div>
            </div>

            {/* System Overview */}
            <Card variant="gradient" hover={false}>
                <div className="p-5">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <Zap className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Status</p>
                                <p className="text-sm font-semibold text-emerald-400">All Systems Go</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Wifi className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Signal</p>
                                <p className="text-sm font-semibold text-white font-mono">{data.system?.wifi_rssi ?? -60} dBm</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Uptime</p>
                                <p className="text-sm font-semibold text-white font-mono">{formatUptime(data.system?.uptime_ms ?? 0)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Sensors</p>
                                <p className="text-sm font-semibold text-white">17 Active</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                <Server className="h-5 w-5 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Device</p>
                                <p className="text-sm font-semibold text-white truncate max-w-[100px]">{data.device_id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Sensor Groups Grid */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h2 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Live Sensor Readings
                    </h2>
                    {/* Category Filter Tabs */}
                    <div className="flex gap-1 p-1 bg-white/5 rounded-xl flex-wrap">
                        <button
                            onClick={() => setActiveCategory("ALL")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                activeCategory === "ALL"
                                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            All
                        </button>
                        {Object.values(SensorCategory).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    activeCategory === cat
                                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                {getCategoryLabel(cat)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Render sensors by category */}
                {Object.values(SensorCategory).map((category) => {
                    if (activeCategory !== "ALL" && activeCategory !== category) return null;

                    const sensorsInCategory = sensorCategories[category];
                    const visibleGroups = sensorGroups.filter(
                        (group) => sensorsInCategory.includes(group.id)
                    );

                    if (visibleGroups.length === 0) return null;

                    return (
                        <div key={category} className="mb-8">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
                                {getCategoryLabel(category)}
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {visibleGroups.map((group) => (
                                    <SensorGroupCard
                                        key={group.id}
                                        group={group}
                                        sensorData={data.sensors}
                                        onClickSensor={handleSensorClick}
                                        isClickable={true}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Grid */}
            <div>
                <h2 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Historical Trends
                </h2>
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card variant="default">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Thermometer className="h-4 w-4 text-orange-400" />
                                Temperature
                            </CardTitle>
                            <Badge variant="success" pulse size="sm">Live</Badge>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <LiveChart
                                data={tempHistory}
                                color="#f97316"
                                gradientId="tempGrad"
                                unit="°C"
                                height={180}
                                minDomain={20}
                                maxDomain={35}
                            />
                        </CardContent>
                    </Card>

                    <Card variant="default">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-pink-400" />
                                Sound Level
                            </CardTitle>
                            <Badge variant="success" pulse size="sm">Live</Badge>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <LiveChart
                                data={soundHistory}
                                color="#ec4899"
                                gradientId="soundGrad"
                                unit="raw"
                                height={180}
                                minDomain={0}
                                maxDomain={500}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5 text-xs text-slate-600">
                <div className="flex items-center gap-4">
                    <span>Firmware v{data.system?.version ?? "1.0.0"}</span>
                    <span>•</span>
                    <span>Last update: {new Date(data.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Cpu className="h-3.5 w-3.5" />
                    <span>Arduino Mega 2560 + ESP8266</span>
                </div>
            </div>

            {/* Sensor Detail Modal */}
            <SensorDetailModal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                sensorId={selectedSensorId}
                sensorData={data.sensors}
                onNext={() => handleSensorNavigation('next')}
                onPrev={() => handleSensorNavigation('prev')}
            />
        </div>
    );
};
