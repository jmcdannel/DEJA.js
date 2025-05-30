<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useColors } from '@/Core/UI/useColors'
import { deviceTypes, useLayout, type Device } from '@repo/modules/layouts'
import { useTurnouts } from '@repo/modules/turnouts'

const { connectDevice, autoConnectDevice } = useLayout()
const { getTurnouts } = useTurnouts()
const { colors, DEFAULT_COLOR } = useColors()

const props = defineProps<{
  device: Device,
  ports: string[],
}>()

const turnouts = ref(getTurnouts())
const serial = ref(props?.device?.port || '')
const autoConnect = ref(props?.device?.autoConnect || false)
const color = ref(colors[DEFAULT_COLOR])
const wifiAutoConnect = ref(true)

const deviceType = computed(() => deviceTypes.find((type) => type.value === props?.device?.type))
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
  connectDevice(serial.value, props.device)
}

async function handelAutoConnect (checked: boolean | null) {
  if (checked !== null && props.device?.id) {
    await autoConnectDevice(props.device.id, checked)
  }
}

</script>
<template>
  <v-card
    class="mx-auto w-full h-full justify-between flex flex-col border-t-4 border-b-4"
    :class="color.border"
    :subtitle="device?.type || 'ID'"
    :color="color.value"
    :variant="device?.isConnected ? 'tonal' : 'outlined'"
    density="compact"
  >
    <template #prepend>
      <img v-if="deviceType?.image" :src="deviceType.image" alt="DCC-EX Logo" class="w-16 h-16 mr-2" />
      <v-icon v-else :icon="deviceType?.icon || 'mdi-help'" class="w-16 h-16 mr-2 border rounded-full" />
    </template>
    <template #title>
      <span class="text-md">{{device?.id}}</span>
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
      <v-chip
        v-if="device?.connection === 'usb'"
        size="small"
        class=" ma-1 inline-flex"
        :variant="device?.isConnected ? 'elevated' : 'outlined'"
        :color="color.value"
        prepend-icon="mdi-memory"
      >
        <template #append>
          <span v-if="device?.isConnected" class="ml-2 relative flex h-3 w-3">
            <span class="absolute inline-flex h-full w-full rounded-full bg-green-600 animate-ping opacity-75"></span>
            <span class="relative inline-flex h-full w-full rounded-full bg-green-600"></span>
          </span>
        </template>
        {{ device?.isConnected ? 'Connected' : 'Disconnected' }}
      </v-chip>
      <v-chip
        v-if="device?.connection === 'wifi'"
        size="small"
        class=" ma-1 inline-flex"
        :variant="device?.isConnected ? 'elevated' : 'outlined'"
        :color="color.value"
        prepend-icon="mdi-wifi"
      >
        <template #append>
          <span v-if="device?.isConnected" class="ml-2 relative flex h-3 w-3">
            <span class="absolute inline-flex h-full w-full rounded-full bg-green-600 animate-ping opacity-75"></span>
            <span class="relative inline-flex h-full w-full rounded-full bg-green-600"></span>
          </span>
        </template>
        {{ device?.isConnected ? 'Connected' : 'Disconnected' }}
      </v-chip>
      <v-spacer class="mt-4"></v-spacer>
      <v-combobox
        v-if="!device?.isConnected && device?.connection === 'usb'"
        label="USB Port"
        v-model="serial"
        variant="outlined"
        item-title="label"
        density="compact"
        :items="ports"
        :disabled="device?.isConnected"
      ></v-combobox>
      <ul>
        <li v-for="turnout in turnouts.filter(t => t.device === device?.id)" :key="turnout.id">
          {{ turnout.name }}
        </li>
      </ul>

    </v-card-text>
    <v-card-actions>
      <v-btn
         v-if="!device?.isConnected"
        text="Connect"
        :color="color.value"
        variant="elevated"
        prepend-icon="mdi-usb"
        @click="handleConnect"
      ></v-btn>
      <v-btn
        text="Reset"
        :color="color.value"
        variant="outlined"
        prepend-icon="mdi-usb"
        disabled
      ></v-btn>
      <v-switch 
        v-if="device?.isConnected || device?.autoConnect"
        @update:modelValue="handelAutoConnect"
        v-model="autoConnect"
        color="green"
        label="Auto Connect"
        hide-details
      ></v-switch>
      <v-switch 
        v-else-if="device?.connection === 'wifi'"
        color="green"
        label="Auto Connect"
        v-model="wifiAutoConnect"
        hide-details
        class="pointer-events-none"
      ></v-switch>
    </v-card-actions>
  </v-card>
</template>
