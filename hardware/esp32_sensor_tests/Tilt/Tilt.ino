/*
 * Sensor: Tilt / Vibration Switch (SW-520D / Generic Ball Switch)
 * Board: ESP32 WROOM32
 * 
 * Dependencies:
 * - None
 * 
 * Pins:
 * - Leg 1 -> GPIO 13
 * - Leg 2 -> GND
 * 
 * Logic: Simple mechanical ball switch. We use internal ESP32 Pull-Up resistor logic.
 */

#define TILT_PIN 13

void setup() {
  Serial.begin(115200);

  // We utilize the ESP32's internal pull-up hardware. 
  // It rests at HIGH (3.3V). When the metal ball rolls onto the contacts, 
  // it bridges the circuit physically to GND, reading LOW.
  pinMode(TILT_PIN, INPUT_PULLUP);
  
  Serial.println("Tilt & Vibration Sensor ESP32 Test");
}

void loop() {
  int tiltState = digitalRead(TILT_PIN);

  // Note: Depending on how you physically mount the sensor (upright vs sideways),
  // LOW might mean "Safe" or it might mean "Danger". Adjust logic as necessary.
  if (tiltState == LOW) {
    Serial.println("Status: CLOSED CIRCUIT (Safe)");
  } else {
    Serial.println("WARNING: TILTED! OPEN CIRCUIT!");
  }

  // Fast polling loop to catch quick momentary vibrations ("switch bounce")
  delay(100);
}
