#include <ArduinoJson.h>
#include <Servo.h>

// Define maximum pins and servos to track
#define MAX_PINS 20
#define MAX_SERVOS 12

// Setup Serial baud rate, ensure it matches DEJA.js server
#define BAUD_RATE 115200

// Internal state tracking for Pin Configurations
struct PinConfig {
  int pin;
  String type; // "unused", "input", "input_pullup", "output", "servo", "pwm"
  int value;   // Store the last written value (for output/pwm)
};

PinConfig pinStates[MAX_PINS];
Servo servos[MAX_SERVOS];
int activeServos = 0;

void setup() {
  Serial.begin(BAUD_RATE);
  
  // Initialize all pins to an explicit 'unused' state
  for (int i = 0; i < MAX_PINS; i++) {
    pinStates[i].pin = i;
    pinStates[i].type = "unused";
    pinStates[i].value = 0;
  }
  
  // Send a startup heartbeat so DEJA.js knows the device is ready
  Serial.println("{\"status\":\"ready\",\"type\":\"deja-arduino\"}");
}

void loop() {
  // 1. Process incoming JSON Configuration from DEJA.js via Serial
  if (Serial.available()) {
    String payload = Serial.readStringUntil('\n');
    
    // Allocate JSON document buffer based on expected config size
    // Adjust size (1024) if Layout config objects are extremely complex
    StaticJsonDocument<1024> doc;
    DeserializationError error = deserializeJson(doc, payload);

    if (!error) {
      String command = doc["command"].as<String>();
      
      if (command == "setConfig") {
        JsonObject config = doc["config"].as<JsonObject>();
        applyConfiguration(config);
      } 
      else if (command == "setState") {
        // Handle explicit real-time control commands (e.g. throw turnout)
        int pin = doc["pin"].as<int>();
        int value = doc["value"].as<int>();
        setPinState(pin, value);
      }
    } else {
      // Send error back to Node.js
      Serial.print("{\"error\":\"json_parse\",\"message\":\"");
      Serial.print(error.c_str());
      Serial.println("\"}");
    }
  }

  // 2. Poll Input Pins continuously and report state changes to DEJA.js
  pollInputs();
}

/**
 * Applies the JSON Configuration to the Hardware Pins
 * Example Config: {"2": "input_pullup", "4": "servo", "13": "output"}
 */
void applyConfiguration(JsonObject config) {
  // Detach all existing servos before reconfiguring
  for (int i = 0; i < MAX_SERVOS; i++) {
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
        Serial.println("{\"error\":\"max_servos_reached\",\"pin\":" + String(pin) + "}");
      }
    }
  }
  
  // Acknowledge configuration application
  Serial.println("{\"status\":\"config_applied\"}");
}

/**
 * Executes direct state changes requested by DEJA.js
 * (e.g., throwing a turnout or turning on an LED)
 */
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
        servos[i].write(value); // value typically 0-180 (degrees)
        sendAcknowledge(pin, value);
        break;
      }
    }
  }
}

/**
 * Continuously polls inputs and notifies DEJA.js only when state changes
 */
void pollInputs() {
  for (int i = 0; i < MAX_PINS; i++) {
    if (pinStates[i].type == "input" || pinStates[i].type == "input_pullup") {
      
      int reading = digitalRead(pinStates[i].pin);
      
      // Simple logic to detect state change (might need debouncing logic in production)
      if (reading != pinStates[i].value) {
        pinStates[i].value = reading;
        
        // Report state change to Node.js server
        Serial.print("{\"event\":\"pin_change\",\"pin\":");
        Serial.print(pinStates[i].pin);
        Serial.print(",\"value\":");
        Serial.print(reading);
        Serial.println("}");
      }
    }
  }
}

void sendAcknowledge(int pin, int value) {
  Serial.print("{\"status\":\"state_set\",\"pin\":");
  Serial.print(pin);
  Serial.print(",\"value\":");
  Serial.print(value);
  Serial.println("}");
}
