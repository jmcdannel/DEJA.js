<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  layoutName?: string
  layoutId: string
  serverIp?: string | null
  wsPort?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  layoutName: undefined,
  serverIp: null,
  wsPort: 8082,
})

const connectionUrl = computed(() => {
  if (!props.serverIp) return null
  return `ws://${props.serverIp}:${props.wsPort}`
})
</script>

<template>
  <v-card variant="flat" class="layout-info-card mb-3">
    <v-card-text class="pa-3">
      <div class="text-overline text-medium-emphasis mb-2">Layout</div>
      <div class="text-subtitle-2 font-weight-bold text-high-emphasis mb-1">
        {{ layoutName || 'Unnamed Layout' }}
      </div>
      <div class="text-caption text-medium-emphasis font-mono mb-3">
        ID: {{ layoutId }}
      </div>

      <div class="text-caption text-medium-emphasis mb-1">Server Connection</div>
      <div v-if="connectionUrl" class="layout-info-card__url">
        <code class="text-caption">{{ connectionUrl }}</code>
      </div>
      <div v-else class="text-caption text-medium-emphasis">—</div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.layout-info-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.layout-info-card__url {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  padding: 4px 8px;
  font-family: 'Roboto Mono', 'Fira Code', monospace;
}

.font-mono {
  font-family: 'Roboto Mono', 'Fira Code', monospace;
}
</style>
