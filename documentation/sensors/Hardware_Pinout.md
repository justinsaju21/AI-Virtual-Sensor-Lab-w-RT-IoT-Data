# Arduino Mega 2560 Pin Assignment Master List

This document outlines the dedicated pin assignments for all 17 sensors in the Virtual Lab physical hardware kit. This map ensures zero conflicts when building the final prototype.

## The Microcontroller
**Target Board:** Arduino Mega 2560 + ESP8266 Combo Board

**Total Pins Available:**
- Digital: 54
- Analog: 16
- *(Total: 70 Pins)*

---

## I2C Bus Pins (Shared)
*The I2C bus supports up to 127 devices simultaneously on just two wires. Both of these sensors connect in parallel to the exact same pins.*

| Sensor | Description | Pin Type | Assigned Pin |
| :--- | :--- | :--- | :--- |
| **All I2C Sensors** | Data Line (SDA) | Dedicated I2C | **Pin 20** |
| **All I2C Sensors** | Clock Line (SCL) | Dedicated I2C | **Pin 21** |
*Devices on this bus: BMP280, MAX30102*

---

## Analog Sensors (ADC)
*These sensors output a variable voltage from 0V to 5V and must be connected to the dedicated `A` pins.*

| Sensor | Description | Pin Type | Assigned Pin |
| :--- | :--- | :--- | :--- |
| **MQ-2** | Gas & Smoke | Analog | **A0** |
| **MQ-3** | Alcohol Vapor | Analog | **A1** |
| **Joystick (X)** | Horizontal Axis | Analog | **A2** |
| **Joystick (Y)** | Vertical Axis | Analog | **A3** |
| **LDR** | Light Sensor | Analog | **A4** |
| **LM35** | Temperature | Analog | **A5** |

---

## Digital Sensors
*These sensors output simple HIGH (5V) or LOW (0V) logic.*

| Sensor | Description | Pin Type | Assigned Pin |
| :--- | :--- | :--- | :--- |
| **PIR** | Passive Infrared Motion | Digital Input | **Pin 2** |
| **Tilt** | Vibration / Angle Switch | Digital Input | **Pin 3** |
| **IR Object** | Infrared Proximity | Digital Input | **Pin 4** |
| **Touch** | Capacitive Finger Sensor | Digital Input | **Pin 5** |
| **Hall Effect** | Magnetic Field Sensor | Digital Input | **Pin 6** |
| **Joystick (Z)** | Joystick Push-Button | Digital Input | **Pin 7** |
| **Flame** | IR Fire Detector | Digital Input | **Pin 8** |
| **HC-SR04** | Ultrasonic Trigger | Digital Output | **Pin 9** |
| **HC-SR04** | Ultrasonic Echo | Digital Input | **Pin 10** |
| **Proximity** | Inductive Metal Sensor | Digital Input | **Pin 11** |
| **Sound** | Microphone Loudness | Digital Input | **Pin 12** |
| **DHT11** | Humidity Data Line | Digital Input | **Pin 13** |

---

## Internal Wi-Fi Communication
*These pins are permanently occupied by the physical copper traces connecting the Mega 2560 brain to the ESP8266 brain on the combo board.*

| Connection | Description | Pin Type | Assigned Pin |
| :--- | :--- | :--- | :--- |
| **Serial Tx3** | Mega Transmit to ESP | Hardware Serial | **Pin 14** |
| **Serial Rx3** | Mega Receive from ESP | Hardware Serial | **Pin 15** |

---

## Hardware Summary Table

| Category | Used | Available | Remaining |
| :--- | :--- | :--- | :--- |
| **Analog** | 6 | 16 | **10** (A6 to A15) |
| **Digital** | 16* | 54 | **38** |
| **Total** | **22** | **70** | **48 unused pins** |

*(Note: The 16 Digital pins used include the 2 I2C pins and the 2 internal Serial pins for the Wi-Fi chip).*

---

## Power Distribution Strategy (CRITICAL)
**WARNING:** The onboard 5V linear voltage regulator of the Arduino Mega 2560 cannot safely provide enough sustained current to power all 17 sensors simultaneously (especially the MQ-series gas heaters and HC-SR04 ultrasonic pulses). Attempting to do so may overheat the regulator, causing a brown-out that resets the microcontroller.

**Solution (The Common Ground):** 
1. Use a dedicated external **5V DC Power Supply** (e.g., a 5V 3A buck converter or wall adapter) to power the VCC rails of all the sensors.
2. Power the Mega 2560 via its barrel jack or USB.
3. **CRITICAL:** You must connect the Ground (GND) wire of the external 5V supply to the GND pin of the Arduino Mega to ensure a common reference voltage, while keeping their 5V lines completely separated.

---

## Communication Architecture (Mega ↔ ESP)
The custom combo board relies on a dual-microcontroller architecture to handle heavy loads:
- **Data Acquisition (ATmega2560):** Handles all real-time sensor polling, ADC conversions, string parsing, and I2C requests.
- **Network Interface (ESP8266):** Handles the Wi-Fi stack and WebSocket/REST transmission to the Node.js backend to ensure the main sensor loop is never blocked by network latency.
- **The Bridge:** The ATmega2560 packages the 17 sensor readings into a minified JSON string and transmits it over **Hardware Serial3** (Pins 14/15) at a high baud rate to the waiting ESP8266, which acts as a transparent network proxy.

---

## Sensor Sampling Strategy (Optimization)
To achieve a smooth 50Hz unified data stream to the Node.js backend without blocking the main `loop()`, sensors are sampled using a non-blocking timeline and hardware interrupts:

- **Interrupt-Driven (Instant):** The PIR (Pin 2) and Tilt (Pin 3) sensors are placed precisely on the Mega's external hardware interrupt pins (`attachInterrupt()`) for instant, event-driven detection skipping the main loop.
- **Fast Polling (50Hz):** Joystick, Proximity, Touch, IR, Hall.
- **Medium Polling (2Hz):** HC-SR04, LDR, LM35, Sound (Envelope).
- **Slow Polling (0.5Hz):** DHT11 (Strict hardware limitation of 1Hz), MQ-2, MQ-3 (Slow chemical reaction times).

---

## PCB-Ready Pin Reservation (Future Expansion)
With 48 pins remaining, the system is designed to be highly expandable for future lab modules:
- **A6 - A15:** Reserved exclusively for future analog expansion (e.g., Soil Moisture, UV light intensity sensors, Flex sensors).
- **PWM Output Pins (Subset of 2-13):** Reserved for potential actuator feedback loops (e.g., controlling a Servo motor based on Joystick X/Y, or RGB LED status indicators).
- **SPI Bus (Pins 50, 51, 52, 53):** Kept completely unassigned to allow for future SD-card offline data logging or high-speed RFID readers.
