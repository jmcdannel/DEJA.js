<script setup lang="ts">
  import { ref, watch, type PropType } from 'vue'
  import type { Loco, Throttle } from './types';
  import FunctionList from '@/functions/FunctionList.vue'
  import { useThrottle } from './useThrottle'

  const props = defineProps({
    throttle: {
      type: Object as PropType<Throttle>,
      required: true
    },
    loco: {
      type: Object as PropType<Loco>,
      required: false
    }
  })

  const emit = defineEmits(['release', 'change', 'select'])

  const { updateSpeed } = useThrottle()

  const isOpen = ref(false)
  const functionsCmp = ref(null)
  const containerRef = ref<HTMLElement | null>(null)
  const currentSpeed = ref(props.throttle?.speed || 0)

  watch(currentSpeed, sendLocoSpeed)

  async function handleStop() {
    currentSpeed.value = 0
  }

  async function clearLoco() {
    console.log('clearLoco', props.throttle)
    await handleStop()
    emit('release', props.throttle?.address)
  }

  async function sendLocoSpeed(newSpeed:number, oldSpeed:number) {
    console.log('sendLocoSpeed', { newSpeed, oldSpeed }, props.throttle?.address, props.throttle)
    updateSpeed(props.throttle?.address, props.loco?.consist || [], newSpeed, oldSpeed)
  }

  function openFunctions() {
    functionsCmp.value && functionsCmp.value.showModal()
  }

  function openThrottle() {
    emit('select', props.throttle?.address)
  }

  // function openFunctionSettings() {
  //   functionsCmp.value && functionsCmp.value.openSettings()
  // }
  
</script>
<template>
  <div class="relative" v-if="loco">
    <v-speed-dial
      v-model="isOpen"
      location="left center"
      transition="fade-transition"
      :color="loco?.meta?.color || 'primary'"
      contained
      >
      <template v-slot:activator="{ props: activatorProps }">
        <v-badge 
          :color="'primary'" 
          :content="loco?.consist?.length || 0"        
          offset-x="4"
          offset-y="4">
          <v-btn 
            v-bind="activatorProps" 
            rounded="circle"
            variant="flat"
            class="text-xl text-2xl"
            :color="loco?.meta?.color || 'primary'"
            :size="'x-small'"
            stacked>
              {{throttle.address.toString()}}
          </v-btn>
        </v-badge>
      </template>

      <v-btn key="1" :color="loco?.meta?.color || 'primary'" icon="mdi-parking" @click="clearLoco"></v-btn>
      <v-btn key="2" :color="loco?.meta?.color || 'primary'" icon="mdi-train" @click="openFunctions"></v-btn>
      <v-btn key="3" :color="loco?.meta?.color || 'primary'" icon="mdi-fullscreen" @click="openThrottle"></v-btn>
      <v-btn key="4" :color="loco?.meta?.color || 'primary'" icon="$error"></v-btn>
    </v-speed-dial>
    <!-- <v-overlay
      :model-value="isOpen"
      class="align-center justify-center"
      scrim="#036358"
      contained
      ></v-overlay> -->
    <FunctionList v-if="loco" :loco="loco" ref="functionsCmp" />
  </div>
</template>