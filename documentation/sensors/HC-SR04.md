# HC-SR04 Ultrasonic Distance Sensor

## 1. Description
The **HC-SR04** uses ultrasonic sound waves to measure distance. It offers excellent non-contact range detection from 2cm to 400cm (4 meters) with an accuracy of roughly 3mm. 

It consists of an ultrasonic transmitter and a receiver module, resembling two metal "eyes".

---

## 2. Theory & Physics

### How it Works (Echolocation / Time of Flight)
The sensor acts like a bat or submarine sonar.
1. The Arduino triggers the sensor via the `TRIG` pin.
2. The **Transmitter (Tx)** emits an 8-cycle burst of ultrasound at 40 kHz (well above human hearing).
3. These sound waves travel through the air, hit an object, and bounce back.
4. The **Receiver (Rx)** waits for the reflected sound wave to return.
5. The sensor drives the `ECHO` pin HIGH the moment the sound is fired, and pulls it LOW the moment it hears the echo.
6. The width (duration) of that HIGH pulse on the `ECHO` pin tells the Arduino exactly how long the sound took to travel round-trip.

### The Math (Speed of Sound)
- Speed of sound in air at sea level is approx **340 meters per second** (or 0.034 cm per microsecond).
- Formula: `Distance = (Speed × Time)`
- Because the sound traveled *to* the object and *back*, we must divide by 2.
- `Distance (cm) = (PulseDuration_µs × 0.034) / 2`
- This simplifies to the common constant: `Distance (cm) = PulseDuration_µs / 58.2`

---

## 3. Communication Protocol (Pulse Width)
This is not I2C or Serial. It requires precision timing control of digital pins.
- **TRIG:** Must receive a 10 microsecond HIGH pulse to initiate.
- **ECHO:** Outputs a PWM-style variable-width pulse corresponding to the flight time. The Arduino function `pulseIn()` is used to precisely time this width in microseconds.

---

## 4. Hardware Wiring (Arduino Mega)

| HC-SR04 Pin | Arduino Mega Pin | Description |
| :--- | :--- | :--- |
| **VCC** | 5V | Power Supply |
| **TRIG** | D9 | Output from Arduino (Trigger pulse) |
| **ECHO** | D10 | Input to Arduino (Echo return pulse) |
| **GND** | GND | Common Ground |

---

## 5. Arduino Implementation Code

```cpp
#define TRIG_PIN 9
#define ECHO_PIN 10

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  // 1. Ensure TRIG is low for a clean start
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  
  // 2. Send 10 microsecond pulse to trigger sensor
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // 3. Read the duration of the HIGH pulse on ECHO pin
  // Timeout set to 30000 µs (stops hanging if no object is found)
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  
  // If pulseIn times out it returns 0
  if (duration == 0) {
    Serial.println("Out of range");
    delay(500);
    return;
  }
  
  // 4. Calculate the distance 
  float distanceCm = duration * 0.034 / 2.0;
  
  Serial.print("Distance: ");
  Serial.print(distanceCm);
  Serial.println(" cm");
  
  delay(100); // Small delay before next ping
}
```

---

## 6. Physical Experiments

1. **The Minimum Range Test:**
   - **Instruction:** Bring a flat book closer and closer to the "eyes" of the sensor.
   - **Observation:** Around 2 centimeters, the readings will suddenly fail, read `0`, or jump wildly.
   - **Expected:** Sound propagates in a cone, and the Tx and Rx are physically separated. Below 2cm, the echo bounces at an angle the Rx cylinder cannot 'see', causing false readings.

2. **The Absorption Test:**
   - **Instruction:** Try measuring the distance to a flat wooden board, and then try measuring the distance to a fluffy pillow at the exact same distance.
   - **Observation:** The wood will read perfectly. The pillow will give erratic numbers or say "Out of range".
   - **Expected:** Soft materials absorb sound energy. Ultrasonic sensors only work well against hard, flat, sound-reflective surfaces.

---

## 7. Common Mistakes & Troubleshooting

1. **`pulseIn()` Freezes the Arduino:**
   - *Symptom:* Code stops entirely if pointed at the sky or empty room.
   - *Cause:* `pulseIn(ECHO_PIN, HIGH)` waits forever for the pin to go low. If no echo returns, it hangs for a whole second by default.
   - *Fix:* Always add a timeout argument: `pulseIn(ECHO_PIN, HIGH, 30000);`
2. **"0 cm" Constant Output:**
   - *Cause:* Trigger and Echo pins are swapped in wiring vs code.
   - *Fix:* Ensure Ping goes to TRIG and Rx goes to ECHO.

---

## Required Libraries
This sensor relies strictly on built-in microprocessor timing (e.g., `pulseIn()`). **No external libraries are required.**

---

## AI Assessment Questions (UI Integration)
*The following questions are designed for the interactive UI quiz module to test student comprehension.*

**Q1: What is the operating frequency of the ultrasound burst emitted by the HC-SR04?**
- A) 20 Hz
- B) 400 Hz
- C) 40,000 Hz (40 kHz) *(Correct)*
- D) 2.4 GHz

**Q2: Why do we divide the calculated time-of-flight distance by two?**
- A) Because the speed of sound is too fast.
- B) Because the sound wave has to travel to the object and then bounce all the way back. *(Correct)*
- C) Because the sensor has two metal cylinders.
- D) To calibrate for temperature.

**Q3: Which materials will the HC-SR04 struggle the most to measure accurately?**
- A) Flat Wooden Boards
- B) Concrete Walls
- C) Soft, fluffy objects like pillows or clothes *(Correct)*
- D) Metal Sheets
