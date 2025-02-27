<script setup lang="ts">
  import { ref, watch, type PropType } from 'vue'

  import ThrottleButtonControls from './ThrottleButtonControls.component.vue'
  import CurrentSpeed from './CurrentSpeed.vue'
  import type { Loco, Throttle } from './types';
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

  const { updateSpeed, releaseThrottle } = useThrottle()
  function getSignedSpeed({speed, direction}: Throttle) {
    return speed && !!direction ? speed : -speed || 0
  }

  const currentSpeed = ref(getSignedSpeed(props.throttle))

  watch(currentSpeed, sendLocoSpeed)

  async function handleStop() {
    currentSpeed.value = 0
  }

  function adjustSpeed(val: number): void { // handle incremental speed changes
    currentSpeed.value = currentSpeed.value + val
  }

  async function sendLocoSpeed(newSpeed:number, oldSpeed:number) {
    console.log('sendLocoSpeed', { newSpeed, oldSpeed }, props.throttle?.address, props.throttle)
    updateSpeed(props.throttle?.address, props?.loco?.consist, newSpeed, oldSpeed)
  }
  
</script>
<template>
  <v-card>
    <v-card-title class="flex items-center justify-between">
      <v-avatar 
        :color="loco?.meta?.color || 'primary'" 
        class="mr-2" 
        @click="$emit('fullscreen')" 
        :text="loco.locoId.toString()"/>
      <span>
        {{ loco.name }}
      </span>
      <CurrentSpeed :speed="currentSpeed" />
    </v-card-title>
    <v-card-text>
      <ThrottleButtonControls :speed="currentSpeed" @update:currentSpeed="adjustSpeed" @stop="handleStop" horizontal class=""  />
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
    </v-card-actions>
  </v-card>
</template>