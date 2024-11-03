<script setup lang="ts">
import { ref } from 'vue'
import { useLayout } from '@/api/useLayout'

defineEmits(['devices'])

const selectedDevices = ref([])
const { getDevices } = useLayout()
const devices = getDevices()
</script>
<template>
  <div class="flex flex-row">
    <div>
      <span>Device</span>
      <v-chip-group v-model="selectedDevices" @update:modelValue="$emit('devices', selectedDevices)" multiple column>
        <v-chip v-for="device in devices" :key="device.id" :value="device.id" color="pink" size="small">{{ device.id }}</v-chip>
      </v-chip-group>
    </div>
  </div>
</template>