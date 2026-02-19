"use client";

import React from "react";
import { FaultType } from "@/hooks/useFaultInjector";
import { FilterType } from "@/hooks/useSignalProcessing";
import { Settings, Activity, Zap, Layers } from "lucide-react";

interface TestingControlPanelProps {
    faultType: FaultType;
    setFault: (f: any) => void;
    filterType: FilterType;
    setFilter: (f: any) => void;
    calibrationOffset: number;
    setCalibrationOffset: (n: number) => void;
}

export const TestingControlPanel: React.FC<TestingControlPanelProps> = ({
    faultType,
    setFault,
    filterType,
    setFilter,
    calibrationOffset,
    setCalibrationOffset
}) => {
    return (
        <div className="grid gap-4 p-4 rounded-xl bg-slate-900 border border-indigo-500/30">
            <div className="flex items-center gap-2 mb-2">
                <Settings className="text-indigo-400" size={18} />
                <h3 className="font-semibold text-indigo-100">Testing & Signal Analysis (QA Mode)</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* Fault Injection */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400 uppercase flex items-center gap-1">
                        <Zap size={12} /> Fault Injection (Simulate Defects)
                    </label>
                    <select
                        value={faultType}
                        onChange={(e) => setFault({ type: e.target.value })}
                        className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="none">Normal Operation</option>
                        <option value="stuck-at-zero">Stuck-at-Low (0)</option>
                        <option value="stuck-at-high">Stuck-at-High (Max)</option>
                        <option value="open-circuit">Open Circuit (NaN)</option>
                        <option value="noise-burst">High Noise Burst</option>
                    </select>
                </div>

                {/* DSP / Filtering */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400 uppercase flex items-center gap-1">
                        <Activity size={12} /> Signal Processing
                    </label>
                    <select
                        value={filterType}
                        onChange={(e) => setFilter({ type: e.target.value, windowSize: 5 })}
                        className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="none">Raw Data</option>
                        <option value="moving-average">Moving Average Filter</option>
                        <option value="threshold">Noise Gate / Threshold</option>
                    </select>
                </div>

                {/* Calibration */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400 uppercase flex items-center gap-1">
                        <Layers size={12} /> Calibration Offset
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="-10"
                            max="10"
                            step="0.5"
                            value={calibrationOffset}
                            onChange={(e) => setCalibrationOffset(parseFloat(e.target.value))}
                            className="flex-1 accent-indigo-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-mono text-indigo-400 w-12 text-right">
                            {calibrationOffset > 0 ? "+" : ""}{calibrationOffset}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
