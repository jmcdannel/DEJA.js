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
    class="mx-auto w-full h-full justify-between flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    density="compact"
  >
    <v-card-title class="flex flex-nowrap items-center gap-3 !overflow-visible">
      <v-icon class="drag-handle cursor-grab active:cursor-grabbing opacity-40 hover:opacity-100 flex-shrink-0" size="small">mdi-drag</v-icon>
      <router-link :to="{ name: 'DeviceDetails', params: { deviceId: device?.id } }" class="flex items-center gap-3 min-w-0 cursor-pointer hover:opacity-80 transition-opacity">
        <img v-if="deviceType?.image" :src="deviceType.image" alt="" class="w-8 h-8 flex-shrink-0" />
        <v-icon v-else :icon="deviceType?.icon || 'mdi-help'" :color="color.value" class="flex-shrink-0" />
        <div class="flex flex-col min-w-0">
          <span class="text-sm font-bold truncate">{{ device?.id }}</span>
          <span class="text-xs opacity-70 uppercase tracking-wider">{{ device?.type || 'Device' }}</span>
        </div>
      </router-link>
      <v-spacer />
      <v-icon
        :icon="effectiveConnected ? 'mdi-circle' : 'mdi-circle-outline'"
        :color="effectiveConnected ? 'green' : 'grey'"
        size="small"
        class="flex-shrink-0"
      />
    </v-card-title>
    <v-card-text>
      <div class="flex justify-between w-full items-start mb-3">
        <v-chip-group>
          <v-chip size="small" variant="outlined" prepend-icon="mdi-usb">
            {{ device?.connection || 'Device' }}
          </v-chip>
          <v-chip
            v-if="isDejaServer && effectiveConnected && serverIp"
            size="small"
            variant="outlined"
            prepend-icon="mdi-ip-network"
          >
            {{ serverIp }}
          </v-chip>
        </v-chip-group>
        <v-btn
          v-if="device?.port"
          size="small"
          variant="outlined"
          :color="color.value"
          prepend-icon="mdi-memory"
        >
          {{ device?.port }}
        </v-btn>
        <v-btn
          v-else-if="device?.topic"
          size="small"
          variant="outlined"
          :color="color.value"
          prepend-icon="mdi-wifi"
        >
          {{ device?.topic }}
        </v-btn>
      </div>

      <!-- Status chip -->
      <div class="flex items-center gap-2 mb-3">
        <StatusPulse v-if="effectiveConnected" status="connected" size="sm" />
        <span class="text-xs" :class="effectiveConnected ? 'text-green-400' : 'text-red-400'">
          {{ effectiveConnected ? 'Connected' : 'Disconnected' }}
        </span>
      </div>

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
      />

      <v-switch
        v-if="!isDejaServer && (effectiveConnected || device?.autoConnect)"
        @update:modelValue="handelAutoConnect"
        v-model="autoConnect"
        color="green"
        label="Auto Connect"
        hide-details
        density="compact"
      />
      <v-switch
        v-else-if="!isDejaServer && device?.connection === 'wifi'"
        color="green"
        label="Auto Connect"
        v-model="wifiAutoConnect"
        hide-details
        density="compact"
        class="pointer-events-none"
      />
    </v-card-text>
    <v-divider />
    <div class="flex items-center pa-1" style="background: rgba(var(--v-theme-on-surface), 0.04)">
      <v-btn
        variant="text"
        :color="color.value"
        size="small"
        @click="$router.push({ name: 'DeviceDetails', params: { deviceId: device?.id } })"
      >
        Details
        <v-icon end icon="mdi-arrow-right" />
      </v-btn>
      <v-spacer />
      <template v-if="isDejaServer">
        <v-chip v-if="effectiveConnected" color="success" size="x-small" variant="tonal" prepend-icon="mdi-check-circle">
          Online
        </v-chip>
        <v-chip v-else color="error" size="x-small" variant="tonal" prepend-icon="mdi-alert-circle">
          Offline
        </v-chip>
      </template>
      <template v-else>
        <v-btn
          v-if="!effectiveConnected"
          text="Connect"
          :color="color.value"
          variant="tonal"
          size="small"
          prepend-icon="mdi-power-plug"
          @click="handleConnect"
        />
        <v-btn
          v-else
          text="Disconnect"
          color="error"
          variant="text"
          size="small"
          prepend-icon="mdi-power-plug-off"
          @click="handleDisconnect"
        />
      </template>
    </div>
  </v-card>
</template>
