# 🔌 Sensors & Hardware Working Principles

This document explains the "How it Works" for every physical and virtual component in the lab.

---

## 🏗️ 1. The Core Infrastructure
- **Arduino Mega 2560:** Chosen for its high pin count (54 Digital, 16 Analog). It acts as the central Data Acquisition (DAQ) system.
- **ESP8266:** Selected for its cheap WiFi capabilities. It is used exclusively as a Bridge to avoid cluttering the Arduino's memory with network stacks.

---

## 📍 2. Sensor Catalog & Physics

### **A. Environmental Sensors**
1.  **Temperature & Humidity (DHT11/22):**
    - **Principle:** Uses a capacitive humidity sensor and a thermistor to measure the surrounding air.
    - **Code Logic:** Data is read as a single-wire digital signal.
2.  **Pressure & Altitude (BMP180):**
    - **Principle:** Measures barometric pressure using a piezo-resistive sensor.
    - **Interface:** I2C (SDA/SCL). 

### **B. Gas & Chemical Sensors**
3.  **Smoke/Gas (MQ-2):**
    - **Principle:** Contains a sensing element (SnO2) that changes resistance when exposed to combustible gases.
4.  **Alcohol (MQ-3):**
    - **Principle:** Similar to MQ-2 but optimized for ethanol molecules.
    - **Viva Question:** Why does it need a warm-up time? *Answer: The internal heater must reach a stable temperature to oxidize the gas molecules.*

### **C. Distance & Physics**
5.  **Ultrasonic (HC-SR04):**
    - **Principle:** Emits an ultrasonic burst (40kHz). The distance is calculated based on the "Time of Flight" (echo return time).
    - **Formula:** `Distance = (Time * 0.034) / 2`
6.  **Light (LDR):**
    - **Principle:** Photoconductivity. Resistance drops when surface is exposed to light.
    - **Circuit:** Requires a **Voltage Divider** with a 10kΩ resistor.

### **D. Motion & Interaction**
7.  **PIR Motion (HC-SR501):**
    - **Principle:** Detects changes in Infrared radiation (heat) moving in front of it.
8.  **Joystick (KY-023):**
    - **Principle:** Two potentiometers (X and Y axis) and a tactile switch.
    - **Output:** 0 to 1023 analog values. 512 is center.

### **E. Safety & Specialty**
9.  **Flame Sensor:**
    - **Principle:** IR-sensitive photodiode. It is most sensitive to the specific wavelength of a fire's flame (760nm - 1100nm).
10. **Heartbeat Sensor:**
    - **Principle:** Photoplethysmogram (PPG). It shines an LED through your finger and measures the slight change in light absorption as blood pulses.

---

## 🛠 3. Pin Mapping Reference (Full Table)

| Sensor | Arduino Pin | Input Type | Virtual Logic |
| :--- | :--- | :--- | :--- |
| Gas (MQ-2) | A0 | Analog (ADC) | Noise Burst |
| Light (LDR) | A1 | Analog (ADC) | Day/Night Cycle |
| Alcohol | A2 | Analog (ADC) | Linear Drift |
| Sound | A3 | Analog (ADC) | Threshold Spike |
| Flame | A4 | Analog (ADC) | Inverse Logic |
| Heartbeat | A5 | Analog (ADC) | Pulse Waveform |
| Joystick X | A6 | Analog (ADC) | Center 512 |
| Joystick Y | A7 | Analog (ADC) | Center 512 |
| Temp/Hum | D2 | 1-Wire Digital | Slow Refresh |
| Hall Effect | D3 | Digital | Magnetic Logic |
| IR Obstacle | D4 | Digital | Reflection Logic |
| Proximity | D5 | Digital | Beam Break |
| Touch | D6 | Digital | Capacitive |
| PIR Motion | D7 | Digital | Pulse Logic |
| Tilt | D8 | Digital | Ball Switch |
| Ultrasonic | D9, D10 | Pulse Duration | Echo Math |

---

## 🔌 4. The ESP8266 Bridge Logic
The ESP8266 does not read any sensors. Its code is simple:
1.  **Connect to SSID:** `WiFi.begin(ssid, password)`.
2.  **Serial Listen:** `if (Serial.available()) { String json = Serial.readStringUntil('\n'); }`.
3.  **HTTP Flash:** Sends that string to the cloud backend.
4.  **Error Handling:** If WiFi drops, it blinks the built-in LED (GPIO 2) to alert the user.
