<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEfx } from '@repo/modules/effects'
import { efxTypes } from '@repo/modules'

defineEmits(['select', 'cancel'])
defineProps({
  color: String,
})
const model = defineModel<string>()
const { getEffects } = useEfx()
const effects = getEffects()
const search = ref('')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return effects.value ?? []
  return (effects.value ?? []).filter((e) =>
    e.name?.toLowerCase().includes(q) ||
    e.type?.toLowerCase().includes(q) ||
    e.id?.toLowerCase().includes(q),
  )
})

function iconFor(type: string) {
  return efxTypes.find((t) => t.value === type)?.icon ?? 'mdi-rocket'
}
</script>

<template>
  <v-card class="mx-auto w-full h-full justify-between flex flex-col" color="surface">
    <v-card-item>
      <v-card-title>Effect</v-card-title>
      <v-card-subtitle>Select an effect to trigger on throw</v-card-subtitle>
    </v-card-item>

    <v-card-text class="flex flex-col gap-3">
      <v-text-field
        v-model="search"
        placeholder="Search effects…"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        clearable
        hide-details
        autofocus
      />

      <div v-if="filtered.length === 0" class="text-sm opacity-40 py-2 text-center">
        No effects match "{{ search }}"
      </div>

      <div class="flex flex-wrap gap-1">
        <v-btn
          v-for="efx in filtered"
          :key="efx.id"
          :prepend-icon="iconFor(efx.type)"
          :color="model === efx.id ? 'primary' : undefined"
          :variant="model === efx.id ? 'flat' : 'tonal'"
          class="m-1"
          @click="model = efx.id"
        >
          {{ efx.name }}
        </v-btn>
      </div>
    </v-card-text>

    <v-card-actions>
      <v-btn prepend-icon="mdi-cancel" variant="outlined" @click="$emit('cancel')">
        Cancel
      </v-btn>
      <v-spacer />
      <v-btn
        v-if="model"
        prepend-icon="mdi-close"
        variant="text"
        color="error"
        @click="model = undefined; $emit('cancel')"
      >
        Clear
      </v-btn>
      <v-btn prepend-icon="mdi-check" color="primary" variant="flat" @click="$emit('select')">
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
