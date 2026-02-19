# IoT Virtual Lab - Data Specification

## 1. Hardware to Backend Protocol (Upstream)

The hardware (Arduino Mega -> ESP8266 -> Backend) sends a JSON packet every `X` milliseconds (e.g., 2000ms).

**Transport:** MQTT (Topic: `lab/sensors/live`) or WebSocket (Event: `sensor_update`)

**JSON Structure:**

```json
{
  "device_id": "lab_unit_01",
  "timestamp": "2023-10-27T10:00:00Z", // Optional, server can add this if no RTC
  "sensors": {
    "dht22": {
      "temperature": 24.5,
      "humidity": 60.2,
      "status": "ok"
    },
    "mq2": {
      "raw_value": 340,
      "gas_percentage": 12.5,
      "status": "ok"
    },
    "ldr": {
      "light_level": 850,
      "status": "ok"
    },
    "pir": {
      "motion_detected": true,
      "status": "ok"
    },
    "ultrasonic": {
      "distance_cm": 150.0,
      "status": "ok"
    }
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
