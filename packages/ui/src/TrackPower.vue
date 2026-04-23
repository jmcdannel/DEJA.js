<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  powerState?: boolean | undefined
  isConnected?: boolean
  onToggle?: (newState: boolean) => Promise<void> | void
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  powerState: undefined,
  isConnected: true,
  disabled: false
})

const emit = defineEmits<{
  toggle: [newState: boolean]
}>()

// Optimistic UI state (assume success on click)
const optimisticOn = ref<boolean>(false)

// Initialize/keep optimistic state in sync when actual changes
watch(() => props.powerState, (val) => {
  if (typeof val === 'boolean') {
    optimisticOn.value = val
  }
}, { immediate: true })

const isDisabled = computed<boolean>(() => props.disabled || !props.isConnected)

async function togglePower() {
  const newState = !optimisticOn.value
  // Flip immediately for optimistic UX
  optimisticOn.value = newState
  
  // Emit the toggle event
  emit('toggle', newState)
  
  // Call the provided toggle function if available
  if (props.onToggle) {
    await props.onToggle(newState)
  }
}

const actualDotColor = computed(() => {
  if (props.powerState === true) return 'primary'
  if (props.powerState === false) return 'error'
  return 'warning'
})

const titleText = computed(() => {
  const optimistic = optimisticOn.value ? 'On' : 'Off'
  const actual = props.powerState === true ? 'On' : props.powerState === false ? 'Off' : 'Unknown'
  return `Track Power — Requested: ${optimistic}, Actual: ${actual}`
})
</script>

<template>
  <v-badge
    :color="actualDotColor"
    dot
    location="top end"
    offset-x="2"
    offset-y="2"
  >
    <v-btn
      :color="optimisticOn ? 'success' : undefined"
      :class="{ 'power-off-btn': !optimisticOn }"
      icon="mdi-fence-electric"
      variant="flat"
      size="small"
      :disabled="isDisabled"
      @click="togglePower"
      :title="titleText"
      aria-label="Toggle track power"
      dark
    />
  </v-badge>
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
