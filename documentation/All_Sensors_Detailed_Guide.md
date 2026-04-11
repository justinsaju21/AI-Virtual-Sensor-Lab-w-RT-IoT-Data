# 📚 IoT Virtual Lab: Comprehensive Sensor Details

# IoT VIRTUAL SENSOR LAB
## Comprehensive Sensor Reference Guide
─────────────────────────────────────────────────

**17 Sensors  ·  Deep-Dive Physics  ·  Full Wiring Diagrams**
**Arduino Implementation Code  ·  Experiments  ·  Troubleshooting  ·  AI Quizzes**

| Sensor | Type | Interface | Page |
| :--- | :--- | :--- | :--- |
| **GY-BMP280-3.3** | Pressure & Altimeter | I²C | § 1 |
| **DHT11** | Temperature & Humidity | Single-Wire (1-Wire) | § 2 |
| **Flame Detector** | Fire / IR Radiation | Analog + Digital | § 3 |
| **HC-SR04 Ultrasonic** | Distance (Time-of-Flight) | Pulse Width GPIO | § 4 |
| **IR Obstacle** | Proximity (Active IR) | Digital GPIO | § 5 |
| **Joystick Module** | Dual-Axis Position | Analog + Digital | § 6 |
| **LDR Module** | Ambient Light | Analog + Digital | § 7 |
| **MAX30102** | Pulse Oximeter / Heart Rate | I²C | § 8 |
| **MQ-2 Gas Sensor** | Combustible Gas & Smoke | Analog + Digital | § 9 |
| **MQ-3 Alcohol Sensor** | Ethanol Vapor (Breathalyzer) | Analog + Digital | § 10 |
| **PIR HC-SR501** | Motion (Body Heat) | Digital GPIO | § 11 |
| **Proximity (Inductive)** | Metal Detection | Digital GPIO (NPN/PNP) | § 12 |
| **Sound Module (Mic)** | Acoustic / Noise Level | Analog + Digital | § 13 |
| **SW-520D Tilt Sensor** | Orientation & Vibration | Digital GPIO | § 14 |
| **TTP223 Touch Sensor** | Capacitive Touch | Digital GPIO | § 15 |
| **Hall Effect (4-Pin)** | Magnetic Field & Polarity | Digital + Analog | § 16 |
| **NTC Thermistor Module**| Temperature (Fast Analog) | Analog + Digital | § 17 |

**Mentor:** Dr. Elamaran E  |  **SEM6 Project** — Dept of ECE  |  March 2026

---

## 📌 Arduino Mega 2560 Pin Assignment Master List

This map ensures zero conflicts when building the final prototype.

### I2C Bus Pins (Shared)
| Sensor | Description | Pin Type | Assigned Pin |
| :--- | :--- | :--- | :--- |
| **All I2C Sensors** | Data Line (SDA) | Dedicated I2C | **Pin 20** |
| **All I2C Sensors** | Clock Line (SCL) | Dedicated I2C | **Pin 21** |
*Devices: BMP280 (0x76), MAX30102 (0x57)*

### Analog Sensors (ADC)
| Sensor | Description | Pin Type | Assigned Pin |
| :--- | :--- | :--- | :--- |
| **MQ-2** | Gas & Smoke | Analog | **A0** |
| **MQ-3** | Alcohol Vapor | Analog | **A1** |
| **Joystick (X)** | Horizontal Axis | Analog | **A2** |
| **Joystick (Y)** | Vertical Axis | Analog | **A3** |
| **LDR** | Light Sensor | Analog | **A4** |
| **Flame (AO)** | Fire Intensity (Analog) | Analog | **A5** |
| **Sound (AO)** | Noise Envelope (Analog) | Analog | **A6** |
| **NTC Thermistor** | Temperature | Analog | **A7** |
| **Hall Effect (AO)** | Magnetic Strength | Analog | **A8** |

