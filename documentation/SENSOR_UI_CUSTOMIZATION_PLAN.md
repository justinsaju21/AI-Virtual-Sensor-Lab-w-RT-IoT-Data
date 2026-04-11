# Sensor-Specific UI Customization Implementation Plan

## Overview
Each sensor will have a customized component (`[SensorName]View.tsx`) that includes:
1. **Real-time Visualization** - graphs, gauges, waveforms specific to sensor type
2. **Theory/Educational Content** - physics, electronics, calibration info
3. **Interactive Elements** - thresholds, unit conversions, alerts
4. **Actionable Insights** - anomalies, warnings, recommendations

---

## Implementation Plan by Sensor Type

### **ENVIRONMENTAL SENSORS**

#### **1. DHT11 (Temperature & Humidity)**
```
Component: DHT11View.tsx
Visualization:
├─ Dual Gauge Display (Temp & Humidity side-by-side)
├─ Live History Chart (5-minute trend)
├─ Comfort Zone Indicator (Dry/Comfortable/Humid)
└─ Dew Point Calculator (derived value)

Theory Section:
├─ Psychrometric Properties (°C, %RH, Dew Point relationships)
├─ Comfort Range Indicator (WHO/ASHRAE standards)
├─ Sensor Limitations (±2°C, ±5% RH accuracy)
└─ Use Cases (HVAC, incubators, storage)

Interactive:
├─ Set comfortable temperature range
├─ Visual alert when out of range
└─ Export historical data
```

**Why**: Dual measurements need coordinated visualization. Comfort zones educate users on practical applications.

---

#### **2. BMP280 (Pressure & Temperature)**
```
Component: BMP280View.tsx
Visualization:
├─ Barometric Pressure Gauge (hPa/mb display)
├─ Altitude Simulator (pressure → altitude conversion)
├─ Trend Analysis (pressure rising/falling = weather prediction)
└─ Temperature Trend (secondary)

Theory Section:
├─ Atmospheric Pressure Basics
├─ Altitude Calculation Formula (hypsometric equation)
├─ Weather Prediction (Low pressure = storm approaching)
├─ Sensor Specs (accuracy ±1 hPa)
└─ Real-world Applications (weather station, altitude tracker, HVAC)

Interactive:
├─ Toggle between hPa/mb/inHg units
├─ Live altitude display (set sea-level reference)
├─ 6-hour pressure trend graph
└─ Weather emoji predictor (sunny/cloudy/rainy based on trend)
```

**Why**: Pressure is underutilized - showing altitude + weather prediction makes it tangible.

---

### **GAS SENSORS**

#### **3. MQ2 (Gas/Smoke)**
```
Component: MQ2View.tsx
Visualization:
├─ Analog Raw Value Display (0-1023 scale)
├─ Progress Bar (visual intensity)
├─ Calibrated PPM Conversion (if baseline set)
├─ Alert Threshold Slider
└─ Response Time Indicator (stabilization graph)

Theory Section:
├─ Gas Detection Mechanism (hot resistor + air quality)
├─ PPM vs Raw ADC Conversion
├─ Calibration Process (fresh air = reference)
├─ Sensitive to: LPG, Smoke, Alcohol, Propane
├─ Response Time: ~10 seconds
├─ Recommended Thresholds (safe: <300, warning: 300-500, danger: >500)
└─ Real Applications (fire alarm, gas leak detector)

Interactive:
├─ Calibrate: Click "Set Fresh Air" to establish baseline
├─ Threshold customization (slide to set alert level)
├─ Alert history (timestamp when thresholds crossed)
└─ Comparison: Show current vs baseline
```

**Why**: Gas sensors need calibration + thresholds to be useful. Raw numbers are meaningless without context.

---

#### **4. MQ3 (Alcohol Sensor)**
```
Component: MQ3View.tsx
Visualization:
├─ Alcohol Level Bar (0-1023 scale)
├─ BAC Estimation (if calibrated for breath)
├─ Response Time Graph (how long to stabilize)
├─ Safety Threshold Indicator
└─ Last Detection Timestamp

Theory Section:
├─ Alcohol Detection Mechanism
├─ Sensitivity: Ethanol vapor
├─ Raw Value Interpretation (200 = no alcohol, >400 = detected)
├─ Breathalyzer Calibration (if used as breath sensor)
├─ Warm-up Time: ~1 minute
├─ False Positives: Explains why certain substances trigger it
└─ Applications (DUI detection, fermentation monitoring)

Interactive:
├─ Set personal threshold for alerts
├─ Warm-up timer (countdown until stable)
├─ Detection history (log when triggered)
└─ Educational: "Why did it spike?" guide
```

