<script setup lang="ts">
import { BackgroundSettings } from '@repo/ui'
import { ref } from 'vue'

const enableAutoDeploy = ref(true)
const allowedNotifications = ref(['email'])
const defaultTheme = ref('system')
const logRetention = ref(30)
const betaFeatures = ref(false)
const notificationOptions = [
  { title: 'Email updates', value: 'email' },
  { title: 'SMS alerts', value: 'sms' },
  { title: 'Push notifications', value: 'push' },
]
const themeOptions = [
  { title: 'System default', value: 'system' },
  { title: 'Light', value: 'light' },
  { title: 'Dark', value: 'dark' },
]
</script>

<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <BackgroundSettings
          app-name="cloud"
          :pages="[
            { path: '/', label: 'Home', icon: 'mdi-home' },
            { path: '/locos', label: 'Roster', icon: 'mdi-train' },
            { path: '/effects', label: 'Effects', icon: 'mdi-auto-fix' },
            { path: '/routes', label: 'Routes', icon: 'mdi-map-marker-path' },
            { path: '/signals', label: 'Signals', icon: 'mdi-traffic-light' },
            { path: '/sensors', label: 'Sensors', icon: 'mdi-motion-sensor' },
            { path: '/turnouts', label: 'Turnouts', icon: 'mdi-directions-fork' },
            { path: '/dccex', label: 'DCC-EX', icon: 'mdi-console' },
            { path: '/layout', label: 'Layout', icon: 'mdi-floor-plan' },
          ]"
          class="mb-4"
        />

        <v-card>
          <v-card-title>Cloud Settings</v-card-title>
          <v-card-subtitle class="pb-0">Placeholder controls for configuration work.</v-card-subtitle>
          <v-divider class="my-2" />
          <v-card-text class="space-y-6">
            <v-switch
              v-model="enableAutoDeploy"
              label="Enable auto-deploy for layout changes"
              color="primary"
              hide-details
            />
            <v-select
              v-model="allowedNotifications"
              :items="notificationOptions"
              label="Notification channels"
              multiple
              chips
              closable-chips
            />
            <v-select
              v-model="defaultTheme"
              :items="themeOptions"
              label="Dashboard theme"
            />
            <div>
              <div class="text-subtitle-2 mb-2">Log retention (days)</div>
              <v-slider
                v-model="logRetention"
                :min="7"
                :max="90"
                :step="1"
                thumb-label="always"
              />
            </div>
            <v-switch
              v-model="betaFeatures"
              label="Join cloud feature preview program"
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