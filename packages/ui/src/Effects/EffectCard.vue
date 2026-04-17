<script setup lang="ts">
import { computed, watch } from 'vue'
import { efxTypes, type Effect } from '@repo/modules'
import { useHaptics } from '../composables/useHaptics'
import ListItemCard from '../DeviceConfig/ListItemCard.vue'

interface Props {
  effect: Effect,
  isRunning: boolean,
}

const props = defineProps<Props>()
const emit = defineEmits<{
  edit: [effect: Effect]
  delete: [effect: Effect]
}>()
const state = defineModel('state', {
  type: Boolean
})
const { vibrate } = useHaptics()

watch(state, () => {
  vibrate('light')
})

const efxType = computed(() =>
  efxTypes.find((type) => type.value === props?.effect?.type),
)
const accentColor = computed(
  () => props.effect?.color || efxType.value?.color || 'purple',
)
const icon = computed(() => efxType.value?.icon || 'mdi-lightbulb')
</script>

<template>
  <ListItemCard
    :item-id="effect?.id"
    :device-id="effect?.device"
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
        {{ effect?.name || effect?.id }}
      </span>
    </template>

    <template #subtitle>
      {{ effect?.type || 'effect' }}
    </template>

    <template #status>
      <v-icon
        :icon="state ? 'mdi-circle' : 'mdi-circle-outline'"
        :color="state ? 'green' : 'grey'"
        size="14"
      />
    </template>

    <div class="flex items-center gap-2 flex-wrap">
      <v-switch
        v-model="state"
        :color="accentColor"
        hide-details
        density="compact"
      />
      <v-spacer />
      <v-chip
        v-if="effect?.allowGuest"
        size="x-small"
        variant="tonal"
        color="success"
        prepend-icon="mdi-account-check"
      >
        Guest
      </v-chip>
    </div>

    <div
      v-if="(effect?.tags?.length ?? 0) > 0"
      class="flex flex-wrap gap-1"
    >
      <v-chip
        v-for="tag in effect?.tags"
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
      <v-btn
        icon="mdi-delete-outline"
        variant="text"
        color="error"
        size="small"
        @click="emit('delete', effect)"
      />
      <v-spacer />
      <v-btn
        icon="mdi-pencil-outline"
        variant="text"
        :color="accentColor"
        size="small"
        @click="emit('edit', effect)"
      />
    </template>
  </ListItemCard>
</template>
