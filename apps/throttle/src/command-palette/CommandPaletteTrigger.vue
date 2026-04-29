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
    aria-label="Menu (Cmd+K)"
    @click="handleClick"
  >
    <v-icon size="20" class="cp-trigger__icon">mdi-menu</v-icon>
    <span class="cp-trigger__label">Menu</span>
    <kbd class="cp-trigger__kbd">⌘K</kbd>
  </button>
</template>

<style scoped>
/* Pill-shaped Menu trigger */
.cp-trigger {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  backdrop-filter: blur(16px);
  background: rgba(96, 165, 250, 0.12);
  border: 1px solid rgba(96, 165, 250, 0.35);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  min-width: 160px;
}
.cp-trigger:hover {
  background: rgba(96, 165, 250, 0.22);
  border-color: rgba(96, 165, 250, 0.55);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(96, 165, 250, 0.25);
}
.cp-trigger:focus-visible {
  outline: none;
  border-color: rgba(96, 165, 250, 0.6);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

.cp-trigger__icon {
  color: #93c5fd;
  flex-shrink: 0;
}
.cp-trigger__label {
  flex: 1;
  text-align: left;
  font-size: 14px;
  color: #dbeafe;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.cp-trigger__kbd {
  flex-shrink: 0;
  display: none;
  font-family: ui-monospace, monospace;
  font-size: 10px;
  font-weight: 600;
  color: rgba(147, 197, 253, 0.7);
  padding: 2px 7px;
  background: rgba(96, 165, 250, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 5px;
  letter-spacing: 0.04em;
  line-height: 1;
}

/* Non-touch (any width): show the ⌘K hint */
@media (hover: hover) and (pointer: fine) {
  .cp-trigger__kbd {
    display: inline-block;
  }
}

/* Touch narrow screens: collapse to icon-only pill */
@media (max-width: 959px) and (hover: none) {
  .cp-trigger {
    min-width: 40px;
    padding: 0;
    width: 40px;
    justify-content: center;
  }
  .cp-trigger__label {
    display: none;
  }
}

/* Non-touch small screens: compact [icon] [⌘K] — drop the label text */
@media (max-width: 959px) and (hover: hover) and (pointer: fine) {
  .cp-trigger {
    min-width: auto;
    padding: 0 10px;
    gap: 6px;
  }
  .cp-trigger__label {
    display: none;
  }
  .cp-trigger__kbd {
    display: inline-block;
  }
}
</style>
