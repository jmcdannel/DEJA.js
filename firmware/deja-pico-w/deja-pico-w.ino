#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Servo.h>

// --- Configuration ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "YOUR_DEJA_SERVER_IP";
const int mqtt_port = 1883;

// Topic should match what DEJA Server automatically generated
// Example: DEJA/betatrack/device_pico_1
const String deviceId = "device_pico_1";
const String layoutId = "betatrack";
String pubTopic = "DEJA/" + layoutId + "/" + deviceId;
String subTopic = pubTopic; 

// --- Pin Management ---
#define MAX_PINS 30
#define MAX_SERVOS 12

struct PinConfig {
  int pin;
  String type; // "unused", "input", "input_pullup", "output", "servo", "pwm"
  int value;
};

PinConfig pinStates[MAX_PINS];
Servo servos[MAX_SERVOS];
int activeServos = 0;

WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastReconnectAttempt = 0;

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  // Convert payload to String
  payload[length] = '\0';
  String message = String((char*)payload);
  
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.println("] " + message);

  // Parse JSON command array or single object
  StaticJsonDocument<1024> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (error) {
    Serial.print("JSON Parse failed: ");
    Serial.println(error.c_str());
    return;
  }

  // Handle potentially nested arrays `[{"command":"..."}]` vs `{"command":"..."}`
  if (doc.is<JsonArray>()) {
    JsonArray array = doc.as<JsonArray>();
    for (JsonObject obj : array) {
      processCommand(obj);
    }
  } else {
    JsonObject obj = doc.as<JsonObject>();
    processCommand(obj);
  }
}

void processCommand(JsonObject obj) {
  String command = obj["command"].as<String>();
  
  if (command == "setConfig") {
    JsonObject config = obj["config"].as<JsonObject>();
    applyConfiguration(config);
  } 
  else if (command == "setState") {
    int pin = obj["pin"].as<int>();
    int value = obj["value"].as<int>();
    setPinState(pin, value);
  }
}

boolean reconnect() {
  if (client.connect(deviceId.c_str())) {
    Serial.println("MQTT Connected");
    // Publish a setup message to trigger a sync
    String statusPayload = "{\"status\":\"ready\",\"type\":\"deja-arduino\",\"deviceId\":\"" + deviceId + "\"}";
    client.publish(pubTopic.c_str(), statusPayload.c_str());
    
    // Subscribe to commands matching our topic
    client.subscribe(subTopic.c_str());
  }
  return client.connected();
}

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  for (int i = 0; i < MAX_PINS; i++) {
    pinStates[i].pin = i;
    pinStates[i].type = "unused";
    pinStates[i].value = 0;
  }

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    long now = millis();
    if (now - lastReconnectAttempt > 5000) {
      lastReconnectAttempt = now;
      if (reconnect()) {
        lastReconnectAttempt = 0;
      }
    }
  } else {
    client.loop();
  }

  // Continuously poll input pins to blast changes to MQTT
  pollInputs();
}

void applyConfiguration(JsonObject config) {
  // Detach all existing servos before reconfiguring
  for (int i = 0; i < activeServos; i++) {
    if (servos[i].attached()) {
      servos[i].detach();
    }
  }
  activeServos = 0;

  for (JsonPair kv : config) {
    int pin = atoi(kv.key().c_str());
    if (pin < 0 || pin >= MAX_PINS) continue;

    String mode = kv.value().as<String>();
    pinStates[pin].type = mode;

    if (mode == "input") {
      pinMode(pin, INPUT);
    } 
    else if (mode == "input_pullup") {
      pinMode(pin, INPUT_PULLUP);
    } 
    else if (mode == "output" || mode == "pwm") {
      pinMode(pin, OUTPUT);
    } 
    else if (mode == "servo") {
      if (activeServos < MAX_SERVOS) {
        servos[activeServos].attach(pin);
        activeServos++;
      } else {
        Serial.println("Max servos reached");
      }
    }
  }
  
  // Acknowledge configuration application
  client.publish(pubTopic.c_str(), "{\"status\":\"config_applied\"}");
}

void setPinState(int pin, int value) {
  if (pin < 0 || pin >= MAX_PINS) return;

  String type = pinStates[pin].type;
  pinStates[pin].value = value;

  if (type == "output") {
    digitalWrite(pin, value > 0 ? HIGH : LOW);
    sendAcknowledge(pin, value);
  } 
  else if (type == "pwm") {
    analogWrite(pin, value);
    sendAcknowledge(pin, value);
  } 
  else if (type == "servo") {
    for (int i = 0; i < MAX_SERVOS; i++) {
      if (servos[i].attached() && servos[i].attachedPin() == pin) {
        servos[i].write(value);
        sendAcknowledge(pin, value);
        break;
      }
    }
  }
}

void pollInputs() {
  for (int i = 0; i < MAX_PINS; i++) {
    if (pinStates[i].type == "input" || pinStates[i].type == "input_pullup") {
      
      int reading = digitalRead(pinStates[i].pin);
      
      if (reading != pinStates[i].value) {
        pinStates[i].value = reading;
        
        // Report state change over MQTT
        String evt = "{\"event\":\"pin_change\",\"pin\":";
        evt += String(pinStates[i].pin);
        evt += ",\"value\":";
        evt += String(reading);
        evt += "}";
        
        client.publish(pubTopic.c_str(), evt.c_str());
      }
    }
  }
}

void sendAcknowledge(int pin, int value) {
  String act = "{\"status\":\"state_set\",\"pin\":";
  act += String(pin);
  act += ",\"value\":";
  act += String(value);
  act += "}";
  client.publish(pubTopic.c_str(), act.c_str());
}
