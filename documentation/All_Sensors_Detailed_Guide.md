# 📚 IoT Virtual Lab: Comprehensive Sensor Details

# IoT VIRTUAL SENSOR LAB
## Comprehensive Sensor Reference Guide
─────────────────────────────────────────────────

**17 Sensors  ·  Deep-Dive Physics  ·  Full Wiring Diagrams**
**Arduino Implementation Code  ·  Experiments  ·  Troubleshooting  ·  AI Quizzes**

| Sensor | Type | Interface | Page |
| :--- | :--- | :--- | :--- |
| **GY-BMP280-3.3** | Pressure & Altimeter | I²C | § 1 |
| **DHT11** | Temperature & Humidity | Single-Wire (1-Wire) | § 2 |
| **Flame Detector** | Fire / IR Radiation | Analog + Digital | § 3 |
| **IR Obstacle** | Proximity (Active IR) | Digital GPIO | § 4 |
| **Joystick Module** | Dual-Axis Position | Analog + Digital | § 5 |
| **LDR Module** | Ambient Light | Analog + Digital | § 6 |
| **MAX30102** | Pulse Oximeter / Heart Rate | I²C | § 7 |
| **MQ-2 Gas Sensor** | Combustible Gas & Smoke | Analog + Digital | § 8 |
| **MQ-3 Alcohol Sensor** | Ethanol Vapor (Breathalyzer) | Analog + Digital | § 9 |
| **PIR HC-SR501** | Motion (Body Heat) | Digital GPIO | § 10 |
| **Sound Module (Mic)** | Acoustic / Noise Level | Analog + Digital | § 11 |
| **SW-520D Tilt Sensor** | Orientation & Vibration | Digital GPIO | § 12 |
| **TTP223 Touch Sensor** | Capacitive Touch | Digital GPIO | § 13 |
| **Hall Effect (4-Pin)** | Magnetic Field & Polarity | Digital + Analog | § 14 |
| **NTC Thermistor Module**| Temperature (Fast Analog) | Analog + Digital | § 15 |

**Mentor:** Dr. Elamaran E  |  **SEM6 Project** — Dept of ECE  |  March 2026

---

## 📌 Arduino Mega 2560 Pin Assignment Master List

This map ensures zero conflicts when building the final prototype.

### I2C Bus Pins (Shared)
| Sensor | Description | Pin Type | Assigned Pin |
| :--- | :--- | :--- | :--- |
| **All I2C Sensors** | Data Line (SDA) | Dedicated I2C | **Pin 20** |
| **All I2C Sensors** | Clock Line (SCL) | Dedicated I2C | **Pin 21** |
*Devices: BMP280 (0x76), MAX30102 (0x57)*

### Analog Sensors (ADC)
| Sensor | Description | Pin Type | Assigned Pin |
| :--- | :--- | :--- | :--- |
| **MQ-2** | Gas & Smoke | Analog | **A0** |
| **MQ-3** | Alcohol Vapor | Analog | **A1** |
| **Joystick (X)** | Horizontal Axis | Analog | **A2** |
| **Joystick (Y)** | Vertical Axis | Analog | **A3** |
| **LDR** | Light Sensor | Analog | **A4** |
| **Flame (AO)** | Fire Intensity (Analog) | Analog | **A5** |
| **Sound (AO)** | Noise Envelope (Analog) | Analog | **A6** |
| **NTC Thermistor** | Temperature | Analog | **A7** |
| **Hall Effect (AO)** | Magnetic Strength | Analog | **A8** |

### Digital Sensors
| Sensor | Description | Pin Type | Assigned Pin |
| :--- | :--- | :--- | :--- |
| **DHT11** | Humidity & Temp Data | Digital In | **Pin 2** |
| **Touch** | Capacitive Sensor | Digital Input | **Pin 5** |
| **Hall Effect (DO)** | Magnetic Switch | Digital Input | **Pin 6** |
| **Joystick (SW)** | Joystick Button | Digital Input | **Pin 7** |
| **Flame (DO)** | Fire Alarm | Digital Input | **Pin 8** |
| **Sound (DO)** | Noise Threshold | Digital Input | **Pin 9** |
| **PIR** | Motion Detector | Digital Input | **Pin 10** |
| **Tilt** | Vibration Switch | Digital Input | **Pin 12** |
| **IR Obstacle** | Reflective Proximity | Digital Input | **Pin 13** |

---

## 1. GY-BMP280-3.3
### High-Precision Altimeter & Atmospheric Pressure Sensor

| Interface | Arduino Pin(s) | Output Type | Library Required |
| :--- | :--- | :--- | :--- |
| I²C / SPI | Pin 20 (SDA), Pin 21 (SCL) | Digital (I²C) | Adafruit BMP280 |

