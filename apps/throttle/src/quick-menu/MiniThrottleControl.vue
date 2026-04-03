<script setup lang="ts">
defineProps<{
  name: string
  address: number
  speed: number
}>()

const emit = defineEmits<{
  stop: [address: number]
  speedUp: [address: number, amount: number]
  speedDown: [address: number, amount: number]
  park: [address: number]
}>()
</script>

<template>
  <div class="mini-throttle">
    <span class="mini-throttle__plate">#{{ address }}</span>
    <span class="mini-throttle__name" :title="name">{{ name || `Loco ${address}` }}</span>
    <div class="mini-throttle__controls">
      <v-btn
        icon
        density="compact"
        variant="text"
        size="x-small"
        color="red"
        @click.stop="emit('stop', address)"
      >
        <v-icon size="16">mdi-stop</v-icon>
      </v-btn>
      <v-btn
        density="compact"
        variant="tonal"
        size="x-small"
        color="green"
        class="mini-throttle__speed-btn"
        @click.stop="emit('speedDown', address, 5)"
      >
        <v-icon size="14">mdi-minus</v-icon>
      </v-btn>
      <span
        class="mini-throttle__speed"
        :class="speed === 0 ? 'text-red-400' : 'text-green-400'"
      >
        {{ speed }}
      </span>
      <v-btn
        density="compact"
        variant="tonal"
        size="x-small"
        color="green"
        class="mini-throttle__speed-btn"
        @click.stop="emit('speedUp', address, 5)"
      >
        <v-icon size="14">mdi-plus</v-icon>
      </v-btn>
      <v-btn
        icon
        density="compact"
        variant="text"
        size="x-small"
        color="amber"
        @click.stop="emit('park', address)"
      >
        <v-icon size="16">mdi-parking</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.mini-throttle {
  display: flex;
  align-items: center;
  padding: 5px 8px;
  border-radius: 6px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  gap: 6px;
}
.mini-throttle:hover {
  background: rgba(var(--v-theme-on-surface), 0.08);
}

/* DCC address — locomotive number plate style */
.mini-throttle__plate {
  font-size: 0.6rem;
  font-weight: 700;
  font-family: monospace;
  letter-spacing: 0.04em;
  padding: 1px 5px;
  border-radius: 3px;
  background: #111;
  color: #e8e8e8;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5), 0 0 4px rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
  line-height: 1.4;
}

.mini-throttle__name {
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.mini-throttle__controls {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.mini-throttle__speed-btn {
  min-width: 28px !important;
  padding: 0 4px !important;
  border-radius: 4px !important;
}

.mini-throttle__speed {
  font-size: 0.7rem;
  font-family: monospace;
  font-weight: 700;
  min-width: 24px;
  text-align: center;
}
</style>
