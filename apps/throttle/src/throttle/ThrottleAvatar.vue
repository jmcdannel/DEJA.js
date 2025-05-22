<script setup lang="ts">
  import { ref, type PropType } from 'vue'
  import type { Loco, Throttle } from './types';
  import FunctionList from '@/functions/FunctionList.vue'

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

  const isOpen = ref(false)
  const functionsCmp = ref(null)

  async function clearLoco() {
    emit('release', props.throttle?.address)
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

      <v-btn key="1" :color="loco?.meta?.color || 'primary'" icon="mdi-parking" @click="$emit('release', throttle.address)"></v-btn>
      <v-btn key="2" :color="loco?.meta?.color || 'primary'" icon="mdi-train" @click="openFunctions"></v-btn>
      <v-btn key="3" :color="loco?.meta?.color || 'primary'" icon="mdi-fullscreen" @click="$emit('select', throttle.address)"></v-btn>
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