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
const char* WIFI_SSID = "THE MAN";
const char* WIFI_PASSWORD = "Justin3443";
const char* SERVER_URL = "http://192.168.1.14:5000/api/sensor-data";
const char* DEVICE_ID = "mega_node_01";
// ========================================

WiFiClientSecure wifiClient;
HTTPClient http;
String inputBuffer = "";
unsigned long lastWifiCheck = 0;
bool wifiReconnecting = false;
unsigned long lastHTTPRequest = 0;
const unsigned long HTTP_REQUEST_INTERVAL = 200; // Limit HTTP requests to 5Hz (200ms)

void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println("\n--- IoT Virtual Lab: Cloud Bridge ---");

  // Allow HTTPS without certificate validation
  wifiClient.setInsecure();

  // Initial connection (blocking is OK at startup since no serial data yet)
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi Failed. Will retry non-blocking in loop...");
  }

  // Set HTTP timeout to reduce blocking during POST (reduced from 3000ms to 2000ms)
  http.setTimeout(2000);
}

void sendToServer(String jsonData) {
  if (WiFi.status() != WL_CONNECTED) return;

  // Dynamic JSON Buffer for 16-sensor payload + system data
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
  
  // Handshake ACK: Tell Mega we are ready for next packet
  Serial.println("ACK");
}

void loop() {
  // --- Non-blocking WiFi reconnection ---
  // Check every 30 seconds; use WiFi.begin() once, then let it reconnect
  // in the background without blocking the serial read loop
  if (millis() - lastWifiCheck > 30000) {
    lastWifiCheck = millis();
    if (WiFi.status() != WL_CONNECTED) {
      if (!wifiReconnecting) {
        Serial.println("WiFi lost. Reconnecting (non-blocking)...");
        WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
        wifiReconnecting = true;
      }
    } else if (wifiReconnecting) {
      Serial.println("WiFi reconnected!");
      Serial.println(WiFi.localIP());
      wifiReconnecting = false;
    }
  }

  // --- Read Serial (always runs, never blocked by WiFi) ---
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      if (inputBuffer.length() > 0) {
        // Queue for sending if enough time has passed since last request
        if (millis() - lastHTTPRequest >= HTTP_REQUEST_INTERVAL) {
          sendToServer(inputBuffer);
          lastHTTPRequest = millis();
        }
        inputBuffer = "";
      }
    } else if (c != '\r') {
      if (inputBuffer.length() < 4096) {
        inputBuffer += c;
      }
    }
  }
}
