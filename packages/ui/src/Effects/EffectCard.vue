<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEfx, efxTypes, type Effect } from '@repo/modules'
import PlaySound from './PlaySound.vue'

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
  <v-card 
    class="m-1 shadow-xl"
    :color="effect?.color || 'primary'"
    :disabled="isRunning"
    :loading="isRunning"
    variant="tonal"
  >
    <v-card-title class="flex flex-row items-center gap-4">
      <v-icon :icon="efxType?.icon || 'mdi-help'"></v-icon>
      <h4 class="text-md font-bold">{{effect?.name}}</h4>
    </v-card-title>
    <v-card-text class="text-sm">
      <p class="my-4">{{effect?.name}}</p>
      <div class="flex flex-wrap gap-2">
        <v-chip 
          v-if="effect?.device" 
          class="ml-2 text-xs"
          prepend-icon="mdi-memory"
          variant="outlined"
        >
          {{effect?.device}}
        </v-chip>
        <v-chip 
          v-if="effect?.type" 
          class="ml-2 text-xs"
          prepend-icon="mdi-electric-switch"
          variant="outlined"
        >
          {{effect?.type}}
        </v-chip>
        <v-chip 
          v-for="tag in effect?.tags" 
          :key="tag" 
          class="ml-2 text-xs"
          prepend-icon="mdi-tag"
          variant="outlined"
        >
          {{tag}}
        </v-chip>
        <v-chip 
          v-if="effect?.allowGuest" 
          class="ml-2 text-xs"
          prepend-icon="mdi-account-check"
          variant="outlined"
          color="success"
        >
          Guest Access
        </v-chip>
      </div>
    </v-card-text>
    <v-card-actions class="flex justify-end">
      <PlaySound v-if="effect?.type === 'sound'" :effect="effect" view-as="card" />
      <v-switch v-else
        v-model="state" 
        :color="effect?.color || 'primary'" 
        :disabled="isRunning" 
        :loading="isRunning" 
        hide-details 
      />    
    </v-card-actions>
  </v-card>
</template>