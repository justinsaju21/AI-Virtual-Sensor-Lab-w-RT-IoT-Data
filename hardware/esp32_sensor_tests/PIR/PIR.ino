/*
 * Sensor: PIR (Passive Infrared Motion - HC-SR501)
 * Board: ESP32 WROOM32
 * 
 * Dependencies:
 * - None
 * 
 * Pins:
 * - VCC  -> 5V (Most PIRs have built-in 3.3V regulators, but operate best with 5V input)
 * - GND  -> GND
 * - OUT  -> GPIO 19 (The internal regulator converts the output to a 3.3V SAFE HIGH signal, perfect for ESP32)
 */

#define PIR_PIN 19

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  
  Serial.print("Calibrating PIR... Please wait 30 seconds... ");
  // The PIR needs time to snapshot the room's ambient IR levels. 
  // Avoid moving in front of it during this boot sequence!
  delay(30000); 
  Serial.println("Ready!");
}

void loop() {
  int motionState = digitalRead(PIR_PIN);

  if (motionState == HIGH) {
    Serial.println(">>> MOTION DETECTED! <<<");
  } else {
    // Normal resting state. Usually we don't spam the console here.
  }

  // PIR sensors keep their hardware output HIGH for a few seconds automatically 
  // when triggered, controlled by the orange potentiometer dials on the sensor back.
  delay(250);
}
