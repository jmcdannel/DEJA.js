<script setup lang="ts">
import { computed } from 'vue'
import type { DocumentData } from 'firebase/firestore'

interface Props {
  item: DocumentData
  isRunning: boolean,
}

const props = defineProps<Props>()
const emit = defineEmits<{
  edit: [item: DocumentData]
  delete: [item: DocumentData]
}>()
const state = defineModel('state', {
  type: Boolean
})

const deviceColor = computed(() => props.item?.color || 'primary')

</script>
<template>
  <v-card
    class="m-1 shadow-xl"
    :disabled="isRunning"
    :loading="isRunning"
  >
    <v-card-title class="flex flex-row items-center gap-4">
      <v-icon :icon="item?.icon || 'mdi-help'" :color="deviceColor" />
      <h4 class="text-md font-bold">{{ item?.name }}</h4>
      <v-spacer />
      <v-icon
        :icon="state ? 'mdi-circle' : 'mdi-circle-outline'"
        :color="state ? 'green' : 'grey'"
        size="small"
      />
    </v-card-title>
    <v-card-text class="text-sm">
      <p class="my-4">{{ item?.name }}</p>
      <div class="flex flex-wrap gap-2">
        <v-btn
          v-if="item?.device"
          size="small"
          variant="outlined"
          :color="deviceColor"
          prepend-icon="mdi-memory"
        >
          {{ item?.device }}
        </v-btn>
        <v-chip
          v-if="item?.type"
          class="text-xs"
          prepend-icon="mdi-electric-switch"
          variant="outlined"
        >
          {{ item?.type }}
        </v-chip>
        <v-chip
          v-for="tag in item?.tags"
          :key="tag"
          class="text-xs"
          prepend-icon="mdi-tag"
          variant="outlined"
        >
          {{ tag }}
        </v-chip>
        <v-chip
          v-if="item?.allowGuest"
          class="text-xs"
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
        :color="deviceColor"
        :disabled="isRunning"
        :loading="isRunning"
        hide-details
      />
    </v-card-actions>
    <v-divider />
    <div class="flex justify-between pa-1" style="background: rgba(var(--v-theme-on-surface), 0.04)">
      <v-btn
        icon="mdi-delete-outline"
        variant="text"
        color="error"
        size="small"
        @click="emit('delete', item)"
      />
      <v-btn
        icon="mdi-pencil-outline"
        variant="text"
        :color="deviceColor"
        size="small"
        @click="emit('edit', item)"
      />
    </div>
  </v-card>
</template>