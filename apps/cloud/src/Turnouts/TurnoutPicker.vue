<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTurnouts } from '@repo/modules'

defineEmits(['select', 'cancel'])
const model = defineModel<string>()
const { getTurnouts } = useTurnouts()
const turnouts = getTurnouts()
const search = ref('')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return turnouts.value ?? []
  return (turnouts.value ?? []).filter((t) =>
    t.name?.toLowerCase().includes(q) ||
    t.device?.toLowerCase().includes(q) ||
    t.id?.toLowerCase().includes(q),
  )
})
</script>

<template>
  <v-card class="mx-auto w-full h-full justify-between flex flex-col" color="surface">
    <v-card-item>
      <v-card-title>Turnout</v-card-title>
      <v-card-subtitle>Select a turnout to link</v-card-subtitle>
    </v-card-item>

    <v-card-text class="flex flex-col gap-3">
      <v-text-field
        v-model="search"
        placeholder="Search turnouts…"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        clearable
        hide-details
        autofocus
      />

      <div v-if="filtered.length === 0" class="text-sm opacity-40 py-2 text-center">
        No turnouts match "{{ search }}"
      </div>

      <div class="flex flex-wrap gap-1">
        <v-btn
          v-for="t in filtered"
          :key="t.id"
          prepend-icon="mdi-directions-fork"
          :color="model === t.id ? 'primary' : undefined"
          :variant="model === t.id ? 'flat' : 'tonal'"
          class="m-1"
          @click="model = t.id"
        >
          {{ t.name }}
          <template #append>
            <span class="text-xs opacity-50 ml-1">{{ t.device }}</span>
          </template>
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
