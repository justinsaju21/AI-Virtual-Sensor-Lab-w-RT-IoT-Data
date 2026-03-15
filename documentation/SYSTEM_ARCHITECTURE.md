# 🏗️ System Architecture: The Deep Dive

This document provides an exhaustive technical analysis of how the **AI-Enabled Virtual Sensor Laboratory** functions. 

---

## 📂 1. Core Architectural Paradigm: The Hybrid Digital Twin
The system is built on the **Digital Twin** concept—a digital representation of a physical object. 

### **The Two Modes of Operation:**
1.  **Physical Mode (Hardware-in-Loop):**
    - The Arduino Mega 2560 acts as the "Local Sensor Node".
    - It physically probes real-world environment data.
    - Data is bridged to the internet via the ESP8266.
2.  **Virtual Mode (Simulation Engine):**
    - When no hardware is connected, the Node.js server generates "Fidelity-Mock" data.
    - This data isn't just random; it follows mathematical patterns (Sine waves for temp, Gaussian distributions for noise) to mimic real physics.

---

## 📡 2. Communication Protocols: The "Three-Link" Chain

### **Link A: Hardware to Gateway (Serial)**
- **Protocol:** UART (Serial)
- **Speed:** 115200 Baud
- **Format:** JSON String
- **Why?** Serial is the most robust way for a Mega to talk to an ESP8266. JSON allows us to add or remove sensors without changing the communication structure.
- **Deep Dive:** See [FIRMWARE_CORE_LOGIC.md](file:///c:/Users/justi/Desktop/SEM6%20Project/iot-virtual-lab/documentation/FIRMWARE_CORE_LOGIC.md) for timing and serialization details.

### **Link B: Gateway to Cloud (REST API)**
- **Protocol:** HTTP POST (via WiFi)
- **Destination:** `https://iot-lab-backend.onrender.com/api/sensor-data`
- **Security:** CORS (Cross-Origin Resource Sharing) is configured on the server to allow specifically signed requests.

### **Link C: Cloud to Browser (WebSockets)**
- **Protocol:** Socket.io (Engine.io)
- **Why WebSockets?** Traditional HTTP is "Pull" (Client asks, Server answers). For IoT, we need "Push" (Server shouts data whenever it arrives). 
- **Latency:** <100ms on high-speed internet.

---

## 🛠 3. The Tech Stack: Rationale

### **Frontend: Next.js + Tailwind**
- **Main Dashboard:** Built with Next.js 14, providing "Server-Side Rendering" for fast initial loads and "Client-Side Hydration" for the interactive charts.
- **Showcase & PPT:** A secondary Next.js 15 site focused on high-fidelity visuals using **Framer Motion**.
- **Theme Support:** Features a custom **Light/Dark Toggle** using React state and CSS variables, allowing for professional presentations in any lighting condition.
- **Tailwind CSS:** Used for its **Utility-First** approach. It allows us to create the complex "Glassmorphism" look (blurred overlays) using simple classes like `bg-white/10 backdrop-blur-lg`.

### **Backend: Node.js + Socket.io**
- **Node.js:** Its **Non-blocking I/O** is perfect for IoT. It handles high-frequency data packets from all 15 sensors concurrently.
- **Socket.io:** Handles the "Handshake" between the browser and the server. If the connection drops, it automatically tries to reconnect every 5 seconds.

---

## 🧠 4. Gemini AI & Mistake Detection
The system uses a two-tier AI architecture:

### **Static: Rule-Based Inference**
- It looks for **Correlative Anomaly**: "If Sensor A says X, but Sensor B says Y, then Z is a mistake."
- **Example:** High sound levels detected while the student's heartbeat (MAX30102) is stagnant indicates a potential environment noise issue rather than a genuine experiment state.

### **Generative: Gemini 1.5 Flash Integration**
The lab is integrated with Google's **Gemini AI** to provide human-like assistance:
- **Tutor Chat:** Context-aware assistant that receives the active sensor name and live data to help with debugging.
- **Automated Quizzes:** Generates engineering assessment questions dynamically based on the current sensor module.
- **Data Interpretation:** Analyzes recorded graph points to explain physical phenomena (e.g., "The spike at 2s indicates a rapid heat increase").

---

## 📊 5. Data Visualization (Recharts)
We use SVG (Scalable Vector Graphics) instead of Canvas for charting because SVG allows us to apply CSS transitions to the data lines. 
- **Frame Rate:** The charts update at **5Hz** (5 times per second). This provides a smooth "Oscilloscope" feel without overwhelming the browser's CPU.
