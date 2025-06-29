<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useCollection } from 'vuefire'
import { useRouter } from 'vue-router'
import { useColors } from '@/Core/UI/useColors'
import { deviceTypes, useLayout, type Device } from '@repo/modules/layouts'
import { useTurnouts } from '@repo/modules/turnouts'
import { useEfx } from '@repo/modules/effects'

const { connectDevice, autoConnectDevice, getDevice } = useLayout()
const { getTurnoutsByDevice } = useTurnouts()
const { getEffectsByDevice } = useEfx()
const { colors, DEFAULT_COLOR } = useColors()

const route = useRouter()
const turnouts = useCollection(getTurnoutsByDevice(route.currentRoute.value.params.deviceId as string))
const effects = useCollection(getEffectsByDevice(route.currentRoute.value.params.deviceId as string))

const device = ref(null as Device | null)

onMounted(async () => {
  const deviceId = route.currentRoute.value.params.deviceId as string
  if (deviceId) {
    device.value = await getDevice(deviceId) as Device
  }
})
// const serial = ref(device.value?.port || '')
// const autoConnect = ref(device.value?.autoConnect || false)
// const wifiAutoConnect = ref(true)

const deviceType = computed(() => deviceTypes.find((type) => type.value === device.value?.type))
const color = colors[deviceType.color || DEFAULT_COLOR]
const turnoutPins = computed(() => {
  return turnouts.value ? turnouts.value.map(turnout => `${turnout.straight}, ${turnout.divergent}`) : []
})
const turnoutPulsers = computed(() => {
  return turnouts.value ? turnouts.value.map(turnout => `TurnoutPulser(${turnout.straight}, ${turnout.divergent})`) : []
})

// onMounted(() => {
//   deviceType.value?.color && (color.value = colors[deviceType.value.color])
// })

// watch(() => deviceType.value?.color, (newVal) => {
//   if (newVal) {
//     color.value = colors[newVal]
//   }
// })

// async function handleConnect () {
//   connectDevice(props.device, serial.value, props.device?.topic)
// }

// async function handelAutoConnect (checked: boolean | null) {
//   if (checked !== null && props.device?.id) {
//     await autoConnectDevice(props.device.id, checked)
//   }
// }

</script>
<template>
  {{ route.currentRoute.value.params.deviceId }}
  <!-- <pre>{{ device }}</pre> -->
  <v-card
    class="mx-auto w-full h-full justify-between flex flex-col"
    :class="color.border"
    :subtitle="device?.type || 'ID'"
    :color="color.value"
    variant="tonal"
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
      <pre>{{ turnoutPins.join(' ') }}</pre>
      <pre>{{ turnoutPulsers.join(',\n') }}</pre>
      <v-table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Index</th>
            <th>Straight</th>
            <th>Divergent</th>
            <th>Type</th>
            <th>State</th>
            <th>ID</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="turnout in turnouts" :key="turnout.id">
            <td>{{ turnout.name }}</td>
            <td>{{ turnout.turnoutIdx }}</td>
            <td>{{ turnout.straight }}</td>
            <td>{{ turnout.divergent }}</td>
            <td>{{ turnout.type }}</td>
            <td>{{ turnout.state }}</td>
            <td>{{ turnout.id }}</td>
            <td>{{ turnout.desc }}</td>
          </tr>
        </tbody>
      </v-table>
      <v-row>
        <v-col v-for="effect in effects" :key="effect.id">
          <v-card>
            <v-card-title>{{ effect.name }}</v-card-title>
            <v-card-subtitle>{{ effect.type }}</v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col v-for="turnout in turnouts" :key="turnout.id">
          <v-card>
            <v-card-title>{{ turnout.name }}</v-card-title>
            <v-card-subtitle>{{ turnout.type }}</v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>


    </v-card-text>
    <v-card-actions>
      <v-btn
        @click="$router.push({ name: 'Layout' })"
        :color="color.value"
        text="Back"
        variant="outlined">
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        text="Deploy"
        :color="color.value"
        variant="elevated"
        prepend-icon="mdi-usb"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>
