/*
 * Sensor: LM35 (Analog Temperature Sensor)
 * Board: ESP32 WROOM32
 * 
 * Dependencies:
 * - None
 * 
 * Pins:
 * - VCC -> 5V (Note: The LM35 operates better at 5V. Because its output is 10mV/°C, 
 *               even at 100°C it only outputs 1.0V. This 1.0V max output is perfectly 
 *               safe to plug directly into the ESP32's 3.3V-limited ADC pins).
 * - GND -> GND
 * - OUT -> GPIO 39 (VN - Input Only ADC pin)
 */

#define TEMP_PIN 39

void setup() {
  Serial.begin(115200);
  Serial.println("LM35 Temperature Probe ESP32 Test");
}

void loop() {
  // ESP32 uses a 12-bit ADC (range 0 to 4095) against a 3.3V reference.
  int rawADC = analogRead(TEMP_PIN);

  // 1. Convert the ADC number to an actual voltage (in millivolts).
  // The ESP32 ADC reads up to 3300mV across 4096 steps.
  float millivolts = (rawADC / 4096.0) * 3300.0;

  // 2. The LM35 scale factor is strictly fixed at 10mV per degree Celsius.
  float tempC = millivolts / 10.0;
  
  // 3. Convert to Fahrenheit
  float tempF = (tempC * 9.0 / 5.0) + 32.0;

  Serial.print("Raw ADC (0-4095): ");
  Serial.print(rawADC);
  Serial.print(" | Temp: ");
  Serial.print(tempC);
  Serial.print(" °C  /  ");
  Serial.print(tempF);
  Serial.println(" °F");

  delay(1000); 
}
