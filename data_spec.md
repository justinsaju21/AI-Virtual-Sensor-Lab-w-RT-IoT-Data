# IoT Virtual Lab - Data Specification

## 1. Hardware to Backend Protocol (Upstream)

The hardware (Arduino Mega -> ESP8266 -> Backend) sends a JSON packet every `X` milliseconds (e.g., 2000ms).

**Transport:** MQTT (Topic: `lab/sensors/live`) or WebSocket (Event: `sensor_update`)

**JSON Structure:**

```json
{
  "device_id": "arduino_mega_01",
  "timestamp": 1700000000000, 
  "sensors": {
    "ultrasonic": { "distance_cm": 45.2 },
    "dht11": { "temp": 24.5, "humidity": 60.1 },
    "mq3": { "value": 150 },
    "mq2": { "value": 220 },
    "hall": { "active": false },
    "mic": { "level": 45 },
    "ir": { "detected": false },
    "flame": { "value": 1023 },
    "proximity": { "active": false },
    "bmp180": { "pressure": 101325, "altitude": 100, "temp": 24.5 },
    "touch": { "active": false },
    "ldr": { "value": 850 },
    "tilt": { "active": false },
    "heartbeat": { "value": 512 },
    "joystick": { "x": 512, "y": 512, "btn": false }
  },
  "system": {
    "uptime_ms": 3600000,
    "wifi_rssi": -55,
    "version": "1.0.0"
  }
}
```

## 2. Backend to Frontend Protocol (Downstream)

The backend broadcasts "normalized" data to connected web clients via socket.io.

**Event Name:** `data_stream`

**JSON Structure:**
(Same as Upstream, but ideally enriched with server-side timestamp if missing)

## 3. API Endpoints (REST)

### `GET /api/history`
Query Params: `start`, `end`, `sensor_id`
Response: Array of objects containing timestamp and specific sensor value.

### `GET /api/status`
Returns current system health status (is hardware connected? last seen?).

## 4. Database Schema (NoSQL - MongoDB-style approach)

Collection: `readings`

```json
{
  "_id": "ObjectId(...)",
  "timestamp": "ISODate(...)",
  "metadata": { "device_id": "..." },
  "readings": {
     // Flattened sensor data for easier querying
     "temperature": 24.5,
     "humidity": 60.2,
     "gas_raw": 340,
     // ...
  }
}
```
