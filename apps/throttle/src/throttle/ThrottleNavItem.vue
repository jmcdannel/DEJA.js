<script lang="ts" setup>
import { toRef } from 'vue'
import { useThrottle } from './useThrottle'
import { useLocos } from '@repo/modules/locos'

const emit = defineEmits(['select'])
const props = defineProps({
  address: {
    type: Number,
    required: true
  }
})

const addressRef = toRef(props, 'address')
const { loco, currentSpeed } = useThrottle(addressRef)
const { getRoadname } = useLocos()

const locoColor = () => loco?.meta?.color || getRoadname(loco?.meta?.roadname || '')?.color || 'green'
</script>

<template>
  <v-btn
    v-if="loco"
    class="throttle-nav-chip ma-1"
    :color="locoColor()"
    variant="tonal"
    rounded="lg"
    size="small"
    @click="emit('select', loco.address)"
  >
    <span class="font-mono font-bold mr-1">{{ loco.address }}</span>
    <v-badge
      v-if="loco?.consist?.length"
      :content="loco.consist.length"
      color="primary"
      inline
    />
  </v-btn>
</template>

<style scoped>
.throttle-nav-chip {
  min-width: 56px;
  text-transform: none;
  letter-spacing: 0;
}
</style>
