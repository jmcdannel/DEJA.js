<script setup lang="ts">
/**
 * LocoFrontGallery — Displays all roadname locomotive fronts in a
 * responsive grid for easy browsing.  Passes actual logos from assets.
 */
import { computed } from 'vue'
import LocoFront from './LocoFront.vue'
import { LOCO_FRONT_DESIGNS } from './locoFrontData'
import { ROADNAMES } from '@repo/modules/locos'

const props = defineProps<{
  /** Override the size (width) of each locomotive illustration */
  size?: number
  /** Map of roadname key → logo image src (imported or URL) */
  logos?: Record<string, string>
}>()

const locoSize = computed(() => props.size ?? 220)

/** Build an ordered list matching the ROADNAMES constant, with demo numbers */
const entries = computed(() =>
  ROADNAMES
    .filter((r) => LOCO_FRONT_DESIGNS[r.value])
    .map((r, i) => ({
      key: r.value,
      label: r.label,
      number: String(1000 + i * 111),
      logo: props.logos?.[r.value],
    }))
)
</script>

<template>
  <div class="loco-gallery">
    <div v-for="entry in entries" :key="entry.key" class="loco-gallery-item">
      <LocoFront
        :roadname="entry.key"
        :road-number="entry.number"
        :logo-src="entry.logo"
        :size="locoSize"
      />
      <p class="loco-gallery-label">{{ entry.label }}</p>
    </div>
  </div>
</template>

<style scoped>
.loco-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  padding: 2rem;
}

.loco-gallery-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.loco-gallery-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.loco-gallery-label {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  margin: 0;
}
</style>
