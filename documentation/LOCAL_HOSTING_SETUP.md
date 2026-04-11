# Local Hosting Setup Guide

This guide walks you through running the IoT Virtual Lab locally for development and testing.

## Prerequisites

- **Node.js** v18 or later ([download](https://nodejs.org/))
- **npm** v9 or later (comes with Node.js)
- **Git** (optional, for version control)
- **Gemini API Key** (optional, for AI features)

## Quick Start (2 Minutes)

### Terminal 1: Start Backend

```bash
cd iot-virtual-lab/backend
npm install
npm start
```

Expected output:
```
[INFO] Mock data broadcast starting
Running on port 5000
```

### Terminal 2: Start Frontend

```bash
cd iot-virtual-lab/frontend
npm install
npm run dev
```

Expected output:
```
Local:  http://localhost:3000
```

Visit [http://localhost:3000](http://localhost:3000) in your browser. ✅ Done!

---

## Detailed Setup

### 1. Backend Setup

**Location:** `iot-virtual-lab/backend/`

```bash
# Navigate to backend directory
cd iot-virtual-lab/backend

# Install dependencies
npm install

# Create environment file (optional, for Gemini API)
# Copy .env.example to .env and add your API key
```

**Environment Variables** (optional, create `.env` file):
```
GEMINI_API_KEY=your-api-key-here
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

**Start the server:**
```bash
npm start
# Or for development with auto-reload:
npx nodemon server.js
```

**Verify backend is running:**
- Open browser to [http://localhost:5000](http://localhost:5000)
- Should see: `{"status":"running","mode":"hybrid",...}`

**What the backend does:**
- Generates 17 mock sensor streams continuously
- Broadcasts data via WebSocket to all connected clients
- Receives real hardware data (when Arduino is connected)
- Provides AI endpoints for the tutoring system
- Merges real hardware + mock data seamlessly

---

### 2. Frontend Setup

**Location:** `iot-virtual-lab/frontend/`

```bash
# Navigate to frontend directory
cd iot-virtual-lab/frontend

# Install dependencies
npm install

# Create environment file (optional)
touch .env.local
```

**Environment Variables** (optional, create `.env.local` file):
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Start the development server:**
```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 16.1.1
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

**Access the application:**
- Dashboard: [http://localhost:3000](http://localhost:3000)
- Sensors page: [http://localhost:3000/sensors](http://localhost:3000/sensors)
- Learning page: [http://localhost:3000/learn](http://localhost:3000/learn)
- Settings: [http://localhost:3000/settings](http://localhost:3000/settings)

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│             Browser (React Frontend)                 │
│         http://localhost:3000                         │
│  ┌──────────────────────────────────────────────┐   │
│  │  Dashboard │ Sensors │ Learn │ Assistant    │   │
│  └──────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────┘
                 │ WebSocket (Socket.io)
                 │ Real-time data stream
                 │
┌────────────────▼────────────────────────────────────┐
│         Backend Server (Express + Socket.io)         │
│         http://localhost:5000                        │
│  ┌──────────────────────────────────────────────┐   │
│  │ Mock Data Generator (17 sensors)             │   │
│  │ Real Hardware RX (/api/sensor-data)          │   │
│  │ AI Endpoints (Gemini Integration)            │   │
│  │ WebSocket Broadcaster                        │   │
│  └──────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────┘
                 │
        ┌────────┘
        │
     ┌──▼──┐
     │ Mock│      (or real hardware via HTTP POST)
     │Data │
     └─────┘
```

---

## Features Tour

### 1. **Dashboard** (`/`)
- Live sensor readings from all 17 sensors
- Category-grouped sensor cards (Environmental, Detection, Gas, etc.)
- Click any sensor card to open detailed view
- Historical trends (Temperature, Sound Level)
- System status (uptime, signal strength, device info)

### 2. **Sensor Detail Views**
- Click sensor card → opens detailed modal
- **DHT11**: Temperature, humidity, dew point calculation
- **MQ2**: Gas detection with calibration controls
- **Ultrasonic**: Distance measurement with temp compensation
- **Coming soon**: 14 more sensor views

### 3. **Theory Panels**
- Each sensor has educational theory content
- Collapsible sections with formulas and explanations
- Learn while monitoring real data

### 4. **AI Tutor** (requires Gemini API key)
- Chat about sensors and IoT concepts
- Context-aware responses based on selected sensor
- Real-time markdown rendering

### 5. **Fault Injection** (Testing page)
- Simulate sensor failures
- Test error handling
- Validate edge cases

---

## Testing with Real Hardware

### Connect Arduino Sensors

1. **Program your Arduino with the firmware:**
   - ESP8266 Bridge: `firmware/esp8266_bridge/esp8266_bridge.ino`
   - Mega 2560 Main: `firmware/Mega2560_Main/Mega2560_Main.ino`

2. **Configure firmware:**
   - Set WiFi SSID/password
   - Set backend URL to your machine's IP address

3. **Start backend** (it will wait for hardware connection):
   ```bash
   npm start
   ```

4. **Power Arduino**
   - Arduino connects to WiFi
   - Sends data to `/api/sensor-data`
   - Dashboard switches to hybrid mode (real + mock data)
   - "Live" badge shows real sensors highlighted

**Hybrid Mode Details:**
- Real sensors override mock data when available
- Missing real sensors use mock data
- Frontend displays `isReal: true` flag on real sensor data
- Graceful fallback if hardware disconnects

---

## Troubleshooting

### Problem: "Cannot reach server" in frontend

**Solution:** Check backend is running
```bash
# Backend terminal
npm start

# Verify: Open http://localhost:5000 in browser
# Should see: {"status":"running",...}
```

### Problem: Socket connection error

**Causes:**
- Backend not running (see above)
- Port 5000 already in use
- Firewall blocking connection

**Fix ports:**
```bash
# Backend - change port in server.js
const PORT = process.env.PORT || 5000;  # Change to 5001, etc

# Frontend - set environment
export NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
npm run dev
```

### Problem: "npm command not found"

**Solution:** Install Node.js from [nodejs.org](https://nodejs.org/)

### Problem: AI responses not working

**Solution:** Set Gemini API key
```bash
# Create backend/.env file
echo "GEMINI_API_KEY=sk-abc123xyz" > .env

# Restart backend
npm start
```

### Problem: Ports don't free up after crash

**Find and kill processes:**
```bash
# Windows (PowerShell as Admin)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

---

## Performance Tips

### 1. Optimize Data Flow
```bash
# Backend: Reduce broadcast frequency
# In server.js, adjust INTERVAL_TX (currently 500ms)
const INTERVAL_TX = 800; // Increase for fewer updates

# Frontend: Limit history points
# In Dashboard.tsx, adjust MAX_DATA_POINTS
const MAX_DATA_POINTS = 20; # Default 30
```

### 2. Reduce CPU Usage
```bash
# Disable fault injection if not testing
# Comment out fault injection mount in Testing page

# Reduce chart update frequency in sensor views
# Adjust LiveGraph refresh rate
```

### 3. Monitor Network
- Open DevTools (F12) → Performance
- Watch WebSocket messages (F12 → Network → WS)
- Typical: 2-3 messages/second at 500ms TX interval

---

## Development Workflow

### Running Tests

**Sensor Detail Components:**
```bash
# Frontend terminal
npm run test  # (When test suite is ready)
```

**Backend API:**
```bash
# Test sensor data endpoint
curl -X POST http://localhost:5000/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{"device_id":"mega1","sensors":{"dht11":{"temp":25,"humidity":60}}}'
```

### Making Changes

1. **Frontend changes** → Auto-reload on save (thanks Next.js!)
2. **Backend changes** → Restart server (`npm start`)
3. **Hardware changes** → Recompile and upload Arduino sketch

### Building for Production

```bash
# Frontend production build
cd frontend
npm run build
npm run start

# Backend (already production-ready)
cd backend
NODE_ENV=production npm start
```

---

## API Reference

### WebSocket Events

**Receive:**
```javascript
socket.on('data_stream', (data) => {
  // Real-time sensor data
  console.log(data.sensors.dht11.temp);
});
```

**Data Structure:**
```typescript
{
  timestamp: string;       // ISO 8601 timestamp
  device_id: string;       // "mega1" or hardware ID
  system: {
    version: string;       // Firmware version
    uptime_ms: number;     // Uptime in milliseconds
    wifi_rssi: number;     // Signal strength (dBm)
  };
  sensors: {
    dht11: { temp: 25.5, humidity: 60, isReal: boolean };
    mq2: { raw: 150, isReal: boolean };
    ultrasonic: { distance_cm: 45, isReal: boolean };
    // ... 14 more sensors
  };
}
```

### HTTP Endpoints

**Health Check:**
```
GET http://localhost:5000/
Response: {"status":"running","mode":"hybrid",...}
```

**Submit Sensor Data (from hardware):**
```
POST http://localhost:5000/api/sensor-data
Content-Type: application/json

{
  "device_id": "mega1",
  "sensors": {
    "dht11": {"temp": 25.5, "humidity": 60},
    "mq2": {"raw": 150}
  }
}
```

**AI Chat (requires Gemini API key):**
```
POST http://localhost:5000/api/ai/ask
Content-Type: application/json

{
  "message": "What is dew point?",
  "context": {
    "sensor": "DHT11",
    "data": {"temp": 25, "humidity": 60}
  }
}
```

---

## Next Steps

1. ✅ **Run locally** → You're here!
2. 📊 **Explore dashboard** → Click sensors, open modal views
3. 🔨 **Test with mock data** → Everything works without hardware
4. 🎓 **Read theory panels** → Learn sensor physics
5. ⚙️ **Connect real hardware** → Program Arduino and connect
6. 🚀 **Deploy to cloud** → Follow DEPLOYMENT_AND_DOMAIN.md

---

## Support

- **Frontend issues?** Check `frontend/errors.txt`
- **Backend crashes?** Check server logs
- **Data not flowing?** Open DevTools (F12) → Console
- **Schema questions?** See `documentation/SYSTEM_ARCHITECTURE.md`

**Happy experimenting!** 🚀
