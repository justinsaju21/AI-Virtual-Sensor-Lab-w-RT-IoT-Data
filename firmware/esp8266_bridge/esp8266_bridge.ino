/*
 * IoT Virtual Sensor Lab - ESP8266 WiFi Bridge
 *
 * HOSTED VERSION — Sends to Render backend (HTTPS Keep-Alive)
 *
 * KEY OPTIMIZATION: Uses http.setReuse(true) to keep the TLS connection
 * alive across multiple POST requests. This avoids paying the ~1200ms
 * TLS handshake cost on every single request, reducing latency from
 * ~4 seconds to ~500ms.
 *
 * Architecture (Combined Mega+ESP8266 board):
 * - DIP 1, 2 = ON for normal operation (Mega Serial0 -> ESP8266)
 * - Mega Serial (pins 0/1) -> ESP8266 via internal DIP bridge
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

// Global persistent HTTP objects — keeps TLS connection alive between requests
WiFiClientSecure wifiClient;
HTTPClient http;

String inputBuffer        = "";
unsigned long lastWifiCheck   = 0;
unsigned long lastHTTPRequest = 0;
const unsigned long HTTP_INTERVAL = 500; // Send at most every 500ms

bool httpInitialized = false; // Track if http.begin() has been called

void setup() {
  Serial.begin(115200);
  delay(200);

  wifiClient.setInsecure(); // Skip SSL cert check

  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false); // Disable WiFi sleep mode for lower latency
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 10000) {
    delay(250);
  }

  if (WiFi.status() == WL_CONNECTED) {
    // Pre-initialize the HTTP connection with Keep-Alive
    // This way the first real POST doesn't pay the full TLS cost
    http.begin(wifiClient, SERVER_URL);
    http.addHeader("Content-Type", "application/json");
    http.setReuse(true);      // Keep-Alive: reuse TCP+TLS connection
    http.setTimeout(65000);   // 65s for Render cold start
    httpInitialized = true;
  }
}

void sendToServer(const String& jsonData) {
  if (WiFi.status() != WL_CONNECTED) return;

  // Re-init if WiFi was lost and reconnected
  if (!httpInitialized) {
    http.begin(wifiClient, SERVER_URL);
    http.addHeader("Content-Type", "application/json");
    http.setReuse(true);
    http.setTimeout(65000);
    httpInitialized = true;
  }

  DynamicJsonDocument doc(2048);
  DeserializationError error = deserializeJson(doc, jsonData);
  if (error) return; // Silent fail on bad JSON

  // Inject minimal system metadata
  JsonObject sys = doc.createNestedObject("system");
  sys["rssi"]      = WiFi.RSSI();
  sys["heap"]      = ESP.getFreeHeap();
  sys["uptime_ms"] = millis();

  String payload;
  payload.reserve(2048);
  serializeJson(doc, payload);

  // POST — uses existing TLS connection (no handshake cost after first request)
  int code = http.POST(payload);

  if (code > 0) {
    // CRITICAL: We MUST read the response stream, otherwise the ESP8266HTTPClient 
    // considers the connection dirty and violently closes it, destroying Keep-Alive!
    String response = http.getString(); 
  } else {
    // If connection was dropped by server, re-initialize for next call
    httpInitialized = false;
  }
}

void loop() {
  // --- Non-blocking WiFi reconnect ---
  if (millis() - lastWifiCheck > 15000) {
    lastWifiCheck = millis();
    if (WiFi.status() != WL_CONNECTED) {
      httpInitialized = false; // Will re-init once WiFi is back
      WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    }
  }

  // --- Read Serial from Mega ---
  while (Serial.available()) {
    char c = Serial.read();

    if (c == '\n') {
      String trimmed = inputBuffer;
      trimmed.trim();

      // Only process valid JSON (starts with '{')
      if (trimmed.length() > 10 && trimmed.startsWith("{")) {
        
        // CRITICAL FIX: Always ACK the Mega immediately so it doesn't wait for TX_TIMEOUT (5s)
        // We do this BEFORE the rate limit check, otherwise dropped packets cause the Mega to freeze!
        Serial.println("ACK");

        if (millis() - lastHTTPRequest >= HTTP_INTERVAL) {
          lastHTTPRequest = millis();
          sendToServer(trimmed);
        }
      }
      inputBuffer = "";
    } else if (c != '\r') {
      if (inputBuffer.length() < 2048) {
        inputBuffer += c;
      }
    }
  }
}
