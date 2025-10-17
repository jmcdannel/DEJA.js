<script lang="ts" setup>
import { ref } from 'vue'
import { useLocos } from '@repo/modules/locos'
import ThrottleNavItem from './ThrottleNavItem.vue'
import { LocoAvatar } from '@repo/ui'

const emit = defineEmits(['select'])
const { getThrottles } = useLocos()
const throttles = getThrottles()

function handleSelect(address: number) {
  emit('select', address)
}
</script>

<template>
  <v-slide-group
      selected-class="bg-success"
      show-arrows
    >
    <v-slide-group-item 
      v-for="item in throttles"
      :key="item.id">
      <ThrottleNavItem :address="item.address" @select="handleSelect(item.address)" />
    </v-slide-group-item>
  </v-slide-group>
</template>
