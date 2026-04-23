<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  speed: {
    type: Number,
    required: true,
  },
})

const isForward = computed(() => props.speed >= 0)
const displaySpeed = computed(() => Math.abs(props.speed))
</script>

<template>
  <div class="flex justify-center">
    <div class="speed-panel">
      <!-- ⚡ Purple accent stripe -->
      <div class="speed-panel__accent" />
      <!-- 🚂 Speed readout -->
      <div class="speed-panel__body">
        <span
          class="speed-panel__direction"
          :class="isForward ? 'text-purple-300' : 'text-red-400'"
        >
          {{ isForward ? 'FWD' : 'REV' }}
        </span>
        <span class="speed-panel__value">{{ displaySpeed }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.speed-panel {
  display: flex;
  min-width: 4.5rem;
  border: 1px solid rgba(168, 85, 247, 0.35);
  border-radius: 4px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(30, 20, 50, 0.95) 0%, rgba(15, 10, 30, 0.98) 100%);
  box-shadow:
    0 0 12px rgba(168, 85, 247, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.speed-panel__accent {
  width: 4px;
  flex-shrink: 0;
  background: linear-gradient(180deg, #a855f7 0%, #7c3aed 100%);
}

.speed-panel__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 0.35rem 0.75rem;
  gap: 0;
}

.speed-panel__direction {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  line-height: 1;
}

.speed-panel__value {
  font-size: 1.5rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  color: #e9d5ff;
  text-shadow: 0 0 8px rgba(168, 85, 247, 0.4);
}

/* 📱 Container query scaling */
@container (min-width: 960px) {
  .speed-panel__value {
    font-size: 1.75rem;
  }
}

@container (min-width: 1024px) {
  .speed-panel {
    min-width: 6rem;
  }
  .speed-panel__value {
    font-size: 2rem;
  }
  .speed-panel__direction {
    font-size: 0.65rem;
  }
}
</style>