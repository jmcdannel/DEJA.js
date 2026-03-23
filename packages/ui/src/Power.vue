<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  powerState?: boolean
  onToggle?: (newState: boolean) => Promise<void> | void
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  powerState: false,
  disabled: false
})

const emit = defineEmits<{
  toggle: [newState: boolean]
}>()

const power = ref(props.powerState)

watch(() => props.powerState, (newVal) => {
  power.value = newVal
}, { immediate: true })

async function togglePower() {
  const newState = !power.value
  power.value = newState
  
  // Emit the toggle event
  emit('toggle', newState)
  
  // Call the provided toggle function if available
  if (props.onToggle) {
    await props.onToggle(newState)
  }
}
</script>

<template>
  <v-btn 
    @click="togglePower"
    :color="power ? 'success' : undefined"
    :class="['shadow-md', { 'power-off-btn': !power }]"
    icon="mdi-power"
    variant="flat"
    size="small"
    title="Layout Power"
    aria-label="Toggle Layout Power"
  >
  </v-btn>
</template>

<style scoped>
.power-off-btn {
  background: rgba(var(--v-theme-surface-variant), 0.7) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  transition: background 300ms cubic-bezier(0.4, 0, 0.2, 1),
    border-color 150ms ease,
    box-shadow 150ms ease,
    transform 150ms ease;
}

.power-off-btn:hover {
  background: rgba(var(--v-theme-surface-variant), 0.85) !important;
  border-color: rgba(var(--v-theme-on-surface), 0.35);
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3);
  transform: translateY(-1px);
}

.power-off-btn:active {
  transform: translateY(0);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
}
</style>
