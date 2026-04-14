#ifndef DEJA_ESP32_CONFIG_H
#define DEJA_ESP32_CONFIG_H

// 📶 WiFi credentials (baked in at build time)
#define WIFI_SSID "your-ssid"
#define WIFI_PASSWORD "your-password"

// 📬 MQTT broker
#define MQTT_BROKER "192.168.1.100"
#define MQTT_PORT 1883
#define MQTT_USERNAME ""  // leave empty if broker is anonymous
#define MQTT_PASSWORD ""

// 🏷️ Device identity (must match the device registered in the Cloud app)
#define DEVICE_ID "deja-esp32"
#define LAYOUT_ID "my-layout"
#define TOPIC_ID "DEJA"

// 🎛️ Feature flags
#define ENABLE_PWM false
#define ENABLE_OUTPUTS false
#define ENABLE_SIGNALS false
#define ENABLE_SENSORS false
#define ENABLE_TURNOUTS false

// 🎛️ Servo tuning (PCA9685 via I2C — ESP32 default SDA=21, SCL=22)
#define SERVOMIN 150
#define SERVOMAX 600
#define MIN_PULSE_WIDTH 650
#define MAX_PULSE_WIDTH 2350
#define USMIN 600
#define USMAX 2400
#define SERVO_FREQ 50
#define SERVO_COUNT 16

// 📍 Pin arrays (filled in per-device by the cloud config generator)
int OUTPINS[] = {};
int SIGNALPINS[] = {};
int SENSORPINS[] = {};

#if ENABLE_TURNOUTS
#include <TurnoutPulser.h>
TurnoutPulser turnouts[] = {};
#endif

#endif
