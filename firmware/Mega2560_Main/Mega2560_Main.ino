/*
 * IoT Virtual Lab - Mega 2560 Super-Node Firmware
 * 
 * Description: 
 * This monolithic firmware reads 17 individual sensors concurrently using 
 * non-blocking millis() timers. It packs the raw data into a serialized JSON 
 * payload and transmits it over Serial3 to the ESP8266 Wi-Fi Gateway.
 * 
 * Required Libraries:
 * - ArduinoJson (v6 or v7)
 * - Adafruit BMP280 Library
 * - Adafruit Unified Sensor
 * - DHT sensor library
 * - SparkFun MAX3010x Pulse and Proximity Sensor Library
 */

#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_BMP280.h>
#include <DHT.h>
#include "MAX30105.h"
#include "heartRate.h"

// ==========================================
// PIN DEFINITIONS
// ==========================================
// Analog Pins
#define PIN_MQ2      A0
#define PIN_MQ3      A1
#define PIN_JOY_X    A2
#define PIN_JOY_Y    A3
#define PIN_LDR      A4
#define PIN_FLAME_A  A5
#define PIN_SOUND_A  A6
#define PIN_LM35     A7

// Digital Pins
#define PIN_DHT      2
#define PIN_TRIG     3
#define PIN_ECHO     4
#define PIN_TOUCH    5
#define PIN_HALL     6
#define PIN_JOY_SW   7
#define PIN_FLAME_D  8
#define PIN_SOUND_D  9
#define PIN_PIR      10
#define PIN_PROX     11
#define PIN_TILT     12
#define PIN_IR       13

// ==========================================
// SENSOR CONFIGURATIONS
// ==========================================
#define DHTTYPE DHT11
DHT dht(PIN_DHT, DHTTYPE);

Adafruit_BMP280 bmp; 
MAX30105 particleSensor;

// ==========================================
// GLOBALS & TIMERS
// ==========================================
// Standard polling intervals (in ms)
const unsigned long INTERVAL_FAST = 50;    // Joystick, Touch, Tilt
const unsigned long INTERVAL_MED  = 200;   // Gases, LDR, Flame, Sound 
const unsigned long INTERVAL_SLOW = 2000;  // DHT11, Serial TX

unsigned long lastFastUpdate = 0;
unsigned long lastMedUpdate  = 0;
unsigned long lastSlowUpdate = 0;
unsigned long lastSonicUpdate = 0;

// Data structure holding all current readings
struct SensorData {
  // Gases/Air
  int mq2_raw;
  int mq3_raw;
  float ext_temp;
  float ext_hum;
  float bmp_temp;
  float bmp_press;
  // Fire/Light/Sound
  int ldr_val;
  int flame_a;
  bool flame_d;
  int sound_a;
  bool sound_d;
  // Motion/Object
  float sonic_dist;
  bool pir_active;
  bool ir_active;
  bool prox_active;
  // Mechanical/Touch
  bool touch_active;
  bool tilt_active;
  bool hall_active;
  int joy_x;
  int joy_y;
  bool joy_sw;
  // Medical
  float lm35_temp;
  long max_ir;
  float bpm;
} sysData;

void setup() {
  // Debug Serial (PC)
  Serial.begin(115200);
  // ESP8266 Serial Link (TX3/RX3)
  Serial3.begin(115200);

  Serial.println("Initialzing IoT Virtual Lab Mega Node...");

  // Setup Digital Inputs
  pinMode(PIN_TOUCH, INPUT);
  pinMode(PIN_HALL, INPUT_PULLUP);
  pinMode(PIN_JOY_SW, INPUT_PULLUP);
  pinMode(PIN_FLAME_D, INPUT);
  pinMode(PIN_SOUND_D, INPUT);
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_PROX, INPUT_PULLUP); // Assuming NPN
  pinMode(PIN_TILT, INPUT_PULLUP);
  pinMode(PIN_IR, INPUT);
  
  // HC-SR04
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);

  // Init I2C & Smart Sensors
  Wire.begin();
  
  dht.begin();
  
  if (!bmp.begin(0x76)) {
    Serial.println("Warning: BMP280 not found! Check wiring!");
  } else {
    // Default setup for BMP280
    bmp.setSampling(Adafruit_BMP280::MODE_NORMAL, 
                    Adafruit_BMP280::SAMPLING_X2, 
                    Adafruit_BMP280::SAMPLING_X16, 
                    Adafruit_BMP280::FILTER_X16, 
                    Adafruit_BMP280::STANDBY_MS_500);
  }

  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("Warning: MAX30102 not found! Check wiring!");
  } else {
    particleSensor.setup(); // Default settings
    particleSensor.setPulseAmplitudeRed(0x0A);
    particleSensor.setPulseAmplitudeGreen(0);
  }

  Serial.println("System Ready. Beginning main loop...");
}

