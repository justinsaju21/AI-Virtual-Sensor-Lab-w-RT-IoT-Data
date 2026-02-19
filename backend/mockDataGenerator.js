const generateMockData = () => {
    const timestamp = new Date().toISOString();

    // Sine wave generator for smooth transitions
    const time = Date.now() / 1000;

    return {
        device_id: "virtual_lab_01",
        timestamp: timestamp,
        sensors: {
            ultrasonic: {
                distance_cm: parseFloat((50 + Math.sin(time) * 30).toFixed(1)),
                valid: true
            },
            dht11: {
                temp: parseFloat((24 + Math.sin(time * 0.5) * 2).toFixed(1)),
                humidity: parseFloat((60 + Math.sin(time * 0.3) * 10).toFixed(1))
            },
            mq3: {
                value: Math.floor(100 + Math.random() * 50)
            },
            mq2: {
                value: Math.floor(200 + Math.random() * 30),
                raw_value: Math.floor(200 + Math.random() * 30) // Backward compat
            },
            hall: {
                active: Math.sin(time * 2) > 0.8 // Occasional trigger
            },
            mic: {
                level: Math.floor(50 + Math.random() * 200 + (Math.sin(time * 5) > 0.9 ? 500 : 0)) // Spikes
            },
            ir: {
                detected: Math.sin(time * 0.2) > 0.5
            },
            flame: {
                value: Math.floor(10 + Math.random() * 20) // Mostly low
            },
            proximity: {
                active: Math.sin(time * 0.4) > 0.6
            },
            bmp180: {
                pressure: parseFloat((1013 + Math.sin(time * 0.1) * 2).toFixed(1)),
                altitude: parseFloat((100 + Math.sin(time * 0.1)).toFixed(1)),
                temp: parseFloat((24.5 + Math.sin(time * 0.5)).toFixed(1))
            },
            touch: {
                active: Math.sin(time) > 0.9
            },
            ldr: {
                value: Math.floor(500 + Math.sin(time * 0.5) * 300),
                light_level: Math.floor(500 + Math.sin(time * 0.5) * 300) // Backward compat
            },
            tilt: {
                active: Math.sin(time * 1.5) > 0.8
            },
            heartbeat: {
                value: Math.floor(500 + Math.sin(time * 10) * 100) // Pulse pattern
            },
            joystick: {
                x: Math.floor(512 + Math.sin(time) * 512),
                y: Math.floor(512 + Math.cos(time) * 512),
                btn: Math.random() > 0.95
            }
        }
    };
};

module.exports = { generateMockData };
