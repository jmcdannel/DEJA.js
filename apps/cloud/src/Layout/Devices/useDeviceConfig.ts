// 🔧 Device config composable for cloud app
// Generates config strings from Vuefire-loaded data + triggers ZIP download

import { computed, type Ref, type ComputedRef } from 'vue'
import type { Device, Effect, Turnout } from '@repo/modules'

interface UseDeviceConfigOptions {
  device: Ref<Device | null>
  effects: Ref<Effect[]> | ComputedRef<Effect[]>
  turnouts: Ref<Turnout[]> | ComputedRef<Turnout[]>
}

export function useDeviceConfig({ device, effects, turnouts }: UseDeviceConfigOptions) {
  const isArduino = computed(() =>
    ['dcc-ex', 'deja-arduino', 'deja-arduino-led'].includes(device.value?.type || '')
  )

  const isPicoW = computed(() => device.value?.type === 'deja-mqtt')

  // 🔧 Arduino config.h — fixes bugs in previous inline template:
  // ✅ Inserts turnoutPulsers into TurnoutPulser turnouts[]
  // ✅ Generates SENSORPINS[] from device sensor data (not hardcoded)
  // ✅ Includes OUTPINS[] from effects with pins
  // ✅ Sets ENABLE_* flags dynamically
  const arduinoConfigH = computed(() => {
    if (!device.value) return ''

    const outPins = effects.value
      .filter(e => e.pin !== undefined && e.pin !== null)
      .map(e => e.pin!)

    const turnoutPulsers = turnouts.value
      .filter(t => t.straight !== undefined && t.divergent !== undefined)
      .map(t => `TurnoutPulser(${t.straight}, ${t.divergent})`)

    const hasOutputs = outPins.length > 0
    const hasTurnouts = turnoutPulsers.length > 0

    return `#include <TurnoutPulser.h>

#define DEVICE_ID "${device.value.id}"
#define ENABLE_PWM false
#define ENABLE_OUTPUTS ${hasOutputs}
#define ENABLE_SIGNALS false
#define ENABLE_TURNOUTS ${hasTurnouts}
#define ENABLE_SENSORS false

#define SERVOMIN 150
#define SERVOMAX 600
#define MIN_PULSE_WIDTH 650
#define MAX_PULSE_WIDTH 2350
#define USMIN 600
#define USMAX 2400
#define SERVO_FREQ 50
#define SERVO_COUNT 16

int OUTPINS[] = {${outPins.length > 0 ? ` ${  outPins.join(', ')  } ` : ''}};
int SIGNALPINS[] = {};
int SENSORPINS[] = {};

TurnoutPulser turnouts[] = {${turnoutPulsers.length > 0 ? ` ${  turnoutPulsers.join(', ')  } ` : ''}};`
  })

  // 🍓 Pico W settings.toml
  const picoSettingsToml = computed(() => {
    if (!device.value) return ''

    return `# 🍓 DEJA.js Pico W Configuration
# Generated for device: ${device.value.id}

CIRCUITPY_WIFI_SSID = ""
CIRCUITPY_WIFI_PASSWORD = ""

ENABLE_CONFIG = "true"
ENABLE_PWM = "false"
ENABLE_MQTT = "true"

MQTT_BROKER = ""
LAYOUT_ID = ""
DEVICE_ID = "${device.value.id}"
TOPIC_ID = "${device.value.topic || 'deja'}"`
  })

  // 🍓 Pico W config.json (pin → GP mapping from effects)
  const picoConfigJson = computed(() => {
    const pins: Record<string, string> = {}
    for (const effect of effects.value) {
      if (effect.pin !== undefined && effect.pin !== null) {
        pins[String(effect.pin)] = `GP${effect.pin}`
      }
    }
    return JSON.stringify({ pins }, null, 2)
  })

  /**
   * 📦 Download a ready-to-deploy ZIP for this device
   */
  async function downloadPackage(wifiSsid?: string, wifiPassword?: string, mqttBroker?: string, layoutId?: string) {
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    const folder = zip.folder(device.value?.id || 'device')!

    if (isArduino.value) {
      folder.file('config.h', arduinoConfigH.value)
    } else if (isPicoW.value) {
      // Generate settings.toml with user-provided WiFi creds
      const settings = `# 🍓 DEJA.js Pico W Configuration
# Generated for device: ${device.value?.id}

CIRCUITPY_WIFI_SSID = "${wifiSsid || ''}"
CIRCUITPY_WIFI_PASSWORD = "${wifiPassword || ''}"

ENABLE_CONFIG = "true"
ENABLE_PWM = "false"
ENABLE_MQTT = "true"

MQTT_BROKER = "${mqttBroker || ''}"
LAYOUT_ID = "${layoutId || ''}"
DEVICE_ID = "${device.value?.id}"
TOPIC_ID = "${device.value?.topic || 'deja'}"`

      folder.file('settings.toml', settings)
      folder.file('config.json', picoConfigJson.value)
    }

    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${device.value?.id || 'device'}-firmware.zip`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    isArduino,
    isPicoW,
    arduinoConfigH,
    picoSettingsToml,
    picoConfigJson,
    downloadPackage,
  }
}
