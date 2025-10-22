<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import { getDocs } from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useCollection, useCurrentUser } from 'vuefire'
import { AppHeader } from '@repo/ui'
import Footer from '@/core/Footer.vue'
import Menu from '@/core/Menu.vue'
import { useDcc } from '@repo/dccex'
import { useEfx, type Effect } from '@repo/modules'

const { sendDccCommand } = useDcc()
const { runEffect, getEffectsByType } = useEfx()
const drawer = ref(false)
const layoutId = useStorage('@DEJA/layoutId', 'betatrack')
const user = useCurrentUser()
const router = useRouter()
console.log('Current user:', user)
console.log('Current layoutId:', layoutId.value)

// Event handlers for the unified header
async function handleTrackPowerToggle(newState: boolean) {
  const DEFAULT_ON = '1 MAIN'
  const DEFAULT_OFF = '0'
  await sendDccCommand({ action: 'dcc', payload: newState ? DEFAULT_ON : DEFAULT_OFF })
}

async function handleLayoutPowerToggle(newState: boolean) {
  const powerEfx = await getEffectsByType('power')
  if (!powerEfx) {
    console.warn('No power effects found for layout', layoutId.value)
    return
  }
  const querySnapshot = await getDocs(powerEfx);
  querySnapshot.forEach((doc) => {
    runEffect({...doc.data(), id: doc.id, state: newState} as Effect);
  });
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

function handleLogoClick() {
  router.push({ path: '/' })
}

</script>

<template>
  <v-responsive>
    <v-app theme="dark">
      <AppHeader 
        app-name="Throttle"
        app-icon="mdi-gamepad-variant"
        variant="throttle"
        color="blue"
        :drawer="drawer"
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
        @logo-click="handleLogoClick"
        @drawer-toggle="drawer = !drawer"
      />
  <Menu v-model:drawer="drawer" />
      <v-main>
        <v-container class="p-0 min-h-full flex flex-col" fluid>
          <RouterView />
        </v-container>
      </v-main>
      <Footer v-if="Boolean(user) && Boolean(layoutId)" />
    </v-app>
  </v-responsive>
</template>