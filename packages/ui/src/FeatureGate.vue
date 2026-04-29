<script setup lang="ts">
import { useFeatureFlags } from '@repo/modules'
import type { FeatureName } from '@repo/modules'
import ComingSoonBadge from './ComingSoonBadge.vue'

type GateMode = 'hide' | 'disable' | 'tease'

const props = withDefaults(
  defineProps<{
    feature: FeatureName
    mode?: GateMode
    badgeLabel?: string
  }>(),
  {
    mode: 'hide',
    badgeLabel: 'Coming Soon',
  },
)

const { isEnabled } = useFeatureFlags()
</script>

<template>
  <template v-if="isEnabled(props.feature)">
    <slot />
  </template>
  <template v-else-if="props.mode === 'hide'">
    <slot name="fallback" />
  </template>
  <div
    v-else
    class="feature-gate-teased"
    :class="{ 'feature-gate-teased--disabled': props.mode === 'disable' }"
    :aria-disabled="props.mode === 'disable' ? 'true' : undefined"
  >
    <div class="feature-gate-teased__badge">
      <ComingSoonBadge :label="props.badgeLabel" />
    </div>
    <div class="feature-gate-teased__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.feature-gate-teased {
  position: relative;
}
.feature-gate-teased__badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2;
  pointer-events: none;
}
.feature-gate-teased__content {
  opacity: 0.55;
  filter: grayscale(0.35);
}
.feature-gate-teased--disabled .feature-gate-teased__content {
  pointer-events: none;
  user-select: none;
}
</style>
