"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Activity,
    BarChart3,
    Beaker,
    Bot,
    ChevronLeft,
    ChevronRight,
    Droplets,
    Flame,
    Globe,
    GraduationCap,
    LayoutDashboard,
    Settings,
    Sun,
    Radar,
    Move,
    Mic,
    Magnet,
    Eye,
    Hand,
    Heart,
    Gauge,
    Gamepad2,
} from "lucide-react";

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
    const pathname = usePathname();

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/" },
    ];

    const sensors = [
        { icon: <ThermometerIcon />, label: "Temperature", href: "/sensors/temperature" },
        { icon: <Droplets size={18} />, label: "Humidity", href: "/sensors/humidity" },
        { icon: <Flame size={18} />, label: "Gas Sensor", href: "/sensors/gas" },
        { icon: <Activity size={18} />, label: "Alcohol (MQ3)", href: "/sensors/mq3" },
        { icon: <Sun size={18} />, label: "Light Sensor", href: "/sensors/light" },
        { icon: <Radar size={18} />, label: "Ultrasonic", href: "/sensors/ultrasonic" },
        { icon: <Move size={18} />, label: "Motion", href: "/sensors/motion" }, // PIR kept for existing page ref
        { icon: <Magnet size={18} />, label: "Hall Effect", href: "/sensors/hall" },
        { icon: <Mic size={18} />, label: "Sound", href: "/sensors/sound" },
        { icon: <Eye size={18} />, label: "IR Obstacle", href: "/sensors/ir" },
        { icon: <Flame size={18} />, label: "Flame", href: "/sensors/flame" },
        { icon: <Radar size={18} />, label: "Proximity", href: "/sensors/proximity" },
        { icon: <Gauge size={18} />, label: "Pressure", href: "/sensors/pressure" },
        { icon: <Hand size={18} />, label: "Touch", href: "/sensors/touch" },
        { icon: <Move size={18} />, label: "Tilt", href: "/sensors/tilt" },
        { icon: <Heart size={18} />, label: "Heartbeat", href: "/sensors/heartbeat" },
        { icon: <Gamepad2 size={18} />, label: "Joystick", href: "/sensors/joystick" },
    ];

    return (
        <aside
            className={`fixed top-0 left-0 z-40 h-screen flex flex-col border-r border-white/5 bg-slate-950/50 backdrop-blur-xl transition-all duration-300 ${collapsed ? "w-20" : "w-64"
                }`}
        >
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-white/5 px-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                        <Globe className="text-white" size={18} />
                    </div>
                    {!collapsed && (
                        <div>
                            <h1 className="font-bold text-white leading-none">VirtLab</h1>
                            <span className="text-[10px] text-slate-500 font-medium">IoT Sensor Platform</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6 custom-scrollbar">
                {/* Main Menu */}
                <div className="px-3">
                    <p className={`mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 ${collapsed ? "text-center" : ""}`}>
                        {collapsed ? "Main" : "Monitoring"}
                    </p>
                    <div className="space-y-1">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.href}
                                item={item}
                                isActive={pathname === item.href}
                                collapsed={collapsed}
                            />
                        ))}
                    </div>
                </div>

                {/* Sensors Menu */}
                <div className="px-3">
                    <p className={`mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 ${collapsed ? "text-center" : ""}`}>
                        {collapsed ? "Sen" : "Sensors"}
                    </p>
                    <div className="space-y-1">
                        {sensors.map((item) => (
                            <NavLink
                                key={item.href}
                                item={item}
                                isActive={pathname === item.href}
                                collapsed={collapsed}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Settings & Toggle */}
            <div className="border-t border-white/5 p-3">
                <NavLink
                    item={{ icon: <Settings size={20} />, label: "Settings", href: "/settings" }}
                    isActive={pathname === "/settings"}
                    collapsed={collapsed}
                />
                <button
                    onClick={onToggle}
                    className="mt-2 flex w-full items-center justify-center rounded-lg border border-white/5 bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                    {collapsed ? <ChevronRight size={16} /> : <div className="flex items-center gap-2 text-xs font-medium"><ChevronLeft size={16} /> <span>Collapse</span></div>}
                </button>
            </div>
        </aside>
    );
};

const NavLink = ({ item, isActive, collapsed }: { item: any; isActive: boolean; collapsed: boolean }) => (
    <Link
        href={item.href}
        className={`
      group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium 
      transition-all duration-200 relative overflow-hidden
      ${isActive
                ? "bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-transparent text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }
      ${collapsed ? "justify-center px-0" : ""}
    `}
    >
        {/* Active indicator */}
        {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full" />
        )}

        <span className={`relative z-10 ${isActive ? "text-cyan-400" : ""}`}>
            {item.icon}
        </span>

        {!collapsed && (
            <>
                <span className="relative z-10 truncate">{item.label}</span>
                {item.badge && (
                    <span className="ml-auto rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {item.badge}
                    </span>
                )}
            </>
        )}
    </Link>
);

const ThermometerIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
);
