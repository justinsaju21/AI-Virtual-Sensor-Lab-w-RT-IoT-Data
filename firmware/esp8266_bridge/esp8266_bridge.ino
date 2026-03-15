/*
 * IoT Virtual Sensor Lab - ESP8266 WiFi Bridge
 * 
 * GENERIC BRIDGE VERSION
 * This code receives ANY JSON data from Arduino Mega via Serial
 * injects WiFi stats, and forwards it to the backend.
 * 
 * Hardware Connections:
 * - ESP8266 RX -> Arduino Mega TX0 (Pin 1)
 * - ESP8266 TX -> Arduino Mega RX0 (Pin 0)
 * - GND -> GND
 * - VCC -> 3.3V
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// ============ CONFIGURATION ============
// NOTE: Update WIFI_SSID and WIFI_PASSWORD for your network.
// Do NOT commit real credentials to version control.
const char* WIFI_SSID = "YOUR_SSID";
const char* WIFI_PASSWORD = "YOUR_PASSWORD";
const char* SERVER_URL = "https://ai-virtual-sensor-lab-w-rt-iot-data.onrender.com/api/sensor-data";
const char* DEVICE_ID = "virtual_lab_01";
// ========================================

WiFiClientSecure wifiClient;
HTTPClient http;
String inputBuffer = "";
unsigned long lastWifiCheck = 0;

void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println("\n--- IoT Virtual Lab: Cloud Bridge ---");
  
  // Allow HTTPS without certificate validation
  wifiClient.setInsecure();
  
  connectWiFi();
}

void connectWiFi() {
  Serial.print("Connecting to ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi Failed. Retry pending...");
  }
}

void sendToServer(String jsonData) {
  if (WiFi.status() != WL_CONNECTED) return;

  // Dynamic JSON Buffer - size raised for high-density 17-sensor payload
  DynamicJsonDocument doc(4096); 
  DeserializationError error = deserializeJson(doc, jsonData);
  
  if (error) {
    Serial.print("JSON Error: ");
    Serial.println(error.c_str());
    return;
  }

  // Inject System Data
  JsonObject system = doc.createNestedObject("system");
  system["wifi_rssi"] = WiFi.RSSI();
  system["ip"] = WiFi.localIP().toString();
  system["heap"] = ESP.getFreeHeap();
  system["version"] = "2.0.0";
  system["uptime_ms"] = millis();

  // Re-serialize
  String payload;
  serializeJson(doc, payload);

  // Send
  http.begin(wifiClient, SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  
  int code = http.POST(payload);
  
  if (code == HTTP_CODE_OK) {
    Serial.println("Sent OK");
  } else {
    Serial.printf("HTTP Error: %d\n", code);
  }
  http.end();
}

void loop() {
  // Reconnect WiFi if lost
  if (millis() - lastWifiCheck > 30000) {
    lastWifiCheck = millis();
    if (WiFi.status() != WL_CONNECTED) connectWiFi();
  }

  // Read Serial
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      if (inputBuffer.length() > 0) {
        Serial.println("RX << " + inputBuffer); // Debug
        sendToServer(inputBuffer);
        inputBuffer = "";
      }
    } else if (c != '\r') {
      if (inputBuffer.length() < 4096) {
        inputBuffer += c;
      }
    }
  }
}