### 1. Description
The GY-BMP280-3.3 is a high-precision, low-power environmental sensor module based on the Bosch Sensortec BMP280 chip. It measures both barometric pressure and temperature. Due to its exceptional precision, it also functions as an altimeter, capable of detecting altitude changes as small as 1 meter. It operates on 3.3V logic and communicates via I²C or SPI.

### 2. Theory & Physics
The BMP280 uses a piezoresistive pressure sensor. Inside the chip is a tiny sealed vacuum reference cavity covered by a thin silicon diaphragm. As external atmospheric pressure changes, this diaphragm deflects microscopically.
Embedded in the diaphragm are piezoresistors — materials whose electrical resistance changes when they undergo mechanical stress. A Wheatstone bridge circuit precisely measures these resistance changes, which are digitized by an onboard 20-bit ADC.

**Altimeter Formula (International Barometric Formula):**
`H = 44330 × [1 − (P / P0)^(1/5.255)]`
Where H = Altitude in meters, P = Measured pressure in hPa, P0 = Sea-level reference pressure.

### 4. Hardware Wiring (Arduino Mega)
| BMP280 Pin | Arduino Mega Pin | Notes |
| :--- | :--- | :--- |
| **VCC** | 3.3V | **CRITICAL: Do NOT use 5V** |
| **GND** | GND | Common Ground |
| **SCL** | Pin 21 (SCL) | I²C Clock Line |
| **SDA** | Pin 20 (SDA) | I²C Data Line |

### 5. Arduino Implementation Code
```cpp
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP280.h>
 
Adafruit_BMP280 bmp; 
 
void setup() {
  Serial.begin(115200);
  if (!bmp.begin(0x76)) {
    Serial.println("BMP280 not found! Check wiring.");
    while (1);
  }
}
 
void loop() {
  Serial.print("Pres: "); Serial.print(bmp.readPressure() / 100.0F); Serial.println(" hPa");
  delay(2000);
}
```

---

## 2. DHT11
### Basic Temperature & Humidity Sensor

| Interface | Arduino Pin(s) | Output Type | Library Required |
| :--- | :--- | :--- | :--- |
| Single-Wire | Any Digital Pin (D2) | Digital (40-bit) | DHT sensor library |

### 1. Description
The DHT11 is a basic, ultra-low-cost digital temperature and humidity sensor combining a capacitive humidity element and a thermistor. It outputs a pre-digitized single-wire data stream. Its main limitation is a maximum polling rate of once every 2 seconds.

### 2. Theory & Physics
*   **Humidity Sensing (Capacitive):** Uses a moisture-holding substrate between electrodes. Capacitance changes as it absorbs water vapor.
*   **Temperature Sensing (Thermistor):** NTC thermistor changes resistance as temperature varies.

### 5. Arduino Implementation Code
```cpp
#include "DHT.h"
#define DHTPIN 2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);
 
void setup() {
  Serial.begin(115200);
  dht.begin();
}
 
void loop() {
  delay(2000); 
  Serial.print("Humidity: "); Serial.print(dht.readHumidity());
  Serial.print(" %  Temp: "); Serial.print(dht.readTemperature()); Serial.println(" C");
}
```

---

## 3. Flame Detector Sensor
### Infrared Fire Detection via Optical Photodiode

| Interface | Arduino Pin(s) | Output Type | Library Required |
| :--- | :--- | :--- | :--- |
| Analog + Digital | A5 (AO), D8 (DO) | Dual Output | None |

### 1. Description
The Flame Sensor detects specific infrared radiation emitted by a live flame, peaking at 700nm–1000nm. It can "see" a fire before a temperature sensor registers a change.

### 2. Theory & Physics
Uses an IR Photodiode with a black epoxy lens (Daylight Blocking Filter). The filter blocks visible light but allows 760nm–1100nm IR through.

### 4. Hardware Wiring (Arduino Mega)
| Flame Pin | Arduino Mega Pin | Notes |
| :--- | :--- | :--- |
| **AO** | Analog Pin A5 | Continuous flame intensity (0–1023) |
| **DO** | Digital Pin D8 | Binary alarm: LOW = fire detected |

---

---

## 4. IR Obstacle Avoidance Sensor
### Active Infrared Proximity & Reflectivity Detector

| Interface | Arduino Pin(s) | Output Type | Library Required |
| :--- | :--- | :--- | :--- |
| Digital GPIO | D13 (OUT) | Digital (LOW = Obstacle) | None |

### 1. Description
Active proximity sensor that emits its own IR light (940nm) and measures the reflection. Common in robotics for obstacle avoidance.

---

## 5. Joystick Module
### Dual-Axis Analog Input with Push-Button

| Interface | Arduino Pin(s) | Output Type | Library Required |
| :--- | :--- | :--- | :--- |
| Analog + Digital | A2 (VRx), A3 (VRy), D7 (SW) | Dual Analog + Digital | None |

