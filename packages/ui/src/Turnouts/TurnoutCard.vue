<script setup lang="ts">
import { computed } from 'vue'
import { useTurnouts, type Turnout } from '@repo/modules'
import ListItemCard from '../DeviceConfig/ListItemCard.vue'

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

const accentColor = computed(() => props.turnout?.color || 'amber')
const icon = computed(() =>
  props.turnout?.type === 'servo' ? 'mdi-call-split' : 'mdi-electric-switch',
)

function handleSetTurnout(newState: boolean) {
  setTurnout(props.turnout.id, {
    ...props.turnout,
    state: newState
  })
  state.value = newState
}
</script>

<template>
  <ListItemCard
    :item-id="turnout?.id"
    :device-id="turnout?.device"
    :color="accentColor"
    :loading="isRunning"
    :disabled="isRunning"
  >
    <template #header-leading>
      <v-avatar :color="accentColor" variant="tonal" size="32" rounded="lg">
        <v-icon :icon="icon" :color="accentColor" size="18" />
      </v-avatar>
    </template>

    <template #title>
      <span class="text-sm font-semibold text-[#f8fafc] truncate">
        {{ turnout?.name || turnout?.id }}
      </span>
    </template>

    <template #subtitle>
      {{ turnout?.type || 'turnout' }}
    </template>

    <template #status>
      <v-icon
        :icon="state ? 'mdi-circle' : 'mdi-circle-outline'"
        :color="state ? 'green' : 'grey'"
        size="14"
      />
    </template>

    <div v-if="turnout?.desc" class="text-xs text-slate-400">
      {{ turnout.desc }}
    </div>

    <div class="flex items-center gap-2 flex-wrap">
      <v-btn
        :color="accentColor"
        variant="tonal"
        size="small"
        @click="handleSetTurnout(true)"
      >
        Straight
      </v-btn>
      <v-btn
        :color="accentColor"
        variant="tonal"
        size="small"
        @click="handleSetTurnout(false)"
      >
        Divergent
      </v-btn>
      <v-spacer />
      <v-switch
        v-model="state"
        :color="accentColor"
        hide-details
        density="compact"
      />
    </div>

    <template #footer>
      <v-btn
        icon="mdi-delete-outline"
        variant="text"
        color="error"
        size="small"
        @click="emit('delete', turnout)"
      />
      <v-spacer />
      <v-btn
        icon="mdi-pencil-outline"
        variant="text"
        :color="accentColor"
        size="small"
        @click="emit('edit', turnout)"
      />
    </template>
  </ListItemCard>
</template>