void loop() {
  unsigned long currentMillis = millis();

  // ---------------------------------------------------------
  // FAST POLLING LOOP (50ms ~ 20Hz)
  // Catch quick human inputs & mechanical switches
  // ---------------------------------------------------------
  if (currentMillis - lastFastUpdate >= INTERVAL_FAST) {
    lastFastUpdate = currentMillis;

    sysData.joy_x = analogRead(PIN_JOY_X);
    sysData.joy_y = analogRead(PIN_JOY_Y);
    sysData.joy_sw = digitalRead(PIN_JOY_SW);
    
    sysData.touch_active = digitalRead(PIN_TOUCH) == HIGH;
    sysData.tilt_active = digitalRead(PIN_TILT) == LOW; // Low when tilted (pullup)
    sysData.hall_active = digitalRead(PIN_HALL) == LOW; // Low when mag detected
    
    // Pulse Oximeter requires constant polling
    sysData.max_ir = particleSensor.getIR();
    if (checkForBeat(sysData.max_ir) == true) {
      // Very basic placeholder. Real BPM calc requires timing arrays.
      sysData.bpm = 75.0; 
    }
  }

  // ---------------------------------------------------------
  // MEDIUM POLLING LOOP (200ms ~ 5Hz)
  // General analog sensors and environment states
  // ---------------------------------------------------------
  if (currentMillis - lastMedUpdate >= INTERVAL_MED) {
    lastMedUpdate = currentMillis;

    sysData.mq2_raw = analogRead(PIN_MQ2);
    sysData.mq3_raw = analogRead(PIN_MQ3);
    sysData.ldr_val = analogRead(PIN_LDR);
    
    sysData.flame_a = analogRead(PIN_FLAME_A);
    sysData.flame_d = digitalRead(PIN_FLAME_D) == LOW; // Low = Fire
    
    sysData.sound_a = analogRead(PIN_SOUND_A);
    sysData.sound_d = digitalRead(PIN_SOUND_D) == HIGH; // High = Noise
    
    sysData.pir_active = digitalRead(PIN_PIR) == HIGH;
    sysData.ir_active = digitalRead(PIN_IR) == LOW; // Low = Obstacle
    sysData.prox_active = digitalRead(PIN_PROX) == LOW; // Low = Metal
    
    // LM35 calculation (10mV per C)
    int rawLM35 = analogRead(PIN_LM35);
    sysData.lm35_temp = (rawLM35 / 1024.0) * 5000.0 / 10.0;
  }

  // ---------------------------------------------------------
  // ULTRASONIC POLLING (60ms)
  // Must be separate because pulseIn() blocks for up to 25ms!
  // ---------------------------------------------------------
  if (currentMillis - lastSonicUpdate >= 60) {
    lastSonicUpdate = currentMillis;
    
    digitalWrite(PIN_TRIG, LOW);
    delayMicroseconds(2);
    digitalWrite(PIN_TRIG, HIGH);
    delayMicroseconds(10);
    digitalWrite(PIN_TRIG, LOW);
    
    // Timeout set to 23200us (~4 meters). Anything longer returns 0.
    long duration = pulseIn(PIN_ECHO, HIGH, 23200);
    sysData.sonic_dist = (duration * 0.0343) / 2.0; 
  }

  // ---------------------------------------------------------
  // SLOW POLLING LOOP (2000ms ~ 0.5Hz)
  // DHT11 requires 2 sec between reads. Also sends JSON.
  // ---------------------------------------------------------
  if (currentMillis - lastSlowUpdate >= INTERVAL_SLOW) {
    lastSlowUpdate = currentMillis;

    // Read DHT
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    if (!isnan(h) && !isnan(t)) {
      sysData.ext_hum = h;
      sysData.ext_temp = t;
    }

    // Read BMP
    sysData.bmp_temp = bmp.readTemperature();
    sysData.bmp_press = bmp.readPressure() / 100.0F; // hPa

    // --- TRANSMIT JSON PAYLOAD ---
    transmitData();
  }
}

// ==========================================
// JSON SERIALIZATION
// ==========================================
void transmitData() {
  StaticJsonDocument<1024> doc; // Adjust size if using JsonDocument (v7)

  // Construct structured payload
  doc["device_id"] = "mega_node_01";
  
  JsonObject s = doc.createNestedObject("sensors");
  
  s["dht11"]["temp"] = sysData.ext_temp;
  s["dht11"]["humidity"] = sysData.ext_hum;
  
  s["bmp280"]["temp"] = sysData.bmp_temp;
  s["bmp280"]["pressure"] = sysData.bmp_press;
  
  s["mq2"]["raw"] = sysData.mq2_raw;
  s["mq3"]["raw"] = sysData.mq3_raw;
  
  s["ldr"]["raw"] = sysData.ldr_val;
  s["flame"]["analog"] = sysData.flame_a;
  s["flame"]["digital"] = sysData.flame_d;
  
  s["sound"]["analog"] = sysData.sound_a;
  s["sound"]["digital"] = sysData.sound_d;
  
  s["ultrasonic"]["distance_cm"] = sysData.sonic_dist;
  s["pir"]["active"] = sysData.pir_active;
  s["ir"]["active"] = sysData.ir_active;
  s["proximity"]["active"] = sysData.prox_active;
  
  s["touch"]["active"] = sysData.touch_active;
  s["tilt"]["active"] = sysData.tilt_active;
  s["hall"]["active"] = sysData.hall_active;
  
  s["joystick"]["x"] = sysData.joy_x;
  s["joystick"]["y"] = sysData.joy_y;
  s["joystick"]["button_pressed"] = !sysData.joy_sw; // Invert so true = pressed
  
  s["lm35"]["temp"] = sysData.lm35_temp;
  s["max30102"]["ir"] = sysData.max_ir;
  s["max30102"]["bpm"] = sysData.bpm;

  // Serialize to JSON and send to ESP8266
  serializeJson(doc, Serial3);
  Serial3.println(); // Terminate with newline

  // Print to PC for debugging
  // serializeJsonPretty(doc, Serial);
  // Serial.println();
}
