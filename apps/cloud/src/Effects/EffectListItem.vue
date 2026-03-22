<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEfx, efxTypes } from '@repo/modules'
import { createLogger } from '@repo/utils'
import { useColors } from '@/Core/UI/useColors'

const log = createLogger('EffectListItem')

const { DEFAULT_COLOR } = useColors()
const { runEffect, deleteEfx } = useEfx()

const props = defineProps({
  efx: Object,
  efxId: String,
})

const confirmDelete = ref(false)
const internalState = ref(props.efx?.state ?? false)

const efxType = computed(() => efxTypes.find((type) => type.value === props?.efx?.type))
const color = ref(props.efx?.color || efxType.value?.color || DEFAULT_COLOR)

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const parts = []
  if (h > 0) {
    parts.push(`${h}h`)
  }
  if (m > 0) {
    parts.push(`${m}m`)
  }
  if (s > 0 || parts.length === 0) {
    parts.push(`${s}s`)
  }
  return parts.join('')
}

async function handleEfx () {
  log.debug('handleEfx', props.efx, props.efx?.id, internalState.value)
  props?.efx && props?.efxId && await runEffect({
      ...props.efx,
      id: props.efxId,
      type: props.efx.type || '',
      state: internalState.value
  })
}

</script>
<template>
  <v-card
    class="mx-auto w-full h-full justify-between flex flex-col"
    density="compact"
  >
    <v-card-title class="flex flex-nowrap items-center gap-3 !overflow-visible">
      <router-link :to="{ name: 'Edit Effect', params: { effectId: efxId } }" class="flex items-center gap-3 min-w-0 cursor-pointer hover:opacity-80 transition-opacity">
        <v-tooltip :text="efxId" location="top">
          <template #activator="{ props: tooltipProps }">
            <v-icon :icon="efxType?.icon || 'mdi-help'" :color="color" v-bind="tooltipProps" class="flex-shrink-0" />
          </template>
        </v-tooltip>
        <span class="truncate">{{ efx?.name }}</span>
      </router-link>
      <v-spacer />
      <v-icon
        v-if="efx?.allowGuest"
        icon="mdi-account-check"
        color="success"
        size="small"
        class="flex-shrink-0"
      />
      <v-switch
        v-model="internalState"
        hide-details
        density="compact"
        :color="color"
        @change="handleEfx"
        class="flex-shrink-0"
      />
    </v-card-title>
    <v-card-text class="min-h-8 flex py-2">
      <div class="flex justify-between w-full items-start">
        <v-chip-group column>
          <v-chip
            size="small"
            variant="outlined"
          >{{ efxType?.label || 'Effect' }}</v-chip>

          <v-chip
            v-if="efx?.duration"
            size="small"
            variant="outlined"
            prepend-icon="mdi-timer-outline"
          >
            {{ formatDuration(efx.duration) }}
          </v-chip>
        </v-chip-group>
        <v-btn
          v-if="efx?.device"
          size="small"
          variant="outlined"
          :color="color"
          prepend-icon="mdi-memory"
        >
          {{ efx?.device }}
        </v-btn>
      </div>
    </v-card-text>
    <v-spacer />
    <v-divider />
    <div class="flex items-center pa-1" style="background: rgba(var(--v-theme-on-surface), 0.04)">
      <v-btn
        v-if="!confirmDelete"
        icon="mdi-delete-outline"
        variant="text"
        color="error"
        size="small"
        @click="confirmDelete = true"
      />
      <template v-else>
        <v-btn
          text="Cancel"
          variant="outlined"
          size="small"
          @click="confirmDelete = false"
        />
        <v-btn
          text="Confirm"
          variant="tonal"
          color="error"
          size="small"
          prepend-icon="mdi-delete"
          @click="deleteEfx(efx?.id)"
        />
      </template>
      <v-spacer />
      <v-btn
        icon="mdi-pencil-outline"
        variant="text"
        :color="color"
        size="small"
        @click="$emit('edit', efx)"
      />
    </div>
  </v-card>
</template>
