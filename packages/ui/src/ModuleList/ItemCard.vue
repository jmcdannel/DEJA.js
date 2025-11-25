<script setup lang="ts">
import type { DocumentData } from 'firebase/firestore'

interface Props {
  item: DocumentData
  isRunning: boolean,
}

defineProps<Props>()
const state = defineModel('state', {
  type: Boolean
})

</script>
<template>
  <v-card 
    class="m-1 shadow-xl"
    :color="item?.color || 'primary'"
    :disabled="isRunning"
    :loading="isRunning"
    variant="tonal"
  >
    <v-card-title class="flex flex-row items-center gap-4">
      <v-icon :icon="item?.icon || 'mdi-help'"></v-icon>
      <h4 class="text-md font-bold">{{item?.name}}</h4>
    </v-card-title>
    <v-card-text class="text-sm">
      <p class="my-4">{{item?.name}}</p>
      <div class="flex flex-wrap gap-2">
        <v-chip 
          v-if="item?.device" 
          class="ml-2 text-xs"
          prepend-icon="mdi-memory"
          variant="outlined"
        >
          {{item?.device}}
        </v-chip>
        <v-chip 
          v-if="item?.type" 
          class="ml-2 text-xs"
          prepend-icon="mdi-electric-switch"
          variant="outlined"
        >
          {{item?.type}}
        </v-chip>
        <v-chip 
          v-for="tag in item?.tags" 
          :key="tag" 
          class="ml-2 text-xs"
          prepend-icon="mdi-tag"
          variant="outlined"
        >
          {{tag}}
        </v-chip>
        <v-chip 
          v-if="item?.allowGuest" 
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
      <v-switch 
        v-model="state" 
        :color="item?.color || 'primary'" 
        :disabled="isRunning" 
        :loading="isRunning" 
        hide-details 
      />    
    </v-card-actions>
  </v-card>
</template>