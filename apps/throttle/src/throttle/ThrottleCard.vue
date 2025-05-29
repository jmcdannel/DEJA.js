<script setup lang="ts">
import { watch, type PropType } from 'vue'
import ThrottleButtonControls from './ThrottleButtonControls.vue'
import CurrentSpeed from './CurrentSpeed.vue'
import type { Loco } from '@repo/modules/locos'
import type { Throttle } from './types';
import { useThrottle } from './useThrottle'

const props = defineProps({
  throttle: {
    type: Object as PropType<Throttle>,
    required: true
  },
  loco: {
    type: Object as PropType<Loco>,
    required: true
  }
})

defineEmits(['consist', 'fullscreen', 'functions', 'park'])

const { 
  currentSpeed, 
  adjustSpeed: handleAdjustSpeed, 
  handleThrottleChange,
  stop: handleStop,
} = useThrottle(props.throttle)

// Setup watchers
watch( () => props.throttle, handleThrottleChange, { deep: true })
</script>
<template>
  <v-card>
    <v-card-title class="flex items-center justify-between">
      <v-avatar 
        :color="loco?.meta?.color || 'primary'" 
        class="mr-2" 
        @click="$emit('fullscreen')" 
        :text="loco.address.toString()"/>
      <span>
        {{ loco.name }}
      </span>
      <CurrentSpeed :speed="currentSpeed" />
    </v-card-title>
    <v-card-text>
      <ThrottleButtonControls :speed="currentSpeed" @update:currentSpeed="handleAdjustSpeed" @stop="handleStop" horizontal class=""  />
    </v-card-text>
    <v-slider 
      v-model="currentSpeed"
      :color="currentSpeed > 0 ? 'green' : currentSpeed < 0 ? 'red' : 'grey'"
      :thumb-label="true"
      :max="100" 
      :min="-100" 
      step="1" 
      ticks="always"
      tick-size="4" 
  />
    <v-card-actions>
      <v-btn 
        @click="$emit('consist')"
        :color="loco?.meta?.color || 'primary'" 
        icon="mdi-transit-connection-horizontal"
        variant="tonal"
      />
      <v-btn 
        @click="$emit('functions')"
        :color="loco?.meta?.color || 'primary'" 
        icon="mdi-train"
        variant="tonal"
      />
      <v-btn 
        @click="$emit('park')"
        :color="loco?.meta?.color || 'primary'" 
        icon="mdi-parking"
        variant="tonal"
      />
      <v-btn 
        @click="$emit('fullscreen')"
        :color="loco?.meta?.color || 'primary'" 
        icon="mdi-fullscreen"
        variant="tonal"
      />
    </v-card-actions>
  </v-card>
</template>