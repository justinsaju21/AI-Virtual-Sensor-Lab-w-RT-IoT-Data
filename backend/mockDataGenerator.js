const generateMockData = () => {
    const timestamp = new Date().toISOString();

    // Sine wave generator for smooth transitions
    const time = Date.now() / 1000;

    return {
        device_id: "mega_node_01",
        timestamp: timestamp,
        sensors: {
            /* ultrasonic: {
                distance_cm: parseFloat((50 + Math.sin(time) * 30 + (Math.random() * 2 - 1)).toFixed(1)),
                isReal: false
            }, */
            dht11: {
                temp: parseFloat((24 + Math.sin(time * 0.1) * 2 + (Math.random() * 0.2)).toFixed(1)),
                humidity: parseFloat((60 + Math.sin(time * 0.1) * 10 + (Math.random() * 1)).toFixed(1)),
                isReal: false
            },
            mq3: {
                raw: Math.floor(150 + Math.sin(time * 0.05) * 20 + Math.random() * 10),
                isReal: false
            },
            mq2: {
                raw: Math.floor(220 + Math.sin(time * 0.05) * 30 + Math.random() * 15),
                isReal: false
            },
            hall: {
                active: Math.sin(time * 1.2) > 0.8,
                isReal: false
            },
            sound: {
                analog: Math.floor(40 + Math.random() * 30 + (Math.random() > 0.95 ? 400 + Math.random() * 300 : 0)),
                digital: false,
                isReal: false
            },
            ir: {
                active: Math.sin(time * 0.5) > 0.7,
                isReal: false
            },
            flame: {
                analog: Math.floor(5 + Math.random() * 5 + (Math.sin(time * 0.2) > 0.9 ? 800 : 0)),
                digital: false,
                isReal: false
            },
            pir: {
                active: Math.sin(time * 1.5) > 0.8,
                isReal: false
            },
            /* proximity: {
                active: Math.sin(time * 0.6) > 0.8,
                isReal: false
            }, */
            bmp280: {
                pressure: parseFloat((1013.25 + Math.sin(time * 0.01) * 2 + (Math.random() * 0.05 - 0.025)).toFixed(2)),
                temp: parseFloat((24.5 + Math.random() * 0.1).toFixed(1)),
                isReal: false
            },
            touch: {
                active: Math.sin(time * 0.8) > 0.85,
                isReal: false
            },
            ldr: {
                raw: Math.floor(600 + Math.sin(time * 0.1) * 300 + (Math.random() * 20 - 10)),
                isReal: false
            },
            tilt: {
                active: Math.sin(time * 0.3) > 0.6,
                isReal: false
            },
            max30102: {
                bpm: Math.floor(70 + Math.sin(time * 0.1) * 5 + Math.random() * 2),
                ir: 50000,
                isReal: false
            },
            thermistor: {
                temp: parseFloat((25 + Math.sin(time * 0.05) * 3 + Math.random() * 0.5).toFixed(1)),
                isReal: false
            },
            joystick: {
                x: Math.floor(512 + Math.sin(time * 0.4) * 500 + (Math.random() * 6 - 3)),
                y: Math.floor(512 + Math.cos(time * 0.4) * 500 + (Math.random() * 6 - 3)),
                button_pressed: Math.random() > 0.98,
                isReal: false
            }
        }
    };
};

module.exports = { generateMockData };
