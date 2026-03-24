<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTurnouts, type Turnout } from '@repo/modules'

const { setTurnout } = useTurnouts()

interface Props {
  turnout: Turnout,
  isRunning: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  edit: [turnout: Turnout]
  delete: [turnout: Turnout]
}>()
const state = defineModel('state', {
  type: Boolean
})

const deviceColor = computed(() => props.turnout?.color || 'primary')

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
    :disabled="isRunning"
    :loading="isRunning"
  >
    <v-card-title class="flex flex-row items-center gap-4">
      <v-icon :icon="turnout?.type === 'servo' ? 'mdi-call-split' : 'mdi-electric-switch'" :color="deviceColor" />
      <h4 class="text-md font-bold">{{ turnout?.name }}</h4>
      <v-spacer />
      <v-icon
        :icon="state ? 'mdi-circle' : 'mdi-circle-outline'"
        :color="state ? 'green' : 'grey'"
        size="small"
      />
    </v-card-title>
    <v-card-text class="text-sm">
      <p class="my-4">{{ turnout?.desc || turnout?.name }}</p>
      <div class="flex flex-wrap gap-2">
        <v-btn
          v-if="turnout?.device"
          size="small"
          variant="outlined"
          :color="deviceColor"
          prepend-icon="mdi-memory"
        >
          {{ turnout?.device }}
        </v-btn>
        <v-chip
          v-if="turnout?.type"
          class="text-xs"
          prepend-icon="mdi-electric-switch"
          variant="outlined"
        >
          {{ turnout?.type }}
        </v-chip>
        <v-chip
          v-for="tag in turnout?.tags"
          :key="tag"
          class="text-xs"
          prepend-icon="mdi-tag"
          variant="outlined"
        >
          {{ tag }}
        </v-chip>
      </div>
    </v-card-text>
    <v-card-actions class="flex justify-end">
      <v-btn
        :color="deviceColor"
        :disabled="isRunning"
        :loading="isRunning"
        variant="tonal"
        @click="handleSetTurnout(true)"
      >Set On</v-btn>
      <v-btn
        :color="deviceColor"
        :disabled="isRunning"
        :loading="isRunning"
        variant="tonal"
        @click="handleSetTurnout(false)"
      >Set Off</v-btn>
      <v-switch
        v-model="state"
        :color="deviceColor"
        :disabled="isRunning"
        :loading="isRunning"
        label="Toggle Turnout"
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
        @click="emit('delete', turnout)"
      />
      <v-btn
        icon="mdi-pencil-outline"
        variant="text"
        :color="deviceColor"
        size="small"
        @click="emit('edit', turnout)"
      />
    </div>
  </v-card>
</template> 