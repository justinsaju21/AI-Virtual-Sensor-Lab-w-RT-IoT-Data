# 🔌 Firmware Core Logic - IoT Virtual Lab

## 1. Overview
The firmware is designed for the **Arduino Mega 2560** (Main Data Aggregator) and **ESP8266** (WiFi Bridge). It follows a polling-based architecture to read 17 sensors and transmit the results to the central server.

## 2. Sensor Polling Loop
The main loop executes a full sensor scan every **100ms**:
1. **Analog Scans**: Reads ADC values for Gas (MQ2/MQ3), Light (LDR), Sound, etc.
2. **Digital/I2C Scans**:
   - `DHT11`: Temperature & Humidity (reads once every 2 seconds to avoid heating).
   - `BMP280`: Pressure & Altitude (I2C protocol).
   - `Ultrasonic`: HC-SR04 pulse counting.
   - `MAX30102`: Heart rate FIFO buffer processing.

## 3. Communication Protocol
Data is packaged into a compact JSON string and sent via Serial to the ESP8266:
```json
{
  "device": "mega-01",
  "sensors": {
    "temp": 24.5,
    "gas": 450,
    "dist": 12.3
    ...
  }
}
```
The ESP8266 then forwards this to `POST /api/sensor-data` over WiFi.

## 4. Calibration & Safety
- **MQ2 Baseline**: The firmware performs a 30-second pre-heat and clean-air calibration at startup.
- **Fail-Safe**: If a sensor fails to respond (e.g., I2C timeout), the firmware sends a `null` value, triggering the backend's "Mock Hybrid" fallback.

---
*Last Updated: April 2024*
