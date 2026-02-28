# PIR Motion Sensor (HC-SR501)

## 1. Description
The **PIR (Passive Infrared) Sensor** allows you to sense motion. It is almost always used to detect whether a human has moved in or out of the sensor's range. They are small, inexpensive, low-power, easy to use, and don't wear out. For that reason they are commonly found in appliances and gadgets (like driveway alarms or automatic lights).

---

## 2. Theory & Physics

### How it Works (Passive Infrared Detection)
Everything emits a certain amount of radiation relative to its temperature. Humans, being warm-blooded (roughly 37°C or 98.6°F), emit a lot of infrared (IR) heat energy—around 9.4 micrometers in wavelength.

- The term "Passive" means the sensor does not emit any IR light itself; it only passively receives the IR radiation naturally emitted by nearby objects.
- The sensor is actually split into two halves (wired such that they cancel each other out).
- When the room is empty, both halves see the exact same amount of ambient IR. The output is ZERO.
- When a warm body (like a human or dog) walks past, it crosses the field of view of the *first* sensor half before the second. This creates a large positive differential change.
- Continuing to walk puts the human in front of the *second* half, creating a large negative differential.
- These rapid, contrasting changes (the "motion") trigger the amplifier circuit on the back of the board, which outputs a pure HIGH/LOW digital voltage to the Arduino.

### The Fresnel Lens
The white, domed, faceted plastic cover over the actual pyroelectric sensor is a **Fresnel lens**. 
- It works to bend and focus IR light from a wide angle (up to 110 degrees) precisely onto the tiny dual-sensor element. 
- It also divides the coverage area into multiple distinct "zones", enhancing the differential effect when a person walks across them.

---

## 3. Communication Protocol (Digital Output)
The PIR uses standard Digital I/O.
- No software libraries or complex timing are required.
- The output pin simply goes **HIGH (5V or 3.3V)** when motion is detected, and **LOW (0V)** when there is no motion.

---

## 4. Hardware Wiring (Arduino Mega)

| PIR Pin | Arduino Mega Pin | Description |
| :--- | :--- | :--- |
| **VCC** | 5V | Powers the PIR internal circuitry |
| **OUT** | Digital Pin (e.g. D2) | The HIGH (Motion) / LOW (No Motion) signal |
| **GND** | GND | Common Ground |

---

## 5. Arduino Implementation Code

```cpp
#define PIR_PIN 2

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);

  Serial.print("Calibrating PIR... Please wait 60 seconds... ");
  // The PIR sensor needs 30-60 seconds after power-on to snapshot the ambient 
  // IR level of the empty room before it can reliably detect motion.
  delay(60000); 
  Serial.println("Ready!");
}

void loop() {
  int motionDetected = digitalRead(PIR_PIN);

  if (motionDetected == HIGH) {
    Serial.println("MOTION DETECTED!");
    // The pin will stay high for a set amount of time (configurable via the onboard dials)
  } else {
    // Usually we don't spam 'No motion', but for testing it's fine
    // Serial.println("Scanning...");
  }

  delay(500);
}
```

---

## 6. Physical Experiments

1. **The Range and Angle Test:**
   - **Instruction:** Have a friend start far away and slowly walk past the sensor parallel to it. Mark where the sensor first triggers. Then try walking straight *towards* it.
   - **Observation:** Notice that walking *across* the field of view triggers it instantly, while walking *straight towards* it takes much longer or fails entirely.
   - **Expected:** Because of the dual-half design and the zone-based Fresnel lens, the sensor relies on capturing differential changes *across* its face.

2. **The "Glass" Blindspot:**
   - **Instruction:** Have someone wave their hands furiously while standing directly behind a solid glass window or sliding door.
   - **Observation:** The PIR likely will not trigger, even though you can clearly see the human moving.
   - **Expected:** Standard window glass is opaque to the specific far-infrared thermal wavelengths (9µm) that the human body emits. The heat never reaches the sensor!

---

## 7. Common Mistakes & Troubleshooting

1. **Skipping the Calibration Phase:**
   - *Symptom:* The sensor throws dozens of false positives immediately after plugging it in, triggering non-stop when the room is empty.
   - *Cause:* The pyroelectric sensor is stabilizing to the new ambient temperature of the room.
   - *Fix:* Ensure no humans move near the sensor during the first 60 seconds of power delivery. Delay the main `loop` via code.
2. **False Positives (The HVAC Problem):**
   - *Symptom:* The alarm goes off when nobody is home.
   - *Cause:* The sensor is mounted near an air conditioning vent, heater, or directly facing a sunny window. Sudden blasts of hot or cold air rapidly change the ambient IR, looking exactly like a moving body.
   - *Fix:* Relocate the sensor away from vents and direct sunlight. Turn the sensitivity dial (Tx) counterclockwise.

---

## Required Libraries
This sensor strictly uses standard digital GPIO. **No external libraries are required.**

---

## AI Assessment Questions (UI Integration)
*The following questions are designed for the interactive UI quiz module to test student comprehension.*

**Q1: What does "Passive" mean in Passive Infrared Sensor?**
- A) The sensor passively ignores false alarms.
- B) The sensor only receives infrared light and does not emit any IR beams itself. *(Correct)*
- C) The sensor enters sleep mode when no motion occurs.
- D) The sensor passes infrared light through thick objects.

**Q2: What is the purpose of the white, faceted plastic dome over the PIR sensor?**
- A) It is a protective shell against water.
- B) It is a Fresnel Lens that focuses IR light onto the internal sensor elements. *(Correct)*
- C) It generates heat for calibration.
- D) It blocks visible sunlight.

**Q3: Why might the PIR fail to trigger if someone stands behind a glass window?**
- A) Glass reflects ultrasonic sound waves.
- B) Glass totally blocks the transmission of standard human-body thermal infrared wavelengths (9µm). *(Correct)*
- C) The glass acts as a mirror and blinds the sensor.
- D) Glass emits its own intense heat.
