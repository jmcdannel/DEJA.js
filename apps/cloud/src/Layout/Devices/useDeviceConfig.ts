// 🔧 Device config composable for cloud app
// Wraps shared generators from @repo/modules in Vue computed() refs + triggers ZIP download

import { computed, type Ref, type ComputedRef } from 'vue'
import type { Device, Effect, Turnout } from '@repo/modules'
import {
  generateArduinoConfig,
  generatePicoSettings,
  generatePicoConfig,
} from '@repo/modules'

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

  // 🔧 Arduino config.h
  const arduinoConfigH = computed(() => {
    if (!device.value) return ''
    return generateArduinoConfig({
      device: device.value,
      effects: effects.value,
      turnouts: turnouts.value,
    })
  })

  // 🍓 Pico W settings.toml (WiFi creds left empty — filled at download time)
  const picoSettingsToml = computed(() => {
    if (!device.value) return ''
    return generatePicoSettings({
      device: device.value,
      effects: effects.value,
      turnouts: turnouts.value,
      layoutId: '',
    })
  })

  // 🍓 Pico W config.json (pin → GP mapping from effects)
  const picoConfigJson = computed(() => {
    if (!device.value) return ''
    return generatePicoConfig({
      device: device.value,
      effects: effects.value,
      turnouts: turnouts.value,
      layoutId: '',
    })
  })

  /**
   * 📦 Download a ready-to-deploy ZIP for this device
   */
  async function downloadPackage(wifiSsid?: string, wifiPassword?: string, mqttBroker?: string, layoutId?: string) {
    if (!device.value) return

    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    const folder = zip.folder(device.value.id)!

    if (isArduino.value) {
      folder.file('config.h', arduinoConfigH.value)
    } else if (isPicoW.value) {
      // Generate settings.toml with user-provided WiFi creds
      const settings = generatePicoSettings({
        device: device.value,
        effects: effects.value,
        turnouts: turnouts.value,
        layoutId: layoutId ?? '',
        wifiSsid,
        wifiPassword,
        mqttBroker,
      })
      folder.file('settings.toml', settings)
      folder.file('config.json', picoConfigJson.value)
    }

    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${device.value.id}-firmware.zip`
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
