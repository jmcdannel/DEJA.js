<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDevices } from './useDevices'
import DeviceList from './DeviceList.vue'
import InstallDeviceDialog from './InstallDeviceDialog.vue'

const { devices, loading, error, load, mintInstallToken, revoke } = useDevices()

const installDialog = ref(false)
const installUrl = ref('')
const minting = ref(false)
const mintError = ref<string | null>(null)

async function openInstall() {
  minting.value = true
  mintError.value = null
  try {
    installUrl.value = await mintInstallToken('DEJA Server', null)
    installDialog.value = true
  } catch (err) {
    mintError.value = (err as Error).message
  } finally {
    minting.value = false
  }
}

async function handleRevoke(pairingId: string) {
  try {
    await revoke(pairingId)
  } catch (err) {
    error.value = (err as Error).message
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="settings-row settings-row--actions">
      <div class="flex flex-wrap gap-3">
        <v-btn
          color="primary"
          size="small"
          variant="tonal"
          prepend-icon="mdi-plus"
          :loading="minting"
          class="text-none"
          @click="openInstall"
        >
          Install on new device
        </v-btn>
      </div>
    </div>
    <div v-if="mintError || error" class="settings-row settings-row--block">
      <v-alert v-if="mintError" type="error" variant="tonal" class="mb-2">{{ mintError }}</v-alert>
      <v-alert v-if="error" type="error" variant="tonal">{{ error }}</v-alert>
    </div>
    <div class="settings-row settings-row--block">
      <DeviceList :devices="devices" :loading="loading" @revoke="handleRevoke" />
    </div>
    <InstallDeviceDialog v-model="installDialog" :install-url="installUrl" />
  </div>
</template>
