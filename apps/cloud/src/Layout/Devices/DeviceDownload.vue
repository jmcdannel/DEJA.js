<script setup lang="ts">
import { ref, computed } from 'vue'
import { isWifiDeviceType, type Device, type Effect, type Turnout } from '@repo/modules'
import { useDeviceConfig } from './useDeviceConfig'

const props = defineProps<{
  device: Device | null
  effects: (Effect | Record<string, unknown>)[]
  turnouts: (Turnout | Record<string, unknown>)[]
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const deviceRef = computed(() => props.device)
const effectsRef = computed(() => props.effects as Effect[])
const turnoutsRef = computed(() => props.turnouts as Turnout[])

const { isArduino, isPicoW, isEsp32Wifi, arduinoConfigH, picoSettingsToml, picoConfigJson, esp32WifiConfigH, downloadPackage } =
  useDeviceConfig({
    device: deviceRef,
    effects: effectsRef,
    turnouts: turnoutsRef,
  })

// 📡 Both Pico W and ESP32 WiFi need WiFi credentials + an MQTT broker.
const isWifi = computed(() => isWifiDeviceType(props.device?.type))

// 🗂 Default tab depends on device type — esp32-wifi uses its own tab key
const configTab = ref(isEsp32Wifi.value ? 'esp32wifi' : 'config')
const wifiSsid = ref('')
const wifiPassword = ref('')
const mqttBroker = ref('')
const layoutId = ref('')
const showPassword = ref(false)
const downloaded = ref(false)

const dialog = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

async function handleDownload() {
  await downloadPackage(wifiSsid.value, wifiPassword.value, mqttBroker.value, layoutId.value)
  downloaded.value = true
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

function handleClose() {
  dialog.value = false
  downloaded.value = false
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="800" scrollable>
    <v-card color="grey-darken-4">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon :icon="isWifi ? 'mdi-wifi' : 'mdi-usb'" class="mr-2" color="green" />
        Deploy Code — {{ device?.id }}
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="handleClose" />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <!-- 📡 WiFi / MQTT Credentials (Pico W + ESP32 WiFi) -->
        <div v-if="isWifi" class="mb-6">
          <h4 class="text-body-1 font-weight-bold mb-3 text-blue-lighten-2">
            <v-icon icon="mdi-wifi-cog" class="mr-1" size="small" /> WiFi & MQTT Settings
          </h4>
          <p class="text-caption text-grey mb-3">
            WiFi credentials are stored locally on the device only — never saved to Firebase.
          </p>
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="wifiSsid"
                label="WiFi SSID"
                density="compact"
                variant="outlined"
                prepend-inner-icon="mdi-wifi"
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="wifiPassword"
                label="WiFi Password"
                density="compact"
                variant="outlined"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="mqttBroker"
                label="MQTT Broker IP"
                density="compact"
                variant="outlined"
                prepend-inner-icon="mdi-server-network"
                placeholder="192.168.1.x"
                hint="IP of the machine running DEJA.js server"
                persistent-hint
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="layoutId"
                label="Layout ID"
                density="compact"
                variant="outlined"
                prepend-inner-icon="mdi-map-marker"
                hide-details
              />
            </v-col>
          </v-row>
        </div>

        <!-- 📝 Config Preview Tabs -->
        <v-tabs v-model="configTab" density="compact" color="green" class="mb-3">
          <v-tab v-if="isArduino && !isEsp32Wifi" value="config">config.h</v-tab>
          <v-tab v-if="isEsp32Wifi" value="esp32wifi">config.h</v-tab>
          <v-tab v-if="isPicoW" value="settings">settings.toml</v-tab>
          <v-tab v-if="isPicoW" value="pins">config.json</v-tab>
        </v-tabs>

        <v-tabs-window v-model="configTab">
          <!-- Arduino config.h -->
          <v-tabs-window-item v-if="isArduino && !isEsp32Wifi" value="config">
            <div class="relative">
              <v-btn
                icon="mdi-content-copy"
                size="x-small"
                variant="text"
                class="position-absolute"
                style="top: 8px; right: 8px; z-index: 1;"
                @click="copyToClipboard(arduinoConfigH)"
              />
              <pre class="overflow-x-auto text-caption font-mono pa-3 bg-black/40 rounded-md ring-1 ring-white/10 text-grey-lighten-1" style="max-height: 400px;">{{ arduinoConfigH }}</pre>
            </div>
          </v-tabs-window-item>

          <!-- 🛜 ESP32 WiFi config.h -->
          <v-tabs-window-item v-if="isEsp32Wifi" value="esp32wifi">
            <div class="relative">
              <v-btn
                icon="mdi-content-copy"
                size="x-small"
                variant="text"
                class="position-absolute"
                style="top: 8px; right: 8px; z-index: 1;"
                @click="copyToClipboard(esp32WifiConfigH)"
              />
              <pre class="overflow-x-auto text-caption font-mono pa-3 bg-black/40 rounded-md ring-1 ring-white/10 text-grey-lighten-1" style="max-height: 400px;">{{ esp32WifiConfigH }}</pre>
            </div>
          </v-tabs-window-item>

          <!-- Pico W settings.toml -->
          <v-tabs-window-item v-if="isPicoW" value="settings">
            <div class="relative">
              <v-btn
                icon="mdi-content-copy"
                size="x-small"
                variant="text"
                class="position-absolute"
                style="top: 8px; right: 8px; z-index: 1;"
                @click="copyToClipboard(picoSettingsToml)"
              />
              <pre class="overflow-x-auto text-caption font-mono pa-3 bg-black/40 rounded-md ring-1 ring-white/10 text-grey-lighten-1" style="max-height: 400px;">{{ picoSettingsToml }}</pre>
            </div>
          </v-tabs-window-item>

          <!-- Pico W config.json -->
          <v-tabs-window-item v-if="isPicoW" value="pins">
            <div class="relative">
              <v-btn
                icon="mdi-content-copy"
                size="x-small"
                variant="text"
                class="position-absolute"
                style="top: 8px; right: 8px; z-index: 1;"
                @click="copyToClipboard(picoConfigJson)"
              />
              <pre class="overflow-x-auto text-caption font-mono pa-3 bg-black/40 rounded-md ring-1 ring-white/10 text-grey-lighten-1" style="max-height: 400px;">{{ picoConfigJson }}</pre>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>

        <!-- 📋 Post-Download Instructions -->
        <v-expand-transition>
          <v-alert v-if="downloaded" type="success" variant="tonal" class="mt-4" closable>
            <template #title>
              <span class="font-weight-bold">✅ ZIP Downloaded!</span>
            </template>
            <div v-if="isArduino && !isEsp32Wifi" class="text-body-2 mt-2">
              <ol class="pl-4">
                <li>Extract the ZIP file</li>
                <li>Copy <code>config.h</code> into your Arduino sketch folder</li>
                <li>Open <code>deja-arduino.ino</code> in Arduino IDE</li>
                <li>Select <strong>Board: Arduino Mega 2560</strong></li>
                <li>Select the correct serial port</li>
                <li>Click <strong>Upload</strong> ⬆️</li>
              </ol>
            </div>
            <div v-if="isEsp32Wifi" class="text-body-2 mt-2">
              <ol class="pl-4">
                <li>Extract the ZIP file</li>
                <li>Copy <code>config.h</code> into your <code>deja-esp32-wifi</code> sketch folder</li>
                <li>Open <code>deja-esp32-wifi.ino</code> in Arduino IDE</li>
                <li>Select an <strong>ESP32</strong> board (e.g. ESP32 Dev Module)</li>
                <li>Select the correct serial port</li>
                <li>Click <strong>Upload</strong> ⬆️ — the device will join WiFi and connect via MQTT 🛜</li>
              </ol>
            </div>
            <div v-if="isPicoW" class="text-body-2 mt-2">
              <ol class="pl-4">
                <li>Connect Pico W via USB (hold BOOTSEL if needed)</li>
                <li>Wait for <strong>CIRCUITPY</strong> drive to appear</li>
                <li>Extract the ZIP and copy all files to the CIRCUITPY drive</li>
                <li>The Pico W will restart automatically 🍓</li>
              </ol>
            </div>
          </v-alert>
        </v-expand-transition>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-btn variant="text" color="grey" @click="handleClose">Cancel</v-btn>
        <v-spacer />
        <v-btn
          color="green"
          variant="elevated"
          :prepend-icon="isWifi ? 'mdi-wifi' : 'mdi-usb'"
          @click="handleDownload"
        >
          📦 Download ZIP
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
