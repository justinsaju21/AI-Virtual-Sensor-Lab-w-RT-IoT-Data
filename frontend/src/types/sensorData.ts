export interface SystemInfo {
    uptime_ms: number;
    version: string;
    wifi_rssi?: number;
    free_heap?: number;
}

export interface SensorData {
    device_id: string;
    timestamp: string;
    sensors: {
        ultrasonic: {
            distance_cm: number;
            valid: boolean;
            isReal?: boolean;
        };
        dht22?: {
            temperature: number;
            humidity: number;
            isReal?: boolean;
        };
        dht11: {
            temp: number;
            humidity: number;
            isReal?: boolean;
        };
        mq3: {
            value: number;
            isReal?: boolean;
        };
        mq2: {
            value: number;
            raw_value?: number;
            isReal?: boolean;
        };
        hall: {
            active: boolean;
            isReal?: boolean;
        };
        mic: {
            level: number;
            isReal?: boolean;
        };
        ir: {
            detected: boolean;
            isReal?: boolean;
        };
        flame: {
            value: number;
            isReal?: boolean;
        };
        proximity: {
            active: boolean;
            isReal?: boolean;
        };
        bmp180: {
            pressure: number;
            altitude: number;
            temp: number;
            isReal?: boolean;
        };
        touch: {
            active: boolean;
            isReal?: boolean;
        };
        ldr: {
            value: number;
            light_level?: number;
            isReal?: boolean;
        };
        tilt: {
            active: boolean;
            isReal?: boolean;
        };
        heartbeat: {
            value: number;
            isReal?: boolean;
        };
        joystick: {
            x: number;
            y: number;
            btn: boolean;
            isReal?: boolean;
        };
    };
    system: SystemInfo;
}
