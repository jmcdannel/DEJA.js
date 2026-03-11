<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { useCollection } from 'vuefire'
import { useColors } from '@repo/ui/src/useColors'
import relativeTime from 'dayjs/plugin/relativeTime'
import { deviceTypes, useTurnouts, useEfx, type Device } from '@repo/modules'
import { createLogger } from '@repo/utils'
import Stat from '@repo/ui/src/Stat.vue'
import { StatusPulse } from '../animations'

const log = createLogger('DeviceStatusItem')

const props = defineProps({
  device: {
    type: Object as PropType<Device>,
    required: true
  }
})

const { colors, DEFAULT_COLOR } = useColors()
const { getTurnoutsByDevice } = useTurnouts()
const { getEffectsByDevice } = useEfx()

log.debug('Device in DeviceStatusItem:', props.device.id)
const turnouts = useCollection(computed(() => props.device ? getTurnoutsByDevice(props.device.id as string) : null))
const effects = useCollection(computed(() => props.device ? getEffectsByDevice(props.device.id as string) : null))

const deviceType = computed(() => deviceTypes.find((type) => type.value === props?.device?.type))
const color = computed(() => colors[deviceType.value?.color || DEFAULT_COLOR])


</script>
<template>
  <v-card 
    class="rounded-2xl shadow-xl p-2 pb-5 device-gradient text-white"
    color="primary"
    variant="flat">
    <template v-slot:title>
      <span class="text-white font-bold tracking-wide">{{ device.id }}</span>
    </template>
    <template v-slot:subtitle>
      <span class="text-white/70 font-semibold tracking-wider uppercase text-xs">{{ device.type }}</span>
    </template>
    <template v-slot:prepend>
      <v-icon v-if="device.type === 'dcc-ex'" class="mr-2" size="48" :color="device.isConnected ? 'success' : 'error'" icon="mdi-memory" />
      <v-icon v-else-if="device.type === 'deja-arduino'" class="mr-2" size="48" :color="device.isConnected ? 'success' : 'error'" icon="mdi-usb" />
      <v-icon v-else-if="device.type === 'deja-arduino-led'" class="mr-2" size="48" :color="device.isConnected ? 'success' : 'error'" icon="mdi-led-strip" />
      <v-icon v-else-if="device.type === 'deja-mqtt'" class="mr-2" size="48" :color="device.isConnected ? 'success' : 'error'" icon="mdi-wifi" />
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
          <StatusPulse v-if="device?.isConnected" :status="'connected'" size="md" class="ml-2" />
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
          <StatusPulse v-if="device?.isConnected" :status="'connected'" size="md" class="ml-2" />
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
