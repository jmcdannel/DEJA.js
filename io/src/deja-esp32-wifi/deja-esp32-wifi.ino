// 🛜 deja-esp32-wifi — ESP32 firmware for DEJA.js IO devices over WiFi + MQTT
//
// Mirrors the deja-arduino handler set (pin, servo, turnout, ialed) but swaps
// USB-serial transport for MQTT. Topic scheme matches deja-pico-w so the
// DEJA.js server's existing MQTT layer routes to it unchanged:
//
//   subscribe: {TOPIC_ID}/{LAYOUT_ID}/{DEVICE_ID}
//   publish:   {TOPIC_ID}/{LAYOUT_ID}/{DEVICE_ID}/messages
//
// Incoming message shape (single JSON object, matches Pico W):
//   { "action": "pin", "payload": { "pin": 8, "state": 1 }, "device": "deja-esp32" }

#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <ArduinoJson.h>

#if __has_include("config.h")
#include "config.h"
#else
#warning config.h not found. Using defaults from config.default.h
#include "config.default.h"
#endif

#if ENABLE_PWM
#include <Adafruit_PWMServoDriver.h>
Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(PCA9685_ADDRESS);
#endif

WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

JsonDocument doc;

char subTopic[128];
char pubTopic[128];

void connectWifi() {
  Serial.print("[wifi] connecting to ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("[wifi] connected, ip=");
  Serial.println(WiFi.localIP());
}

void connectMqtt() {
  while (!mqtt.connected()) {
    Serial.print("[mqtt] connecting to ");
    Serial.print(MQTT_BROKER);
    Serial.print(":");
    Serial.println(MQTT_PORT);

    bool ok;
    if (strlen(MQTT_USERNAME) > 0) {
      ok = mqtt.connect(DEVICE_ID, MQTT_USERNAME, MQTT_PASSWORD);
    } else {
      ok = mqtt.connect(DEVICE_ID);
    }

    if (ok) {
      Serial.println("[mqtt] connected");
      mqtt.subscribe(subTopic);
      Serial.print("[mqtt] subscribed to ");
      Serial.println(subTopic);
      mqtt.publish(pubTopic, "{\"status\":\"connected\",\"device\":\"" DEVICE_ID "\"}");
    } else {
      Serial.print("[mqtt] failed, rc=");
      Serial.print(mqtt.state());
      Serial.println(" — retrying in 2s");
      delay(2000);
    }
  }
}

void handlePin(JsonObject payload) {
  int pin = payload["pin"];
  bool state = payload["state"];
  digitalWrite(pin, state);
  Serial.print("[pin] ");
  Serial.print(pin);
  Serial.print("=");
  Serial.println(state);
}

void handleServo(JsonObject payload) {
#if ENABLE_PWM
  int angle = payload["value"];
  int servo = payload["servo"];
  int current = payload["current"];
  int pulseTarget = getPulseWidth(angle);
  int pulseOrigin = getPulseWidth(current);
  Serial.print("[servo] angle=");
  Serial.print(angle);
  Serial.print(" servo=");
  Serial.print(servo);
  Serial.print(" current=");
  Serial.print(current);
  Serial.print(" pulseTarget=");
  Serial.print(pulseTarget);
  Serial.print(" pulseOrigin=");
  Serial.println(pulseOrigin);
  if (pulseTarget < pulseOrigin) {
    Serial.println("[servo] moving down");
    for (uint16_t p = pulseOrigin; p > pulseTarget; p--) {
      pwm.setPWM(servo, 0, p);
    }
  } else {
    Serial.println("[servo] moving up");
    for (uint16_t p = pulseOrigin; p < pulseTarget; p++) {
      pwm.setPWM(servo, 0, p);
    }
  }
  Serial.println("[servo] done");
#endif
}

void handleTurnout(JsonObject payload) {
#if ENABLE_TURNOUTS
  int turnoutIdx = payload["turnout"];
  bool state = payload["state"];
  turnouts[turnoutIdx].set(state);
#endif
}

void handleLED(JsonObject payload) {
  // 🎨 Placeholder — wire up FastLED / NeoPixel here if needed
}

void handleAction(const char* action, JsonObject payload) {
  Serial.print("[action] ");
  Serial.println(action);
  if (strcmp(action, "pin") == 0) {
    handlePin(payload);
  } else if (strcmp(action, "servo") == 0) {
    handleServo(payload);
  } else if (strcmp(action, "turnout") == 0 || strcmp(action, "turnouts") == 0) {
    handleTurnout(payload);
  } else if (strcmp(action, "ialed") == 0 || strcmp(action, "effects") == 0) {
    handleLED(payload);
  }
}

void onMqttMessage(char* topic, byte* message, unsigned int length) {
  Serial.print("[rx] ");
  Serial.print(topic);
  Serial.print(" len=");
  Serial.println(length);

  DeserializationError err = deserializeJson(doc, message, length);
  if (err) {
    Serial.print("[rx] JSON parse error: ");
    Serial.println(err.c_str());
    return;
  }

  // 🔒 Accept either a single object (Pico W style) or an array (deja-arduino style)
  if (doc.is<JsonArray>()) {
    for (JsonVariant v : doc.as<JsonArray>()) {
      const char* action = v["action"];
      JsonObject payload = v["payload"];
      if (action) handleAction(action, payload);
    }
  } else {
    const char* device = doc["device"];
    if (device && strcmp(device, DEVICE_ID) != 0) {
      return;  // 🚫 not for us
    }
    const char* action = doc["action"];
    JsonObject payload = doc["payload"];
    if (action) handleAction(action, payload);
  }
}

int getPulseWidth(int angle) {
  int pulse_wide = map(angle, 0, 180, MIN_PULSE_WIDTH, MAX_PULSE_WIDTH);
  return int(float(pulse_wide) / 1000000 * SERVO_FREQ * 4096);
}

void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.println();
  Serial.print("[boot] ");
  Serial.println(DEVICE_ID);

  Wire.begin();  // Initialize I2C

  snprintf(subTopic, sizeof(subTopic), "%s/%s/%s", TOPIC_ID, LAYOUT_ID, DEVICE_ID);
  snprintf(pubTopic, sizeof(pubTopic), "%s/%s/%s/messages", TOPIC_ID, LAYOUT_ID, DEVICE_ID);

#if ENABLE_OUTPUTS
  for (unsigned int i = 0; i < sizeof(OUTPINS) / sizeof(OUTPINS[0]); i++) {
    pinMode(OUTPINS[i], OUTPUT);
  }
#endif

#if ENABLE_SIGNALS
  for (unsigned int i = 0; i < sizeof(SIGNALPINS) / sizeof(SIGNALPINS[0]); i++) {
    pinMode(SIGNALPINS[i], OUTPUT);
    digitalWrite(SIGNALPINS[i], HIGH);
  }
#endif

#if ENABLE_SENSORS
  for (unsigned int i = 0; i < sizeof(SENSORPINS) / sizeof(SENSORPINS[0]); i++) {
    pinMode(SENSORPINS[i], INPUT);
  }
#endif

#if ENABLE_TURNOUTS
  for (unsigned int i = 0; i < sizeof(turnouts) / sizeof(turnouts[0]); i++) {
    turnouts[i].begin();
  }
#endif

#if ENABLE_PWM
  pwm.begin();
  pwm.setOscillatorFrequency(27000000);
  pwm.setPWMFreq(SERVO_FREQ);
  // Check if PWM device is responding
  Wire.beginTransmission(PCA9685_ADDRESS);
  uint8_t error = Wire.endTransmission();
  if (error == 0) {
    Serial.println("[pwm] initialized successfully");
  } else {
    Serial.println("[pwm] initialization failed, I2C error: " + String(error));
  }
#endif

  connectWifi();
  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
  mqtt.setBufferSize(512);
  mqtt.setCallback(onMqttMessage);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWifi();
  }
  if (!mqtt.connected()) {
    connectMqtt();
  }
  mqtt.loop();

#if ENABLE_TURNOUTS
  for (unsigned int i = 0; i < sizeof(turnouts) / sizeof(turnouts[0]); i++) {
    turnouts[i].loop();
  }
#endif

#if ENABLE_SENSORS
  static int lastSensorValues[sizeof(SENSORPINS) / sizeof(SENSORPINS[0])] = {HIGH};
  static unsigned long lastChangeTime[sizeof(SENSORPINS) / sizeof(SENSORPINS[0])] = {0};
  unsigned long now = millis();
  for (unsigned int i = 0; i < sizeof(SENSORPINS) / sizeof(SENSORPINS[0]); i++) {
    int value = digitalRead(SENSORPINS[i]);
    if (value != lastSensorValues[i] && (now - lastChangeTime[i] >= 500)) {
      char msg[96];
      snprintf(msg, sizeof(msg),
               "{\"device\":\"%s\",\"sensor\":%u,\"state\":%d}",
               DEVICE_ID, i, value);
      mqtt.publish(pubTopic, msg);
      lastSensorValues[i] = value;
      lastChangeTime[i] = now;
    }
  }
#endif
}
