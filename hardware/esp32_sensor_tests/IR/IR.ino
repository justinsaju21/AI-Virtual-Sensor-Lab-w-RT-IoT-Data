/*
 * Sensor: IR Proximity / Obstacle Avoidance Sensor
 * Board: ESP32 WROOM32
 * 
 * Dependencies:
 * - None
 * 
 * Pins:
 * - VCC -> 3.3V or 5V (Most operate optimally at 3.3V, providing a natively safe 3.3V logic output)
 * - GND -> GND
 * - OUT -> GPIO 14
 */

#define IR_PIN 14

void setup() {
  Serial.begin(115200);
  
  // The onboard LM393 comparator definitively drives the pin HIGH or LOW.
  pinMode(IR_PIN, INPUT);
  
  Serial.println("IR Obstacle Sensor ESP32 Test. Waiting for objects...");
}

void loop() {
  int objectState = digitalRead(IR_PIN);

  // Typical IR module logic: LOW means the IR light hit an object and reflected back
  if (objectState == LOW) {
    Serial.println("OBSTACLE DETECTED!");
  }

  delay(100);
}
