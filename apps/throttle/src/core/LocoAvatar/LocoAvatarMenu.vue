<script setup lang="ts">
import { type PropType } from 'vue'
import type { Loco } from '@repo/modules/locos'
import type { Throttle } from '@/throttle/types'
import { useRouter } from 'vue-router'

defineEmits(['showcard', 'fullscreen', 'throttlelist', 'park', 'stop'])
const props = defineProps({
  loco: {
    type: Object as PropType<Loco>,
    required: true
  },
  throttle: {
    type: Object as PropType<Throttle>,
    default: null
  },
})
const $router = useRouter()

const showThrottle = $router.currentRoute.value.name !== 'cloud-throttle' 
  || ($router.currentRoute.value.name === 'cloud-throttle' && $router.currentRoute.value.params.address !== props.loco.locoId.toString())

const showThrottleList = $router.currentRoute.value.name !== 'throttle-list' 
  && !props.throttle


</script>
<template>
  <v-btn 
    key="1" 
    @click="$emit('showcard')"
    :color="loco?.meta?.color || 'primary'" 
    icon="mdi-gamepad-square"
  />
  <v-btn 
    key="2" 
    v-if="showThrottle"
    @click="$emit('fullscreen')"
    :color="loco?.meta?.color || 'primary'" 
    icon="mdi-fullscreen"
  />
  <v-btn 
    key="3"
    v-if="showThrottleList"
    @click="$emit('throttlelist')"
    :color="loco?.meta?.color || 'primary'" 
    icon="mdi-view-sequential-outline" 
  />
  <v-btn 
    key="4" 
    v-if="throttle"
    @click="$emit('park')"
    :color="loco?.meta?.color || 'primary'" 
    icon="mdi-parking"
  />
  <v-btn 
    key="5" 
    v-if="throttle && Math.abs(throttle.speed)"
    @click="$emit('stop')"
    :color="loco?.meta?.color || 'primary'" 
    icon="mdi-stop-circle-outline"
  />
  <!-- <v-btn 
    key="8" 
    @click="handleClose"
    :color="loco?.meta?.color || 'primary'" 
    icon="$error"
  /> -->
</template>