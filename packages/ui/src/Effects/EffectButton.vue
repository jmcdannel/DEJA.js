<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEfx, efxTypes, type Effect } from '@repo/modules'

const { runEffect } = useEfx()

interface Props {
  effect: Effect,
  isRunning: boolean,
}

const props = defineProps<Props>()
const state = defineModel('state', {
  type: Boolean
})
const efxType = computed(() => efxTypes.find((type) => type.value === props?.effect?.type))

</script>

<template>
  <v-btn 
    class="m-1"
    :color="effect?.color || 'primary'"
    :disabled="isRunning"
    :loading="isRunning"
    variant="tonal"
    @click="state = !state"
  >
    <template #prepend>
      <v-icon :icon="efxType?.icon || 'mdi-help'"></v-icon>
    </template>
    {{effect?.name}}
    <template #append>
      <v-icon icon="mdi-circle" :color="state ? 'green' : 'red'" class="w-4 h-4"></v-icon>
    </template>
  </v-btn>
</template>