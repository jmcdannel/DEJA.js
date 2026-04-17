<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTurnouts, type Turnout } from '@repo/modules'
import { ListItemCard } from '@repo/ui'
import { createLogger } from '@repo/utils'

const log = createLogger('TurnoutListItem')

const { setTurnout, deleteTurnout } = useTurnouts()
const router = useRouter()

defineEmits(['edit', 'delete'])

const props = defineProps<{
  state?: boolean
  turnout: Turnout
  turnoutId: string
}>()

const internalState = ref(
  props.state !== undefined ? props.state : props.turnout?.state,
)
const confirmDelete = ref(false)

const accentColor = computed(() => props.turnout?.color || 'amber')
const icon = computed(() =>
  props.turnout?.type === 'servo' ? 'mdi-call-split' : 'mdi-directions-fork',
)

async function handleSwitch() {
  await setTurnout(props.turnoutId, {
    ...props.turnout,
    id: props.turnoutId,
    state: internalState.value,
  })
}

async function handleDelete() {
  log.debug('handleDelete', props.turnoutId)
  if (!props.turnoutId) {
    log.error('No turnout ID provided for deletion')
    return
  }
  await deleteTurnout(props.turnoutId)
  confirmDelete.value = false
}

function goToEdit() {
  router.push({ name: 'Edit Turnout', params: { turnoutId: props.turnoutId } })
}
</script>

<template>
  <ListItemCard
    :item-id="turnoutId"
    :device-id="turnout?.device"
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
        {{ turnout?.name || turnoutId }}
      </button>
    </template>

    <template #subtitle>
      {{ turnout?.type || 'turnout' }}
    </template>

    <template #status>
      <v-switch
        v-model="internalState"
        :color="accentColor"
        hide-details
        density="compact"
        class="flex-shrink-0"
        @change="handleSwitch"
      />
    </template>

    <div v-if="turnout?.desc" class="text-xs text-slate-400">
      {{ turnout.desc }}
    </div>

    <div v-if="(turnout?.tags?.length ?? 0) > 0" class="flex flex-wrap gap-1">
      <v-chip
        v-for="tag in turnout?.tags"
        :key="tag"
        class="text-xs"
        prepend-icon="mdi-tag"
        variant="outlined"
        size="x-small"
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
          @click="handleDelete"
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
        @click="$emit('edit', turnout)"
      />
    </template>
  </ListItemCard>
</template>
