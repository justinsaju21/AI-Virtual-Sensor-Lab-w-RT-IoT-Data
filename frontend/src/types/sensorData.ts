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
        };
        dht22?: { // Kept for backward compat compatibility if needed
            temperature: number;
            humidity: number;
        };
        dht11: {
            temp: number;
            humidity: number;
        };
        mq3: {
            value: number;
        };
        mq2: {
            value: number;
            raw_value?: number;
        };
        hall: {
            active: boolean;
        };
        mic: {
            level: number;
        };
        ir: {
            detected: boolean;
        };
        flame: {
            value: number;
        };
        proximity: {
            active: boolean;
        };
        bmp180: {
            pressure: number;
            altitude: number;
            temp: number;
        };
        touch: {
            active: boolean;
        };
        ldr: {
            value: number;
            light_level?: number;
        };
        tilt: {
            active: boolean;
        };
        heartbeat: {
            value: number;
        };
        joystick: {
            x: number;
            y: number;
            btn: boolean;
        };
    };
    system: SystemInfo;
}
