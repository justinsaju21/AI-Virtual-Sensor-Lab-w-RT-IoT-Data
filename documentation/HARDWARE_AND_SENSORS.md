# 🔌 Sensors & Hardware Working Principles

This document explains the "How it Works" for every physical and virtual component in the lab.

---

## 🏗️ 1. The Core Infrastructure
- **Arduino Mega 2560:** Chosen for its high pin count (54 Digital, 16 Analog). It acts as the central Data Acquisition (DAQ) system.
- **ESP8266:** Selected for its cheap WiFi capabilities. It is used exclusively as a Bridge to avoid cluttering the Arduino's memory with network stacks.

---

## 📍 2. Sensor Catalog & Physics

### **A. Environmental Sensors**
1.  **Temperature & Humidity (DHT11):**
    - **Principle:** Uses a capacitive humidity sensor and a thermistor.
    - **Code Logic:** Data is read via the DHT library on Digital Pin 2.
2.  **Pressure & Altitude (BMP180):**
    - **Principle:** Measures barometric pressure using a piezo-resistive sensor.
    - **Interface:** I2C (Pins 20/21 on Mega). 

### **B. Gas & Chemical Sensors**
3.  **Smoke/Gas (MQ-2):**
    - **Principle:** Detection of LP gas, Propane, and Hydrogen.
4.  **Alcohol (MQ-3):**
    - **Principle:** High sensitivity to alcohol and small sensitivity to Benzine.

### **C. Distance & Physics**
5.  **Ultrasonic (HC-SR04):**
    - **Principle:** Echo-based distance measurement (40kHz).
    - **Formula:** `Distance = (Time * 0.034) / 2`
6.  **Light (LDR):**
    - **Principle:** Resistance decreases as light intensity increases.

### **D. Motion & Interaction**
7.  **Hall Effect (A3144):**
    - **Principle:** Detects magnetic fields via the Hall Effect.
8.  **Joystick:**
    - **Principle:** Dual potentiometers for X/Y and a push-button.

---

## 🛠 3. Pin Mapping Reference (Full Table)

| Sensor | Arduino Pin | Input Type | Description |
| :--- | :--- | :--- | :--- |
| **MQ-2 Gas** | A0 | Analog | Gas/Smoke levels |
| **LDR Light** | A1 | Analog | Lux intensity |
| **MQ-3 Alcohol** | A2 | Analog | Ethanol concentration |
| **Mic/Sound** | A3 | Analog | Acoustic level |
| **Flame** | A4 | Analog | IR Fire detection |
| **Heartbeat** | A5 | Analog | PPG Pulse signal |
| **Joystick X** | A6 | Analog | X-Axis position |
| **Joystick Y** | A7 | Analog | Y-Axis position |
| **DHT11** | D2 | Digital | Temp/Humidity data |
| **Hall Effect** | D3 | Digital | Magnet detect (Active LOW) |
| **IR Sensor** | D4 | Digital | Obstacle detect (Active LOW) |
| **Proximity** | D5 | Digital | Generic proximity (Active LOW) |
| **Touch** | D6 | Digital | Capacitive Touch (Active HIGH) |
| **Tilt** | D8 | Digital | Ball tilt (Active HIGH) |
| **Ultrasonic** | D9 (T), D10 (E) | Pulse | Trig/Echo distance |
| **Joystick Btn**| D11 | Digital | Joystick select (PULLUP) |
| **BMP180** | 20, 21 | I2C | Pressure/Altitude/Temp |

---

## 🔌 4. The ESP8266 Bridge Logic
The ESP8266 does not read any sensors. Its code is simple:
1.  **Connect to SSID:** `WiFi.begin(ssid, password)`.
2.  **Serial Listen:** `if (Serial.available()) { String json = Serial.readStringUntil('\n'); }`.
3.  **HTTP Flash:** Sends that string to the cloud backend.
4.  **Error Handling:** If WiFi drops, it blinks the built-in LED (GPIO 2) to alert the user.
