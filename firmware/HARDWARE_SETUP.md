# IoT Virtual Lab - Hardware Setup Guide

## Overview

This guide explains how to connect your physical sensors to the Virtual Lab dashboard.

## Architecture

```
[Sensors] → [Arduino Mega 2560] → [ESP8266] → [WiFi] → [Backend Server] → [Dashboard]
```

## Hardware Required

| Component | Purpose | Quantity |
|-----------|---------|----------|
| Arduino Mega 2560 | Main controller, reads all sensors | 1 |
| ESP8266 (ESP-01 or NodeMCU) | WiFi connectivity | 1 |
| DHT22 | Temperature & Humidity | 1 |
| MQ-2 | Gas/Smoke detection | 1 |
| LDR Module | Light intensity | 1 |
| HC-SR501 PIR | Motion detection | 1 |
| HC-SR04 | Ultrasonic distance | 1 |
| 10kΩ Resistor | DHT22 pull-up | 1 |
| Jumper Wires | Connections | ~20 |

## Wiring Diagram

### Arduino Mega Pin Connections

| Sensor | Arduino Pin | Notes |
|--------|-------------|-------|
| **DHT22** | | |
| VCC | 5V | Power |
| DATA | D2 | Add 10kΩ pull-up to 5V |
| GND | GND | |
| **MQ-2** | | |
| VCC | 5V | Needs ~20s warm-up |
| AO | A0 | Analog output |
| GND | GND | |
| **LDR Module** | | |
| VCC | 5V | |
| AO | A1 | |
| GND | GND | |
| **PIR (HC-SR501)** | | |
| VCC | 5V | |
| OUT | D7 | Digital output |
| GND | GND | |
| **Ultrasonic (HC-SR04)** | | |
| VCC | 5V | |
| TRIG | D9 | |
| ECHO | D10 | |
| GND | GND | |
| **ESP8266** | | |
| TX | RX1 (D19) | Cross-connect |
| RX | TX1 (D18) | Use voltage divider! |
| GND | GND | Common ground |
| VCC | 3.3V | **NOT 5V!** |

### ⚠️ Important: ESP8266 is 3.3V!

The ESP8266 operates at 3.3V. When connecting TX from Arduino to ESP8266 RX, use a voltage divider:

```
Arduino TX1 ──[1kΩ]──┬──[2kΩ]── GND
                     │
                     └── ESP8266 RX
```

## Software Setup

### 1. Install Arduino IDE Libraries

Open Arduino IDE → Sketch → Include Library → Manage Libraries:

- **DHT sensor library** by Adafruit
- **ArduinoJson** by Benoit Blanchon
- **ESP8266WiFi** (comes with ESP8266 board package)

### 2. Install ESP8266 Board Package

1. Open Arduino IDE → File → Preferences
2. Add to "Additional Boards Manager URLs":
   ```
   http://arduino.esp8266.com/stable/package_esp8266com_index.json
   ```
3. Go to Tools → Board → Boards Manager
4. Search "ESP8266" and install

### 3. Configure ESP8266 Firmware

Open `esp8266_bridge.ino` and update:

```cpp
const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SERVER_URL = "http://YOUR_COMPUTER_IP:5000/api/sensor-data";
```

**To find your computer's IP:**
- Windows: Run `ipconfig` in Command Prompt
- Look for "IPv4 Address" (e.g., 192.168.1.100)

### 4. Upload Code

1. **Arduino Mega:**
   - Select Board: Arduino Mega 2560
   - Select Port: COM port for Mega
   - Upload `arduino_mega.ino`

2. **ESP8266:**
   - Select Board: Generic ESP8266 Module (or NodeMCU 1.0)
   - Select Port: COM port for ESP8266
   - Upload `esp8266_bridge.ino`

## Testing

### 1. Test Arduino Alone

Open Serial Monitor (115200 baud). You should see JSON data every 2 seconds:

```json
{"device_id":"arduino_mega_01","dht22":{"temperature":24.5,"humidity":55.2},...}
```

### 2. Test ESP8266 Connection

After uploading, ESP8266 Serial Monitor should show:

```
WiFi Connected!
IP Address: 192.168.1.XXX
Received from Arduino: {...}
Data sent successfully!
```

### 3. Verify on Dashboard

1. Start the backend: `node server.js`
2. Start the frontend: `npm run dev`
3. Open http://localhost:3000
4. The dashboard should show real sensor values!

## Troubleshooting

| Problem | Solution |
|---------|----------|
| ESP8266 won't connect to WiFi | Check SSID/password, ensure 2.4GHz network |
| No data from Arduino | Check Serial1 connections (TX1↔RX, RX1↔TX) |
| Backend not receiving data | Verify SERVER_URL matches your computer IP |
| DHT22 reading NaN | Check wiring, add pull-up resistor |
| MQ-2 readings unstable | Allow 20+ second warm-up time |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/data` | GET | Get current sensor data |
| `/api/sensor-data` | POST | Submit sensor data (from ESP8266) |
| `/api/mode` | POST | Switch mock/hardware mode |

## Switching Modes

The backend automatically switches between mock and hardware data:

- **Mock Mode:** Default when no hardware connected
- **Hardware Mode:** Activates when receiving POST to `/api/sensor-data`
- **Auto-fallback:** Returns to mock if no hardware data for 10 seconds
