<script setup lang="ts">
import { useCommandPalette } from './useCommandPalette'

const { open } = useCommandPalette()

function handleClick() {
  open()
}
</script>

<template>
  <button
    class="cp-trigger"
    aria-label="Command palette (Cmd+K)"
    @click="handleClick"
  >
    <kbd class="cp-trigger__kbd">⌘K</kbd>
  </button>
</template>

<style scoped>
.cp-trigger {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(148, 163, 184, 0.08);
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;
}
.cp-trigger:hover {
  background: rgba(148, 163, 184, 0.15);
  border-color: rgba(148, 163, 184, 0.4);
}
.cp-trigger__kbd {
  font-family: ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.7);
  letter-spacing: 0.03em;
}
</style>
