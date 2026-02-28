/*
 * Sensor: Capacitive Touch (TTP223)
 * Board: ESP32 WROOM32
 * 
 * Dependencies:
 * - None
 * 
 * Pins:
 * - VCC -> 3.3V
 * - GND -> GND
 * - SIG -> GPIO 27
 */

#define TOUCH_PIN 27

void setup() {
  Serial.begin(115200);
  
  // The onboard TTP223 chip handles internal pull-down logic
  pinMode(TOUCH_PIN, INPUT);
  
  Serial.println("Capacitive Touch ESP32 Test. Touch the copper pad!");
}

void loop() {
  int touchState = digitalRead(TOUCH_PIN);

  if (touchState == HIGH) {
    Serial.println("FINGER DETECTED (Touch)");
    
    // A simple software debounce so it doesn't spam the console instantly
    delay(200); 
  }

  // Very rapid polling for responsive hardware UX
  delay(10);
}
