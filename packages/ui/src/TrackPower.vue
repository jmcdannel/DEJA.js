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
  if (props.powerState === true) return 'success'
  if (props.powerState === false) return 'error'
  return 'grey'
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
      class="shadow-md"
      :color="optimisticOn ? 'success' : 'error'"
      icon="mdi-fence-electric"
      variant="elevated"
      :disabled="isDisabled"
      @click="togglePower"
      :title="titleText"
      aria-label="Toggle track power"
      dark
    />
  </v-badge>
</template>
