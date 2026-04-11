"use client";

import React, { useMemo } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { DHT11View } from "./views/DHT11View";
import { MQ2View } from "./views/MQ2View";
import { UltrasonicView } from "./views/UltrasonicView";
import { sensorGroups } from "@/config/sensorGroups";

interface SensorDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    sensorId: string | null;
    sensorData: any;
    onNext: () => void;
    onPrev: () => void;
}

export const SensorDetailModal: React.FC<SensorDetailModalProps> = ({
    isOpen,
    onClose,
    sensorId,
    sensorData,
    onNext,
    onPrev,
}) => {
    const currentSensorGroup = useMemo(() => {
        return sensorGroups.find(g => g.id === sensorId);
    }, [sensorId]);

    if (!isOpen || !sensorId || !currentSensorGroup) return null;

    const renderSensorView = () => {
        switch (sensorId) {
            case "dht11":
                return (
                    <DHT11View
                        data={{
                            temp: sensorData.dht11?.temp ?? 0,
                            humidity: sensorData.dht11?.humidity ?? 0,
                            stale: !sensorData.dht11?.temp,
                        }}
                    />
                );
            case "mq2":
                return (
                    <MQ2View
                        data={{
                            raw: sensorData.mq2?.raw ?? 0,
                            isReal: sensorData.mq2?.isReal,
                        }}
                    />
                );
            case "ultrasonic":
                return (
                    <UltrasonicView
                        data={{
                            distance_cm: sensorData.ultrasonic?.distance_cm ?? 0,
                            isReal: sensorData.ultrasonic?.isReal,
                        }}
                    />
                );
            default:
                return (
                    <div className="text-center py-8 text-slate-400">
                        <p>Detailed view coming soon for {currentSensorGroup.name}</p>
                        <p className="text-xs mt-2">Check back for more sensor visualizations</p>
                    </div>
                );
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-slate-950 border border-white/10 rounded-2xl shadow-2xl max-w-4xl w-full my-8">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-slate-950/95 backdrop-blur z-10">
                        <h2 className="text-xl font-bold text-white">{currentSensorGroup.name} - Detailed View</h2>

                        <div className="flex items-center gap-2">
                            {/* Navigation */}
                            <button
                                onClick={onPrev}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                title="Previous sensor"
                            >
                                <ChevronLeft className="h-5 w-5 text-slate-400" />
                            </button>

                            <button
                                onClick={onNext}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                title="Next sensor"
                            >
                                <ChevronRight className="h-5 w-5 text-slate-400" />
                            </button>

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors ml-2"
                                title="Close (ESC)"
                            >
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                        {renderSensorView()}
                    </div>
                </div>
            </div>
        </>
    );
};
