# 📖 User Manual: How to Use the Lab

This guide explains how to interact with the **AI-Enabled Virtual Sensor Laboratory** dashboard.

---

## 🏠 1. The Main Dashboard
The home page shows "Live Preview Cards" for all 17 sensors.
- **Green Badge:** Indicates the sensor is receiving live data.
- **Red Badge:** Indicates a connection issue or that the sensor is currently being simulated (Digital Twin mode).
- **Clicking a Card:** Transports you to the dedicated "Focus Room" for that specific sensor.

---

## 📊 2. Reading the Real-Time Charts
Each sensor page has a high-fidelity chart.
- **Raw Data (The spiky line):** Shows the direct signal from the physical sensor or simulator.
- **Processed Data (The smooth white line):** Appears when you enable **DSP Filters**. It shows the mathematical trend.
- **Zoom/Pan:** Hover over the chart to see exact timestamps and values at any specific point in the history.

---

## 🛠 3. The Testing Control Panel (FIT)
This is where you perform "Stress Testing".
1. **Enable Testing Mode:** Toggle the switch in the sidebar.
2. **Inject Faults:** Select a fault (e.g., "Stuck-at-Low") to see how your system handles a failure.
3. **Apply Filters:** Select "Moving Average" to clean up noisy signals.
4. **Calibration:** Use the sliders to adjust the `m` and `c` values in $y = mx + c$ to fix sensor errors.

---

## 🤖 4. Interacting with the AI
The laboratory has two AI modes:

### **A. Global AI Assistant**
- Click the "AI Assistant" tab in the sidebar for a full-screen chat.
- Ask questions like: *"How do I calibrate an LDR?"* or *"Why is my Flame sensor showing 1023?"*

### **B. AI Mistake Detector**
- This module runs in the background. If you make a common engineering mistake (like leaving a wire floating), a **Mistake Alert** will pop up on your dashboard with a suggested fix.

---

## 📥 5. Data Exporting & Reporting
To use your lab data for your college records:
1. Go to any sensor page.
2. Click the **"Export Report"** button.
3. The system will generate a CSV or PDF summary of the last 100 data points, including the "Raw vs. Processed" comparison.
