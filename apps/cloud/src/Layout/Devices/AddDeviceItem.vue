<script setup lang="ts">
import { ref, watch } from 'vue'
import { deviceTypes, isWifiDeviceType, useLayout, type Device } from '@repo/modules'
import { createLogger } from '@repo/utils'

const log = createLogger('AddDeviceItem')

interface ValidationRules {
  required: ((val: unknown) => boolean | string)[];
}

const emit = defineEmits(['close'])
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})
const reveal = ref(false)
const loading = ref(false)
const connection = ref<'usb' | 'wifi' | null>(null)
const deviceType = ref<Device['type'] | null>(null)

// 📡 Auto-default connection based on device type — WiFi devices (Pico W, ESP32 WiFi)
// must use connection: 'wifi' so the server's MQTT publish branch is used.
// Server modules in apps/server/src/modules/effects.ts gate WiFi publish on
// `connection === 'wifi'`, so this default is load-bearing.
watch(deviceType, (newType) => {
  if (isWifiDeviceType(newType ?? undefined)) {
    connection.value = 'wifi'
  } else if (newType) {
    connection.value = 'usb'
  }
})
const deviceId = ref('')
const topic = ref('')
const autoConnect = ref(false)
const rules:ValidationRules = {
  required: [(val) => !!val || 'Required.']
}

const { createDevice } = useLayout()

const connectionTypes = ['usb', 'wifi']

async function submit (e: Event) {
  loading.value = true
  const form = e.target as HTMLFormElement

  if (form.checkValidity() && connection.value && deviceType.value && deviceId.value) {
    const device: Device = {
      connection: connection.value,
      id: deviceId.value,
      name: deviceId.value,
      type: deviceType.value,
      autoConnect: autoConnect.value,
      ...(connection.value === 'wifi' && topic.value ? { topic: topic.value } : {}),
    }
    await createDevice(deviceId.value, device)
  }

  loading.value = false
}

function handleClose() {
  reveal.value = false
  emit('close')
}

log.debug('deviceTypes', deviceTypes)

</script>
<template>
  <v-form validate-on="submit lazy" @submit.prevent="submit">
    <v-card  
      v-if="reveal || props.show"
    >
    <v-card-title>
      <h3 class="flex text-sky-500 dark:text-sky-400 mt-4">
        <v-icon icon="mdi-memory" class="w-8 h-8 mr-2"></v-icon>
        <span class="text-xl">Add Device</span>
      </h3>
    </v-card-title>
      <v-card-text class="pb-0">
          <v-btn-toggle v-model="deviceType" color="cyan" divided class="flex-col sm:flex-row flex-wrap h-auto" size="x-large">
            <v-btn v-for="device in deviceTypes" :value="device.value" :key="device.value"  
              class="md:min-h-24 border">
              <div class="flex flex-col justify-center items-center py-2">
                <v-icon :icon="device.icon" :color="device.color"></v-icon>
                <div class="mt-4">{{ device.label }}</div>
              </div>
            </v-btn>
          </v-btn-toggle>
          <v-divider class="my-4"></v-divider>
          <v-btn-toggle v-model="connection" color="cyan" divided class="flex-wrap h-auto" size="x-large">
            <v-btn v-for="conn in connectionTypes" :value="conn" :key="conn" 
            class="min-h-24 min-w-24 border">              
              <div class="flex flex-col justify-center items-center py-2">
                <v-icon :icon="`mdi-${conn}`"></v-icon>
                <div class="mt-4">{{ conn }}</div>
              </div>
            </v-btn>
          </v-btn-toggle>
          <v-divider class="my-4"></v-divider>
          <v-text-field
            v-model="deviceId"
            label="ID"
            variant="outlined"
            density="compact"
            :rules="rules.required"
          ></v-text-field>
          <v-text-field
            v-if="connection === 'wifi'"
            v-model="topic"
            label="MQTT Topic"
            variant="outlined"
            density="compact"
            placeholder="deja/layout/device"
            hint="MQTT topic this device subscribes to"
            persistent-hint
          ></v-text-field>
          <v-switch
            v-model="autoConnect"
            color="cyan"
            label="Auto Connect"
            hide-details
            density="compact"
            class="mb-2"
          />
      </v-card-text>
      <v-card-actions>
        <v-btn
          text="Close"
          type="button"
          variant="tonal"
          @click="handleClose"
        ></v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :loading="loading"
          text="Submit"
          type="submit"
          color="cyan"
          variant="flat"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>