<script lang="ts" setup>
import { LocoAvatar } from '@repo/ui'
import { useThrottle } from './useThrottle'

const emit = defineEmits(['select'])
const props = defineProps({
  address: {
    type: Number,
    required: true
  }
})

import { toRef } from 'vue'

const addressRef = toRef(props, 'address')
const { 
  loco,
} = useThrottle(addressRef)

</script>

<template>
  <LocoAvatar 
    class="pa-2"
    v-if="loco" 
    :loco="loco" 
    :size="48" 
    @select="emit('select', loco.address)"
    />
</template>
