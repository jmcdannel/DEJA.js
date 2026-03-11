<script setup lang="ts">
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import type { Layout } from '@repo/modules'
import SelectFavorites from '@/core/Menu/SelectFavorites.vue'

const enableExperimentalSync = ref(true)
const notificationChannels = ref(['email'])
const defaultTheme = ref('system')
const speedSteps = ref('128')
const autoSaveSessions = ref(false)
const notificationOptions = [
  { title: 'Email alerts', value: 'email' },
  { title: 'SMS alerts', value: 'sms' },
  { title: 'Push notifications', value: 'push' },
]
const themeOptions = [
  { title: 'System default', value: 'system' },
  { title: 'Light', value: 'light' },
  { title: 'Dark', value: 'dark' },
]
const speedStepOptions = [
  { title: '14 steps', value: '14' },
  { title: '28 steps', value: '28' },
  { title: '128 steps', value: '128' },
]

// Runtime DEJA server configuration — stored in localStorage so mobile users
// can point the app at their local server without rebuilding.
const wsServerUrl = useStorage('@DEJA/wsServerUrl', '')
const mqttBrokerUrl = useStorage('@DEJA/mqttBrokerUrl', '')
const serverSaved = ref(false)

function saveServerSettings() {
  // Values are already reactive through useStorage; just show confirmation.
  serverSaved.value = true
  setTimeout(() => { serverSaved.value = false }, 2000)
}

// Layout Throttle Connection config
const layoutId = useStorage<string>('@DEJA/layoutId', '').value
const connectionType = ref<'deja-server' | 'withrottle'>('deja-server')
const connectionHost = ref('')
const connectionPort = ref(44444)
const isLayoutLoading = ref(true)
const isLayoutSaving = ref(false)

if (layoutId) {
  getDoc(doc(db, 'layouts', layoutId)).then((snap) => {
    if (snap.exists()) {
      const data = snap.data() as Layout
      if (data.throttleConnection) {
        connectionType.value = data.throttleConnection.type || 'deja-server'
        connectionHost.value = data.throttleConnection.host || ''
        connectionPort.value = data.throttleConnection.port || 44444
      }
    }
    isLayoutLoading.value = false
  })
}

async function saveLayoutConnectionSettings() {
  if (!layoutId) return
  isLayoutSaving.value = true
  try {
    await setDoc(
      doc(db, 'layouts', layoutId), 
      {
        throttleConnection: {
          type: connectionType.value,
          host: connectionHost.value,
          port: connectionPort.value
        }
      },
      { merge: true }
    )
  } catch(e) {
    console.error('Error saving throttle connection:', e)
  }
  isLayoutSaving.value = false
}

</script>

<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <SelectFavorites />

        <!-- DEJA Server configuration (used at runtime, especially on mobile) -->
        <v-card class="mb-4">
          <v-card-title>DEJA Server</v-card-title>
          <v-card-subtitle class="pb-0">
            Configure your local DEJA server connection. Required for mobile apps.
          </v-card-subtitle>
          <v-divider class="my-2" />
          <v-card-text class="space-y-4">
            <v-text-field
              v-model="wsServerUrl"
              label="WebSocket Server URL"
              placeholder="ws://192.168.1.100:8082"
              hint="Leave blank to use the built-in default (web only)"
              persistent-hint
              clearable
              prepend-inner-icon="mdi-server-network"
            />
            <v-text-field
              v-model="mqttBrokerUrl"
              label="MQTT Broker URL"
              placeholder="mqtt://192.168.1.100:1883"
              hint="Leave blank to disable MQTT"
              persistent-hint
              clearable
              prepend-inner-icon="mdi-transit-connection-variant"
            />
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              color="success"
              variant="tonal"
              :prepend-icon="serverSaved ? 'mdi-check' : 'mdi-content-save'"
              @click="saveServerSettings"
            >
              {{ serverSaved ? 'Saved!' : 'Save Server Settings' }}
            </v-btn>
          </v-card-actions>
        </v-card>

        <v-card class="mb-4" :loading="isLayoutLoading">
          <v-card-title>Throttle Connection</v-card-title>
          <v-card-subtitle class="pb-0">Configure how this Throttle connects to your Layout.</v-card-subtitle>
          <v-divider class="my-2" />
          <v-card-text class="space-y-4">
            <v-radio-group v-model="connectionType" label="Connection Protocol" inline hide-details>
              <v-radio label="DEJA.js Server" value="deja-server" />
              <v-radio label="Native WiThrottle" value="withrottle" />
            </v-radio-group>
            
            <div v-if="connectionType === 'withrottle'" class="mt-4 space-y-4">
               <v-text-field
                v-model="connectionHost"
                label="WiThrottle Host IP"
                placeholder="192.168.1.50"
                hint="IP address of the device running the WiThrottle server (e.g., DCC-EX WiFi, JMRI server)"
                persistent-hint
                prepend-inner-icon="mdi-ip-network"
              />
              <v-text-field
                v-model.number="connectionPort"
                label="WiThrottle Port"
                type="number"
                placeholder="44444"
                hint="Typically 44444 or 12090"
                persistent-hint
                prepend-inner-icon="mdi-serial-port"
              />
            </div>
            
            <v-alert v-if="connectionType === 'deja-server'" type="info" variant="tonal" class="mt-4 text-sm">
              The DEJA.js Server provides a native web socket connection which handles routing commands automatically. This option does not require the Capacitor native networking plugins and works reliably in the web browser.
            </v-alert>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn 
              color="primary" 
              variant="tonal" 
              :loading="isLayoutSaving"
              @click="saveLayoutConnectionSettings">
              Save Connection Info
            </v-btn>
          </v-card-actions>
        </v-card>

        <v-card>
          <v-card-title>Throttle Settings</v-card-title>
          <v-card-subtitle class="pb-0">Prototype controls for upcoming features.</v-card-subtitle>
          <v-divider class="my-2" />
          <v-card-text class="space-y-6">
            <v-switch
              v-model="enableExperimentalSync"
              label="Enable experimental consist sync"
              color="primary"
              hide-details
            />
            <v-select
              v-model="notificationChannels"
              :items="notificationOptions"
              label="Notification channels"
              multiple
              chips
              closable-chips
            />
            <v-select
              v-model="defaultTheme"
              :items="themeOptions"
              label="Interface theme"
            />
            <v-select
              v-model="speedSteps"
              :items="speedStepOptions"
              label="Default throttle speed steps"
            />
            <v-switch
              v-model="autoSaveSessions"
              label="Auto-save active throttles on close"
              color="primary"
              hide-details
            />
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn color="primary" variant="tonal" disabled>Save (coming soon)</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>