# IoT Virtual Lab: Challenges & Solutions Retrospective

This document summarizes the major technical hurdles encountered during the Session 3 audit and the Gemini AI integration, along with the engineering solutions implemented.

## 🔴 1. The "Silent" Data Truncation (Root Cause: 1024 vs 2048)
- **Challenge:** Several sensors (Ultrasonic, PIR, Joystick) were reporting 0 or default values on the dashboard even though the Arduino code looked correct.
- **Discovery:** The `StaticJsonDocument` in the Mega firmware was limited to **1024 bytes**. With 17 sensors, the serialized string was exceeding this limit. ArduinoJson silently fails and stops serializing once the buffer is full, causing the sensors at the end of the JSON to be "invisible."
- **Solution:** Increased the buffer to **2048 bytes** and the ESP8266 bridge buffer to **4096 bytes**.

## 🔴 2. Real-Time Data vs. AI Latency
- **Challenge:** Sending live data frequency (every 2s) while trying to use LLMs (which take 3-5s per response) caused UI lag or message stacking.
- **Solution:** Separated the **Data Stream** (Socket.io) from the **AI Logic** (REST API). The AI Assistant only receives a "snapshot" of the data when a question is asked, preventing the LLM from slowing down the real-time gauges.

## 🟠 3. Mismatched "Heartbeats" (Mega vs. ESP8266)
- **Challenge:** The Mega was sending data using `Serial0`. If the ESP8266 was busy uploading to the cloud, it would miss the start of the next JSON packet, leading to "JSON Error: Incomplete Packet."
- **Solution:** Switched the ESP8266 to a **non-blocking circular buffer** reading pattern. It now accumulates data byte-by-byte independently of the HTTP upload process.

## 🟠 4. TypeScript Type Drift
- **Challenge:** The firmware added new fields like `stale` (for DHT11) and `analog` (for Flame), but the Frontend was still expecting the old `value` field. This caused components to display 0 despite data being present.
- **Solution:** Fully synchronized `sensorData.ts` in the frontend with the `transmitData()` function in the firmware.

## 🟡 5. AI Hallucination & Consistency
- **Challenge:** Mock AI would say things like "Your temperature is 25°C" when the sensor actually showed 40°C.
- **Solution:** Implemented **Gemini Context Injection**. The backend now injects a `systemPrompt` containing the active sensor name and the latest hardware readings before the user's message reaches Gemini.

## 🟡 6. The "Baud Rate" Stability Limit
- **Challenge:** 9600 baud was too slow for high-frequency data packets, causing a buildup in the serial buffer. 
- **Solution:** Standardized the entire project on **115200 baud**. This provides enough bandwidth for the large 2048-byte JSON payloads without delay.

---
**Status:** All these challenges are now **Resolved** in the current `main` branch.
