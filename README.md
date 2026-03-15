# 🧪 AI-Enabled Virtual Sensor Laboratory with Real-Time IoT Data

A hybrid "Digital Twin" platform for remote IoT education, SoC reliability testing, and real-time sensor analytics.

## 🚀 Quick Links
- **Live Demo:** [ai-virtual-sensor-lab-w-rt-iot-data.vercel.app](https://ai-virtual-sensor-lab-w-rt-iot-data.vercel.app)
- **Backend API:** [ai-virtual-sensor-lab-w-rt-iot-data.onrender.com](https://ai-virtual-sensor-lab-w-rt-iot-data.onrender.com)

---

## 📚 Technical Documentation
We have simplified the project documentation into several modules for ease of review:

1.  **[System Architecture](documentation/SYSTEM_ARCHITECTURE.md):** Tech stack (Node, Next, Socket.io) and 4-layer Data Flow.
2.  **[File Structure](documentation/FILE_STRUCTURE.md):** Breakdown of frontend, backend, firmware, and the **Showcase/PPT** project.
3.  **[Hardware & Sensors](documentation/HARDWARE_AND_SENSORS.md):** Arduino Mega pinouts for 15 active sensors.
4.  **[Deployment & Domain](documentation/DEPLOYMENT_AND_DOMAIN.md):** Cloud hosting and environment setup.
5.  **[Algorithms & Logic](documentation/ALGORITHMS_AND_LOGIC.md):** Fault Injection, DSP Filters, and AI Mistake Detector math.

## ✨ Key Features
- **17 Integrated Sensors:** Real-time acquisition from 16 physical + 1 virtual source.
- **Hybrid Digital Twin:** High-fidelity simulation when hardware is offline.
- **Gemini AI Integration:** Live tutoring, automated quiz generation, and data interpreted by Google's Gemini 1.5 Flash.
- **AI-Driven Diagnostics:** Interactive mistake detection and engineering assistance.
- **Dual-Theme Showcase:** Professional presentation deck with Light/Dark mode transitions.
- **Illustration Generator:** Dedicated UI for generating project illustrations.

---

## 🛠 Tech Stack Summary
- **Frontend:** Next.js (TypeScript), Tailwind CSS, Recharts.
- **Backend:** Node.js, Express, Socket.io.
- **Hardware:** Arduino Mega 2560, ESP8266 (WiFi Bridge).
- **Hosting:** Render (Backend), Vercel (Frontend).

## 🛠 Prerequisites
- Node.js (v18+)
- Arduino IDE (for hardware uploads)

## 🏃 Running Locally
1. **Backend:** `cd backend && npm install && node server.js`
2. **Frontend:** `cd frontend && npm install && npm run dev`
3. Open `http://localhost:3000`