**Why**: Alcohol sensors are misunderstood - need clear thresholds and context.

---

### **DISTANCE & DETECTION SENSORS**

#### **5. HC-SR04 (Ultrasonic Distance)**
```
Component: UltrasonicView.tsx
Visualization:
├─ Large Distance Display (cm/inches)
├─ Visual Distance Bar (0-400cm scale)
├─ 3D Distance Gauge (needle + color zones)
├─ Real-time Distance Plot (5 sec rolling)
├─ Accuracy Indicator (±2.5cm at optimal)
└─ Dead Zone Warning (can't detect <2cm)

Theory Section:
├─ How it Works (speed of sound calculation)
├─ Formula: distance = (time × speed_of_sound) / 2
├─ Speed of Sound (343 m/s at 20°C, varies with temperature)
├─ Blind Spots (<2cm can't detect, >400cm unreliable)
├─ Accuracy Factors (angle, material reflectivity)
├─ Temperature Compensation (why accuracy changes with temp)
└─ Applications (parking sensors, obstacle detection, liquid level)

Interactive:
├─ Show formula derivation
├─ Temperature input (adjust sound speed)
├─ Calibration wizard (measure known distance)
├─ Zone Definition (0-50cm danger, 50-200cm caution, >200cm safe)
└─ Obstacle Detection Alert
```

**Why**: Ultrasonic is fascinating physics - showing the math + compensation builds understanding.

---

#### **6. Flame Sensor**
```
Component: FlameSensorView.tsx
Visualization:
├─ Large "FLAME STATUS" Indicator (🔥 or ✓)
├─ Analog Intensity (0-1023, shows sensitivity)
├─ Digital State (High/Low logic)
├─ Digital Pin State Display
├─ Response Time Indicator
└─ False Positive Warning

Theory Section:
├─ IR Flame Detection (900-1100nm wavelength)
├─ Analog vs Digital (analog = intensity, digital = threshold)
├─ Response Time: 10-20ms
├─ Range: Detectable up to 1 meter
├─ False Triggers: Direct sunlight, infrared heaters, welding
├─ Detection Spectrum (BBQ flames: strong signal, matches/lighters: weak)
└─ Applications (fire alarm verification, automated extinguisher)

Interactive:
├─ Set Digital Threshold via slider
├─ View analog + digital comparison
├─ Sensitivity Test (show what analog value triggers digital)
├─ False Positive Prevention Guide
└─ Test Log (last N detections with timestamp)
```

**Why**: Safety-critical sensor needs clear state + false positive awareness.

---

#### **7. PIR Sensor (Motion)**
```
Component: PIRView.tsx
Visualization:
├─ Large Motion State (MOTION DETECTED / Clear)
├─ Last Detection Timestamp
├─ Detection Frequency (detections per minute)
├─ Warm-up Status (sensor stabilizing)
├─ Active Duration Timer (how long motion detected)
└─ Heat Map Visualization (ASCII art of sensing zone)

Theory Section:
├─ Passive Infrared Detection (measures temperature differences)
├─ How It Works (compares background IR to moving objects)
├─ Detection Range: 5-7 meters typical
├─ Response Time: 0.5-60 seconds (configurable)
├─ Warm-up Time: 30-60 seconds required
├─ Blind Spot: Directly above sensor
├─ False Triggers: Heating vents, air conditioning, animals
└─ Applications (motion-activated lighting, security, occupancy detection)

Interactive:
├─ Warm-up countdown (if not ready)
├─ Detection sensitivity indicator
├─ Decay Time selector (detection timeout)
├─ Motion History (last 10 detections)
└─ Alternative: "Is it a pet?" - explains animal detection
```

**Why**: PIR sensors confuse users (warmup, range, blind spots) - educational UI solves this.

---

#### **8. IR Obstacle Sensor**
```
Component: IRView.tsx
Visualization:
├─ Large State Display (OBSTACLE / CLEAR)
├─ Analog Value Display (0-1023, sensor strength)
├─ Distance Estimation (if calibrated)
├─ Sensitivity Calibration Slider
├─ LED Feedback (shows when detecting)
└─ Response Timeline

Theory Section:
├─ Infrared Reflection Detection
├─ How It Works (emit IR, measure reflection)
├─ Analog Output Interpretation (closer = lower value, farther = higher)
├─ Detection Range: 20-30cm typical
├─ Response Time: <5ms
├─ Materials (reflective surfaces: shiny, dark surfaces: poor detection)
├─ Calibration Needed (environmental IR affects accuracy)
└─ Applications (line following, obstacle avoidance, hand proximity)

Interactive:
├─ Real-time Calibration: "Move obstacle closer/farther"
├─ Threshold Setting via Slider
├─ Surface Material Test (test on different surfaces)
└─ Distance Estimation Graph
```

