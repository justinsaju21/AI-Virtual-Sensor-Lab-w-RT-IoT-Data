/*
 * Sensor: Dual Axis Analog Joystick
 * Board: ESP32 WROOM32
 * 
 * Dependencies:
 * - None
 * 
 * Pins:
 * - VCC -> 3.3V (IMPORTANT: Powering the potentiometers with 3.3V limits the 
 *          maximum analog output to 3.3V, keeping the ESP32 ADC pins safe from clipping!)
 * - GND -> GND
 * - VRx -> GPIO 32 (ADC1_CH4)
 * - VRy -> GPIO 33 (ADC1_CH5)
 * - SW  -> GPIO 25 (Digital switch requiring Pull-Up)
 */

#define JOY_X 32
#define JOY_Y 33
#define JOY_BUTTON 25

void setup() {
  Serial.begin(115200);

  // The physical button connects the pin to GND when pressed down
  pinMode(JOY_BUTTON, INPUT_PULLUP);
  
  Serial.println("Analog Joystick ESP32 Test");
}

void loop() {
  // ESP32 ADC resolution is 12-bit (0 - 4095).
  // At physical rest (spring center), X and Y should report roughly 2048.
  int xVal = analogRead(JOY_X);
  int yVal = analogRead(JOY_Y);
  int btnState = digitalRead(JOY_BUTTON);

  Serial.print("X: ");
  Serial.print(xVal);
  Serial.print(" | Y: ");
  Serial.print(yVal);

  if (btnState == LOW) {
    Serial.println(" | BUTTON PRESSED!");
  } else {
    Serial.println(" | (unpressed)");
  }

  delay(100);
}
