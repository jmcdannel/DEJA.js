<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useColors } from '@/Core/UI/useColors'
import { deviceTypes, useLayout, useServerStatus, type Device } from '@repo/modules'
import { useTurnouts } from '@repo/modules'
import { StatusPulse } from '@repo/ui'

const { connectDevice, autoConnectDevice } = useLayout()
const { getTurnouts } = useTurnouts()
const { colors, DEFAULT_COLOR } = useColors()
const { serverStatus } = useServerStatus()

const props = defineProps<{
  device: Device,
  ports: string[] | null | undefined,
}>()

const turnouts = ref(getTurnouts())
const serial = ref(props?.device?.port || '')
const autoConnect = ref(props?.device?.autoConnect || false)
const color = ref(colors[DEFAULT_COLOR])
const wifiAutoConnect = ref(true)

const deviceType = computed(() => deviceTypes.find((type) => type.value === props?.device?.type))
const isDejaServer = computed(() => props.device?.type === 'deja-server')
const effectiveConnected = computed(() => isDejaServer.value ? serverStatus.value?.online ?? false : props.device?.isConnected ?? false)
const serverIp = computed(() => serverStatus.value?.ip ?? null)
// const color = colors[deviceType.color || DEFAULT_COLOR]

onMounted(() => {
  deviceType.value?.color && (color.value = colors[deviceType.value.color])
})

watch(() => deviceType.value?.color, (newVal) => {
  if (newVal) {
    color.value = colors[newVal]
  }
})

async function handleConnect () {
  connectDevice(props.device, serial.value, props.device?.topic)
}

async function handelAutoConnect (checked: boolean | null) {
  if (checked !== null && props.device?.id) {
    await autoConnectDevice(props.device.id, checked)
  }
}

async function handleDisconnect () {
  // Disconnect logic here
}

