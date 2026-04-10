<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  canSubmit: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
}>()

const displayValue = computed(() => props.modelValue || '—')

function tap(digit: string) {
  const next = props.modelValue + digit
  if (next.length > 4) return
  emit('update:modelValue', next)
}

function backspace() {
  emit('update:modelValue', props.modelValue.slice(0, -1))
}

function submit() {
  if (props.canSubmit) emit('submit')
}
</script>

<template>
  <div class="quick-numpad">
    <div class="quick-numpad__display">
      <span class="quick-numpad__label">DCC</span>
      <span class="quick-numpad__value">{{ displayValue }}</span>
    </div>
    <div class="quick-numpad__grid">
      <button v-for="n in [1,2,3,4,5,6,7,8,9]" :key="n" class="quick-numpad__key" @click="tap(String(n))">
        {{ n }}
      </button>
      <button class="quick-numpad__key quick-numpad__key--util" @click="backspace" aria-label="Backspace">
        <v-icon size="20">mdi-backspace-outline</v-icon>
      </button>
      <button class="quick-numpad__key" @click="tap('0')">0</button>
      <button
        class="quick-numpad__key quick-numpad__key--submit"
        :disabled="!canSubmit"
        @click="submit"
        aria-label="Go"
      >
        <v-icon size="20">mdi-arrow-right</v-icon>
      </button>
    </div>
  </div>
</template>

<style scoped>
.quick-numpad {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.quick-numpad__display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  font-family: monospace;
}
.quick-numpad__label {
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  letter-spacing: 0.1em;
}
.quick-numpad__value {
  font-size: 1.6rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.95);
  letter-spacing: 0.05em;
}
.quick-numpad__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.quick-numpad__key {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 0;
  border-radius: 8px;
  border: none;
  background: rgba(var(--v-theme-on-surface), 0.06);
  color: rgba(var(--v-theme-on-surface), 0.9);
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 120ms ease, transform 80ms ease;
}
.quick-numpad__key:hover {
  background: rgba(var(--v-theme-on-surface), 0.12);
}
.quick-numpad__key:active {
  transform: scale(0.94);
}
.quick-numpad__key--util {
  background: rgba(var(--v-theme-on-surface), 0.04);
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.quick-numpad__key--submit {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}
.quick-numpad__key--submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
