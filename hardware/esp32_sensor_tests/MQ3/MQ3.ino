/*
 * Sensor: MQ-3 (Alcohol Vapor)
 * Board: ESP32 WROOM32
 * 
 * Dependencies:
 * - Base ESP32 platform libraries (No external library required)
 * 
 * Pins:
 * - VCC -> 5V (CRITICAL: The internal heater of the MQ-3 will NOT work on 3.3V)
 * - GND -> GND
 * - AO  -> GPIO 35 (ADC1_CH7) 
 * 
 * **IMPORTANT ESP32 NOTE:** 
 * Similar to MQ-2, the output can theoretically reach 5V when concentrations are critical. 
 * Use a hardware voltage divider (e.g., 10k + 20k resistors) to step the AO voltage 
 * down to a safe range (max 3.3V) before it touches the ESP32 GPIO pin to prevent damage!
 */

#define MQ3_PIN 35 

void setup() {
  Serial.begin(115200);
  Serial.println("MQ-3 Alcohol Sensor ESP32 Test");
  // The heater requires several minutes of 5V burn-in warm-up for accurate readings
}

void loop() {
  // ESP32 uses a 12-bit ADC by default, meaning values range from 0 to 4095
  int rawValue = analogRead(MQ3_PIN);
  
  // Approximate conversion to voltage (Assuming you used a voltage divider, 
  // this is the voltage hitting the pin, not the raw output of the MQ3)
  float voltage = rawValue * (3.3 / 4095.0); 

  Serial.print("Raw ADC (0-4095): ");
  Serial.print(rawValue);
  Serial.print(" | Approx Voltage into ESP32: ");
  Serial.print(voltage);
  Serial.println("V");

  delay(1000);
}
