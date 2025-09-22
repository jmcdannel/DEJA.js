<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useStorage } from '@vueuse/core'
import { AppHeader } from '@repo/ui'
import Footer from '@/core/Footer.vue'
import { useDcc } from '@repo/dccex'
import { useEfx } from '@repo/modules'

const { sendDccCommand } = useDcc()
const { runEffect, getEffectsByType } = useEfx()
const layoutId = useStorage('@DEJA/layoutId', '')

// Event handlers for the unified header
async function handleTrackPowerToggle(newState: boolean) {
  const DEFAULT_ON = '1 MAIN'
  const DEFAULT_OFF = '0'
  await sendDccCommand({ action: 'dcc', payload: newState ? DEFAULT_ON : DEFAULT_OFF })
}

async function handleLayoutPowerToggle(newState: boolean) {
  const powerEfx = await getEffectsByType('power')
  if (powerEfx && Array.isArray(powerEfx)) {
    powerEfx.forEach((efx: any) => {
      runEffect({...efx, state: newState })
    })
  }
}

async function handleEmergencyStop() {
  await sendDccCommand({ action: 'dcc', payload: '!' })
}

function handleDeviceSelect(deviceId: string) {
  console.log('Device selected:', deviceId)
  // Handle device selection if needed
}

function handleLayoutSelect(newLayout: string) {
  layoutId.value = newLayout
  
  window.location.reload()
}
</script>

<template>
  <v-responsive>
    <v-app theme="dark">
      <AppHeader 
        app-name="DEJA Throttle"
        app-icon="mdi-gamepad-variant"
        variant="throttle"
        color="surface"
        :dark="true"
        :show-layout-power="true"
        :show-emergency-stop="true"
        :show-device-status="true"
        :show-device-status-label="true"
        :show-user-profile="true"
        @track-power-toggle="handleTrackPowerToggle"
        @layout-power-toggle="handleLayoutPowerToggle"
        @emergency-stop="handleEmergencyStop"
        @device-select="handleDeviceSelect"
      />

      <v-navigation-drawer expand-on-hover
        rail>
        <v-list>
          
        </v-list>
        <v-divider />
        <v-list>
          <v-list-item @click="handleLayoutSelect('betatrack')">
            <template #prepend>
              <v-avatar size="32" color="primary">BT</v-avatar>
            </template>
            <v-list-item-title>Betatrack</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleLayoutSelect('tam')">
            <template #prepend>
              <v-avatar size="32" color="primary">TJ</v-avatar>
            </template>
            <v-list-item-title>Tamarack Junction</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleLayoutSelect('shef')">
            <template #prepend>
              <v-avatar size="32" color="primary">HO</v-avatar>
            </template>
            <v-list-item-title>HO Clockwork Shelf</v-list-item-title>
          </v-list-item>
        </v-list>
        <v-divider />
        <v-list>
          <v-list-item prepend-icon="mdi-logout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main>
        <v-container class="p-0 min-h-full flex flex-col" fluid>
          <RouterView />
        </v-container>
      </v-main>
      <Footer />
    </v-app>
  </v-responsive>
</template>