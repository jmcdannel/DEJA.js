<script lang="ts" setup>
import { type PropType } from 'vue'
import type { Loco } from '@repo/modules/locos'

defineProps({
  loco: {
    type: Object as PropType<Loco>,
    required: true
  }
  ,
  selectedAddress: {
    type: Number as PropType<number | null>,
    required: false,
    default: null
  }
})

const emit = defineEmits<{
  (e: 'select', loco: Loco): void
}>()

const opacityClasses: { [key: number]: string } = {
  10: 'opacity-10',
  20: 'opacity-20',
  30: 'opacity-30',
  40: 'opacity-40',
  50: 'opacity-50',
  60: 'opacity-60',
  70: 'opacity-70',
  80: 'opacity-80',
  90: 'opacity-90',
  100: 'opacity-100',
}

const leftOffsetClasses: { [key: number]: string } = {
  0: 'left-0',
  2: 'left-2',
  4: 'left-4',
  6: 'left-6',
  8: 'left-8',
  10: 'left-10',
  12: 'left-12',
  14: 'left-14',
  16: 'left-16',
  18: 'left-18',
  20: 'left-20'
}

</script>
<template>
  <div 
    class="hidden sm:flex relative align-middle items-center ml-2"> 
    <v-avatar
      v-if="loco?.consist?.length" 
      v-for="(cloco, index) in loco?.consist" 
      :key="cloco.address"
      :class="`${leftOffsetClasses[index * 2] || 'left-22'} ${opacityClasses[80-(index+1) * 10] || 'opacity-20'} cursor-pointer ${cloco.address === selectedAddress ? 'ring-2 ring-offset-1 ring-primary' : ''}`"
      :color="loco?.meta?.color || 'primary'"
      size="28"      
      variant="flat"
      @click="emit('select', cloco)"
    ><span class="text-xs">{{ cloco.address?.toString() || '?' }}</span></v-avatar>
  </div>
</template>