### Digital Sensors
| Sensor | Description | Pin Type | Assigned Pin |
| :--- | :--- | :--- | :--- |
| **DHT11** | Humidity & Temp Data | Digital In | **Pin 2** |
| **HC-SR04 (TRIG)** | Ultrasonic Trigger | Digital Out | **Pin 3** |
| **HC-SR04 (ECHO)** | Ultrasonic Echo | Digital In | **Pin 4** |
| **Touch** | Capacitive Sensor | Digital Input | **Pin 5** |
| **Hall Effect (DO)** | Magnetic Switch | Digital Input | **Pin 6** |
| **Joystick (SW)** | Joystick Button | Digital Input | **Pin 7** |
| **Flame (DO)** | Fire Alarm | Digital Input | **Pin 8** |
| **Sound (DO)** | Noise Threshold | Digital Input | **Pin 9** |
| **PIR** | Motion Detector | Digital Input | **Pin 10** |
| **Proximity** | Metal Detector | Digital Input | **Pin 11** |
| **Tilt** | Vibration Switch | Digital Input | **Pin 12** |
| **IR Obstacle** | Reflective Proximity | Digital Input | **Pin 13** |

---

## 1. Environment & Gas Sensors
Detailed physics, schematics, and experiments for atmospheric sensing.

| Sensor | Key Wavelength / Metric | Deep Dive Link |
| :--- | :--- | :--- |
| **GY-BMP280** | Pressure (Piezoresistive) | [View Detailed Guide](sensors/BMP280.md) |
| **DHT11** | Humidity (Capacitive) | [View Detailed Guide](sensors/DHT11.md) |
| **MQ-2** | Smoke/Gas (Chemisorption) | [View Detailed Guide](sensors/MQ2.md) |
| **MQ-3** | Alcohol (Redox Reaction) | [View Detailed Guide](sensors/MQ3.md) |
| **LM35** | Temperature (Bandgap) | [View Detailed Guide](sensors/Temperature.md) |
| **NTC-10k** | Thermal (Resistance Curve) | [View Detailed Guide](sensors/Thermistor.md) |

---

## 2. Optical & Proximity Sensors
Detecting presence, distance, and fire using light and sound.

| Sensor | Physics Principle | Deep Dive Link |
| :--- | :--- | :--- |
| **HC-SR04** | Ultrasonic (Time-of-Flight) | [View Detailed Guide](sensors/HC-SR04.md) |
| **Flame** | Infrared (Phototransistor) | [View Detailed Guide](sensors/Flame.md) |
| **IR Obstacle** | Reflection (Albedo) | [View Detailed Guide](sensors/IR.md) |
| **LDR** | Photoconductivity (CdS) | [View Detailed Guide](sensors/LDR.md) |
| **PIR** | Thermal (Pyroelectric) | [View Detailed Guide](sensors/PIR.md) |
| **Inductive** | Magnetism (Eddy Currents) | [View Detailed Guide](sensors/Proximity.md) |

---

## 3. Human Interface & Health
Sensors designed for direct human interaction.

| Sensor | Mechanism | Deep Dive Link |
| :--- | :--- | :--- |
| **MAX30102** | Pulse (Reflective PPG) | [View Detailed Guide](sensors/MAX30102.md) |
| **Joystick** | Position (Voltage Divider) | [View Detailed Guide](sensors/Joystick.md) |
| **TTP223** | Touch (Parasitic Capacitance)| [View Detailed Guide](sensors/Touch.md) |
| **Sound** | Acoustic (Electret Mic) | [View Detailed Guide](sensors/Sound.md) |

---

## 4. Mechanical & Magnetic
Basic physical switches and field detectors.

| Sensor | Physics Principle | Deep Dive Link |
| :--- | :--- | :--- |
| **Hall Effect** | Magnetism (Lorentz Force) | [View Detailed Guide](sensors/Hall.md) |
| **SW-520D** | Gravity (Conductive Ball) | [View Detailed Guide](sensors/Tilt.md) |

---

> [!TIP]
> Each "Deep Dive" link above contains a full section on **Physical Mechanisms**, **Mathematical Models**, **Mermaid Flowcharts**, and **Arduino Source Code** specific to that sensor.

> [!NOTE]
> This guide is optimized for the SEM6 Project Hardware Kit and Arduino Mega 2560 Firmware.
