<script setup lang="ts">
import { chordKey } from './useGlobalKeybindings'
</script>

<template>
  <Transition name="chord-chip-fade">
    <div v-if="chordKey" class="chord-chip">
      <span class="chord-chip__key">{{ chordKey }}</span>
      <span class="chord-chip__ellipsis">…</span>
    </div>
  </Transition>
</template>

<style scoped>
.chord-chip {
  position: fixed;
  bottom: 16px;
  left: 16px;
  z-index: 9998;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(96, 165, 250, 0.5);
  backdrop-filter: blur(12px);
  font-family: ui-monospace, monospace;
  font-size: 11px;
  color: #e2e8f0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
.chord-chip__key {
  display: inline-block;
  padding: 1px 6px;
  background: rgba(96, 165, 250, 0.2);
  border: 1px solid rgba(96, 165, 250, 0.5);
  border-radius: 4px;
  font-weight: 700;
  color: #60a5fa;
}
.chord-chip__ellipsis {
  color: rgba(148, 163, 184, 0.6);
}

.chord-chip-fade-enter-active,
.chord-chip-fade-leave-active {
  transition: opacity 120ms ease, transform 120ms ease;
}
.chord-chip-fade-enter-from,
.chord-chip-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
