<script setup lang="ts">
interface Props {
  disabled?: boolean
  onStop?: () => Promise<void> | void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  stop: []
}>()

async function stop() {
  // Emit the stop event
  emit('stop')
  
  // Call the provided stop function if available
  if (props.onStop) {
    await props.onStop()
  }
}
</script>

<template>
  <v-btn 
    @click="stop"
    class="relative shadow-md"
    icon="mdi-alert-octagon"
    variant="elevated"
    color="error"
    title="Emergency Stop"
    aria-label="Emergency Stop"
    dark>
  </v-btn>
</template>
