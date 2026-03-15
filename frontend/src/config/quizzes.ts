export interface Question {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export const SENSOR_QUIZZES: Record<string, Question[]> = {
    "flame": [
        {
            question: "Why does the flame sensor use a black epoxy lens over the photodiode?",
            options: [
                "To make the sensor look professional.",
                "To act as a daylight blocking filter — only passing the 760nm–1100nm IR band from flames.",
                "To focus visible light like a magnifying glass.",
                "To protect the diode from heat damage."
            ],
            correctIndex: 1,
            explanation: "The black epoxy blocks visible sunlight and only lets through the specific Infrared (IR) wavelengths emitted by fire."
        },
        {
            question: "Why is the flame sensor better for rapid detection than a temperature sensor?",
            options: [
                "It uses Bluetooth for lower latency.",
                "It detects light at the speed of light from meters away, without needing physical contact with hot air.",
                "It has a larger sensing range than 1 meter.",
                "Temperature sensors cannot work without a battery."
            ],
            correctIndex: 1,
            explanation: "IR radiation travels at the speed of light, whereas thermal sensors require hot air to physically convect and touch the sensor body."
        },
        {
            question: "What does a LOW output on the digital pin (DO) indicate?",
            options: [
                "The sensor is powered off.",
                "No flame has been detected.",
                "A flame exceeding the threshold has been detected.",
                "The I²C connection was lost."
            ],
            correctIndex: 2,
            explanation: "The LM393 comparator outputs an inverted logic LOW (0V) when the threshold is crossed."
        }
    ],
    "gas": [
        {
            question: "Why does the MQ-2 get physically hot when powered on?",
            options: [
                "Too much supply voltage.",
                "Internal heater required for the chemical SnO₂ reaction to occur rapidly.",
                "It is short-circuiting.",
                "To evaporate ambient humidity."
            ],
            correctIndex: 1,
            explanation: "The Tin Dioxide (SnO2) sensing layer must be heated to ~300°C for the gas molecules to physically react with the surface."
        },
        {
            question: "What element changes its electrical property based on gas concentration?",
            options: [
                "A Photodiode",
                "A Piezoelectric crystal",
                "Tin Dioxide (SnO₂) sensing resistor",
                "A Hall Effect transistor"
            ],
            correctIndex: 2,
            explanation: "MQ series sensors are chemiresistors dependent on the semiconductor properties of Tin Dioxide."
        },
        {
            question: "Why is an ADC needed for the MQ-2 sensor?",
            options: [
                "Because it communicates over I²C.",
                "Its output is a fluctuating continuous voltage, not a simple 1 or 0.",
                "Because it requires 5V logic levels.",
                "To convert digital data to radio frequency."
            ],
            correctIndex: 1,
            explanation: "The sensor provides an analog voltage between 0-5V. An Analog-to-Digital Converter converts this continuously variable voltage into a numeric value (0-1023)."
        }
    ],
    "hall": [
        {
            question: "What fundamental force causes the Hall Voltage in a Hall Effect sensor?",
            options: [
                "Gravitational force on electrons.",
                "The Lorentz force deflecting moving electrons sideways in a magnetic field.",
                "Capacitive coupling between the magnet and semiconductor.",
                "Thermal expansion of the sensing crystal."
            ],
            correctIndex: 1,
            explanation: "The Lorentz force curves the path of moving electrons, causing them to pool on one side of the semiconductor and generating a voltage difference."
        },
        {
            question: "What analog ADC value indicates no magnetic field present?",
            options: [
                "0 (0V)",
                "1023 (5V)",
                "~512 -- centered resting voltage at VCC/2.",
                "337 (1.65V)"
            ],
            correctIndex: 2,
            explanation: "A linear Hall sensor outputs half the supply voltage (2.5V or an ADC of ~512) when at rest to allow the voltage to swing up OR down depending on the magnetic pole."
        },
        {
            question: "How can you identify which magnetic pole is approaching using the analog output?",
            options: [
                "North gives LOW digital output; South gives HIGH.",
                "Hall sensors only detect presence, not polarity.",
                "Analog rises above 512 for one pole and falls below 512 for the opposite pole.",
                "North pole makes the indicator LED flash faster."
            ],
            correctIndex: 2,
            explanation: "The Hall voltage polarity inverts depending on the direction of the magnetic field lines. This is why analog readings swing in opposite directions from the 512 center."
        }
    ],
    "heartbeat": [
        {
            question: "What medical measurement principle does the MAX30102 rely upon?",
            options: [
                "Electrocardiography (ECG)",
                "Photoplethysmography (PPG)",
                "Capnography",
                "Piezoresistance"
            ],
            correctIndex: 1,
            explanation: "Photoplethysmography uses optical light reflection to measure volumetric changes in blood flow."
        },
        {
            question: "Why does the sensor use two different LEDs (Red + Infrared)?",
            options: [
                "To look cool in the dark.",
                "Oxygenated blood absorbs IR differently than deoxygenated blood absorbs Red — enabling SpO₂ calculation.",
                "Red measures heart rate, IR measures temperature.",
                "To penetrate bone and muscle."
            ],
            correctIndex: 1,
            explanation: "The ratio of red vs infrared light absorbed by the blood allows the sensor to calculate Blood Oxygen Saturation (SpO2)."
        },
        {
            question: "If BPM values are completely erratic, what is the most likely physical cause?",
            options: [
                "Wrong I²C address.",
                "Pressing too hard on the sensor, cutting off capillary blood flow.",
                "5V logic instead of 3.3V.",
                "The person has no pulse."
            ],
            correctIndex: 1,
            explanation: "Applying pressure squeezes the blood out of the capillary bed in the finger, destroying the optical signal."
        }
    ],
    "humidity": [
        {
            question: "How does the DHT11 physically measure changes in humidity?",
            options: [
                "By measuring air pressure.",
                "Moisture-absorbing substrate where capacitance changes with water content.",
                "Bouncing ultrasonic waves off water molecules.",
                "Using a tiny internal fan."
            ],
            correctIndex: 1,
            explanation: "A capacitive humidity sensor sandwiches a moisture-retaining layer between two electrodes. As it absorbs water from the air, its electrical capacitance changes."
        },
        {
            question: "What is the maximum polling rate for the DHT11?",
            options: [
                "50 times per second (50 Hz)",
                "10 times per second (10 Hz)",
                "Once every 2 seconds (0.5 Hz)",
                "Once per minute"
            ],
            correctIndex: 2,
            explanation: "The internal 8-bit microcontroller inside the DHT11 requires almost 2 seconds to sample, calculate, and prepare the 40-bit data stream."
        },
        {
            question: "Which communication protocol does the DHT11 use?",
            options: [
                "I²C",
                "SPI",
                "Analog Voltage",
                "Proprietary Single-Wire Digital Protocol"
            ],
            correctIndex: 3,
            explanation: "It uses a custom time-based digital protocol on a single wire, requiring microsecond-level timing from the Arduino to read properly."
        }
    ],
    "ir": [
        {
            question: "How does the IR Obstacle sensor fundamentally detect an object?",
            options: [
                "It listens for the echo of ultrasonic sound.",
                "It waits for body heat.",
                "It shoots an IR beam and waits for it to reflect back into the receiver.",
                "It measures changes in air capacitance."
            ],
            correctIndex: 2,
            explanation: "It is an active optical sensor that emits its own infrared light and monitors for reflections bouncing off nearby objects."
        },
        {
            question: "What is the primary cause of 'Sunlight Blindness'?",
            options: [
                "Sunlight makes objects too hot.",
                "Sunlight contains massive IR radiation that floods the dark receiver diode.",
                "Sunlight melts the plastic lenses.",
                "UV rays disrupt the I²C bus."
            ],
            correctIndex: 1,
            explanation: "The sun is an enormous source of broadband infrared radiation which overpowers the tiny reflection from the sensor's own LED."
        },
        {
            question: "Which object would be detected from the farthest distance?",
            options: [
                "A piece of flat white paper.",
                "A piece of matte black felt.",
                "A block of completely clear glass.",
                "A puff of grey smoke."
            ],
            correctIndex: 0,
            explanation: "Light colors, especially shiny or flat white surfaces, reflect the highest percentage of infrared light (high Albedo). Matte black absorbs the IR leaving no echo."
        }
    ],
    "joystick": [
        {
            question: "What fundamental component creates the X/Y coordinate values in an analog joystick?",
            options: [
                "An optical camera.",
                "Two independent potentiometers (variable resistors) mounted 90° apart.",
                "A tiny accelerometer chip.",
                "Four digital pushbutton switches."
            ],
            correctIndex: 1,
            explanation: "Moving the joystick mechanically turns the wiper blades inside two rotary potentiometers, acting as physical voltage dividers."
        },
        {
            question: "When a 5V joystick is perfectly centered, what ADC value should the Arduino report?",
            options: [
                "1023",
                "0",
                "512 (~2.5V)",
                "255"
            ],
            correctIndex: 2,
            explanation: "A perfectly centered potentiometer divides the 5V exactly in half to 2.5V. The 10-bit ADC maps 2.5V to a value of exactly 512."
        },
        {
            question: "Why is a software 'Deadzone' required for joystick code?",
            options: [
                "Because the stick gets tired.",
                "Mechanical springs rarely return potentiometers to a perfect 512/512 center.",
                "Because the Z-button requires a delay.",
                "Because the Arduino reads only negative numbers."
            ],
            correctIndex: 1,
            explanation: "The mechanical return spring is imperfect and friction exists. The stick might rest at 505 or 520, which would cause an in-game character to slowly drift without a deadzone."
        }
    ],
    "light": [
        {
            question: "How does LDR resistance change in response to light?",
            options: [
                "Resistance increases as light intensity increases.",
                "Resistance drops massively when exposed to bright light.",
                "Resistance remains constant, only voltage changes.",
                "It generates its own voltage."
            ],
            correctIndex: 1,
            explanation: "A photoresistor is a semiconductor whose resistance decreases when photons strike it, providing energy for electrons to jump into the conduction band."
        },
        {
            question: "What circuit must a raw LDR be wired into to work with an Arduino analog input?",
            options: [
                "An H-Bridge",
                "A voltage divider with a fixed pull-down resistor.",
                "A Schmitt Trigger",
                "An Op-Amp"
            ],
            correctIndex: 1,
            explanation: "A standalone resistor by itself cannot generate a changing voltage. It must be paired with a fixed resistor to form a voltage divider to provide a 0-5V signal."
        },
        {
            question: "Which color of light will a standard CdS LDR struggle most to detect?",
            options: [
                "Red light",
                "Deep Blue or Violet/UV light",
                "Yellow light",
                "Green light"
            ],
            correctIndex: 1,
            explanation: "Cadmium Sulfide has a spectral response curve that peaks in the green-yellow-red range but is mostly blind to high-frequency blue/violet wavelengths."
        }
    ],
    "motion": [
        {
            question: "What does 'Passive' mean in PIR sensor?",
            options: [
                "It passively ignores false alarms.",
                "It only receives infrared light and emits no IR beams itself.",
                "It enters sleep mode when idle.",
                "It passes infrared through thick objects."
            ],
            correctIndex: 1,
            explanation: "Unlike an IR proximity sensor, a Passive sensor emits nothing. It only listens for the natural body heat (9.4 micrometer IR radiation) emitted by humans."
        },
        {
            question: "What is the purpose of the white faceted dome on the PIR sensor?",
            options: [
                "A protective waterproof shell.",
                "A Fresnel Lens that focuses wide-angle IR onto the internal sensor element.",
                "Generates heat for calibration.",
                "Blocks visible sunlight."
            ],
            correctIndex: 1,
            explanation: "The Fresnel lens collects IR radiation from a wide 110-degree area and focuses it precisely onto the tiny dual pyroelectric elements."
        },
        {
            question: "Why might the PIR fail to trigger for someone behind a glass window?",
            options: [
                "Glass reflects ultrasonic waves.",
                "Glass blocks transmission of human-body thermal IR wavelengths (~9µm).",
                "Glass acts as a mirror and blinds the sensor.",
                "Glass emits its own heat."
            ],
            correctIndex: 1,
            explanation: "Glass is transparent to visible light but acts like a solid brick wall to far-infrared radiation, completely blocking your thermal signature."
        }
    ],
    "mq3": [
        {
            question: "What specific gas is the MQ-3 optimized to detect?",
            options: [
                "Methane",
                "Alcohol / Ethanol",
                "Carbon Monoxide",
                "Hydrogen Gas"
            ],
            correctIndex: 1,
            explanation: "The SnO2 layer and operating temperature of the MQ-3 are chemically tuned to react aggressively to ethanol vapor, making it useful for breathalyzers."
        },
        {
            question: "How does the MQ-3 communicate its readings to the microcontroller?",
            options: [
                "As an analog voltage from 0 to 5V.",
                "Via I²C bus.",
                "Via Single-Wire Digital protocol.",
                "By transmitting ultrasonic pulses."
            ],
            correctIndex: 0,
            explanation: "It uses a physical voltage divider. The decreasing resistance of the SnO2 layer directly translates to a rising analog voltage."
        },
        {
            question: "Why might blowing gently on the MQ-3 cause a false positive?",
            options: [
                "The sensor is broken.",
                "Human breath is warm and humid — the sensor is slightly sensitive to temperature and moisture.",
                "The microcontroller lacks power.",
                "The I²C address changed."
            ],
            correctIndex: 1,
            explanation: "MQ sensors have cross-sensitivity. High humidity and temperature changes from human breath can cause minor resistance drops that look like tiny amounts of gas."
        }
    ],
    "pressure": [
        {
            question: "What physical property does the BMP280 use to measure changes in air pressure?",
            options: [
                "Capacitance",
                "Piezoresistance",
                "Thermal Conductivity",
                "Optical Reflection"
            ],
            correctIndex: 1,
            explanation: "The BMP280 uses tiny piezoresistors embedded in a silicon diaphragm. Mechanical stress from air pressure changes the electrical resistance."
        },
        {
            question: "How does altitude mathematically relate to atmospheric pressure?",
            options: [
                "Pressure increases exponentially with altitude.",
                "Pressure remains constant regardless of altitude.",
                "Pressure decreases exponentially as altitude increases.",
                "Pressure decreases linearly by 1 hPa per meter."
            ],
            correctIndex: 2,
            explanation: "Follows the Barometric Formula: atmospheric pressure drops off exponentially as you go higher because there is less weight of the atmosphere above you."
        },
        {
            question: "Which communication protocol does the BMP280 use according to the hardware wiring?",
            options: [
                "SPI",
                "Analog Voltage",
                "UART (Serial)",
                "I²C"
            ],
            correctIndex: 3,
            explanation: "It uses the I²C bus, which allows multiple sensors to share only two data lines: SDA (Data) and SCL (Clock)."
        }
    ],
    "proximity": [
        {
            question: "How does an inductive proximity sensor detect metal?",
            options: [
                "Shooting lasers at it.",
                "Electromagnetic field inducing Eddy Currents in metal that drain the oscillator's energy.",
                "Magnetic attraction pull.",
                "Sensing the object's body heat."
            ],
            correctIndex: 1,
            explanation: "The sensor projects a high-frequency alternating magnetic field. Nearby metal absorbs this energy via eddy currents, which loads the sensor circuit and triggers the switch."
        },
        {
            question: "What is the main advantage of inductive over optical IR proximity?",
            options: [
                "It detects any material including plastic.",
                "Completely immune to bright sunlight, dust, thick oil, and water.",
                "Lower power consumption.",
                "Longer detection range across the room."
            ],
            correctIndex: 1,
            explanation: "Because it relies on electromagnetic fields rather than light, nothing opaque (like mud, oil, or bright light) can interfere with it."
        },
        {
            question: "Connecting a 12V industrial PNP sensor's data wire directly to Arduino Mega will:",
            options: [
                "Work perfectly.",
                "Not trigger because 12V is too low.",
                "Instantly destroy the Arduino — 12V exceeds its 5V logic limit.",
                "Invert the sensor logic."
            ],
            correctIndex: 2,
            explanation: "PNP sensors source the supply voltage when triggered. Pushing 12V into a pin designed to tolerate a maximum of 5V will permanently fry the microcontroller."
        }
    ],
    "sound": [
        {
            question: "What fundamental component inside the microphone converts sound waves to electrical voltage?",
            options: [
                "A piezoelectric crystal",
                "A variable capacitor formed by the vibrating diaphragm and backplate.",
                "A photoresistor",
                "A Hall Effect sensor"
            ],
            correctIndex: 1,
            explanation: "An electret microphone contains a charged membrane that physically moves in response to sound waves, changing the distance and exactly mirroring the audio as changing electrical capacitance."
        },
        {
            question: "Why must the raw microphone signal be amplified before the Arduino can read it?",
            options: [
                "The microphone outputs 12V and needs to be reduced.",
                "The raw acoustic voltage is in millivolts — far too small for the Arduino ADC.",
                "The Arduino only reads AC signals.",
                "Because the signal is transmitted wirelessly."
            ],
            correctIndex: 1,
            explanation: "Microphone capsules output a signal measured in microvolts or tiny millivolts. The LM393 op-amp on the module amplifies this to the 0-5V range so the Arduino can actually detect it."
        },
        {
            question: "Why does a single clap often register as multiple trigger events?",
            options: [
                "The potentiometer is broken.",
                "Sound waves reflect off walls and surfaces, arriving at the microphone as multiple echoes.",
                "The Arduino runs too slowly.",
                "Clapping generates static electricity."
            ],
            correctIndex: 1,
            explanation: "A room acts like an acoustic echo chamber. The direct sound hits first, followed milliseconds later by reflections off the ceiling, desk, and walls — all of which can register as separate claps."
        }
    ],
    "temperature": [
        {
            question: "What does NTC stand for and what does it mean physically?",
            options: [
                "Narrow Thermal Conductor -- sensor is physically thin.",
                "Negative Temperature Coefficient -- resistance decreases as temperature rises.",
                "Non-Transistor Component -- uses no active parts.",
                "Normalized Thermal Calibration -- auto-calibrates."
            ],
            correctIndex: 1,
            explanation: "In metals, resistance goes UP with heat (PTC). In these semiconductor thermistors, resistance goes DOWN with heat (NTC) due to electrons jumping into the conduction band."
        },
        {
            question: "What equation precisely describes the non-linear resistance-temperature curve of an NTC thermistor?",
            options: [
                "Ohm's Law: V = IR",
                "Ideal Gas Law: PV = nRT",
                "The Steinhart-Hart Equation.",
                "The Beer-Lambert Law"
            ],
            correctIndex: 2,
            explanation: "The Steinhart-Hart equation is an empirical 3rd-order polynomial describing the extreme non-linearity of semiconductor thermistors."
        },
        {
            question: "When should you prefer the NTC Thermistor over the DHT11?",
            options: [
                "When you also need humidity data.",
                "When you need fast-response continuous analog readings for feedback control or thermal monitoring.",
                "When I2C communication is required.",
                "The DHT11 is always the superior choice."
            ],
            correctIndex: 1,
            explanation: "The DHT11 takes 2 seconds to output a reading. An NTC thermistor provides instant, continuous analog values perfect for rapid safety cutoffs or PID loop feedback."
        }
    ],
    "tilt": [
        {
            question: "What internal mechanism bridges the circuit in a SW-520D Tilt Sensor?",
            options: [
                "A flexible piezoelectric crystal.",
                "A conductive metal ball (or mercury) that rolls onto contact pins.",
                "Dual phototransistors.",
                "A Hall-Effect magnetic plate."
            ],
            correctIndex: 1,
            explanation: "Gravity pulls a small conductive rolling ball down onto separated contact pins, acting exactly like a mechanical light switch closing."
        },
        {
            question: "Why is INPUT_PULLUP necessary for a tilt switch?",
            options: [
                "Prevents the Arduino from pulling too much current.",
                "Keeps the pin HIGH so it doesn't float and read random noise when the switch opens.",
                "Pulls the metal ball faster via magnetism.",
                "Increases the sensitivity angle."
            ],
            correctIndex: 1,
            explanation: "When the ball rolls away, the pin is connected to literally nothing. Electromagnetic noise in the room will cause a floating pin to jump between HIGH and LOW unpredictably unless anchored to VCC via PULLUP."
        },
        {
            question: "Besides orientation detection, what other event can this sensor detect via switch bounce?",
            options: [
                "Temperature changes.",
                "Air pressure changes.",
                "Sudden kinetic impacts or vibrations.",
                "Humidity levels."
            ],
            correctIndex: 2,
            explanation: "A hard slap or structural vibration will briefly jolt the metal ball off the electrical contacts for a few milliseconds, acting as a crude seismic alarm."
        }
    ],
    "touch": [
        {
            question: "What electrical principle allows the TTP223 to detect touch without physical moving parts?",
            options: [
                "Parasitic Capacitance",
                "Piezoresistance",
                "The Hall Effect",
                "Inductive Reactance"
            ],
            correctIndex: 0,
            explanation: "The human finger acts as the second conductive plate of an electrical capacitor, altering the charge/discharge time of the circuit pad."
        },
        {
            question: "Why can the touch sensor detect a finger through thin glass or plastic?",
            options: [
                "Glass bends light rays toward the sensor.",
                "Capacitance is based on electric fields which penetrate non-conductive dielectric materials.",
                "Finger heat passes through glass.",
                "Glass physically pushes the copper pad."
            ],
            correctIndex: 1,
            explanation: "Electric fields extend radially outward through insulating materials (dielectrics) just like the Gorilla Glass on a smartphone."
        },
        {
            question: "What causes the sensor to ignore your finger immediately after power-on?",
            options: [
                "Arduino takes 5 minutes to warm up.",
                "Touching the pad at power-on causes the 0.5s calibration to set your finger as the baseline.",
                "Sensor must be connected to I²C first.",
                "pulseIn() timed out."
            ],
            correctIndex: 1,
            explanation: "The chip self-calibrates immediately when it receives power. If a finger is present, the dense capacitance of the finger becomes the new zero-threshold, effectively blinding the sensor to future touches."
        }
    ],
    "ultrasonic": [
        {
            question: "What frequency of ultrasound does the HC-SR04 emit?",
            options: [
                "20 Hz",
                "400 Hz",
                "40,000 Hz (40 kHz)",
                "2.4 GHz"
            ],
            correctIndex: 2,
            explanation: "It rings the piezoelectric transducer at 40 kHz, which is well above the roughly 20 kHz maximum limit of human hearing."
        },
        {
            question: "Why do we divide the flight time distance calculation by two?",
            options: [
                "Because the speed of sound is too fast.",
                "Because the sound wave travels to the object AND bounces all the way back.",
                "Because the sensor has two metal cylinders.",
                "To calibrate for ambient temperature."
            ],
            correctIndex: 1,
            explanation: "The measured microsecond duration is the round-trip flight. Dividing by two gives the distance for just the one-way journey to the object."
        },
        {
            question: "Which surface will the HC-SR04 struggle most to measure?",
            options: [
                "Flat wooden boards",
                "Concrete walls",
                "Soft, fluffy objects like pillows or thick clothing",
                "Metal sheets"
            ],
            correctIndex: 2,
            explanation: "Soft porous materials physically absorb the kinetic energy of the sound wave rather than reflecting a strong geometric echo back to the receiver."
        }
    ]
};
