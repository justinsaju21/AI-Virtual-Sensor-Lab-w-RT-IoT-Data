/*
 * Sensor: Flame Detector (IR Fire Sensor)
 * Board: ESP32 WROOM32
 * 
 * Dependencies:
 * - None
 * 
 * Pins:
 * - VCC -> 3.3V
 * - GND -> GND
 * - DO  -> GPIO 16 (Digital Trigger output)
 * - AO  -> Optional (Analog intensity, e.g., GPIO 39 if needed)
 */

#define FLAME_DIGITAL 16

void setup() {
  Serial.begin(115200);
  pinMode(FLAME_DIGITAL, INPUT);
  
  Serial.println("IR Fire Detection System ESP32 Test Armed.");
}

void loop() {
  int fireAlarm = digitalRead(FLAME_DIGITAL);

  // The LM393 comparator pulls LOW when a strong 760nm-1100nm IR source (fire) is detected
  if (fireAlarm == LOW) {
    Serial.println(">>> FIRE DETECTED! <<<");
  }

  // Fast loop for rapid detection
  delay(100); 
}
