/*
 * IoT Virtual Sensor Lab - ESP8266 WiFi Bridge
 *
 * HOSTED VERSION — Sends to Render backend
 *
 * ARCHITECTURE — TLS SESSION CACHING (No Keep-Alive)
 *   TCP Keep-Alive causes unpredictable deadlocks on ESP8266 with Render.
 *   Instead, we cleanly open and close the TCP socket on every request,
 *   but cache the TLS Cryptographic Session. This gives us the same
 *   low latency (~150ms) without the instability!
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// ============ CONFIGURATION ============
const char* WIFI_SSID     = "THE MAN";
const char* WIFI_PASSWORD = "Justin3443";
const char* SERVER_URL    = "https://ai-virtual-sensor-lab-w-rt-iot-data.onrender.com/api/sensor-data";
// ========================================

WiFiClientSecure wifiClient;
HTTPClient       http;
BearSSL::Session tlsSession; // Cache TLS keys to bypass slow handshakes!

// Static buffer for serial parsing
char jsonBuffer[2048];
int  bufferIndex = 0;

unsigned long lastWifiCheck   = 0;
unsigned long lastHTTPRequest = 0;
const unsigned long HTTP_INTERVAL = 250; // POST at most every 250ms (4Hz)

void setup() {
  Serial.begin(115200);
  delay(200);

  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false); // Disable modem sleep
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    delay(250);
  }
}

void sendToServer(const char* jsonData) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("DEBUG: WiFi Disconnected");
    return;
  }

  DynamicJsonDocument doc(2048);
  DeserializationError err = deserializeJson(doc, jsonData);
  if (err) {
    Serial.print("DEBUG: JSON Parse Failed - ");
    Serial.println(err.c_str());
    return;
  }

  JsonObject sys   = doc.createNestedObject("system");
  sys["rssi"]      = WiFi.RSSI();
  sys["heap"]      = ESP.getFreeHeap();
  sys["uptime_ms"] = millis();

  String payload;
  payload.reserve(2048);
  serializeJson(doc, payload);

  // Setup Secure Client
  wifiClient.setInsecure(); // Skip cert check
  wifiClient.setSession(&tlsSession); // Resume previous session (FAST!)

  http.begin(wifiClient, SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000); // 5s timeout

  // Execute POST
  int code = http.POST(payload);

  if (code > 0) {
    // Success! 
    Serial.print("DEBUG: HTTP Success: ");
    Serial.println(code);
  } else {
    // Failed
    Serial.print("DEBUG: HTTP Error: ");
    Serial.println(http.errorToString(code).c_str());
  }

  // ALWAYS gracefully close to prevent socket exhaustion and deadlocks
  http.end();
  wifiClient.stop();
}

void loop() {
  // ============================================================
  // 1. MEMORY-SAFE SERIAL READER & BACKPRESSURE HANDSHAKE
  // ============================================================
  while (Serial.available()) {
    char c = Serial.read();

    if (c == '\n') {
      jsonBuffer[bufferIndex] = '\0'; // Null-terminate

      // Basic validation
      if (bufferIndex > 10 && jsonBuffer[0] == '{') {
        
        // Only POST if interval has passed
        if (millis() - lastHTTPRequest >= HTTP_INTERVAL) {
          sendToServer(jsonBuffer);
          lastHTTPRequest = millis();
        }

        // ACK IMMEDIATELY AFTER PROCESSING.
        Serial.println("ACK");
      } else {
        Serial.println("DEBUG: Invalid packet received from Mega");
      }

      bufferIndex = 0;

    } else if (c != '\r') {
      if (bufferIndex < 2047) {
        jsonBuffer[bufferIndex++] = c;
      }
    }
  }

  // ============================================================
  // 2. WIFI WATCHDOG
  // ============================================================
  if (millis() - lastWifiCheck > 15000) {
    lastWifiCheck = millis();
    if (WiFi.status() != WL_CONNECTED) {
      WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    }
  }
}

