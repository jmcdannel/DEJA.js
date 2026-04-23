<script setup lang="ts">
import TypePickerGrid, { type TypeOption } from '@/Core/UI/TypePickerGrid.vue'

defineEmits(['select', 'cancel'])
const model = defineModel<string>()

defineProps({
  color: String
})

const types: TypeOption[] = [
  {
    value: 'kato',
    label: 'Kato',
    icon: 'mdi-directions-fork',
    color: 'yellow',
    description: 'Snap-action solenoid',
  },
  {
    value: 'servo',
    label: 'Servo',
    icon: 'mdi-rotate-right',
    color: 'blue',
    description: 'Servo motor control',
  },
  {
    value: 'tortise',
    label: 'Tortise',
    icon: 'mdi-swap-horizontal',
    color: 'green',
    description: 'Slow-motion machine',
    disabled: true,
  },
  {
    value: 'dcc',
    label: 'DCC',
    icon: 'mdi-chip',
    color: 'indigo',
    description: 'DCC accessory decoder',
    disabled: true,
  },
]
</script>

<template>
  <v-card class="mx-auto w-full h-full justify-between flex flex-col" color="surface">
    <v-card-item>
      <v-card-title>Turnout Type</v-card-title>
      <v-card-subtitle>Select the turnout mechanism</v-card-subtitle>
    </v-card-item>

    <v-card-text>
      <TypePickerGrid v-model="model" :options="types" />
    </v-card-text>

    <v-card-actions>
      <v-btn prepend-icon="mdi-cancel" variant="outlined" @click="$emit('cancel')">
        Cancel
      </v-btn>
      <v-spacer />
      <v-btn prepend-icon="mdi-check" color="primary" variant="flat" @click="$emit('select')">
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
