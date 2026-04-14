// 🛜 ESP-01 (ESP8266) WiFi Connection Test
// Hardware: Arduino Nano + ESP-01 module
// Wiring: Nano D2 (TX) → ESP-01 RX, Nano D3 (RX) → ESP-01 TX
// ESP-01 VCC → 3.3V, GND → GND, CH_PD → 3.3V
//
// ⚠️ ESP-01 is 3.3V logic — use a voltage divider on Nano D2 → ESP RX
//    (1K + 2K divider or a level shifter). ESP TX → Nano D3 is fine as-is.

#include <Arduino.h>
#include <SoftwareSerial.h>
#include "credentials.h" // 🔐 WiFi creds — see credentials.example.h

// 📌 Pin definitions
#define ESP_TX_PIN 2  // Nano D2 → ESP-01 RX
#define ESP_RX_PIN 3  // Nano D3 ← ESP-01 TX

// ⏱️ Timeout for AT command responses (ms)
#define AT_TIMEOUT 5000
#define WIFI_TIMEOUT 15000

SoftwareSerial espSerial(ESP_RX_PIN, ESP_TX_PIN); // RX, TX

// 📨 Send AT command and wait for expected response
bool sendATCommand(const char* cmd, const char* expected, unsigned long timeout) {
  Serial.print(">>> ");
  Serial.println(cmd);

  espSerial.println(cmd);

  unsigned long start = millis();
  String response = "";

  while (millis() - start < timeout) {
    while (espSerial.available()) {
      char c = espSerial.read();
      response += c;
      Serial.write(c); // echo to serial monitor
    }
    if (response.indexOf(expected) != -1) {
      Serial.println();
      return true;
    }
  }

  Serial.println("\n⏰ TIMEOUT");
  return false;
}

// 📨 Send command, print all output (no expected string)
void sendATCommandRaw(const char* cmd, unsigned long timeout) {
  Serial.print(">>> ");
  Serial.println(cmd);

  espSerial.println(cmd);

  unsigned long start = millis();
  while (millis() - start < timeout) {
    while (espSerial.available()) {
      Serial.write(espSerial.read());
    }
  }
  Serial.println();
}

void setup() {
  Serial.begin(9600);
  espSerial.begin(9600); // ESP-01 default baud rate

  delay(2000); // ⏳ Wait for ESP-01 to boot

  Serial.println("================================");
  Serial.println("🛜 ESP-01 WiFi Connection Test");
  Serial.println("================================");
  Serial.println();

  // 🔌 Step 1: Basic communication check
  Serial.println("--- Step 1: AT Check ---");
  if (!sendATCommand("AT", "OK", AT_TIMEOUT)) {
    Serial.println("❌ ESP-01 not responding!");
    Serial.println("🔍 Check: wiring, 3.3V power, CH_PD pulled HIGH");
    Serial.println();
    Serial.println("💡 Tip: Try changing baud rate to 9600:");
    Serial.println("   espSerial.begin(9600);");
    Serial.println("   Or send AT+UART_DEF=9600,8,1,0,0 to change ESP baud");
    while (true) { delay(1000); } // halt
  }
  Serial.println("✅ ESP-01 responding!\n");

  // ℹ️ Step 2: Get firmware version
  Serial.println("--- Step 2: Firmware Info ---");
  sendATCommandRaw("AT+GMR", AT_TIMEOUT);

  // 📡 Step 3: Set WiFi mode to Station
  Serial.println("--- Step 3: Set Station Mode ---");
  if (sendATCommand("AT+CWMODE=1", "OK", AT_TIMEOUT)) {
    Serial.println("✅ Station mode set\n");
  } else {
    Serial.println("⚠️ Could not set station mode\n");
  }

  // 🛜 Step 4: Connect to WiFi
  Serial.println("--- Step 4: Connect to WiFi ---");
  Serial.print("📡 Connecting to: ");
  Serial.println(WIFI_SSID);

  char connectCmd[128];
  snprintf(connectCmd, sizeof(connectCmd), "AT+CWJAP=\"%s\",\"%s\"", WIFI_SSID, WIFI_PASS);

  if (sendATCommand(connectCmd, "OK", WIFI_TIMEOUT)) {
    Serial.println("✅ WiFi connected!\n");
  } else {
    Serial.println("❌ WiFi connection failed!");
    Serial.println("🔍 Check: SSID, password, signal strength");
    Serial.println("   ESP-01 only supports 2.4GHz networks\n");
  }

  // 🌐 Step 5: Get IP address
  Serial.println("--- Step 5: IP Address ---");
  sendATCommandRaw("AT+CIFSR", AT_TIMEOUT);

  // 🏓 Step 6: Test internet connectivity (TCP to example.com:80)
  Serial.println("--- Step 6: Internet Test ---");
  if (sendATCommand("AT+CIPSTART=\"TCP\",\"example.com\",80", "OK", AT_TIMEOUT)) {
    Serial.println("✅ TCP connection to example.com successful!");

    // Send a simple HTTP GET
    const char* httpGet = "GET / HTTP/1.1\r\nHost: example.com\r\nConnection: close\r\n\r\n";
    char sendCmd[32];
    snprintf(sendCmd, sizeof(sendCmd), "AT+CIPSEND=%d", strlen(httpGet));

    if (sendATCommand(sendCmd, ">", AT_TIMEOUT)) {
      espSerial.print(httpGet);
      Serial.println("📨 HTTP GET sent, waiting for response...\n");

      // Print first part of HTTP response
      unsigned long start = millis();
      while (millis() - start < 10000) {
        while (espSerial.available()) {
          Serial.write(espSerial.read());
        }
      }
      Serial.println("\n\n✅ Internet connectivity confirmed!");
    }
  } else {
    Serial.println("❌ Could not reach example.com");
    Serial.println("🔍 WiFi may be connected but no internet access\n");
  }

  // 📊 Summary
  Serial.println("\n================================");
  Serial.println("📊 Test Complete!");
  Serial.println("================================");
  Serial.println("If all steps passed, your ESP-01 is ready.");
  Serial.println("Next: configure MQTT or WebSocket for DEJA.js 🚂");
}

void loop() {
  // 🔄 Pass-through mode: type AT commands in Serial Monitor
  if (Serial.available()) {
    espSerial.write(Serial.read());
  }
  if (espSerial.available()) {
    Serial.write(espSerial.read());
  }
}
