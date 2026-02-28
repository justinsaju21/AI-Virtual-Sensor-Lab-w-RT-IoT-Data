/*
 * Sensor: MQ-2 (Gas/Smoke)
 * Board: ESP32 WROOM32
 * 
 * Dependencies:
 * - Base ESP32 platform libraries (No external library required)
 * 
 * Pins:
 * - VCC -> 5V (CRITICAL: The internal heater of the MQ-2 will NOT work on 3.3V)
 * - GND -> GND
 * - AO  -> GPIO 34 (ADC1_CH6) 
 * 
 * **IMPORTANT ESP32 NOTE:** 
 * The MQ-2 AO pin can output up to 5V when gas is highly concentrated.
 * The ESP32 ADC pins are ONLY 3.3V tolerant. Sending 5V directly to GPIO 34 
 * could destroy the pin over time. You MUST use a voltage divider (e.g. 10k + 20k resistors) 
 * to step the AO voltage down to safe ranges if you expect maximum concentrations.
 */

// Choose an ADC1 pin for ESP32 (32, 33, 34, 35). Do not use ADC2 if using WiFi.
#define MQ2_PIN 34 

void setup() {
  Serial.begin(115200);
  Serial.println("MQ-2 Gas Sensor ESP32 Test");
  // The heater requires several minutes to physically warm up for accurate readings output
}

void loop() {
  // ESP32 uses a 12-bit ADC by default, meaning values range from 0 to 4095
  int rawValue = analogRead(MQ2_PIN);
  
  // Approximate voltage conversion (Assuming default 11dB attenuation)
  float voltage = rawValue * (3.3 / 4095.0); 

  Serial.print("Raw ADC (0-4095): ");
  Serial.print(rawValue);
  Serial.print(" | Approx Voltage into ESP32: ");
  Serial.print(voltage);
  Serial.println("V");

  delay(1000);
}
