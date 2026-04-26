# 🏗️ System Architecture - IoT Virtual Lab

## Infrastructure Overview
The IoT Virtual Lab is built on a **High-Performance Hybrid Digital Twin** architecture, combining real hardware data with low-latency animated mock streams.

### 1. Data Flow Architecture
The system operates on a 4-layer synchronized data flow model:
1. **Physical Layer**: 17 sensors connected to Arduino Mega 2560 (Data Aggregator).
2. **Transport Layer**: 
   - **Local**: UART with stop-and-wait ACK handshake between Mega and ESP8266.
   - **Internet**: HTTPS POST via ESP8266 using **BearSSL Session Caching** to bypass TLS handshake latency.
3. **Processing Layer**: Node.js (Render) backend merges real-time hardware buffers with mock streams at a consistent **200ms (5Hz)** sync frequency.
4. **Visualization Layer**: Next.js 15+ frontend rendering live Recharts and AI-enhanced tutor widgets.

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
