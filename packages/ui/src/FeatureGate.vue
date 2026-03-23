<script setup lang="ts">
import { useFeatureFlags } from '@repo/modules'
import type { FeatureName } from '@repo/modules'

const props = defineProps<{
  feature: FeatureName
}>()

const { isEnabled } = useFeatureFlags()
</script>

<template>
  <slot v-if="isEnabled(props.feature)" />
  <slot v-else name="fallback" />
</template>
