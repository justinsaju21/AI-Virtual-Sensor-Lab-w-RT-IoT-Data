"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import { MetricCard } from "./MetricCard";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { LiveChart } from "./charts/LiveChart";
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
    RefreshCw,
    Mic,
    Magnet,
    Move,
    Hand,
    Heart,
    Eye,
    Gauge,
    Gamepad2,
} from "lucide-react";

interface DataPoint {
    time: string;
    value: number;
}

const MAX_DATA_POINTS = 30;

export const Dashboard = () => {
    const { isConnected, data } = useSocket();
    // History states for charts
    const [tempHistory, setTempHistory] = useState<DataPoint[]>([]);
    const [humidityHistory, setHumidityHistory] = useState<DataPoint[]>([]);
    const [gasHistory, setGasHistory] = useState<DataPoint[]>([]);
    const [lightHistory, setLightHistory] = useState<DataPoint[]>([]);
    const [soundHistory, setSoundHistory] = useState<DataPoint[]>([]);
    const [pressureHistory, setPressureHistory] = useState<DataPoint[]>([]);

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
            const humidity = data.sensors.dht11?.humidity ?? data.sensors.dht22?.humidity ?? 0;
            const gas = data.sensors.mq2?.value ?? data.sensors.mq2?.raw_value ?? 0;
            const light = data.sensors.ldr?.value ?? data.sensors.ldr?.light_level ?? 0;
            const sound = data.sensors.mic?.level ?? 0;
            const pressure = data.sensors.bmp180?.pressure ?? 0;

            setTempHistory((prev) => [...prev, { time: timeLabel, value: temp }].slice(-MAX_DATA_POINTS));
            setHumidityHistory((prev) => [...prev, { time: timeLabel, value: humidity }].slice(-MAX_DATA_POINTS));
            setGasHistory((prev) => [...prev, { time: timeLabel, value: gas }].slice(-MAX_DATA_POINTS));
            setLightHistory((prev) => [...prev, { time: timeLabel, value: light }].slice(-MAX_DATA_POINTS));
            setSoundHistory((prev) => [...prev, { time: timeLabel, value: sound }].slice(-MAX_DATA_POINTS));
            setPressureHistory((prev) => [...prev, { time: timeLabel, value: pressure }].slice(-MAX_DATA_POINTS));
        }
    }, [data]);

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

    // Sensor Values with safe defaults
    const s = data.sensors;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Sensor Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">Monitor 15 connected IoT sensors in real-time</p>
                </div>
                <Badge variant="success" pulse size="md">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Live Updates
                </Badge>
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
                                <p className="text-sm font-semibold text-white">15 Active</p>
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

            {/* Sensor Cards Grid */}
            <div>
                <h2 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Live Readings
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {/* 1. Ultraviolet/Distance */}
                    <MetricCard
                        title="Distance"
                        value={s.ultrasonic.distance_cm}
                        unit="cm"
                        icon={<Radar className="h-5 w-5" />}
                        iconColor="text-purple-400"
                        status="ok"
                        subtitle="HC-SR04"
                    />
                    {/* 2. DHT11 Temp */}
                    <MetricCard
                        title="Temperature"
                        value={s.dht11?.temp ?? s.dht22?.temperature ?? 0}
                        unit="°C"
                        icon={<Thermometer className="h-5 w-5" />}
                        iconColor="text-orange-400"
                        status="ok"
                        subtitle="DHT11 Sensor"
                    />
                    {/* 2. DHT11 Humidity */}
                    <MetricCard
                        title="Humidity"
                        value={s.dht11?.humidity ?? s.dht22?.humidity ?? 0}
                        unit="%"
                        icon={<Droplets className="h-5 w-5" />}
                        iconColor="text-blue-400"
                        status="ok"
                        subtitle="DHT11 Sensor"
                    />
                    {/* 3. MQ-3 Alcohol */}
                    <MetricCard
                        title="Alcohol Level"
                        value={s.mq3?.value ?? 0}
                        unit="raw"
                        icon={<Activity className="h-5 w-5" />}
                        iconColor="text-emerald-400"
                        status={(s.mq3?.value ?? 0) > 400 ? "warning" : "ok"}
                        subtitle="MQ-3 Alcohol"
                    />
                    {/* 4. MQ-2 Gas */}
                    <MetricCard
                        title="Gas/Smoke"
                        value={s.mq2?.value ?? 0}
                        unit="ppm"
                        icon={<Flame className="h-5 w-5" />}
                        iconColor="text-red-400"
                        status={(s.mq2?.value ?? 0) > 300 ? "warning" : "ok"}
                        subtitle="MQ-2 Sensor"
                    />
                    {/* 5. Hall Effect */}
                    <MetricCard
                        title="Magnetic Field"
                        value={s.hall?.active ? "DETECTED" : "Clear"}
                        icon={<Magnet className="h-5 w-5" />}
                        iconColor="text-indigo-400"
                        status={s.hall?.active ? "warning" : "ok"}
                        subtitle="Hall Sensor"
                    />
                    {/* 6. Mic/Sound */}
                    <MetricCard
                        title="Sound Level"
                        value={s.mic?.level ?? 0}
                        unit="dB"
                        icon={<Mic className="h-5 w-5" />}
                        iconColor="text-pink-400"
                        status="ok"
                        subtitle="Microphone"
                    />
                    {/* 7. IR Object */}
                    <MetricCard
                        title="IR Obstacle"
                        value={s.ir?.detected ? "DETECTED" : "Clear"}
                        icon={<Eye className="h-5 w-5" />}
                        iconColor="text-cyan-400"
                        status={s.ir?.detected ? "warning" : "ok"}
                        subtitle="IR Sensor"
                    />
                    {/* 8. Flame */}
                    <MetricCard
                        title="Flame Detect"
                        value={s.flame?.value ?? 0}
                        unit="val"
                        icon={<Flame className="h-5 w-5" />}
                        iconColor="text-orange-500"
                        status={(s.flame?.value ?? 1023) < 500 ? "error" : "ok"} // Usually Low = Flame
                        subtitle="Flame Sensor"
                    />
                    {/* 9. Proximity */}
                    <MetricCard
                        title="Proximity"
                        value={s.proximity?.active ? "NEAR" : "Far"}
                        icon={<Radar className="h-5 w-5" />}
                        iconColor="text-teal-400"
                        status={s.proximity?.active ? "warning" : "ok"}
                        subtitle="IR Proximity"
                    />
                    {/* 10. Pressure */}
                    <MetricCard
                        title="Pressure"
                        value={Math.round(s.bmp180?.pressure ?? 0)}
                        unit="Pa"
                        icon={<Gauge className="h-5 w-5" />}
                        iconColor="text-sky-400"
                        status="ok"
                        subtitle="BMP180 Baro"
                    />
                    {/* 11. Touch */}
                    <MetricCard
                        title="Touch Input"
                        value={s.touch?.active ? "TOUCHED" : "Released"}
                        icon={<Hand className="h-5 w-5" />}
                        iconColor="text-violet-400"
                        status={s.touch?.active ? "info" : "ok"}
                        subtitle="Capacitive"
                    />
                    {/* 12. LDR */}
                    <MetricCard
                        title="Light Level"
                        value={s.ldr?.value ?? 0}
                        unit="lux"
                        icon={<Sun className="h-5 w-5" />}
                        iconColor="text-yellow-400"
                        status="ok"
                        subtitle="LDR Module"
                    />
                    {/* 13. Tilt */}
                    <MetricCard
                        title="Tilt Status"
                        value={s.tilt?.active ? "TILTED" : "Level"}
                        icon={<Move className="h-5 w-5" />}
                        iconColor="text-rose-400"
                        status={s.tilt?.active ? "warning" : "ok"}
                        subtitle="Tilt Switch"
                    />
                    {/* 14. Heartbeat */}
                    <MetricCard
                        title="Pulse/Heart"
                        value={s.heartbeat?.value ?? 0}
                        unit="bpm"
                        icon={<Heart className="h-5 w-5" />}
                        iconColor="text-red-500"
                        status="ok"
                        subtitle="Heartbeat"
                    />
                    {/* 15. Joystick */}
                    <MetricCard
                        title="Joystick"
                        value={`X:${s.joystick?.x} Y:${s.joystick?.y}`}
                        icon={<Gamepad2 className="h-5 w-5" />}
                        iconColor="text-green-400"
                        status={s.joystick?.btn ? "info" : "ok"}
                        subtitle={s.joystick?.btn ? "Button Pressed" : "Idle"}
                    />
                </div>
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
                                unit="dB"
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
        </div>
    );
};
