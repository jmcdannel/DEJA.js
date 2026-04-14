<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEfx, efxTypes, type Effect } from '@repo/modules'
import { createLogger } from '@repo/utils'
import { ListItemCard } from '@repo/ui'
import { useColors } from '@/Core/UI/useColors'

const log = createLogger('EffectListItem')

const { DEFAULT_COLOR } = useColors()
const { runEffect, deleteEfx } = useEfx()
const router = useRouter()

const emit = defineEmits<{
  edit: [effect: Effect]
}>()

function handleEdit() {
  if (props.efx) emit('edit', props.efx)
}

const props = defineProps<{
  efx?: Effect
  efxId?: string
}>()

const confirmDelete = ref(false)
const internalState = ref(props.efx?.state ?? false)

const efxType = computed(() => efxTypes.find((type) => type.value === props?.efx?.type))
const accentColor = computed(
  () => props.efx?.color || efxType.value?.color || DEFAULT_COLOR,
)
const icon = computed(() => efxType.value?.icon || 'mdi-help')

// `duration` is an optional untyped custom field used by some effects;
// cast locally so the template can safely read it without TS errors.
const durationSeconds = computed<number | undefined>(
  () => (props.efx as (Effect & { duration?: number }) | undefined)?.duration,
)

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const parts = []
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  if (s > 0 || parts.length === 0) parts.push(`${s}s`)
  return parts.join('')
}

async function handleEfx() {
  log.debug('handleEfx', props.efx, props.efx?.id, internalState.value)
  if (!props.efx || !props.efxId) return
  await runEffect({
    ...props.efx,
    id: props.efxId,
    type: props.efx.type || '',
    state: internalState.value,
  })
}

function goToEdit() {
  if (!props.efxId) return
  router.push({ name: 'Edit Effect', params: { effectId: props.efxId } })
}
</script>

<template>
  <ListItemCard
    :item-id="efxId"
    :device-id="efx?.device"
    :color="accentColor"
  >
    <template #header-leading>
      <v-avatar :color="accentColor" variant="tonal" size="32" rounded="lg">
        <v-icon :icon="icon" :color="accentColor" size="18" />
      </v-avatar>
    </template>

    <template #title>
      <button
        type="button"
        class="text-sm font-semibold text-[#f8fafc] truncate text-left hover:opacity-80 transition-opacity"
        @click="goToEdit"
      >
        {{ efx?.name || efxId }}
      </button>
    </template>

    <template #subtitle>
      {{ efxType?.label || efx?.type || 'effect' }}
    </template>

    <template #status>
      <v-icon
        v-if="efx?.allowGuest"
        icon="mdi-account-check"
        color="success"
        size="14"
        class="flex-shrink-0"
      />
      <v-switch
        v-model="internalState"
        hide-details
        density="compact"
        :color="accentColor"
        class="flex-shrink-0"
        @change="handleEfx"
      />
    </template>

    <div class="flex flex-wrap gap-1 items-center">
      <v-chip
        v-if="durationSeconds"
        size="x-small"
        variant="outlined"
        prepend-icon="mdi-timer-outline"
      >
        {{ formatDuration(durationSeconds) }}
      </v-chip>
      <v-chip
        v-for="tag in efx?.tags"
        :key="tag"
        size="x-small"
        variant="outlined"
        prepend-icon="mdi-tag"
      >
        {{ tag }}
      </v-chip>
    </div>

    <template #footer>
      <template v-if="confirmDelete">
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
          @click="deleteEfx(efx?.id ?? '')"
        />
      </template>
      <v-btn
        v-else
        icon="mdi-delete-outline"
        variant="text"
        color="error"
        size="small"
        @click="confirmDelete = true"
      />
      <v-spacer />
      <v-btn
        icon="mdi-pencil-outline"
        variant="text"
        :color="accentColor"
        size="small"
        @click="handleEdit"
      />
    </template>
  </ListItemCard>
</template>
