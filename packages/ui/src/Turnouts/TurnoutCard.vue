<script setup lang="ts">
import { ref } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useTurnouts, type Turnout } from '@repo/modules/turnouts'

const { switchTurnout } = useTurnouts()

interface Props {
  turnout: Turnout
  turnoutId?: string
}

const props = defineProps<Props>()

const state = ref(props.turnout?.state)
const isRunning = ref(false)

async function handleTurnouts(event: Event) {
  const { isPending } = useTimeoutFn(() => {
    isRunning.value = false
  }, 3000)
  isRunning.value = isPending.value
  await switchTurnout({...props.turnout, id: props.turnoutId || props.turnout.id, state: state.value})
}
</script>

<template>
  <v-card 
    class="m-1 shadow-xl"
    :color="turnout?.color || 'primary'"
    :disabled="isRunning"
    :loading="isRunning"
    variant="tonal"
    @click="handleTurnouts"
  >
    <v-card-title class="flex flex-row items-center gap-4">
      <v-icon icon="mdi-call-split" class="w-6 h-6" />
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
      <v-switch 
        v-model="state" 
        @change="handleTurnouts" 
        :color="turnout?.color || 'primary'" 
        :disabled="isRunning" 
        :loading="isRunning" 
        hide-details 
      />    
    </v-card-actions>
  </v-card>
</template> 