# 📂 File Structure & Module Connectivity

This document provides a map of the codebase, explaining what each key file does and how they interact.

## 📁 Root Directory
- `documentation/`: Detailed technical guides (You are here).
- `backend/`: Node.js server and data generation logic.
- `frontend/`: Next.js web application.
- `firmware/`: Embedded C++ code for Arduino and ESP8266.

---

## 📁 Backend (`/backend`)
The backend acts as the data broker and simulation engine.

- **`server.js`**: The main entry point. Sets up Express, Socket.io, and handles incoming HTTP POSTs from the physical hardware.
- **`mockDataGenerator.js`**: Contains the mathematical models for all 17 "Virtual Sensors". It calculates values based on time/triggers when hardware is detached.
- **`package.json`**: Defines dependencies (`express`, `socket.io`, `cors`).

---

## 📁 Frontend (`/frontend`)
The frontend is the interactive dashboard used by students.

### **Key Directories**
- `src/app/`: Next.js App Router pages (Dashboard, Assistant, Settings).
- `src/app/sensors/`: Individual detail pages for every sensor (e.g., `/temperature`, `/ultrasonic`).
- `src/components/`: Reusable UI elements.
    - `charts/LiveChart.tsx`: The real-time graphing engine.
    - `ai/MistakeDetector.tsx`: The visual alert system for troubleshooting.
    - `testing/TestingControlPanel.tsx`: The UI for injecting faults and applying DSP.
- `src/hooks/`: Custom React logic.
    - **`useSocket.ts`**: Handles the permanent connection to the Render/Local backend.
    - **`useFaultInjector.ts`**: The logic that "corrupts" data for reliability testing.
    - **`useSignalProcessing.ts`**: Implements the Moving Average Filter.
- `src/types/`: TypeScript definitions (`sensorData.ts`) ensuring data consistency.

---

## 📁 Firmware (`/firmware`)
Code running on the physical hardware.

- **`arduino_mega/arduino_mega.ino`**:
    - Initializes 15 hardware pins.
    - Performs polling of analog/digital signals.
    - Serializes data into a single JSON object.
    - Transmits to the ESP8266.
- **`esp8266_bridge/esp8266_bridge.ino`**:
    - Connects to WiFi.
    - Acts as a "transparent bridge" between Serial and the Cloud (Render).

---

## 🔗 How Files Connect
1. **Hardware Path:** `arduino_mega.ino` -> (Serial) -> `esp8266_bridge.ino` -> (HTTP) -> `server.js`.
2. **Streaming Path:** `server.js` -> (Socket.io) -> `useSocket.ts` -> (Prop drilling/Context) -> `SensorPage.tsx`.
3. **Logic Path:** `SensorPage.tsx` -> `useFaultInjector.ts` -> `useSignalProcessing.ts` -> `LiveChart.tsx`.
