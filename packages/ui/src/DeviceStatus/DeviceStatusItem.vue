<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { useCollection } from 'vuefire'
import { useColors } from '@repo/ui/src/useColors'
import relativeTime from 'dayjs/plugin/relativeTime'
import { deviceTypes, useTurnouts, useEfx, type Device } from '@repo/modules'
import Stat from '@repo/ui/src/Stat.vue'

const props = defineProps({
  device: {
    type: Object as PropType<Device>,
    required: true
  }
})

const { colors, DEFAULT_COLOR } = useColors()
const { getTurnoutsByDevice } = useTurnouts()
const { getEffectsByDevice } = useEfx()

console.log('Device in DeviceStatusItem:', props.device.id)
const turnouts = useCollection(computed(() => props.device ? getTurnoutsByDevice(props.device.id as string) : null))
const effects = useCollection(computed(() => props.device ? getEffectsByDevice(props.device.id as string) : null))

const deviceType = computed(() => deviceTypes.find((type) => type.value === props?.device?.type))
const color = computed(() => colors[deviceType.value?.color || DEFAULT_COLOR])


</script>
<template>
  <v-card 
    class="rounded-2xl shadow-xl p-2 pb-5 device-gradient"
    :subtitle="device.type"
    color="primary"
    :title="device.id"
    variant="flat">
    <template v-slot:prepend>
      <v-icon v-if="device.type === 'dcc-ex'" size="48" :color="device.isConnected ? 'success' : 'error'" icon="mdi-memory" />
      <v-icon v-else-if="device.type === 'deja-arduino'" size="48" :color="device.isConnected ? 'success' : 'error'" icon="mdi-usb" />
      <v-icon v-else-if="device.type === 'deja-arduino-led'" size="48" :color="device.isConnected ? 'success' : 'error'" icon="mdi-led-strip" />
      <v-icon v-else-if="device.type === 'deja-mqtt'" size="48" :color="device.isConnected ? 'success' : 'error'" icon="mdi-wifi" />
    </template>
    <v-card-text>
      <!-- <pre>{{ device }}</pre> -->
      <v-chip
        size="small"
        class="ma-1"
        prepend-icon="mdi-usb"
        :color="color?.value"
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
        v-else-if="device?.topic"
        size="small"
        class=" ma-1 inline-flex"
        :color="color.value"
        prepend-icon="mdi-wifi"
      >
        {{ device?.topic || '--' }}
      </v-chip>
      <v-chip
        v-else
        size="small"
        class=" ma-1 inline-flex"
        :color="color.value"
        prepend-icon="mdi-wifi"
      >
        [unknown connection]
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
      <Stat :label="'Turnout'" :value="turnouts.length" :emptyLabel="'No turnouts found'" color="blue" class="mt-4" />
      <Stat :label="'Effect'" :value="effects.length" :emptyLabel="'No effects found'" color="purple" class="mt-4" />   
    </v-card-text>
  </v-card>
</template>
<style scoped>
.device-gradient {
  background: rgba(18, 68, 186, 0.25)!important;
  backdrop-filter: blur(20px);
}
</style>
