/*
 * Sensor: MAX30102 (Pulse Oximeter & Heart Rate)
 * Board: ESP32 WROOM32
 * 
 * Dependencies (Install via Arduino Library Manager):
 * - "SparkFun MAX3010x Pulse and Proximity Sensor Library" by SparkFun Electronics
 * 
 * Pins:
 * - VCC  -> 3.3V
 * - GND  -> GND
 * - SDA  -> GPIO 21 (Default ESP32 I2C SDA)
 * - SCL  -> GPIO 22 (Default ESP32 I2C SCL)
 */
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h" // Helper algorithm included in SparkFun library

MAX30105 particleSensor;
const byte RATE_SIZE = 4; // Increase this for more averaging
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute;
int beatAvg;

void setup() {
  Serial.begin(115200);
  Serial.println("Initializing MAX30102 ESP32 Test...");

  // Initialize sensor
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) { // ESP32 uses pins 21 and 22
    Serial.println("MAX30102 was not found. Please check wiring/power.");
    while (1);
  }

  particleSensor.setup(); // Configure sensor with default settings
  particleSensor.setPulseAmplitudeRed(0x0A); // Turn Red LED to low
  particleSensor.setPulseAmplitudeGreen(0);  // Turn off Green LED
}

void loop() {
  long irValue = particleSensor.getIR();

  if (checkForBeat(irValue) == true) {
    // Sensed a beat
    long delta = millis() - lastBeat;
    lastBeat = millis();

    beatsPerMinute = 60 / (delta / 1000.0);

    if (beatsPerMinute < 255 && beatsPerMinute > 20) {
      rates[rateSpot++] = (byte)beatsPerMinute; 
      rateSpot %= RATE_SIZE;
      
      // Calculate average BPM
      beatAvg = 0;
      for (byte x = 0 ; x < RATE_SIZE ; x++) {
        beatAvg += rates[x];
      }
      beatAvg /= RATE_SIZE;
    }
  }

  Serial.print("IR="); 
  Serial.print(irValue);
  Serial.print(", BPM="); 
  Serial.print(beatsPerMinute);
  Serial.print(", Avg BPM="); 
  Serial.println(beatAvg);
  
  if (irValue < 50000) {
    Serial.println(" No finger?");
  }
  
  delay(20);
}
