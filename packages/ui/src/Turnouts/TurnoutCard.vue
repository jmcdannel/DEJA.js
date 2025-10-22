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

function handleSetTurnout(newState: boolean) {
  setTurnout(props.turnout.id, {
    ...props.turnout,
    state: newState
  })
  state.value = newState
}

</script>

<template>
  <v-card 
    class="m-1 shadow-xl"
    :color="turnout?.color || 'primary'"
    :disabled="isRunning"
    :loading="isRunning"
    variant="tonal"
  >
    <v-card-title class="flex flex-row items-center gap-4">
      <v-icon :icon="turnout?.type === 'servo' ? 'mdi-call-split' : 'mdi-electric-switch'" class="w-6 h-6" />
      <h4 class="text-md font-bold">{{turnout?.name}}</h4>
    </v-card-title>
    <v-card-text class="text-sm">
      <p class="my-4">{{turnout?.desc || turnout?.name}}</p>
      <div class="flex flex-wrap gap-2">
        <v-chip 
          v-if="turnout?.device" 
          class="ml-2 text-xs"
          prepend-icon="mdi-memory"
          variant="outlined"
        >
          {{turnout?.device}}
        </v-chip>
        <v-chip 
          v-if="turnout?.type" 
          class="ml-2 text-xs"
          prepend-icon="mdi-electric-switch"
          variant="outlined"
        >
          {{turnout?.type}}
        </v-chip>
        <v-chip 
          v-for="tag in turnout?.tags" 
          :key="tag" 
          class="ml-2 text-xs"
          prepend-icon="mdi-tag"
          variant="outlined"
        >
          {{tag}}
        </v-chip>
      </div>
    </v-card-text>
    <v-card-actions class="flex justify-end">
      <v-btn 
        :color="turnout?.color || 'primary'"
        :disabled="isRunning"
        :loading="isRunning"
        variant="tonal"
        @click="handleSetTurnout(true)"  
      >Set On</v-btn>
      <v-btn
        :color="turnout?.color || 'primary'"
        :disabled="isRunning"
        :loading="isRunning"
        variant="tonal"
        @click="handleSetTurnout(false)"
      >Set Off</v-btn>
      <v-switch 
        v-model="state" 
        :color="turnout?.color || 'primary'" 
        :disabled="isRunning" 
        :loading="isRunning" 
        label="Toggle Turnout"
        hide-details 
      />    
    </v-card-actions>
  </v-card>
</template> 