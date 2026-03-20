<script setup lang="ts">
import { ref } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useEfx } from '@repo/modules/effects'
import { useTurnouts, type Turnout } from '@repo/modules'

const { setTurnout } = useTurnouts()
const { runEffect, getEffect } = useEfx()

defineEmits(['edit'])

const props = defineProps<{
  state?: boolean
  turnout: Turnout
  turnoutId: string
}>()

const internalState = ref(props.state !== undefined ? props.state : props.turnout?.state)

async function handleSwitch() {
  await setTurnout(props.turnoutId, {...props.turnout, id: props.turnoutId, state: internalState.value })
}

</script>
<template>
  <v-card
    class="mx-auto w-full h-full justify-between flex flex-col bg-zinc-500 bg-opacity-20"
    variant="tonal"
    density="compact"
    :color="turnout?.color || 'yellow'"
  >
  <v-card-item class="font-weight-black py-1">
    <template #prepend>
      <v-icon class="drag-handle cursor-grab active:cursor-grabbing opacity-40 hover:opacity-100 mr-1" size="small">mdi-drag</v-icon>
    </template>
    <v-card-title class="font-weight-black text-sm flex items-center justify-between">
      {{ turnout?.name }}
      <v-switch
        v-model="internalState"
        @change="handleSwitch"
        :color="turnout?.color || 'yellow'"
        hide-details
        density="compact"
      ></v-switch>
    </v-card-title>
    <v-card-subtitle v-if="turnout?.desc" class="text-xs">
      {{ turnout?.desc }}
    </v-card-subtitle>
  </v-card-item>
    <v-card-text
      class="min-h-6 flex py-1 justify-space-between bg-blend-lighten bg-opacity-30"
      >
        <v-chip-group column>
          <v-chip
            size="x-small"
            prepend-icon="mdi-directions-fork"
          >{{ turnout?.type || 'Effect' }}</v-chip>
          <v-chip
            size="x-small"
            prepend-icon="mdi-memory"
          >
            {{ turnout?.device }}
          </v-chip>
          <v-chip v-for="tag in turnout?.tags" :key="tag"
            size="x-small"
            color="primary"
          >
            {{ tag }}
          </v-chip>
        </v-chip-group>
    </v-card-text>
    <v-card-actions class="py-1">
      <v-btn
        class="ma-1"
        icon="mdi-delete"
        variant="tonal"
        size="x-small"
        disabled
      ></v-btn>
      <v-spacer></v-spacer>

      <v-btn
        text="Edit"
        variant="tonal"
        prepend-icon="mdi-pencil"
        size="x-small"
        @click="$emit('edit', turnout)"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>