**Why**: IR detection is counterintuitive (lower = closer) - visualization fixes confusion.

---

#### **9. Ultrasonic Proximity (Sonar)**
```
Component: ProximitySensorView.tsx
Visualization:
├─ State Display (NEAR / FAR)
├─ Digital Pin State
├─ Detection History Timeline
├─ Response Performance
└─ Environmental Conditions

Theory Section:
├─ Sonar-based Detection
├─ Detection Range: Varies by model
├─ Trigger Point: Configurable distance
├─ Applications: Presence detection, proximity alerts
└─ Limitations: Reflective surfaces, dead zones
```

**Why**: Simpler sensor - straightforward visualization + practical use cases.

---

### **LIGHT & SOUND SENSORS**

#### **10. LDR (Light Sensor)**
```
Component: LDRView.tsx
Visualization:
├─ Large Light Level Display (0-1023)
├─ Light Intensity Gauge (visual bar)
├─ Light Conditions Label (dark/dim/bright/very bright)
├─ Live Graph (5-minute trend)
├─ Color-coded Background (darker when dim, lighter when bright)
└─ Calibration Reference

Theory Section:
├─ Light-Dependent Resistor (photoresistor)
├─ How It Works (resistance ↓ as light ↑)
├─ Resistance Range: Dark: ~200kΩ, Bright: ~1kΩ
├─ Response Time: ~30ms
├─ Temperature Sensitivity (changes with ambient temp)
├─ Spectral Sensitivity (more sensitive to red light)
├─ Applications (light-adaptive displays, light meters, photography)
├─ Typical Thresholds:
│   ├─ Dark: 0-200
│   ├─ Dim: 200-400
│   ├─ Bright: 400-700
│   └─ Very Bright: 700+

Interactive:
├─ Set custom light level thresholds
├─ Calibrate: "Mark current level as reference"
├─ Alert when brightness drops below threshold
└─ Show what objects trigger specific levels
```

**Why**: LDR is simple but showing light zones + practical applications makes it educational.

---

#### **11. Sound Sensor (Microphone)**
```
Component: SoundSensorView.tsx
Visualization:
├─ Audio Level Meter (0-1023 scale, VU meter style)
├─ Real-time Waveform (50ms rolling visualization)
├─ Decibel Estimation (if calibrated)
├─ Frequency Indicator (HIGH/MID/LOW approximation)
├─ Noise Category (Silent/Quiet/Normal/Loud/Very Loud)
├─ Digital Detection State (HIGH when loud enough)
└─ Peak Hold Indicator

Theory Section:
├─ Microphone Basics (converts sound pressure to voltage)
├─ How It Works (membrane vibrates, capacitance changes)
├─ Frequency Response (typically 20Hz-20kHz human hearing range)
├─ Analog Output: Sound intensity level
├─ Digital Output: Threshold-based detection
├─ Decibel Scale (logarithmic, each +10dB = 2x power)
├─ Typical Levels:
│   ├─ Silent: 30dB (0-100 raw)
│   ├─ Quiet: 40-50dB (100-300 raw)
│   ├─ Normal: 60dB (300-600 raw)
│   ├─ Loud: 80dB (600-900 raw)
│   └─ Very Loud: >90dB (900+ raw)
├─ Noise in Different Environments
└─ Applications (clap detection, noise monitoring, audio-triggered events)

Interactive:
├─ Set Sensitivity (digital threshold slider)
├─ Calibrate: Record "silent" baseline
├─ View analog + digital sync
├─ Test: "Clap Detection" wizard
├─ Frequency Visualization (simple spectrum analyzer)
└─ Alert when noise exceeds threshold
```

**Why**: Sound is non-obvious (raw values vs dB) - visualization + categories make it intuitive.

---

### **MECHANICAL SENSORS**

