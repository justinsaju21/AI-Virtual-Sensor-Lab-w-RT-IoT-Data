# 📖 Technical Manual - IoT Virtual Lab

## 1. System Internals
The IoT Virtual Lab is a distributed system consisting of a React-based frontend and a Node.js-based backend, synchronized via WebSockets.

### Data Model
Sensor data is represented as a structured object:
```json
{
  "sensorId": {
    "value": Number,
    "timestamp": String,
    "isReal": Boolean,
    "properties": { ... }
  }
}
```

### Processing Logic
- **Backend**: Every 200ms, the `broadcastLoop` executes. It calculates the delta for mock data using sine/noise functions and merges it with the `LATEST_HARDWARE_DATA` buffer.
- **Frontend**: Data is received via `useSocket` hook and stored in a shared state using React Context (or local state in the Dashboard). Sensors detail pages use a rolling window of 50 points for real-time charting.

## 2. Component Architecture
- **SensorDetailLayout**: A HOC that wraps all sensor pages, providing the common sidebar, header, and AI chat integration.
- **FaultInjector**: Intercepts the data stream to apply mathematical transformations (e.g., `value * 0` for open circuit).
- **AI Tutors**: Sends the current sensor type and last 5 data points to the Gemini 1.5 Flash model for real-time analysis.

## 3. Performance Optimization
- **Recharts Optimization**: Uses `isAnimationActive={false}` for high-frequency updates to save CPU.
- **WebSocket Throttling**: Backend limits broadcast frequency to 5Hz to avoid flooding the browser main thread.
- **Selective Rendering**: Memoized components prevent unnecessary re-renders of the dashboard grid.

## 4. Advanced Troubleshooting
- **Missing Data**: Check `Socket Status` in the header. If `Offline`, verify backend `PORT 5000` is open.
- **AI Not Responding**: Ensure `GEMINI_API_KEY` is set in `.env`. Check backend logs for rate limit errors.
- **Hardware Lag**: Ensure ESP8266 is on the same 2.4GHz network. Wired USB fallback is recommended for low-latency testing.

---
*Last Updated: April 2024*
