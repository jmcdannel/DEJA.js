<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTurnouts, type Turnout } from '@repo/modules'

const { setTurnout } = useTurnouts()

interface Props {
  turnout: Turnout,
  isRunning: boolean
}

const props = defineProps<Props>()
const state = defineModel('state', {
  type: Boolean
})

</script>

<template>
  <v-btn 
    class="w-full"
    :color="turnout?.color || 'primary'"
    :disabled="isRunning"
    :loading="isRunning"
    variant="tonal"
    @click="state = !state"  
  >
    <template #prepend>
      <v-icon icon="mdi-call-split" class="w-6 h-6" />
    </template>
    {{turnout?.name}}
    <template #append>
      <v-icon icon="mdi-circle" :color="state ? 'green' : 'red'" class="w-4 h-4"></v-icon>
    </template>
  </v-btn>
</template> 