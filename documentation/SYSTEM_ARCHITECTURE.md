# 🏗️ System Architecture - IoT Virtual Lab

## Infrastructure Overview
The IoT Virtual Lab is built on a **High-Performance Hybrid Digital Twin** architecture, combining real hardware data with low-latency animated mock streams.

### 1. Data Flow Architecture
The system operates on a 4-layer data flow model:
1. **Physical Layer**: Sensors connected to Arduino Mega/ESP8266.
2. **Transport Layer**: HTTP POST (Hardware -> Backend) and WebSockets (Backend -> Frontend).
3. **Processing Layer**: Node.js backend merges real hardware buffers with mock data generators at a consistent **200ms (5Hz)** frequency.
4. **Visualization Layer**: Next.js 16 frontend renders dual-layer charts (raw + processed) and AI-enhanced tutor widgets.

### 2. Technology Stack
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Recharts.
- **Backend**: Express 5.2, Socket.io 4.8, Node.js 18+.
- **AI**: Google Generative AI (Gemini 1.5 Flash).
- **Firmware**: C++ (Arduino/ESP8266).

### 3. Key Subsystems
- **AI Context Engine**: Injects real-time sensor state into LLM prompts for context-aware assistance.
- **Fault Injector**: Higher-order components that simulate 6 physical failure modes (stuck, noise, drift, etc.) for educational troubleshooting.
- **Signal Processor**: Client-side DSP pipeline providing Moving Average and Threshold Gate filters.

---
*Last Updated: April 2024*
