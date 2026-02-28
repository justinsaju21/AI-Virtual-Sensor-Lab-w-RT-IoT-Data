/*
 * Sensor: GY-BMP280-3.3 (Pressure & Temperature)
 * Board: ESP32 WROOM32
 * 
 * Dependencies (Install via Arduino Library Manager):
 * - "Adafruit BMP280 Library" by Adafruit
 * - "Adafruit Unified Sensor" by Adafruit
 * 
 * Pins:
 * - VCC  -> 3.3V
 * - GND  -> GND
 * - SDA  -> GPIO 21 (Default ESP32 I2C SDA)
 * - SCL  -> GPIO 22 (Default ESP32 I2C SCL)
 * 
 * Logic: Initializes I2C and reads temperature/pressure.
 */
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp; // I2C Hardware

void setup() {
  Serial.begin(115200);
  Serial.println(F("BMP280 ESP32 Test"));

  // ESP32 default I2C pins: SDA=21, SCL=22
  if (!bmp.begin(0x76)) {  // Address is usually 0x76 or 0x77
    Serial.println(F("Could not find a valid BMP280 sensor, check wiring!"));
    while (1) delay(10);
  }

  /* Default settings from datasheet. */
  bmp.setSampling(Adafruit_BMP280::MODE_NORMAL,     /* Operating Mode. */
                  Adafruit_BMP280::SAMPLING_X2,     /* Temp. oversampling */
                  Adafruit_BMP280::SAMPLING_X16,    /* Pressure oversampling */
                  Adafruit_BMP280::FILTER_X16,      /* Filtering. */
                  Adafruit_BMP280::STANDBY_MS_500); /* Standby time. */
}

void loop() {
    Serial.print(F("Temperature = "));
    Serial.print(bmp.readTemperature());
    Serial.println(" *C");

    Serial.print(F("Pressure = "));
    Serial.print(bmp.readPressure() / 100.0F); // Convert Pa to hPa
    Serial.println(" hPa");

    Serial.println();
    delay(2000);
}
