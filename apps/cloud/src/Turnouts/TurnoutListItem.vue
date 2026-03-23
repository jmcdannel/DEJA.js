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
    class="mx-auto w-full h-full justify-between flex flex-col"
    density="compact"
  >
    <v-card-item>
      <v-card-title class="font-weight-black flex flex-nowrap items-center gap-3 !overflow-visible">
        <v-icon class="drag-handle cursor-grab active:cursor-grabbing opacity-40 hover:opacity-100 flex-shrink-0" size="small">mdi-drag</v-icon>
        <router-link :to="{ name: 'Edit Turnout', params: { turnoutId } }" class="flex items-center gap-3 min-w-0 cursor-pointer hover:opacity-80 transition-opacity">
          <v-icon
            :icon="turnout?.type === 'servo' ? 'mdi-call-split' : 'mdi-directions-fork'"
            :color="turnout?.color || 'yellow'"
            class="flex-shrink-0"
          />
          <span class="truncate">{{ turnout?.name }}</span>
        </router-link>
        <v-spacer />
        <v-switch
          v-model="internalState"
          @change="handleSwitch"
          :color="turnout?.color || 'yellow'"
          hide-details
          density="compact"
          class="flex-shrink-0"
        />
      </v-card-title>
      <v-card-subtitle v-if="turnout?.desc" class="text-md">
        {{ turnout?.desc }}
      </v-card-subtitle>
    </v-card-item>
    <v-card-text class="min-h-8 flex py-2">
      <div class="flex justify-between w-full items-start">
        <v-chip-group column>
          <v-chip
            size="small"
            variant="outlined"
            prepend-icon="mdi-directions-fork"
          >{{ turnout?.type || 'Turnout' }}</v-chip>
          <v-chip v-for="tag in turnout?.tags" :key="tag"
            size="small"
            variant="outlined"
            prepend-icon="mdi-tag"
          >
            {{ tag }}
          </v-chip>
        </v-chip-group>
        <v-btn
          v-if="turnout?.device"
          size="small"
          variant="outlined"
          :color="turnout?.color || 'yellow'"
          prepend-icon="mdi-memory"
        >
          {{ turnout?.device }}
        </v-btn>
      </div>
    </v-card-text>
    <v-spacer />
    <v-divider />
    <div class="flex justify-between pa-1" style="background: rgba(var(--v-theme-on-surface), 0.04)">
      <v-btn
        icon="mdi-delete-outline"
        variant="text"
        color="error"
        size="small"
        disabled
      />
      <v-btn
        icon="mdi-pencil-outline"
        variant="text"
        :color="turnout?.color || 'yellow'"
        size="small"
        @click="$emit('edit', turnout)"
      />
    </div>
  </v-card>
</template>