#### **12. Touch Sensor**
```
Component: TouchSensorView.tsx
Visualization:
├─ Large Touch State (TOUCHED / RELEASED)
├─ Last Touch Timestamp
├─ Touch Count (consecutive touches)
├─ Touch Duration (how long held)
├─ Touch Frequency (touches per minute)
├─ Sensitivity Indicator
└─ Visual Feedback Animation (button press effect)

Theory Section:
├─ Capacitive Touch Sensing
├─ How It Works (detects capacitive change when finger near)
├─ Detection Range: 1-3mm typical
├─ Response Time: <20ms
├─ False Triggers: Moisture, metal objects
├─ Debounce Requirements (software filtering needed)
├─ Applications (phone screens, touch lamps, capacitive buttons)
└─ Troubleshooting Guide

Interactive:
├─ Touch Sensitivity Calibration
├─ Debounce Time Setting
├─ Test: "Touch and Hold" counter
└─ Troubleshoot: False trigger detection
```

**Why**: Touch sensors need debouncing explanation - common source of confusion.

---

#### **13. Tilt Sensor**
```
Component: TiltSensorView.tsx
Visualization:
├─ Large Tilt State (TILTED / LEVEL)
├─ 3D Cube Representation (tilts with sensor)
├─ Orientation Angle Estimate (if dual-axis)
├─ Tilt Frequency (tilts per minute)
├─ Last Tilt Timestamp
├─ Threshold Indicator
└─ Sensitivity Calibration

Theory Section:
├─ Mercury/Ball Tilt Switch
├─ How It Works (ball/mercury completes circuit when tilted)
├─ Tilt Threshold: Typically 45-90 degrees
├─ Response Time: Instant
├─ Debounce: Needed (settles after tilting)
├─ Applications (anti-theft, device orientation detection, incline measurement)
└─ Limitations: Only detects at threshold
```

**Why**: Simple sensor - 3D visualization + frequency analytics make it engaging.

---

#### **14. Hall Effect Sensor (Magnetic)**
```
Component: HallSensorView.tsx
Visualization:
├─ Large Magnetic State (DETECTED / CLEAR)
├─ Magnetic Field Strength Indicator
├─ Last Detection Timestamp
├─ Polarization Indicator (N/S poles)
├─ Detection Count
├─ Response Time Graph
└─ Magnet Type Legend

Theory Section:
├─ Hall Effect Physics (Lorentz force)
├─ How It Works (measures magnetic field perpendicular to current)
├─ Output Voltage: Proportional to magnetic flux
├─ Sensitivity: Typical 10-20mV/mT (milli-Tesla)
├─ Response Time: <10µs
├─ Magnetic Field Sources:
│   ├─ Permanent magnets (strongest)
│   ├─ Electromagnets
│   ├─ Earth's magnetic field (weak)
│   └─ AC current (varies)
├─ Practical Magnetism Units (Tesla, Gauss, mT)
└─ Applications (brushless motor control, compass, proximity detection)

Interactive:
├─ Visualize when magnetic field detected
├─ Magnet Type Identifier (tool to identify pole strength)
├─ Field Strength Logger
└─ Wave Generator (show AC field response)
```

**Why**: Hall effect is fascinating physics - visualization helps demystify it.

---

### **INPUT CONTROLLERS**

#### **15. Joystick**
```
Component: JoystickView.tsx
Visualization:
├─ Live 2D Coordinate Plot (X vs Y position)
├─ Joystick Schematic (needle indicator in 2D space)
├─ Digital Button State (PRESSED / RELEASED)
├─ Center Deadzone Visualization (neutral zone)
├─ Movement Trail (last 30 positions)
├─ Calibration Status
└─ Range Indicators (0-1023 for each axis)

Theory Section:
├─ Analog Joystick Mechanics (2x potentiometers + button)
├─ X/Y Output: 0-1023 each
├─ Center Position: ~512
├─ Deadzone Concept (ignore small movements around center)
├─ Calibration (full range mapping)
├─ Button: Digital press detection
├─ Response Time: <5ms
├─ Applications (games, robot control, menu navigation)
└─ Calibration Process

Interactive:
├─ Auto-Calibration: Move through full range
├─ Deadzone Setting: Slider to ignore center noise
├─ Movement Test: Show current position + trail
├─ Button Debounce Setting
└─ Test Game: Simple arrow game to verify responsiveness
```

**Why**: Analog input - needs calibration + deadzone explanation to work well.

---

### **MEDICAL SENSORS**