### 4. Hardware Wiring (Arduino Mega)
| Joystick Pin | Arduino Mega Pin | Notes |
| :--- | :--- | :--- |
| **VRx** | Analog Pin A2 | X-Axis continuous voltage |
| **VRy** | Analog Pin A3 | Y-Axis continuous voltage |
| **SW** | Digital Pin D7 | Click button — **REQUIRES INPUT_PULLUP** |

---

## 6. LDR (Light Dependent Resistor)
### 3-Pin Photoresistor Module

| Interface | Arduino Pin(s) | Output Type | Library Required |
| :--- | :--- | :--- | :--- |
| Analog + Digital | A4 (AO) | Analog + Digital | None |

### 1. Description
Cadmium Sulfide (CdS) photoresistor whose resistance decreases as light intensity increases.

---

## 7. MAX30102
### Pulse Oximeter & Heart-Rate Sensor

| Interface | Arduino Pin(s) | Output Type | Library Required |
| :--- | :--- | :--- | :--- |
| I²C | Pin 20 (SDA), Pin 21 (SCL) | Digital (I²C) | SparkFun MAX3010x |

### 1. Description
Integrated pulse oximeter that uses Red (660nm) and IR (880nm) LEDs to measure heart rate and blood oxygen (SpO₂).

---

## 8. MQ-2 Gas & Smoke Sensor

| Interface | Arduino Pin(s) | Output Type | Library Required |
| :--- | :--- | :--- | :--- |
| Analog + Digital | A0 (AO) | Analog Voltage | None |

### 1. Description
Chemiresistive sensor for LPG, Smoke, and Combustible gases. Requires an internal heating element.

---

## 9. MQ-3 Alcohol Vapor Sensor

| Interface | Arduino Pin(s) | Output Type | Library Required |
| :--- | :--- | :--- | :--- |
| Analog + Digital | A1 (AO) | Analog Voltage | None |

---

## 10. PIR Motion Sensor (HC-SR501)
### Passive Infrared Human Body Detection

| Interface | Arduino Pin(s) | Output Type | Library Required |
| :--- | :--- | :--- | :--- |
| Digital GPIO | D10 (OUT) | Digital (HIGH = Motion) | None |

---

---

## 11. Sound Sensor Module (Microphone)

| Interface | Arduino Pin(s) | Output Type | Library Required |
| :--- | :--- | :--- | :--- |
| Analog + Digital | A6 (AO), D9 (DO) | Dual Output | None |

---

## 12. SW-520D Tilt Sensor

| Interface | Arduino Pin(s) | Output Type | Library Required |
| :--- | :--- | :--- | :--- |
| Digital GPIO | D12 (OUT) | Digital Switch | None |

---

## 13. Capacitive Touch Sensor (TTP223)

| Interface | Arduino Pin(s) | Output Type | Library Required |
| :--- | :--- | :--- | :--- |
| Digital GPIO | D5 (SIG) | Digital (HIGH = Touched) | None |

---

## 14. Hall Effect Magnetic Sensor (4-Pin)
### Lorentz Force-Based Magnetic Field Detection

| Interface | Arduino Pin(s) | Output Type | Library Required |
| :--- | :--- | :--- | :--- |
| Digital + Analog | D6 (DO), A8 (AO) | Dual Output | None |

### 4. Hardware Wiring (Arduino Mega)
| Hall Pin | Arduino Mega Pin | Notes |
| :--- | :--- | :--- |
| **DO** | Digital Pin D6 | LOW when magnetic field detected |
| **AO** | Analog Pin A8 | Linear field strength (Unassigned in basic firmware) |

---

## 15. NTC Thermistor Temperature Sensor
### Continuous Analog Thermal Measurement

| Interface | Arduino Pin(s) | Output Type | Library Required |
| :--- | :--- | :--- | :--- |
| Analog + Digital | A7 (AO) | Analog Voltage | math.h (built-in) |

### 5. Arduino Implementation Code
```cpp
#include <math.h>
#define THERM_AO A7
 
void setup() { Serial.begin(115200); }
 
void loop() {
  int rawADC = analogRead(THERM_AO);
  if (rawADC > 0) {
    // 10k series resistor with 10k NTC
    float Vout = (rawADC * 5.0) / 1023.0;
    float R_therm = (10000.0 * Vout) / (5.0 - Vout);
    float logR = log(R_therm);
    
    // Steinhart-Hart Coefficients for common 10k NTC
    float tempK = 1.0 / (0.001129148 + (0.000234125 * logR) + (0.0000000876741 * logR * logR * logR));
    float tempC = tempK - 273.15;
    
    Serial.print("Temperature: ");
    Serial.print(tempC);
    Serial.println(" C");
  }
  delay(1000);
}
```

---

> [!NOTE]
> This guide is optimized for the SEM6 Project Hardware Kit and Arduino Mega 2560 Firmware.
