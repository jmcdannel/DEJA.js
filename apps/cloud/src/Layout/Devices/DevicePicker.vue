<script setup lang="ts">
import { useLayout } from '@repo/modules'
import { DevicePickerGrid } from '@repo/ui'

defineProps<{ color?: string }>()
defineEmits(['select', 'cancel'])

const model = defineModel<string>()
const { getDevices } = useLayout()
const devices = getDevices()
</script>

<template>
  <v-card
    class="mx-auto w-full h-full flex flex-col"
    variant="tonal"
    density="compact"
    :color="color"
  >
    <v-card-item>
      <v-card-title class="font-weight-black">Select Device</v-card-title>
      <v-card-subtitle>Pick the hardware this item is attached to</v-card-subtitle>
    </v-card-item>

    <v-card-text>
      <DevicePickerGrid
        v-model="model"
        :devices="(devices ?? []) as []"
      />
    </v-card-text>

    <v-card-actions>
      <v-btn prepend-icon="mdi-cancel" variant="outlined" @click="$emit('cancel')">
        Cancel
      </v-btn>
      <v-spacer />
      <v-btn
        prepend-icon="mdi-check"
        :color="color || 'primary'"
        variant="flat"
        :disabled="!model"
        @click="$emit('select')"
      >
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
