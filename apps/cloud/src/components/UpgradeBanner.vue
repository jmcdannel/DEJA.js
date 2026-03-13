<script setup lang="ts">
import { PLAN_DISPLAY } from '@repo/modules'
import type { PlanTier } from '@repo/modules'

defineProps<{
  resource: string
  currentCount: number
  limit: number
  requiredPlan: PlanTier
}>()
</script>

<template>
  <v-alert
    type="warning"
    variant="tonal"
    density="compact"
    class="mt-2"
  >
    <template #text>
      {{ currentCount }} / {{ limit }} {{ resource }} max.
      <router-link :to="{ name: 'settings' }" class="text-primary">
        Upgrade to {{ PLAN_DISPLAY[requiredPlan].name }} for more →
      </router-link>
    </template>
  </v-alert>
</template>
