const generateMockData = () => {
    const timestamp = new Date().toISOString();

    // Sine wave generator for smooth transitions
    const time = Date.now() / 1000;

    return {
        device_id: "virtual_lab_01",
        timestamp: timestamp,
        sensors: {
            ultrasonic: {
                // Add +/- 1cm of jitter
                distance_cm: parseFloat((50 + Math.sin(time) * 30 + (Math.random() * 2 - 1)).toFixed(1)),
                valid: true
            },
            dht11: {
                // Temperature changes slowly, humidity has slight jitter
                temp: parseFloat((24 + Math.sin(time * 0.1) * 2 + (Math.random() * 0.2)).toFixed(1)),
                humidity: parseFloat((60 + Math.sin(time * 0.1) * 10 + (Math.random() * 1)).toFixed(1))
            },
            mq3: {
                // Alcohol sensor has natural baseline drift
                value: Math.floor(150 + Math.sin(time * 0.05) * 20 + Math.random() * 10)
            },
            mq2: {
                // Gases have slight rapid noise
                value: Math.floor(220 + Math.sin(time * 0.05) * 30 + Math.random() * 15),
                raw_value: Math.floor(220 + Math.sin(time * 0.05) * 30 + Math.random() * 15)
            },
            hall: {
                // Digital switch, occasional trigger, holding state briefly
                active: Math.sin(time * 1.2) > 0.8
            },
            mic: {
                // Background noise level + random sharp acoustic spikes
                level: Math.floor(40 + Math.random() * 30 + (Math.random() > 0.95 ? 400 + Math.random() * 300 : 0))
            },
            ir: {
                detected: Math.sin(time * 0.5) > 0.7
            },
            flame: {
                // Very clean baseline unless there is a fire
                value: Math.floor(5 + Math.random() * 5 + (Math.sin(time * 0.2) > 0.9 ? 800 : 0))
            },
            proximity: {
                active: Math.sin(time * 0.6) > 0.8
            },
            bmp180: {
                // Highly stable, extremely tiny pressure drift
                pressure: parseFloat((1013.25 + Math.sin(time * 0.01) * 2 + (Math.random() * 0.05 - 0.025)).toFixed(2)),
                altitude: parseFloat((100 + Math.sin(time * 0.01) * 10).toFixed(1)),
                temp: parseFloat((24.5 + Math.random() * 0.1).toFixed(1))
            },
            touch: {
                active: Math.sin(time * 0.8) > 0.85
            },
            ldr: {
                // Continuous light level with slight natural flicker
                value: Math.floor(600 + Math.sin(time * 0.1) * 300 + (Math.random() * 20 - 10)),
                light_level: Math.floor(600 + Math.sin(time * 0.1) * 300 + (Math.random() * 20 - 10))
            },
            tilt: {
                active: Math.sin(time * 0.3) > 0.6
            },
            heartbeat: {
                // Pulse oximeter PPG wave simulation
                value: Math.floor(500 + Math.sin(time * Math.PI * 2 * 1.2) * 200 + Math.random() * 20)
            },
            joystick: {
                // Potentiometer deadzone variance
                x: Math.floor(512 + Math.sin(time * 0.4) * 500 + (Math.random() * 6 - 3)),
                y: Math.floor(512 + Math.cos(time * 0.4) * 500 + (Math.random() * 6 - 3)),
                btn: Math.random() > 0.98
            }
        }
    };
};

module.exports = { generateMockData };