#### **16. MAX30102 (Pulse Oximeter)**
```
Component: MAX30102View.tsx
Visualization:
├─ Heart Rate Display (90 BPM, large)
├─ IR LED Waveform (real-time PPG signal)
├─ Red LED Waveform (if enabled)
├─ SpO2 Calculation (blood oxygen, if available)
├─ Heart Rate Variability (HRV) graph
├─ Waveform Quality Indicator
├─ Signal Quality Meter (0-100%)
└─ Valid Detection LED

Theory Section:
├─ Photoplethysmography (PPG) Basics
├─ How It Works:
│   ├─ Red/IR LEDs shine through fingertip
│   ├─ Light reflected by blood hemoglobin
│   ├─ Photodiode measures reflected light
│   ├─ Absorption varies with blood flow → detects heartbeat
├─ IR vs Red Light:
│   ├─ IR: Measures heart rate, penetrates deeper
│   ├─ Red: Better at detecting oxygen saturation (SpO2)
├─ Signal Processing:
│   ├─ Raw ADC → Noise filtering → Peak detection
│   ├─ Beat Detection: Finds peaks in waveform
│   ├─ BPM Calculation: Interval between beats
├─ Normal Ranges:
│   ├─ Heart Rate: 60-100 BPM (resting)
│   ├─ SpO2: 95-100% (healthy)
│   ├─ SpO2 <90%: Warning (hypoxia)
├─ Waveform Quality Factors:
│   ├─ Finger placement (must contact sensor)
│   ├─ Motion artifacts (keep still)
│   ├─ Ambient light (dark environment better)
│   ├─ Finger pressure (not too hard, not too light)
├─ Applications (fitness, medical monitoring, sleep studies)
└─ Limitations (difficult to get stable signal without proper contact)

Interactive:
├─ Beat Detection: Highlight peaks in real-time waveform
├─ Quality Indicator: Show why signal is poor if <50%
├─ Heart Rate Zones (resting, light, moderate, intense, max)
├─ Finger Placement Guide (with visual instructions)
├─ SpO2 Trend (if calculator available)
├─ Test Wizard: "Find Optimal Fingertip Placement"
└─ Export: Save heart rate history
```

**Why**: Most complex sensor - needs waveform visualization + setup guidance to work properly.

---

#### **17. Thermistor (NTC Temperature Probe)**
```
Component: ThermistorView.tsx
Visualization:
├─ Body Temperature Display (37.5°C, large)
├─ Thermal Gauge (visual thermometer)
├─ Temperature Status (Normal/Elevated/Fever)
├─ Live Temperature History (5-minute trend)
├─ Temperature Zones (color-coded)
├─ Sensor Calibration Status
└─ Response Time Indicator

Theory Section:
├─ Negative Temperature Coefficient (NTC) Thermistor
├─ How It Works:
│   ├─ Resistance ↑ as temperature ↓ (negative coefficient)
│   ├─ Resistance measured via voltage divider
│   ├─ Steinhart-Hart equation converts resistance → temperature
├─ Sensor Specs:
│   ├─ Typical: 10kΩ @ 25°C
│   ├─ Accuracy: ±0.5°C typical
│   ├─ Response Time: 5-30 seconds (depends on probe size)
├─ Calibration Methods:
│   ├─ Two-point calibration (ice water + body temp)
│   ├─ Reference comparison (medical thermometer)
├─ Temperature Ranges:
│   ├─ Normal: 36.5-37.5°C
│   ├─ Elevated: 37.5-38.5°C
│   ├─ Fever: >38.5°C
│   ├─ Hypothermia: <36°C
├─ Measurement Considerations:
│   ├─ Placement matters (oral vs skin vs rectal)
│   ├─ Equilibration time (wait 1 minute for stable reading)
│   ├─ Thermal mass affects response
└─ Applications (body temperature monitoring, incubator control)

Interactive:
├─ Two-Point Calibration Wizard
├─ Temperature Conversion (C/F toggle)
├─ Thermal Status Indicator
├─ Body Temp Reference Chart
├─ Response Time Observation (show time to stabilize)
└─ Temperature Alert Settings
```

**Why**: Medical sensor - needs calibration + understanding of proper measurement technique.

---

## Architecture Implementation

### **File Structure:**
```
frontend/src/components/sensors/
├─ SensorDetailView.tsx          # Wrapper component
├─ views/
│  ├─ DHT11View.tsx
│  ├─ BMP280View.tsx
│  ├─ MQ2View.tsx
│  ├─ MQ3View.tsx
│  ├─ UltrasonicView.tsx
│  ├─ FlameSensorView.tsx
│  ├─ PIRView.tsx
│  ├─ IRView.tsx
│  ├─ ProximitySensorView.tsx
│  ├─ LDRView.tsx
│  ├─ SoundSensorView.tsx
│  ├─ TouchSensorView.tsx
│  ├─ TiltSensorView.tsx
│  ├─ HallSensorView.tsx
│  ├─ JoystickView.tsx
│  ├─ MAX30102View.tsx
│  └─ ThermistorView.tsx
├─ utils/
│  ├─ calibration.ts              # Calibration helpers
│  ├─ conversions.ts              # Equation solvers (Steinhart-Hart, etc.)
│  └─ thresholds.ts               # Default thresholds per sensor
└─ types/
   └─ sensorViews.ts              # TypeScript interfaces
```

