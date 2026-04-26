# 🔌 Firmware Core Logic - IoT Virtual Lab

## 1. Overview
The firmware is designed for the **Arduino Mega 2560** (Main Data Aggregator) and **ESP8266** (WiFi Bridge). It follows a polling-based architecture to read 17 sensors and transmit the results to the central server.

## 2. Sensor Polling Loop
The main loop executes high-speed polling for critical sensors while maintaining asynchronous intervals for slower ones:
1. **High-Speed (50ms)**: Joystick, Touch, Tilt, and Sound digital pins.
2. **Medium-Speed (200ms)**: Analog Gas (MQ2/MQ3), Light (LDR), and Flame sensors.
3. **Low-Speed (2000ms)**: `DHT11` Temperature & Humidity (sampled at 0.5Hz to avoid self-heating).
4. **On-Demand/Special**:
   - `BMP280`: Pressure & Altitude via I2C (optimized for low-latency).
   - `Ultrasonic`: HC-SR04 pulse counting (non-blocking).
   - `MAX30102`: Heart rate FIFO buffer processing (sampled every 50ms).

## 3. Communication Protocol
Data is transmitted at **10Hz (100ms intervals)** using a **Stop-and-Wait ACK Handshake**:
1. **Serialization**: Data is packed into a compact JSON payload using `ArduinoJson`.
2. **Transmission**: The Mega sends JSON to the ESP8266 via Serial.
3. **Wait for ACK**: The Mega pauses all transmissions until it receives a literal `"ACK"` from the ESP8266, preventing buffer overflows.
4. **TLS Gateway (ESP8266)**: The ESP8266 utilizes **BearSSL Session Caching** to forward data to the Render backend via HTTPS POST without the overhead of full TLS handshakes on every packet.

## 4. Calibration & Safety
- **MQ2 Baseline**: The firmware performs a 30-second pre-heat and clean-air calibration at startup.
- **Fail-Safe**: If a sensor fails to respond (e.g., I2C timeout), the firmware sends a `null` value, triggering the backend's "Mock Hybrid" fallback.

---
*Last Updated: April 2024*
