/*
 * Sensor: HC-SR04 (Ultrasonic Distance)
 * Board: ESP32 WROOM32
 * 
 * Dependencies:
 * - None (Standard Arduino pulseIn logic is used)
 * 
 * Pins:
 * - VCC  -> 5V (Standard HC-SR04 strictly requires 5V to fire the ultrasonic ping)
 * - GND  -> GND
 * - TRIG -> GPIO 5 
 * - ECHO -> GPIO 18   **!!! CRITICAL WARNING !!!**
 *   Because the sensor runs on 5V, the ECHO pin will return a 5V HIGH signal. 
 *   The ESP32 is a 3.3V device! You MUST use a voltage divider (e.g., 1kΩ + 2kΩ) 
 *   on the ECHO wire to step it down to ~3.3V before plugging it into GPIO 18, 
 *   otherwise you risk permanently frying the ESP32 pin!
 */

#define TRIG_PIN 5
#define ECHO_PIN 18

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.println("HC-SR04 Ultrasonic ESP32 Test");
}

void loop() {
  // 1. Clear the trigger
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  
  // 2. Send a 10 microsecond HIGH pulse
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // 3. Read the Echo pulse width in microseconds 
  // Timeout set to 30ms (30000us) to prevent the ESP32 from freezing if nothing is found
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  
  if (duration == 0) {
    Serial.println("Out of range or wire disconnected.");
  } else {
    // 4. Math: Speed of sound is ~340 m/s or 0.034 cm/us. 
    // Divide by 2 because the sound makes a round trip (out and back).
    float distanceCm = duration * 0.034 / 2.0;
    
    Serial.print("Distance: ");
    Serial.print(distanceCm);
    Serial.println(" cm");
  }
  
  delay(200); // Small delay before sending the next ping
}
