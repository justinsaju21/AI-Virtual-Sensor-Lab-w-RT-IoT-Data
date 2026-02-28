/*
 * Sensor: LDR (Photoresistor Light Sensor)
 * Board: ESP32 WROOM32
 * 
 * Dependencies:
 * - None
 * 
 * Pins:
 * - VCC -> 3.3V 
 * - GND -> GND
 * - AO  -> GPIO 36 (VP - Input Only ADC pin, perfectly safe for analog reading)
 * 
 * Note: If using a bare LDR component instead of a breakout board, you MUST 
 * construct a voltage divider with a 10k resistor to GND. Otherwise, the 
 * reading will always remain pinned at 4095.
 */

#define LDR_PIN 36

void setup() {
  Serial.begin(115200);
  Serial.println("LDR Photoresistor ESP32 Test");
}

void loop() {
  // ESP32 uses a 12-bit ADC (0 to 4095)
  int lightLevel = analogRead(LDR_PIN);

  Serial.print("Raw Light Value (0-4095): ");
  Serial.print(lightLevel);

  // Ranges depend entirely on the specific LDR and Voltage Divider used!
  if (lightLevel < 200) {
    Serial.println(" - Pitch Black Night");
  } else if (lightLevel < 1500) {
    Serial.println(" - Dimly Lit Room");
  } else if (lightLevel < 3000) {
    Serial.println(" - Bright Office");
  } else {
    Serial.println(" - Direct Flashlight / Sunlight");
  }

  delay(250);
}
