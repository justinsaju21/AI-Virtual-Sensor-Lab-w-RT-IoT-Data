/*
 * Sensor: Inductive Proximity (e.g., LJ12A3-4-Z/BX NPN)
 * Board: ESP32 WROOM32
 * 
 * Dependencies:
 * - None
 * 
 * Pins:
 * - BROWN (VCC) -> 12V External Power Supply (DO NOT PLUG THIS INTO ESP32 3.3V/5V)
 * - BLUE  (GND) -> External 12V Ground (CRITICAL: You must link this GND to the ESP32 GND)
 * - BLACK (OUT) -> GPIO 4
 * 
 * **CRITICAL WARNING FOR ESP32:**
 * Industrial NPN sensors safely "sink" current to ground. However, industrial PNP 
 * sensors output their supply voltage (12V-24V) when triggered. 
 * Connecting 12V directly to an ESP32 GPIO will INSTANTLY DESTROY THE CHIP. 
 * ALWAYS USE AN NPN SENSOR or use an Optocoupler/Voltage Divider if using a PNP sensor!
 */

#define PROX_PIN 4

void setup() {
  Serial.begin(115200);
  
  // NPN sensors "sink" the output to GND when metal is detected.
  // We MUST provide a resting 3.3V HIGH state using the internal pullup!
  pinMode(PROX_PIN, INPUT_PULLUP);
  
  Serial.println("Inductive Metal Proximity ESP32 Test");
}

void loop() {
  int metalDetected = digitalRead(PROX_PIN);

  // LOW implies the NPN transistor is active and sinking the 3.3V pullup to Ground
  if (metalDetected == LOW) {
    Serial.println(">>> METAL OBJECT DETECTED! <<<");
  }

  delay(100);
}
