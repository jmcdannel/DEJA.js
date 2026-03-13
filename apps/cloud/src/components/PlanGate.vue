<script setup lang="ts">
import { useSubscription, PLAN_DISPLAY } from '@repo/modules'
import type { PlanTier } from '@repo/modules'

const props = defineProps<{
  requiredPlan: PlanTier
}>()

const { requiresPlan } = useSubscription()
const isLocked = requiresPlan(props.requiredPlan)
</script>

<template>
  <slot v-if="!isLocked" />
  <v-card v-else variant="outlined" class="text-center pa-6">
    <v-chip color="primary" size="small" class="mb-4">
      {{ PLAN_DISPLAY[requiredPlan].name }}
    </v-chip>
    <div class="text-h4 mb-2">🔒</div>
    <div class="text-body-2 text-medium-emphasis mb-4">
      This feature requires the {{ PLAN_DISPLAY[requiredPlan].name }} plan or higher.
    </div>
    <v-btn
      color="primary"
      variant="elevated"
      size="small"
      :to="{ name: 'settings' }"
    >
      Upgrade to {{ PLAN_DISPLAY[requiredPlan].name }}
    </v-btn>
  </v-card>
</template>
