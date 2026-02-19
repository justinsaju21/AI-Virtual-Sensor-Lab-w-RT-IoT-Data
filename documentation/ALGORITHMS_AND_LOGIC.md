# 🧠 Algorithms, Filters & AI Logic

This is the most technical document in the lab. It explains the "Control Engineering" and "Data Science" applied to the sensor streams.

---

## 🛡️ 1. Fault Injection: The Engineering Stress Test
To teach students how to build "Fault-Tolerant" code, we intentionally corrupt the data. This is done inside the `useFaultInjector.ts` hook.

### **The Logic Table:**
| Fault Type | Mathematical Implementation | Physical Equivalent |
| :--- | :--- | :--- |
| **None** | `y = raw_input` | Perfect Operation |
| **Stuck-at-Low** | `y = 0` | Short to Ground (GND) |
| **Stuck-at-High** | `y = 1023` | Short to VCC (5V) |
| **Open Circuit** | `y = undefined / null` | Cut or Broken Wire |
| **Random Noise** | `y = raw + random(-100, 100)` | Electromagnetic Interference |
| **Calibration Drift** | `y = raw + constant_increase` | Sensor Aging / Heat Damage |

---

## 📉 2. Digital Signal Processing (DSP)
Real-world sensors are "dirty" (they have spikes). We use software math to clean them up in the `useSignalProcessing.ts` hook.

### **A. Moving Average Filter (Smoothing)**
This algorithm calculates the average of the last $N$ samples to remove sudden spikes.
```javascript
// Pseudocode
window_size = 10;
history = [];

function smoothedValue(newSample) {
    history.push(newSample);
    if (history.length > window_size) history.shift();
    return sum(history) / history.length;
}
```
**Why use it?** It creates a steady trendline on your charts, making it easier to read values like Temperature or Gas levels.

### **B. Dynamic Thresholding**
Used for "Binary" sensors like PIR or Hall Effect.
```javascript
// Logic
if (raw_value > sensitivity_threshold) {
    return "DETECTED";
} else {
    return "CLEAR";
}
```

---

## 🤖 3. AI Supervision & Inference Engine
The "AI" doesn't just chat; it watches the live data stream for engineering mistakes.

### **Rule 1: The "Floating Pin" Mistake**
- **Symptom:** A Digital Sensor (Motion/Touch) is fluctuating between 0 and 1 extremely fast (like a square wave).
- **AI Logic:** `if (frequency > 20Hz && sensorType == "Digital")`
- **Output Warning:** "Potential Floating Pin detected! Please check if your Pull-up/Pull-down resistor is connected."

### **Rule 2: Environmental Correlation**
- **Logic:** `if (Gas_Sensor > 400 && LDR_Sensor < 100 && Flame_Sensor == 0)`
- **AI Inference:** "Detected Smoke in a dark room without a fire spark. Likely a hidden smoldering fire or sensor calibration error!"

---

## 📝 4. JSON Serialization (The Contract)
To make the Arduino talk to the Cloud, we use a structured JSON format. This ensures the frontend always knows which value belongs to which sensor.
```json
{
  "deviceId": "MEGA_01",
  "sensors": {
    "temp": 24.5,
    "mq2": 150,
    "ultrasonic": 52.1
  },
  "system": {
    "uptime": 3600,
    "freeHeap": 4096
  }
}
```
*Tip: We use the `ArduinoJson` library on the Mega to safely build this string without causing memory leaks.*
