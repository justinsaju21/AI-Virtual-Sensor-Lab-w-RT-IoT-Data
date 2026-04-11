"use client";

import React from "react";
import { Card } from "./ui/Card";
import { SensorGroupConfig, SensorProperty } from "@/config/sensorGroups";

interface SensorGroupCardProps {
  group: SensorGroupConfig;
  sensorData: any;
  onClickSensor?: (sensorId: string, sensorName: string, sensorData: any) => void;
  isClickable?: boolean;
}

export const SensorGroupCard: React.FC<SensorGroupCardProps> = ({
  group,
  sensorData,
  onClickSensor,
  isClickable = true,
}) => {
  const IconComponent = group.icon;
  const properties = group.properties(sensorData);
  const isHardware = group.hardwareStatus?.(sensorData) ?? false;

  const handleClick = () => {
    if (isClickable && onClickSensor) {
      onClickSensor(group.id, group.name, sensorData);
    }
  };

  return (
    <>
      {properties.map((prop: SensorProperty) => {
        const isError = prop.status === 'error' || prop.isCritical;
        
        return (
          <Card
            key={prop.key}
            variant="default"
            className={isClickable ? "cursor-pointer border-white/5 bg-[#171e2e]/80 hover:bg-[#1a2333] transition-colors p-5 relative" : "border-white/5 bg-[#171e2e]/80 p-5 relative"}
            onClick={handleClick}
          >
            <div className="flex justify-between items-start mb-8">
              <div className={`h-10 w-10 rounded-xl bg-slate-800/50 flex items-center justify-center border border-white/5`}>
                <IconComponent strokeWidth={1.5} className={`h-5 w-5 ${group.iconColor}`} />
              </div>
              
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${isError ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isError ? 'bg-red-500' : 'bg-emerald-400'} animate-pulse`} />
                {isError ? "Error" : "Online"}
              </div>
            </div>

            <div className="flex flex-col mt-2">
              <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase mb-1">{prop.label}</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[28px] leading-none font-bold text-white tracking-tight">{prop.value}</span>
                {prop.unit && <span className="text-xs font-semibold text-slate-500">{prop.unit}</span>}
              </div>
              <span className="text-[11px] text-slate-600 font-medium mt-3">{group.name} ({isHardware ? 'Hardware' : 'Mock'})</span>
            </div>
          </Card>
        );
      })}
    </>
  );
};
