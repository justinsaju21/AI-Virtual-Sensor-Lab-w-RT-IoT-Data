# DHT11 Basic Temperature & Humidity Sensor

## 1. Description
The **DHT11** is a basic, ultra-low-cost digital temperature and humidity sensor. It uses a capacitive humidity sensor and a thermistor to measure the surrounding air and outputs a digital signal on the data pin (no analog input pins needed).

It is very simple to use but requires careful timing to grab data. The only real downside is you can only get new data from it once every 2 seconds.

---

## 2. Theory & Physics

### How it Works
- **Humidity Sensing (Capacitive):** Inside the DHT11, there is a moisture-holding substrate sandwiched between two electrodes. As humidity increases, the substrate absorbs more water vapor, which changes the electrical capacitance between the electrodes.
- **Temperature Sensing (Thermistor):** It uses a Negative Temperature Coefficient (NTC) thermistor. As temperature rises, its electrical resistance decreases in a predictable, non-linear curve.
- **Microcontroller:** A small 8-bit chip inside the DHT11 reads both analog values, digitizes them, and prepares a proprietary 40-bit data stream to send to the Arduino.

---

## 3. Communication Protocol (Single-Wire)
The DHT11 uses a custom single-wire protocol, *not* standard I2C or SPI.
- The Arduino holds the data line LOW for 18ms to "wake up" the sensor.
- The DHT11 responds with an 80µs LOW then 80µs HIGH signal.
- The sensor then transmits 40 bits of data (representing 16-bit humidity, 16-bit temperature, and an 8-bit checksum).
- A **0 bit** is represented by a 50µs LOW followed by a 26-28µs HIGH.
- A **1 bit** is represented by a 50µs LOW followed by a 70µs HIGH.

Because the timing is on the microsecond level, interrupts on the Arduino are often disabled during reading to prevent data corruption.

---

## 4. Hardware Wiring (Arduino Mega)

| DHT11 Pin | Arduino Mega Pin | Description |
| :--- | :--- | :--- |
| **VCC** | 5V (or 3.3V) | Power Supply |
| **DATA** | Digital Pin (e.g. D2) | Data signal. Requires 10kΩ pull-up resistor to VCC if not built into module |
| **NC** | Not Connected | Often exists on raw 4-pin components, ignore |
| **GND** | GND | Common Ground |

---

## 5. Arduino Implementation Code

*(Requires the Adafruit Unified Sensor and DHT library)*

```cpp
#include "DHT.h"

#define DHTPIN 2     // Digital pin connected to the DHT sensor
#define DHTTYPE DHT11   // DHT 11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  Serial.println(F("DHT11 test!"));
  dht.begin();
}

void loop() {
  // Wait a few seconds between measurements.
  // The DHT11 is a slow sensor (1Hz max read rate).
  delay(2000);

  // Reading temperature or humidity takes about 250 milliseconds!
  float h = dht.readHumidity();
  float tempC = dht.readTemperature();

  // Check if any reads failed and exit early (to try again).
  if (isnan(h) || isnan(tempC)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }

  Serial.print(F("Humidity: "));
  Serial.print(h);
  Serial.print(F("%  Temperature: "));
  Serial.print(tempC);
  Serial.println(F("°C "));
}
```

---

## 6. Physical Experiments

1. **The "Breath" Test:**
   - **Instruction:** Blow warm, moist air directly onto the blue grid of the sensor.
   - **Observation:** Watch the humidity rapidly spike up (often to 90%+) and the temperature slowly creep up.
   - **Expected:** Verifies both sensors are responding to localized environmental changes. It will take several minutes to dry out and return to room ambient.

---

## 7. Common Mistakes & Troubleshooting

1. **"Failed to read from DHT sensor!" Error:**
   - *Cause:* The single-wire protocol timing failed, usually because of wrong pin assignment, or a missing Pull-Up resistor (if using the bare 4-pin blue component instead of the 3-pin breakout board).
   - *Fix:* Verify `DHTPIN` matches your wiring. Ensure a 10k resistor links DATA to 5V.
2. **Reading Too Fast:**
   - *Cause:* Putting `delay(100)` in the loop. The onboard processor requires at least 1-2 seconds between requests.
   - *Fix:* Ensure the loop delay is `2000` or higher.

---

## Required Libraries
To run the Arduino code above, you must install the following libraries via the Arduino Library Manager:
- **`DHT sensor library`** by Adafruit
- **`Adafruit Unified Sensor`** by Adafruit

---

## AI Assessment Questions (UI Integration)
*The following questions are designed for the interactive UI quiz module to test student comprehension.*

**Q1: How does the DHT11 physically measure changes in humidity?**
- A) By measuring the air pressure.
- B) Using a moisture-absorbing substrate where electrical resistance changes with water content. *(Correct)*
- C) By bouncing ultrasonic waves off water molecules.
- D) Using a tiny internal Fan.

**Q2: What is the maximum polling rate allowed for the DHT11 sensor?**
- A) 50 times per second (50Hz)
- B) 10 times per second (10Hz)
- C) Once every 2 seconds (0.5Hz) *(Correct)*
- D) Once per minute

**Q3: Which communication protocol does the DHT11 use?**
- A) I²C
- B) SPI
- C) Analog Voltage reading
- D) A proprietary Single-Wire Digital Protocol *(Correct)*