</script>
<template>
  <v-card
    class="mx-auto w-full h-full justify-between flex flex-col border-t-4 border-b-4 glass transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    :class="[color.border, effectiveConnected ? 'bg-opacity-20' : 'bg-opacity-10']"
    :color="color.value"
    :variant="effectiveConnected ? 'tonal' : 'outlined'"
    density="compact"
  >
    <template #prepend>
      <v-icon class="drag-handle cursor-grab active:cursor-grabbing opacity-40 hover:opacity-100 mr-1" size="small">mdi-drag</v-icon>
      <img v-if="deviceType?.image" :src="deviceType.image" alt="DCC-EX Logo" class="w-12 h-12 mr-2" />
      <v-icon v-else :icon="deviceType?.icon || 'mdi-help'" class="w-12 h-12 mr-2 border rounded-full" />
    </template>
    <template #title>
      <div class="flex flex-col">
        <span class="text-sm font-bold text-white tracking-wide">{{device?.id}}</span>
        <span class="text-xs text-white/70 uppercase tracking-wider font-semibold">{{device?.type || 'ID'}}</span>
      </div>
    </template>
    <template #append>
    </template>
    <v-card-text>
      <!-- <pre>{{  deviceType }}</pre>
      <pre>{{  color }}</pre> -->
      <v-chip
        size="small"
        class="ma-1"
        prepend-icon="mdi-usb"
        :color="color.value"
      >{{ device?.connection || 'Device' }}</v-chip>
      <v-chip
        v-if="device?.port"
        size="small"
        class=" ma-1 inline-flex"
        :color="color.value"
        prepend-icon="mdi-memory"
      >
        {{ device?.port || '--' }}
      </v-chip>
      <v-chip
        v-if="device?.topic"
        size="small"
        class=" ma-1 inline-flex"
        :color="color.value"
        prepend-icon="mdi-wifi"
      >
        {{ device?.topic || '--' }}
      </v-chip>
      <!-- Deja Server: show IP and connection from server status -->
      <v-chip
        v-if="isDejaServer"
        size="small"
        class="ma-1 inline-flex"
        :variant="effectiveConnected ? 'elevated' : 'outlined'"
        :color="color.value"
        prepend-icon="mdi-server"
      >
        <template #append>
          <span v-if="effectiveConnected" class="ml-2">
            <StatusPulse status="connected" size="sm" />
          </span>
        </template>
        {{ effectiveConnected ? 'Connected' : 'Disconnected' }}
      </v-chip>
      <v-chip
        v-if="isDejaServer && effectiveConnected && serverIp"
        size="small"
        class="ma-1 inline-flex"
        :color="color.value"
        prepend-icon="mdi-ip-network"
      >
        {{ serverIp }}
      </v-chip>

      <!-- USB devices -->
      <v-chip
        v-if="!isDejaServer && device?.connection === 'usb'"
        size="small"
        class="ma-1 inline-flex"
        :variant="effectiveConnected ? 'elevated' : 'outlined'"
        :color="color.value"
        prepend-icon="mdi-memory"
      >
        <template #append>
          <span v-if="effectiveConnected" class="ml-2">
            <StatusPulse status="connected" size="sm" />
          </span>
        </template>
        {{ effectiveConnected ? 'Connected' : 'Disconnected' }}
      </v-chip>

      <!-- WiFi devices -->
      <v-chip
        v-if="!isDejaServer && device?.connection === 'wifi'"
        size="small"
        class="ma-1 inline-flex"
        :variant="effectiveConnected ? 'elevated' : 'outlined'"
        :color="color.value"
        prepend-icon="mdi-wifi"
      >
        <template #append>
          <span v-if="effectiveConnected" class="ml-2">
            <StatusPulse status="connected" size="sm" />
          </span>
        </template>
        {{ effectiveConnected ? 'Connected' : 'Disconnected' }}
      </v-chip>
      <v-spacer class="mt-4"></v-spacer>

      <!-- USB port dropdown (not for deja-server) -->
      <v-combobox
        v-if="!isDejaServer && !effectiveConnected && device?.connection === 'usb'"
        label="USB Port"
        v-model="serial"
        variant="outlined"
        item-title="label"
        density="compact"
        :items="ports || []"
        :disabled="effectiveConnected"
      ></v-combobox>

      <v-switch
        v-if="!isDejaServer && (effectiveConnected || device?.autoConnect)"
        @update:modelValue="handelAutoConnect"
        v-model="autoConnect"
        color="green"
        label="Auto Connect"
        hide-details
      ></v-switch>
      <v-switch
        v-else-if="!isDejaServer && device?.connection === 'wifi'"
        color="green"
        label="Auto Connect"
        v-model="wifiAutoConnect"
        hide-details
        class="pointer-events-none"
      ></v-switch>

    </v-card-text>
    <v-card-actions>
      <v-btn
        @click="$router.push({ name: 'DeviceDetails', params: { deviceId: device?.id } })"  
        :color="color.value"
        text="Details"
        variant="outlined">
      </v-btn>
      <v-spacer></v-spacer>
      <template v-if="isDejaServer">
        <v-chip v-if="effectiveConnected" color="success" size="small" variant="tonal" prepend-icon="mdi-check-circle">
          Server Online
        </v-chip>
        <v-chip v-else color="error" size="small" variant="tonal" prepend-icon="mdi-alert-circle">
          Server Offline
        </v-chip>
      </template>
      <template v-else>
        <v-btn
          v-if="!effectiveConnected"
          text="Connect"
          :color="color.value"
          variant="elevated"
          prepend-icon="mdi-usb"
          @click="handleConnect"
        ></v-btn>
        <v-btn
          v-else
          text="Disconnect"
          :color="color.value"
          variant="outlined"
          prepend-icon="mdi-usb"
          @click="handleDisconnect"
        ></v-btn>
      </template>      
    </v-card-actions>
  </v-card>
</template>
