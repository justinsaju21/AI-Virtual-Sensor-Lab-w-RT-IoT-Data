export interface SystemInfo {
    uptime_ms: number;
    version: string;
    wifi_rssi?: number;
    free_heap?: number;
    heap?: number;
    ip?: string;
}

export interface SensorData {
    device_id: string;
    timestamp: string;
    sensors: {
        ultrasonic: {
            distance_cm: number;
            valid?: boolean;
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
            stale?: boolean;
            isReal?: boolean;
        };
        mq3: {
            raw: number;
            value?: number;
            isReal?: boolean;
        };
        mq2: {
            raw: number;
            value?: number;
            raw_value?: number;
            isReal?: boolean;
        };
        hall: {
            active: boolean;
            isReal?: boolean;
        };
        sound: {
            analog: number;
            digital: boolean;
            isReal?: boolean;
        };
        mic?: {
            level: number;
            isReal?: boolean;
        };
        ir: {
            detected?: boolean;
            active: boolean;
            isReal?: boolean;
        };
        flame: {
            analog: number;
            digital?: boolean;
            value?: number;
            isReal?: boolean;
        };
        proximity: {
            active: boolean;
            isReal?: boolean;
        };
        pir: {
            active: boolean;
            isReal?: boolean;
        };
        bmp280: {
            pressure: number;
            temp: number;
            isReal?: boolean;
        };
        bmp180?: {
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
            raw: number;
            value?: number;
            light_level?: number;
            isReal?: boolean;
        };
        tilt: {
            active: boolean;
            isReal?: boolean;
        };
        max30102: {
            bpm: number;
            ir: number;
            isReal?: boolean;
        };
        heartbeat?: {
            value: number;
            isReal?: boolean;
        };
        thermistor: {
            temp: number;
            isReal?: boolean;
        };
        joystick: {
            x: number;
            y: number;
            btn?: boolean;
            button_pressed: boolean;
            isReal?: boolean;
        };
    };
    system: SystemInfo;
}
