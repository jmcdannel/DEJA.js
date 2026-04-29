#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
#include <ArduinoJson.h>

#if __has_include("config.h")
#include "config.h"
#else
#warning config.h not found. Using defaults from config.default.h
#include "config.default.h"
#endif

#if ENABLE_PWM
// 🎛️ Optional non-default PCA9685 I²C address (defaults to 0x40 in config.h).
Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(PCA9685_ADDRESS);
#endif

StaticJsonDocument<256> doc;

#if ENABLE_SENSORS
static int lastSensorValues[sizeof(SENSORPINS) / sizeof(SENSORPINS[0])] = {HIGH};      // Store last states, initialized to HIGH
static unsigned long lastChangeTime[sizeof(SENSORPINS) / sizeof(SENSORPINS[0])] = {0}; // Array to store last change times
#endif

void setup()
{
  Serial.begin(BAUD_RATE);

  // 🧭 Custom PCA9685 I²C pins — only honored on boards that support the
  // Wire.begin(sda, scl) 2-arg signature (ESP32, RP2040). Classic AVR boards
  // (Uno, Mega) stay on their hardwired default pins even if the generator
  // emits PCA9685_SDA_PIN / PCA9685_SCL_PIN.
#if defined(PCA9685_SDA_PIN) && defined(PCA9685_SCL_PIN) && (defined(ESP32) || defined(ARDUINO_ARCH_RP2040))
  Wire.begin(PCA9685_SDA_PIN, PCA9685_SCL_PIN);
#endif

  Serial.println(DEVICE_ID);

#if ENABLE_OUTPUTS
  for (int idx = 0; idx < (sizeof(OUTPINS) / sizeof(OUTPINS[0])); idx++)
  {
    pinMode(OUTPINS[idx], OUTPUT);
  }
#endif

#if ENABLE_SIGNALS
  for (int idx = 0; idx < (sizeof(SIGNALPINS) / sizeof(SIGNALPINS[0])); idx++)
  {
    pinMode(SIGNALPINS[idx], OUTPUT);
    digitalWrite(SIGNALPINS[idx], HIGH);
  }
#endif

#if ENABLE_SENSORS
  for (int idx = 0; idx < (sizeof(SENSORPINS) / sizeof(SENSORPINS[0])); idx++)
  {
    pinMode(SENSORPINS[idx], INPUT);
  }
#endif

#if ENABLE_TURNOUTS
  for (int idx = 0; idx < (sizeof(turnouts) / sizeof(turnouts[0])); idx++)
  {
    turnouts[idx].begin();
  }
#endif

#if ENABLE_PWM
  pwm.begin();
  pwm.setOscillatorFrequency(PWM_OSCILLATOR_FREQ);
  pwm.setPWMFreq(SERVO_FREQ);
  //  pwm.setPWMFreq(1200);  // This is the maximum PWM frequency
#endif
}

void loop()
{

#if ENABLE_TURNOUTS
  for (int idx = 0; idx < (sizeof(turnouts) / sizeof(turnouts[0])); idx++)
  {
    turnouts[idx].loop();
  }
#endif

  if (Serial.available() > 0)
  {
    Serial.print("[rx] available=");
    Serial.println(Serial.available());
    handleInput();
  }

#if ENABLE_SENSORS
  unsigned long currentTime = millis();

  for (int i = 0; i < (sizeof(SENSORPINS) / sizeof(SENSORPINS[0])); i++)
  {
    int sensorValue = digitalRead(SENSORPINS[i]); // Read current sensor value
    if (sensorValue != lastSensorValues[i] && (currentTime - lastChangeTime[i] >= SENSOR_DEBOUNCE_MS))
    {
      Serial.print("{ \"sensor\": ");
      Serial.print(i);
      Serial.print(", \"state\": ");
      Serial.print(sensorValue);
      Serial.println(" }");
      lastSensorValues[i] = sensorValue; // Update last known state
      lastChangeTime[i] = currentTime;   // Update last change time
    }
  }
#endif
}

void handleInput()
{
  char input[256];
  int len = Serial.readBytes(input, sizeof(input) - 1);
  input[len] = '\0';
  Serial.print("[rx] len=");
  Serial.print(len);
  Serial.print(" raw=");
  Serial.println(input);

  DeserializationError err = deserializeJson(doc, input);
  if (err)
  {
    Serial.print("[rx] JSON parse error: ");
    Serial.println(err.c_str());
    return;
  }

  JsonArray array = doc.as<JsonArray>();
  Serial.print("[rx] array size=");
  Serial.println(array.size());
  for (JsonVariant v : array)
  {
    handleAction(v);
  }
}

void handleAction(JsonVariant v)
{
  String action = v["action"];
  JsonObject payload = v["payload"];

  Serial.print("Action: ");
  Serial.println(action);

  if (action == "pin")
  {
    handlePin(payload);
  }
  else if (action == "servo")
  {
    handleServo(payload);
  }
  else if (action == "turnout")
  {
    handleTurnout(payload);
  }
  else if (action == "ialed")
  {
    handleLED(payload);
  }
}

void handleTurnout(JsonObject payload)
{
  int turnoutIdx = payload["turnout"];
  bool state = payload["state"];
  turnouts[turnoutIdx].set(state);
  Serial.print("turnoutIdx: ");
  Serial.println(turnoutIdx);
  Serial.print("state: ");
  Serial.println(state);
}

void handlePin(JsonObject payload)
{
  int pin = payload["pin"];
  bool state = payload["state"];
  Serial.print("pin: ");
  Serial.println(pin);
  Serial.print("state: ");
  Serial.println(state);
  digitalWrite(pin, state);
}

void handleServo(JsonObject payload)
{
  int angle = payload["value"];
  int servo = payload["servo"];
  int current = payload["current"];
  int pulseTarget = getPulseWidth(angle);
  int pulseOrigin = getPulseWidth(current);
  if (pulseTarget < pulseOrigin)
  {
    for (uint16_t pulselen = pulseOrigin; pulselen > pulseTarget; pulselen--)
    {
#if ENABLE_PWM
      pwm.setPWM(servo, 0, pulselen);
#endif
    }
  }
  else
  {
    for (uint16_t pulselen = pulseOrigin; pulselen < pulseTarget; pulselen++)
    {
#if ENABLE_PWM
      pwm.setPWM(servo, 0, pulselen);
#endif
    }
  }
}

void handleLED(JsonObject payload)
{
  int strip = payload["strip"];
  int pattern = payload["pattern"];
  int r = payload["r"];
  int g = payload["g"];
  int b = payload["b"];

  // SoftSerial.print(strip);
  // SoftSerial.print(", ");
  // SoftSerial.print(pattern);
  // SoftSerial.print(", ");
  // SoftSerial.print(r);
  // SoftSerial.print(", ");
  // SoftSerial.print(g);
  // SoftSerial.print(", ");
  // SoftSerial.println(b);

  // Serial.print(strip);
  // Serial.print(", ");
  // Serial.print(pattern);
  // Serial.print(", ");
  // Serial.print(r);
  // Serial.print(", ");
  // Serial.print(g);
  // Serial.print(", ");
  // Serial.println(b);
}

int getPulseWidth(int angle)
{
  int pulse_wide, analog_value;
  pulse_wide = map(angle, 0, 180, MIN_PULSE_WIDTH, MAX_PULSE_WIDTH);
  analog_value = int(float(pulse_wide) / 1000000 * SERVO_FREQ * 4096);
  Serial.println(analog_value);
  return analog_value;
}
