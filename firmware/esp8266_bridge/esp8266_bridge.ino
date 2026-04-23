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
const char* DEVICE_ID     = "mega_node_01";
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
    http.end(); // Clean up previous socket if any leak occurred
    http.begin(wifiClient, SERVER_URL);
    http.addHeader("Content-Type", "application/json");
    // Removed setReuse(true) because ESP8266 WiFiClientSecure Keep-Alive causes memory fragmentation/crashing
    http.setTimeout(15000); // Changed to 15s to fail-fast if Render hangs
    httpInitialized = true;
  }

  DynamicJsonDocument doc(2048);
  DeserializationError error = deserializeJson(doc, jsonData);
  if (error) {
    Serial.print("[BRIDGE] JSON Parse Failed: ");
    Serial.println(error.c_str());
    Serial.println("[BRIDGE] Raw Input: " + jsonData);
    return; // Silent fail on bad JSON to backend, but warned locally
  }

  // Inject minimal system metadata
  JsonObject sys = doc.createNestedObject("system");
  sys["rssi"]      = WiFi.RSSI();
  sys["heap"]      = ESP.getFreeHeap();
  sys["uptime_ms"] = millis();

  String payload;
  payload.reserve(2048);
  serializeJson(doc, payload);

  // POST — uses existing TLS connection (no handshake cost after first request)
  Serial.println("[BRIDGE] Executing HTTP POST to Render...");
  int code = http.POST(payload);
  
  Serial.print("[BRIDGE] HTTP Status Code: ");
  Serial.println(code);

  if (code > 0) {
    // Read the response stream to flush the buffer
    String response = http.getString(); 
    Serial.println("[BRIDGE] Render Response: " + response);
    
    // Explicitly disconnect after every request to save RAM since we disabled Keep-Alive
    http.end();
    httpInitialized = false;
  } else {
    // If connection was dropped by server, re-initialize for next call
    Serial.println("[BRIDGE] Connection Dropped or Failed! Error: " + http.errorToString(code));
    http.end(); // Terminate dead socket properly to prevent TCP socket leak
    httpInitialized = false;
  }
}

void loop() {
  // --- Non-blocking WiFi reconnect ---
  if (millis() - lastWifiCheck > 15000) {
    lastWifiCheck = millis();
    if (WiFi.status() != WL_CONNECTED) {
      http.end(); // Cleanly close socket before attempting WiFi reset
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

        if (millis() - lastHTTPRequest >= HTTP_INTERVAL) {
          lastHTTPRequest = millis();
          sendToServer(trimmed);
        }

        // ACK the Mega AFTER processing (e.g. after HTTP POST) so we don't overflow the Serial buffer
        // Flow control: Mega waits for this before sending the next packet.
        Serial.println("ACK");
      }
      inputBuffer = "";
    } else if (c != '\r') {
      if (inputBuffer.length() < 2048) {
        inputBuffer += c;
      }
    }
  }
}
