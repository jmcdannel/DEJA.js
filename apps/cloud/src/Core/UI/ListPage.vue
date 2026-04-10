<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { PageHeader } from '@repo/ui'

defineProps<{
  title: string
  icon?: string
  color?: string
  subtitle?: string
  addTo?: RouteLocationRaw
  addLabel?: string
  loading?: boolean
  empty?: boolean
}>()
</script>

<template>
  <!-- 🔄 Loading -->
  <div
    v-if="loading"
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4"
  >
    <v-skeleton-loader v-for="n in 6" :key="n" type="card" />
  </div>

  <!-- 📭 Empty -->
  <template v-else-if="empty">
    <slot name="empty-state" />
  </template>

  <!-- ✅ Has items -->
  <template v-else>
    <PageHeader
      :title="title"
      :icon="icon"
      :color="color"
      :subtitle="subtitle"
    >
      <template v-if="$slots.subtitle" #subtitle>
        <slot name="subtitle" />
      </template>
      <template v-if="$slots.controls" #controls>
        <slot name="controls" />
      </template>
      <template v-if="$slots.actions || addTo" #actions>
        <slot name="actions" />
        <v-btn
          v-if="addTo"
          prepend-icon="mdi-plus"
          :color="color"
          variant="flat"
          size="small"
          :to="addTo"
        >
          {{ addLabel ?? 'New' }}
        </v-btn>
      </template>
    </PageHeader>

    <slot />
  </template>
</template>
