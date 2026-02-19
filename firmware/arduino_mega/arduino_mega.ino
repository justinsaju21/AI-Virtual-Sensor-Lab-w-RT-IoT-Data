/*
 * IoT Virtual Sensor Lab - Arduino Mega 2560 (15 Sensors)
 * 
 * Hardware Connections:
 * 1. Ultrasonic: D9 (TRIG), D10 (ECHO)
 * 2. DHT11: D2
 * 3. MQ-3: A2
 * 4. MQ-2: A0
 * 5. Hall Effect: D3
 * 6. Mic/Sound: A3
 * 7. IR Sensor: D4
 * 8. Flame Sensor: A4
 * 9. Proximity: D5
 * 10. Pressure (BMP180): SDA(20), SCL(21)
 * 11. Touch: D6
 * 12. LDR: A1
 * 13. Tilt: D8
 * 14. Heartbeat: A5
 * 15. Joystick: A6(X), A7(Y), D11(SW)
 */

#include <DHT.h>
#include <Wire.h>
#include <Adafruit_BMP085.h>
#include <ArduinoJson.h>

// Pin Definitions
#define DHT_PIN 2
#define DHT_TYPE DHT11

#define TRIG_PIN 9
#define ECHO_PIN 10
#define HALL_PIN 3
#define IR_PIN 4
#define PROXIMITY_PIN 5
#define TOUCH_PIN 6
#define PIR_PIN 7 // Keeping PIR support just in case, though user list didn't mention it explicitly but useful
#define TILT_PIN 8
#define JOY_SW_PIN 11

#define MQ2_PIN A0
#define LDR_PIN A1
#define MQ3_PIN A2
#define MIC_PIN A3
#define FLAME_PIN A4
#define HEART_PIN A5
#define JOY_X_PIN A6
#define JOY_Y_PIN A7

// Objects
DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_BMP085 bmp;

// Variables
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 2000;
unsigned long uptimeStart;

void setup() {
  Serial.begin(115200);
  Serial1.begin(115200);
  
  dht.begin();
  if (!bmp.begin()) {
    Serial.println("Could not find BMP180 sensor!");
  }
  
  // Digital Inputs
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(HALL_PIN, INPUT);
  pinMode(IR_PIN, INPUT);
  pinMode(PROXIMITY_PIN, INPUT);
  pinMode(TOUCH_PIN, INPUT);
  pinMode(TILT_PIN, INPUT_PULLUP); // Usually needs pullup
  pinMode(JOY_SW_PIN, INPUT_PULLUP);
  
  uptimeStart = millis();
  
  Serial.println("IoT Virtual Lab - 15 Sensors Ready");
}

float readDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration == 0) return 0;
  return duration * 0.034 / 2;
}

void loop() {
  unsigned long currentTime = millis();
  
  if (currentTime - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = currentTime;
    
    // 1. Ultrasonic
    float distance = readDistance();
    
    // 2. DHT11
    float temp = dht.readTemperature();
    float humidity = dht.readHumidity();
    
    // 3. MQ-3 (Alcohol)
    int mq3Val = analogRead(MQ3_PIN);
    
    // 4. MQ-2 (Gas)
    int mq2Val = analogRead(MQ2_PIN);
    
    // 5. Hall Effect
    bool magnetDetected = digitalRead(HALL_PIN) == LOW; // Usually active LOW
    
    // 6. Mic/Sound
    int soundLevel = analogRead(MIC_PIN);
    
    // 7. IR Sensor
    bool irObject = digitalRead(IR_PIN) == LOW; // Active LOW
    
    // 8. Flame Sensor
    int flameVal = analogRead(FLAME_PIN);
    
    // 9. Proximity
    bool proxObject = digitalRead(PROXIMITY_PIN) == LOW;
    
    // 10. Pressure (BMP180)
    float pressure = bmp.readPressure();
    float altitude = bmp.readAltitude();
    float bmpTemp = bmp.readTemperature();
    
    // 11. Touch
    bool isTouched = digitalRead(TOUCH_PIN) == HIGH;
    
    // 12. LDR
    int lightVal = analogRead(LDR_PIN);
    
    // 13. Tilt
    bool isTilted = digitalRead(TILT_PIN) == HIGH;
    
    // 14. Heartbeat
    int heartVal = analogRead(HEART_PIN);
    
    // 15. Joystick
    int joyX = analogRead(JOY_X_PIN);
    int joyY = analogRead(JOY_Y_PIN);
    bool joyBtn = digitalRead(JOY_SW_PIN) == LOW;

    // Build JSON
    StaticJsonDocument<1024> doc;
    doc["device_id"] = "arduino_mega_01";
    doc["timestamp"] = currentTime;
    
    JsonObject sensors = doc.createNestedObject("sensors");
    
    sensors["ultrasonic"]["distance_cm"] = distance;
    
    sensors["dht11"]["temp"] = isnan(temp) ? 0 : temp;
    sensors["dht11"]["humidity"] = isnan(humidity) ? 0 : humidity;
    
    sensors["mq3"]["value"] = mq3Val;
    sensors["mq2"]["value"] = mq2Val;
    
    sensors["hall"]["active"] = magnetDetected;
    sensors["mic"]["level"] = soundLevel;
    sensors["ir"]["detected"] = irObject;
    sensors["flame"]["value"] = flameVal;
    sensors["proximity"]["active"] = proxObject;
    
    sensors["bmp180"]["pressure"] = pressure;
    sensors["bmp180"]["altitude"] = altitude;
    sensors["bmp180"]["temp"] = bmpTemp;
    
    sensors["touch"]["active"] = isTouched;
    sensors["ldr"]["value"] = lightVal;
    sensors["tilt"]["active"] = isTilted;
    sensors["heartbeat"]["value"] = heartVal;
    
    sensors["joystick"]["x"] = joyX;
    sensors["joystick"]["y"] = joyY;
    sensors["joystick"]["btn"] = joyBtn;
    
    String jsonString;
    serializeJson(doc, jsonString);
    Serial1.println(jsonString);
    Serial.println(jsonString); // Debug
  }
}
