<script setup lang="ts">
import { ref } from 'vue'
import type { PropType } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useTurnouts, type Turnout } from '@repo/modules/turnouts'

const { switchTurnout } = useTurnouts()

const props = defineProps({
  turnout: Object,
  turnoutId: String,
  viewAs: {
    type: String as PropType<'switch' | 'card' | 'button' | 'table' | 'raw'>,
    default: () => 'list'
  }
})

const state = ref(props.turnout?.state)
const isRunning = ref(false)

async function handleTurnouts (event: Event) {
  const { isPending } = useTimeoutFn(() => {
    isRunning.value = false
  }, 3000)
  isRunning.value = isPending.value
  const target = event.target as HTMLInputElement;
  console.log('handleTurnouts', target.checked, props.turnoutId, props.turnout)
  if (props.turnoutId && props.turnout) {
    await switchTurnout(props.turnout as Turnout)
  }
}

</script>
<template>
  <template v-if="viewAs === 'switch'">
    <v-card 
      class="shadow-xl my-1 p-[1px] rounded-full"
      :class="isRunning ? 'bg-gradient-to-r from-indigo-400 to-pink-900 ' : ''"
      :color="turnout?.color || 'primary'"
      >
      <v-card-title 
        class="flex flex-row items-center gap-4 justify-between rounded-full px-2 bg-gray-900 bg-opacity-40"
        :class="isRunning ? 'shadow-inner shadow-pink-500 bg-opacity-80' : 'bg-opacity-95'"
        >
        <v-icon icon="mdi-call-split" class="w-6 h-6" />
        <h4 class="text-md font-bold mr-2">{{turnout?.name}}</h4>
        <v-switch v-model="state" @change="handleTurnouts" :color="turnout?.color || 'primary'" :disabled="isRunning" :loading="isRunning" hide-details />    
      </v-card-title>
    </v-card>
  </template>
  <template v-else-if="viewAs === 'card'">
    <v-card 
      class="m-1 shadow-xl"
      :color="turnout?.color || 'primary'"
      :disabled="isRunning"
      :loading="isRunning"
      variant="tonal"
      @click="handleTurnouts">
      <v-card-title class="flex flex-row items-center gap-4" >
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
            variant="outlined">
            {{turnout?.device}}
          </v-chip>
          <v-chip 
            v-if="turnout?.type" 
            class="ml-2 text-xs"
            prepend-icon="mdi-electric-switch"
            variant="outlined">
            {{turnout?.type}}
          </v-chip>
          <v-chip v-for="tag in turnout?.tags" 
            :key="tag" 
            class="ml-2 text-xs"
            prepend-icon="mdi-tag"
            variant="outlined">
            {{tag}}
          </v-chip>
        </div>
      </v-card-text>
      <v-card-actions class="flex justify-end">
        <v-switch v-model="state" @change="handleTurnouts" :color="turnout?.color || 'primary'" :disabled="isRunning" :loading="isRunning" hide-details />    
      </v-card-actions>
    </v-card>
  </template>
  <template v-else-if="viewAs === 'button'">
    <v-btn 
      class="m-1"
      :color="turnout?.color || 'primary'"
      :disabled="isRunning"
      :loading="isRunning"
      variant="tonal"
      @click="handleTurnouts">
      <template #prepend>
        <v-icon icon="mdi-call-split" class="w-6 h-6" />
      </template>
      {{turnout?.name}}
    </v-btn>
  </template>
  <template v-else-if="viewAs === 'raw'">
    <pre class="m-1 p-2 rounded-lg text-sm">
{{ JSON.stringify(turnout, null, 2) }}
    </pre>
  </template>
</template>
