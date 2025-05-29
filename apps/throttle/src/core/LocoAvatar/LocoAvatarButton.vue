<script setup lang="ts">
import { type PropType } from 'vue'
import type { Loco } from '@repo/modules/locos'
defineEmits(['select'])
defineProps({
  loco: {
    type: Object as PropType<Loco>,
    required: true
  },
  size: {
    type: Number,
    default: 72
  },
  color: {
    type: String,
    default: 'primary'
  },
  showConsist: {
    type: Boolean,
    default: true
  },
  variant: {
    type: String as PropType<'text' | 'flat' | 'elevated' | 'tonal' | 'outlined' | 'plain'>,
    default: 'tonal'
  }
})
</script>
<template>
  <v-badge v-if="loco?.consist?.length && showConsist" 
    color="primary"
    :content="loco?.consist?.length || 0"
    offset-x="5"
    offset-y="5"
    >
    <v-btn
      :color="loco?.meta?.color || color"
      rounded="circle"
      :size="size"
      stacked
      :text="loco.address?.toString() || '?'"
      :variant="variant"
      @select="$emit('select', loco.address)"
    />
  </v-badge>
  <v-btn v-else
    :color="loco?.meta?.color || color"
    rounded="circle"
    :size="size"
    stacked
    :text="loco.address?.toString() || '?'"
    :variant="variant"
    @select="$emit('select', loco.address)"
  />  
</template>