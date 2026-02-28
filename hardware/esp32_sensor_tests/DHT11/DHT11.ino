/*
 * Sensor: DHT11 (Temperature & Humidity)
 * Board: ESP32 WROOM32
 * 
 * Dependencies (Install via Arduino Library Manager):
 * - "DHT sensor library" by Adafruit
 * - "Adafruit Unified Sensor" by Adafruit
 * 
 * Pins:
 * - VCC  -> 3.3V
 * - GND  -> GND
 * - DATA -> GPIO 4 (Note: You may need a 10k Pull-up resistor from DATA to 3.3V)
 */
#include "DHT.h"

#define DHTPIN 4     // Digital pin connected to the DHT sensor
#define DHTTYPE DHT11   // DHT 11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  Serial.println(F("DHT11 ESP32 Test"));
  dht.begin();
}

void loop() {
  // DHT11 requires at least 2 seconds between readings!
  delay(2000); 

  float h = dht.readHumidity();
  float t = dht.readTemperature(); // Celsius

  if (isnan(h) || isnan(t)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }

  Serial.print(F("Humidity: "));
  Serial.print(h);
  Serial.print(F("%  Temperature: "));
  Serial.print(t);
  Serial.println(F("°C "));
}
