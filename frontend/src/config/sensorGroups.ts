/**
 * Sensor Groups Configuration
 * Defines how sensors are grouped and displayed on the dashboard
 * Also ensures AI context awareness for sensor group interactions
 */

import {
  Thermometer,
  Droplets,
  Flame,
  Sun,
  Activity,
  Radar,
  Mic,
  Eye,
  Gauge,
  Hand,
  Heart,
  Move,
  Magnet,
  Gamepad2,
  LucideIcon,
} from "lucide-react";

export interface SensorProperty {
  key: string;
  label: string;
  value: any;
  unit?: string;
  status?: "success" | "ok" | "warning" | "error" | "info";
  isCritical?: boolean;
}

export interface SensorGroupConfig {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  properties: (data: any) => SensorProperty[];
  hardwareStatus?: (data: any) => boolean;
}

export const sensorGroups: SensorGroupConfig[] = [
  {
    id: "dht11",
    name: "DHT11",
    description: "Temperature & Humidity Sensor",
    icon: Thermometer,
    iconColor: "text-orange-400",
    properties: (s) => [
      {
        key: "temp",
        label: "Temperature",
        value: s.dht11?.temp?.toFixed(1) ?? "--",
        unit: "°C",
        status: "ok",
      },
      {
        key: "humidity",
        label: "Humidity",
        value: s.dht11?.humidity?.toFixed(1) ?? "--",
        unit: "%",
        status: "ok",
      },
    ],
    hardwareStatus: (s) => s.dht11?.isReal ?? false,
  },

  {
    id: "bmp280",
    name: "BMP280",
    description: "Pressure & Temperature Sensor",
    icon: Gauge,
    iconColor: "text-sky-400",
    properties: (s) => [
      {
        key: "pressure",
        label: "Pressure",
        value: Math.round(s.bmp280?.pressure ?? 0),
        unit: "hPa",
        status: "ok",
      },
      {
        key: "temp",
        label: "Temperature",
        value: s.bmp280?.temp?.toFixed(1) ?? "--",
        unit: "°C",
        status: "ok",
      },
    ],
    hardwareStatus: (s) => s.bmp280?.isReal ?? false,
  },

  {
    id: "mq2",
    name: "MQ2",
    description: "Gas & Smoke Sensor",
    icon: Flame,
    iconColor: "text-red-400",
    properties: (s) => [
      {
        key: "gas",
        label: "Gas/Smoke Level",
        value: s.mq2?.raw ?? "--",
        unit: "ppm",
        status: (s.mq2?.raw ?? 0) > 300 ? "warning" : "ok",
        isCritical: (s.mq2?.raw ?? 0) > 300,
      },
    ],
    hardwareStatus: (s) => s.mq2?.isReal ?? false,
  },

  {
    id: "mq3",
    name: "MQ3",
    description: "Alcohol Sensor",
    icon: Activity,
    iconColor: "text-emerald-400",
    properties: (s) => [
      {
        key: "alcohol",
        label: "Alcohol Level",
        value: s.mq3?.raw ?? "--",
        unit: "raw",
        status: (s.mq3?.raw ?? 0) > 400 ? "warning" : "ok",
      },
    ],
    hardwareStatus: (s) => s.mq3?.isReal ?? false,
  },

  {
    id: "ultrasonic",
    name: "HC-SR04",
    description: "Ultrasonic Distance Sensor",
    icon: Radar,
    iconColor: "text-purple-400",
    properties: (s) => {
      const distance = s.ultrasonic?.distance_cm ?? 0;
      return [
        {
          key: "distance",
          label: "Distance",
          value: distance < 0 ? "N/A" : distance.toFixed(1),
          unit: "cm",
          status: distance < 0 ? "error" : "ok",
        },
      ];
    },
    hardwareStatus: (s) => s.ultrasonic?.isReal ?? false,
  },

  {
    id: "sound",
    name: "Sound Sensor",
    description: "Microphone & Sound Level",
    icon: Mic,
    iconColor: "text-pink-400",
    properties: (s) => [
      {
        key: "level",
        label: "Sound Level",
        value: s.sound?.analog ?? "--",
        unit: "raw",
        status: "ok",
      },
      {
        key: "detected",
        label: "Noise Detected",
        value: s.sound?.digital ? "YES" : "NO",
        status: s.sound?.digital ? "warning" : "ok",
      },
    ],
    hardwareStatus: (s) => s.sound?.isReal ?? false,
  },

  {
    id: "flame",
    name: "Flame Sensor",
    description: "Fire Detection Sensor",
    icon: Flame,
    iconColor: "text-orange-500",
    properties: (s) => [
      {
        key: "intensity",
        label: "Flame Intensity",
        value: s.flame?.analog ?? "--",
        unit: "val",
        status: (s.flame?.analog ?? 1023) < 500 ? "error" : "ok",
        isCritical: (s.flame?.analog ?? 1023) < 500,
      },
      {
        key: "detected",
        label: "Flame Detected",
        value: s.flame?.digital ? "YES" : "NO",
        status: s.flame?.digital ? "error" : "ok",
      },
    ],
    hardwareStatus: (s) => s.flame?.isReal ?? false,
  },

  {
    id: "ldr",
    name: "LDR",
    description: "Light Sensor",
    icon: Sun,
    iconColor: "text-yellow-400",
    properties: (s) => [
      {
        key: "brightness",
        label: "Light Level",
        value: s.ldr?.raw ?? "--",
        unit: "raw",
        status: "ok",
      },
    ],
    hardwareStatus: (s) => s.ldr?.isReal ?? false,
  },

  {
    id: "ir",
    name: "IR Sensor",
    description: "Infrared Obstacle Detection",
    icon: Eye,
    iconColor: "text-cyan-400",
    properties: (s) => [
      {
        key: "obstacle",
        label: "Obstacle Status",
        value: s.ir?.active || s.ir?.detected ? "DETECTED" : "Clear",
        status: s.ir?.active || s.ir?.detected ? "warning" : "ok",
      },
    ],
    hardwareStatus: (s) => s.ir?.isReal ?? false,
  },

  {
    id: "pir",
    name: "PIR Sensor",
    description: "Motion & Presence Detection",
    icon: Move,
    iconColor: "text-lime-400",
    properties: (s) => [
      {
        key: "motion",
        label: "Motion Detected",
        value: s.pir?.active ? "DETECTED" : "Clear",
        status: s.pir?.active ? "warning" : "ok",
      },
    ],
    hardwareStatus: (s) => s.pir?.isReal ?? false,
  },

  {
    id: "proximity",
    name: "Proximity Sensor",
    description: "Object Proximity Detection",
    icon: Radar,
    iconColor: "text-teal-400",
    properties: (s) => [
      {
        key: "distance",
        label: "Proximity Status",
        value: s.proximity?.active ? "NEAR" : "Far",
        status: s.proximity?.active ? "warning" : "ok",
      },
    ],
    hardwareStatus: (s) => s.proximity?.isReal ?? false,
  },

  {
    id: "hall",
    name: "Hall Effect",
    description: "Magnetic Field Detection",
    icon: Magnet,
    iconColor: "text-indigo-400",
    properties: (s) => [
      {
        key: "field",
        label: "Magnetic Field",
        value: s.hall?.active ? "DETECTED" : "Clear",
        status: s.hall?.active ? "warning" : "ok",
      },
    ],
    hardwareStatus: (s) => s.hall?.isReal ?? false,
  },

  {
    id: "touch",
    name: "Touch Sensor",
    description: "Capacitive Touch Input",
    icon: Hand,
    iconColor: "text-violet-400",
    properties: (s) => [
      {
        key: "state",
        label: "Touch Status",
        value: s.touch?.active ? "TOUCHED" : "Released",
        status: s.touch?.active ? "info" : "ok",
      },
    ],
    hardwareStatus: (s) => s.touch?.isReal ?? false,
  },

  {
    id: "tilt",
    name: "Tilt Sensor",
    description: "Orientation & Angle Detection",
    icon: Move,
    iconColor: "text-rose-400",
    properties: (s) => [
      {
        key: "angle",
        label: "Tilt Status",
        value: s.tilt?.active ? "TILTED" : "Level",
        status: s.tilt?.active ? "warning" : "ok",
      },
    ],
    hardwareStatus: (s) => s.tilt?.isReal ?? false,
  },

  {
    id: "max30102",
    name: "MAX30102",
    description: "Pulse Oximeter & Heart Rate",
    icon: Heart,
    iconColor: "text-red-500",
    properties: (s) => [
      {
        key: "bpm",
        label: "Heart Rate",
        value: s.max30102?.bpm ?? "--",
        unit: "bpm",
        status: "ok",
      },
      {
        key: "ir",
        label: "IR Level",
        value: s.max30102?.ir ?? "--",
        unit: "raw",
        status: "ok",
      },
    ],
    hardwareStatus: (s) => s.max30102?.isReal ?? false,
  },

  {
    id: "thermistor",
    name: "Thermistor",
    description: "Body Temperature (NTC Probe)",
    icon: Thermometer,
    iconColor: "text-orange-300",
    properties: (s) => [
      {
        key: "temp",
        label: "Body Temperature",
        value: s.thermistor?.temp?.toFixed(1) ?? "--",
        unit: "°C",
        status: "ok",
      },
    ],
    hardwareStatus: (s) => s.thermistor?.isReal ?? false,
  },

  {
    id: "joystick",
    name: "Joystick",
    description: "Analog Input Controller",
    icon: Gamepad2,
    iconColor: "text-green-400",
    properties: (s) => [
      {
        key: "x",
        label: "X Position",
        value: s.joystick?.x ?? "--",
        unit: "pos",
        status: "ok",
      },
      {
        key: "y",
        label: "Y Position",
        value: s.joystick?.y ?? "--",
        unit: "pos",
        status: "ok",
      },
      {
        key: "button",
        label: "Button",
        value: s.joystick?.button_pressed || s.joystick?.btn ? "PRESSED" : "Released",
        status: s.joystick?.button_pressed ? "info" : "ok",
      },
    ],
    hardwareStatus: (s) => s.joystick?.isReal ?? false,
  },
];

