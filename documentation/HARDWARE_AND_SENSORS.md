# 🔌 Hardware Integration & Sensor Catalog

This document provides the hardware specification for the **AI-Enabled Virtual Sensor Laboratory**.

## 🧠 Brain: Arduino Mega 2560
The Arduino Mega was selected as the core controller due to its 54 digital I/O pins and 16 analog inputs, which are essential for running 15+ sensors concurrently without using multiplexers.

### **Technical Specs Used:**
- **Microcontroller:** ATmega2560
- **Operating Voltage:** 5V
- **Analog Inputs:** 10-bit resolution (0-1023)
- **Serial Ports:** 4 Hardware UARTS (Serial, Serial1, Serial2, Serial3)

---

## 📍 Pin Mapping Table

| Category | Sensor | Interface | Arduino Pin |
|:---|:---|:---|:---|
| **Digital** | Proximity | GPIO | D5 |
| | Touch | GPIO | D6 |
| | Motion (PIR) | GPIO | D7 |
| | Tilt | GPIO | D8 |
| | IR Obstacle | GPIO | D4 |
| | Hall Effect | GPIO | D3 |
| **Analog** | Gas (MQ-2) | ADC | A0 |
| | Light (LDR) | ADC | A1 |
| | Alcohol (MQ-3) | ADC | A2 |
| | Sound | ADC | A3 |
| | Flame | ADC | A4 |
| | Heartbeat | ADC | A5 |
| | Joystick (X) | ADC | A6 |
| | Joystick (Y) | ADC | A7 |
| **Special** | Ultrasonic | Trigger/Echo | D9, D10 |
| | Temperature/Hum | 1-Wire | D2 |
| | Pressure | I2C | SDA (20), SCL (21) |

---

## 📡 Cloud Bridge: ESP8266
The ESP8266 handles the Wi-Fi stack and cloud communication to keep the Arduino Mega's main loop responsive.

### **Connection Logic:**
1. **Physical:** Arduino `TX1` (Pin 18) connects to ESP8266 `RX`.
2. **Level Shifting:** Because the Mega is 5V and the ESP is 3.3V, a voltage divider (1kΩ/2kΩ) is used on the TX line to ensure safe signals.
3. **Firmware:** The ESP runs a small `ESP8266_Bridge` sketch that parses the incoming serial JSON and forwards it to the Hosted Render API via `HTTP POST`.

## 🛠 Sensor Logic & Data Acquisition
- **Analog Scaling:** Most analog sensors are mapped using the standard formula:
  `Value = (AnalogRead / 1023.0) * Max_Scale`
- **Ultrasonic Math:** Uses the Time-of-Flight (ToF) formula:
  `Distance (cm) = (Duration * 0.034) / 2`
- **DHT Sampling:** Implements a 2-second delay to ensure stable humidity readings according to the sensor's datasheet.
