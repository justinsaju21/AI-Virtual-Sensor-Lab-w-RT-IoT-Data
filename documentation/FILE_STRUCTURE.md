# 📂 File-by-File Technical Guide

This document explains every single file in the repository, its purpose, and how it connects to the project as a whole.

---

## 📁 1. The Frontend (`/frontend`)
The frontend is built with **Next.js 14** using the **App Router** architecture.

### **📦 `src/components/` (The UI Library)**
- **`ui/`**: Basic UI building blocks like Buttons, Cards, and Badges.
- **`layout/Header.tsx`**: The top bar. It listens to the `isConnected` state to show the green "WiFi" indicator.
- **`charts/LiveChart.tsx`**: The core visualization. It uses **Recharts** to draw SVG lines. It is designed to accept two data series: `raw` and `processed`.
- **`testing/TestingControlPanel.tsx`**: The panel on sensor pages where users select "Faults" or "DSP Filters".
- **`ai/MistakeDetector.tsx`**: A smart overlay that pops up when unusual sensor patterns (like floating pins) are detected.

### **🎣 `src/hooks/` (The Global Logic Hooks)**
- **`useSocket.ts`**: The "Heartbeat" of the app. It opens the connection to the backend and exposes a `data` object that contains all 17 sensors.
- **`useFaultInjector.ts`**: Intercepts the real data. If a user clicks "Stuck-at-GND" in the UI, this hook overrides the real value with `0`.
- **`useSignalProcessing.ts`**: Runs the **Moving Average** math. It keeps an internal array of the last 10 samples and averages them.

### **📄 `src/app/` (The Pages/Routes)**
- **`page.tsx`**: The main Dashboard. Shows preview cards for all sensors.
- **`sensors/[name]/page.tsx`**: The detailed view for each sensor. These are the core files where learning happens.
- **`assistant/page.tsx`**: The full-screen AI chat page for deep troubleshooting.

---

## 📁 2. The Backend (`/backend`)
The backend is a **Node.js** server that acts as a secure "Data Hub".

- **`server.js`**: 
  - Sets up the **Express** web server.
  - Initializes **Socket.io** for real-time broadcasts.
  - Contains the logic: "When data comes from the Arduino, scream it to every open browser."
- **`mockDataGenerator.js`**: 
  - The Digital Twin engine. 
  - It uses `setInterval` to generate fresh pulses of data for all 17 sensors every second when no hardware is found.
- **`package.json`**: Lists the critical libraries like `socket.io` and `cors`.

---

## 📁 3. The Firmware (`/firmware`)
This is the code that actually lives inside the chips on your board.

- **`arduino_mega/arduino_mega.ino`**:
  - The "Data Harvester." 
  - It loops through `analogRead(A0)` to `analogRead(A15)`.
  - It creates a JSON object: `{"s":{"temp":25, "hum":60, ...}}`.
  - It sends this to the ESP8266 using `Serial1.println()`.
- **`esp8266_bridge/esp8266_bridge.ino`**:
  - The "WiFi Gateway." 
  - It purely listens to the Serial line. 
  - When it sees a JSON line come from the Mega, it wraps it in an **HTTP POST** request and fires it at the Render URL.

---

## 📁 4. The Types (`/frontend/src/types`)
- **`sensorData.ts`**: 
  - This is the **Contract**. 
  - It defines exactly what properties a sensor must have. 
  - If the backend sends a property named `pir`, but the frontend expects `ir`, this file helps us find and fix the error (as we did earlier!).

---

## 📁 5. Root Files
- **`README.md`**: The entry point for humans.
- **`data_spec.md`**: The raw data format documentation.
- **`documentation/`**: This comprehensive help folder.
