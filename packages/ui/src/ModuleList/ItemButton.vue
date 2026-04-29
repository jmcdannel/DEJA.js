<script setup lang="ts">
import type { DocumentData } from 'firebase/firestore'
import { useHaptics } from '../composables/useHaptics'

interface Props {
  item: DocumentData
  isRunning: boolean,
}

defineProps<Props>()
const state = defineModel('state', {
  type: Boolean
})
const { vibrate } = useHaptics()

</script>
<template>
    <v-btn 
        class="m-1 w-full flex justify-between"
        :color="item?.color || 'primary'"
        :disabled="isRunning"
        :loading="isRunning"
        variant="tonal"
        @click="state = !state; vibrate('light')"
        :prepend-icon="item?.icon || 'mdi-help'"
    >
        {{item?.name}}
        <template #append>
            <v-icon icon="mdi-circle" :color="state ? 'green' : 'red'" class="w-4 h-4"></v-icon>
        </template>
  </v-btn>
</template>