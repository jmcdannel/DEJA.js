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
    :color="power ? 'success' : 'error'"
    icon="mdi-power"
    variant="elevated"
    title="Layout Power"
    aria-label="Toggle Layout Power"
    class="shadow-md"
    dark>
  </v-btn>
</template>
