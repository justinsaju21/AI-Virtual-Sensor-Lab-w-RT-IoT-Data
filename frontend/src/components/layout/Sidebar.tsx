"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Activity,
    ChevronLeft,
    ChevronRight,
    Droplets,
    Flame,
    Globe,
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
    Thermometer,
} from "lucide-react";
import { sensorGroups } from "@/config/sensorGroups";

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
    const pathname = usePathname();

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/" },
    ];

    // Map sensor IDs to their routes (using kebab-case for URLs)
    const sensorRouteMap: Record<string, string> = {
        dht11: "/sensors/dht11",
        bmp280: "/sensors/bmp280",
        mq2: "/sensors/mq2",
        mq3: "/sensors/mq3",
        ultrasonic: "/sensors/ultrasonic",
        sound: "/sensors/sound",
        flame: "/sensors/flame",
        ldr: "/sensors/ldr",
        ir: "/sensors/ir",
        pir: "/sensors/pir",
        proximity: "/sensors/proximity",
        hall: "/sensors/hall",
        touch: "/sensors/touch",
        max30102: "/sensors/max30102",
        thermistor: "/sensors/thermistor",
        tilt: "/sensors/tilt",
        joystick: "/sensors/joystick",
    };

    // Generate sensors from sensorGroups with proper routing
    const sensors = sensorGroups.map((sensor) => {
        // Get the icon component from sensorGroups
        const IconComponent = sensor.icon;
        return {
            icon: <IconComponent size={18} />,
            label: sensor.name,
            href: sensorRouteMap[sensor.id] || `/sensors/${sensor.id}`,
            sensorId: sensor.id,
        };
    });

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
