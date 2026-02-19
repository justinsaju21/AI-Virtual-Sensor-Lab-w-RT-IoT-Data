# 🧠 Algorithms & Mathematical Logic

This document details the scientific and logical backbone of the **AI-Enabled Virtual Sensor Laboratory**.

## 🛡️ 1. Fault Injection Simulator (FIS)
We implement **FIT (Fault Injection Testing)** to evaluate how the software handles degraded hardware. These are implemented in the `useFaultInjector.ts` hook.

### **Types of Faults:**
- **Stuck-at-Low / Stuck-at-High:**
  `y = constant_offset (0 or 1023)`
  *Simulates a short circuit to VCC or GND.*
- **Open Circuit:**
  `y = null`
  *Simulates a cut wire or loose connection.*
- **Gaussian Noise Burst:**
  `y = raw_data + random_variation(-200, +200)`
  *Simulates electromagnetic interference (EMI) or bad shielding.*
- **Drift Fault:**
  `y = raw_data + (rate * time)`
  *Simulates sensor aging or thermal expansion.*

---

## 📉 2. Digital Signal Processing (DSP)
To handle real-world noisy hardware, the system includes real-time signal processing in the `useSignalProcessing.ts` hook.

### **Moving Average Filter:**
$$ y[n] = \frac{1}{L} \sum_{k=0}^{L-1} x[n-k] $$
- **Why?** It acts as a Low-Pass Filter (LPF) that removes high-frequency jitter while preserving the trend.
- **Visual:** The dashboard shows a smooth white line overlaying the jagged raw data.

### **Thresholding (Digital Debouncing):**
Used for binary sensors like Tilt or Touch to prevent "spiky" data from causing false triggers.
`if (raw < low_threshold) state = OFF;`

---

## 🤖 3. AI Mistake Detector Logic
The laboratory uses an "AI-Enabled" diagnostic layer to supervise user experiments.

### **Logic Rules:**
- **Floating Input Detection:** If a digital pin is fluctuating randomly between 0 and 1 without user interaction, the AI flags a "Missing Pull-up Resistor" mistake.
- **Cross-Sensor Validation:**
  - *Scenario:* Gas Sensor (MQ2) is high, but the LDR (Light) shows darkness.
  - *AI Inference:* Flags a potential Fire Hazard (since fire creates light and smoke).
- **Sampling Frequency Warning:** If data arrives too slow, the AI suggests checking the ESP8266 power supply for voltage drops.

---

## 📊 4. Data Serialization (ArduinoJson)
The Arduino Mega uses **MessagePack-inspired JSON** to minimize serial overhead.
- **Static Memory Allocation:** We use `StaticJsonDocument<1024>` to ensure the Mega never crashes from heap fragmentation during high-speed data acquisition.
