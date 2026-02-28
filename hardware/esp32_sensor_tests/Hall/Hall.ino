/*
 * Sensor: Hall Effect Magnetic Sensor (A3144 Digital Switch)
 * Board: ESP32 WROOM32
 * 
 * Dependencies:
 * - None
 * 
 * Pins:
 * - VCC -> 3.3V
 * - GND -> GND
 * - OUT -> GPIO 26
 * 
 * Logic: Open-Collector output requiring a Pull-Up resistor.
 */

#define HALL_PIN 26

void setup() {
  Serial.begin(115200);
  
  // CRITICAL: Bare Hall Effect transistors (A3144) have "Open Collector" data outputs. 
  // They can only pull a signal down to GND. They cannot supply Volts. 
  // You MUST use INPUT_PULLUP to provide the resting 3.3V HIGH state.
  pinMode(HALL_PIN, INPUT_PULLUP);
  
  Serial.println("Hall Effect Magnetic Sensor ESP32 Test");
}

void loop() {
  int magnetState = digitalRead(HALL_PIN);

  // The sensor pulls the pin to GND (LOW) when a strong magnet approaches
  if (magnetState == LOW) {
    Serial.println(">>> STRONG MAGNETIC FIELD DETECTED <<<");
  }

  delay(100);
}