### **Data Flow:**
```
Dashboard
  ↓ (click sensor)
  ↓ (triggers handleSensorClick)
  ↓
AIContext Updates (sensor name + data)
  ↓
SensorDetailView (modal/page)
  ├─ Loads appropriate [Sensor]View.tsx
  ├─ Passes: sensor ID, current readings, historical data
  └─ Component handles: visualization + theory + interactivity
```

### **Common Components Library:**
```
sensors/components/
├─ Gauge.tsx                      # Reusable gauge widget
├─ Waveform.tsx                   # Real-time waveform display
├─ ThresholdSlider.tsx            # Customizable threshold setting
├─ TheoryPanel.tsx                # Collapsible theory section
├─ CalibrationWizard.tsx          # Multi-step calibration
└─ AlertZones.tsx                 # Color-coded range visualization
```

---

## User Experience Flow

### **Example: User clicks MQ2 Sensor Card**
```
1. User clicks "MQ2" card on dashboard
2. AI context updates → "Currently viewing MQ2"
3. Modal/Detailed View Opens
4. Shows:
   ├─ Title: "MQ2 - Gas & Smoke Sensor"
   ├─ Real-time analog value + bar
   ├─ "Calibrate" button (launches wizard)
   ├─ Threshold slider (sets alert level)
   ├─ Detection history (timeline)
   ├─ Theory section (collapsible):
   │  ├─ How it works
   │  ├─ Calibration instructions
   │  ├─ Safe/Warning/Danger ranges
   │  └─ Applications
   └─ AI Ask Button (context-aware question)
      └─ "Ask AI about gas safety..."
5. User can:
   ├─ Calibrate sensor
   ├─ Test with different gases
   ├─ Set custom thresholds
   └─ Ask AI specific questions about this sensor
```

---

## Implementation Phases

### **Phase 1: Foundation** (1-2 days)
- Create base `SensorDetailView.tsx` wrapper
- Build `Gauge`, `Waveform`, `ThresholdSlider` components
- Implement calibration system
- Create utility functions (conversions, thresholds)

### **Phase 2: Environmental Sensors** (2-3 days)
- DHT11View (dual gauges, comfort zones)
- BMP280View (altitude calculator, weather predictor)
- LDRView (light zones, threshold alerts)
- ThermistorView (calibration, temp zones)

### **Phase 3: Gas & Detection Sensors** (2-3 days)
- MQ2View (calibration, PPM conversion)
- MQ3View (BAC estimation, calibration)
- FlameSensorView (false positive prevention)
- PIRView (warm-up timer, sensitivity)

### **Phase 4: Advanced Sensors** (2-3 days)
- UltrasonicView (formula visualization, temp compensation)
- MAX30102View (waveform display, beat detection)
- JoystickView (calibration, deadzone)

### **Phase 5: Polish & Testing** (1-2 days)
- Mobile responsiveness
- Performance optimization
- AI context integration testing
- Edge case handling

---

## Benefits of This Approach

✅ **Educational**: Each sensor teaches its physics/theory  
✅ **Practical**: Calibration wizards, threshold settings  
✅ **Engaging**: Real-time visualizations, interactive elements  
✅ **Professional**: Matches quality of academic IoT platforms  
✅ **Extensible**: Easy to add new sensors or visualization types  
✅ **AI-Aligned**: Rich context for AI to provide expert guidance  
✅ **Debugging**: Helps identify sensor issues (calibration, placement, etc.)  

---

## Next Steps

1. **Review this plan** - Does it match your vision?
2. **Prioritize** - Which sensors to start with?
3. **Approve design** - Any specific visualizations you want different?
4. **Implementation** - I can start with Phase 1 foundation + your priority sensors

Would you like me to:
- [ ] Modify any sensor's planned features?
- [ ] Add more sensors to higher priority?
- [ ] Adjust the theory content depth?
- [ ] Change architecture/file structure?
- [ ] Start implementation (Phase 1)?
