<script setup lang="ts">
import { ref, type PropType } from 'vue'
import type { Loco, Throttle } from './types';
import FunctionList from '@/functions/FunctionList.vue'

defineProps({
  throttle: {
    type: Object as PropType<Throttle>,
    required: true
  },
  loco: {
    type: Object as PropType<Loco>,
    required: false
  },
  size: {
    type: Number,
    default: 72
  },
  variant: {
    type: String as PropType<'text' | 'flat' | 'elevated' | 'tonal' | 'outlined' | 'plain'>,
    default: 'tonal'
  },
})

const emit = defineEmits(['release', 'change', 'select'])

const isOpen = ref(false)
const functionsCmp = ref<InstanceType<typeof FunctionList> | null>(null)

function openFunctions() {
  functionsCmp.value && functionsCmp.value.showModal()
}
  
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
            class="text-xl"
            :color="loco?.meta?.color || 'primary'"
            :size="size"
            :variant="variant"
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
    <FunctionList v-if="loco" :loco="loco" ref="functionsCmp" />
  </div>
</template>