/**
 * Group sensors by category for better organization
 */
export enum SensorCategory {
  ENVIRONMENTAL = "ENVIRONMENTAL",
  DETECTION = "DETECTION",
  ANALOG = "ANALOG",
  INPUT = "INPUT",
  MEDICAL = "MEDICAL",
}

export const sensorCategories = {
  [SensorCategory.ENVIRONMENTAL]: [
    "dht11",
    "bmp280",
    "ldr",
    "thermistor",
  ],
  [SensorCategory.DETECTION]: [
    "flame",
    "ir",
    "pir",
    "proximity",
    "ultrasonic",
  ],
  [SensorCategory.ANALOG]: ["mq2", "mq3", "sound"],
  [SensorCategory.INPUT]: ["touch", "tilt", "hal", "joystick"],
  [SensorCategory.MEDICAL]: ["max30102"],
};

export const getCategoryLabel = (category: SensorCategory): string => {
  const labels: Record<SensorCategory, string> = {
    [SensorCategory.ENVIRONMENTAL]: "Environmental",
    [SensorCategory.DETECTION]: "Detection & Safety",
    [SensorCategory.ANALOG]: "Gas & Audio",
    [SensorCategory.INPUT]: "Input & Motion",
    [SensorCategory.MEDICAL]: "Medical",
  };
  return labels[category];
};
