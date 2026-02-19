# 🏗️ System Architecture Overview

This document describes the high-level design and data flow of the **AI-Enabled Virtual Sensor Laboratory with Real-Time IoT Data**.

## 🚀 Technical Stack

### **Frontend (The User Interface)**
- **Framework:** [Next.js 14+](https://nextjs.org/) (React)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Mobile-responsive, modern dark-mode aesthetic)
- **Language:** TypeScript (Strict typing for sensor data payloads)
- **Charts:** [Recharts](https://recharts.org/) (SVG-based real-time data visualization)
- **Icons:** [Lucide-React](https://lucide.dev/) (Consistent engineering iconography)

### **Backend (The Logic Engine)**
- **Runtime:** [Node.js](https://nodejs.org/) (High-concurrency event-driven architecture)
- **API Framework:** Express.js (RESTful endpoints for history and configuration)
- **Real-Time Communication:** [Socket.io](https://socket.io/) (Bi-directional WebSockets for live data streaming)

### **Firmware (The Edge Layer)**
- **Main MCU:** Arduino Mega 2560 (Handles high-density I/O for 15+ sensors)
- **Cloud Gateway:** ESP8266 (WiFi bridge for cloud connectivity)
- **Protocol:** JSON over UART Serial (115200 baud)

---

## 🔄 Data Flow & Communication

The system operates in a **Hybrid Loop**, supporting both physical hardware and virtual simulation.

### 1. Hardware-in-Loop (Real Sensor Data)
1. **Acquisition:** Arduino Mega reads 15 analog/digital sensors via ADC and GPIO.
2. **Serialization:** Data is packaged into a compact JSON string using the `ArduinoJson` library.
3. **Bridge:** The ESP8266 receives this JSON via Serial, connects to the lab WiFi, and sends an HTTP POST request to the **Render** backend.
4. **Broadcast:** The Backend receives the POST, updates its internal state, and immediately "emits" the data to all connected browser clients via **Socket.io**.

### 2. Virtual Mode (Digital Twin)
1. **Simulation:** If no hardware is detected, the `mockDataGenerator.js` script on the backend takes over.
2. **Logic:** It uses mathematical models (Sine waves, Random Gaussian noise) to simulate realistic environmental changes.
3. **Delivery:** This simulated data follows the same Socket.io path as real data, making the transition seamless for the user.

---

## 🌐 API & Protocol Reference

### **Socket.io Events**
- `connection`: Triggered when a browser opens the dashboard.
- `data_stream`: The primary event. Sends the full `SensorData` object to the frontend every 500ms - 2000ms.
- `update_fault`: Sends new fault injection parameters from the UI to the backend engine.

### **REST API Endpoints**
- `POST /api/sensor-data`: The entry point for physical hardware (ESP8266).
- `GET /api/status`: Returns system uptime and connection heartbeat.
- `POST /api/ai-chat`: Sends user questions to the AI assistant logic.

---

## 🎨 Design Philosophy
The UI uses **Tailwind CSS** to create a "Glassmorphic" design. Key components (Cards, Charts) use semi-transparent backgrounds and subtle gradients to give the feel of a high-tech modern laboratory.
