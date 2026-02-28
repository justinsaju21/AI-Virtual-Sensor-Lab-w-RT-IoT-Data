/*
 * Sensor: Sound Sensor Module (Microphone)
 * Board: ESP32 WROOM32
 * 
 * Dependencies:
 * - None
 * 
 * Pins:
 * - VCC -> 3.3V
 * - GND -> GND
 * - DO  -> GPIO 17 (Volume Threshold Trigger)
 * 
 * Note: Use a tiny screwdriver to adjust the blue potentiometer on the module 
 * to set the exact volume threshold needed to trigger it.
 */

#define SOUND_DIGITAL 17

void setup() {
  Serial.begin(115200);
  pinMode(SOUND_DIGITAL, INPUT);
  Serial.println("Acoustic Sound Sensor ESP32 Test. Clap your hands!");
}

void loop() {
  int noiseTrigger = digitalRead(SOUND_DIGITAL);
  
  // Depending on the specific module, HIGH or LOW may indicate the trigger.
  // Assuming active-HIGH for standard hobby modules.
  if (noiseTrigger == HIGH) {
    Serial.println("CLAP DETECTED! (Loud noise)");
    // Small delay to prevent detecting the room echo as a second distinct clap
    delay(100); 
  }

  // Very rapid looping to catch short sound spikes
  delay(10);
}
