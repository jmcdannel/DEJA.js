<script setup lang="ts">
import { ref } from 'vue'

const autoRefresh = ref(true)
const refreshInterval = ref(15)
const alertDestinations = ref(['email'])
const includeDiagnostics = ref(false)
const theme = ref('system')
const notificationOptions = [
  { title: 'Email alerts', value: 'email' },
  { title: 'SMS alerts', value: 'sms' },
  { title: 'Webhook ping', value: 'webhook' },
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
        <v-card>
          <v-card-title>Monitor Settings</v-card-title>
          <v-card-subtitle class="pb-0">Mock controls for device monitoring tweaks.</v-card-subtitle>
          <v-divider class="my-2" />
          <v-card-text class="space-y-6">
            <v-switch
              v-model="autoRefresh"
              label="Enable auto-refresh"
              color="primary"
              hide-details
            />
            <v-text-field
              v-model="refreshInterval"
              type="number"
              min="5"
              max="120"
              label="Refresh interval (seconds)"
              suffix="s"
            />
            <v-select
              v-model="alertDestinations"
              :items="notificationOptions"
              label="Alert destinations"
              multiple
              chips
              closable-chips
            />
            <v-switch
              v-model="includeDiagnostics"
              label="Include verbose diagnostics in alerts"
              color="primary"
              hide-details
            />
            <v-select
              v-model="theme"
              :items="themeOptions"
              label="Dashboard theme"
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