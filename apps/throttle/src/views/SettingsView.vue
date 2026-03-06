<script setup lang="ts">
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
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