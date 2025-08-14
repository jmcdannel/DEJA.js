<template>
  <div>
    <h1>EffectForm Test Component</h1>
    <p>This is a test to see if the component renders at all.</p>
    
    <div class="debug-info" style="background: #f0f0f0; padding: 10px; margin: 10px; border: 1px solid #ccc;">
      <strong>Props:</strong> {{ JSON.stringify(efx) }}<br>
      <strong>Component loaded at:</strong> {{ new Date().toISOString() }}
    </div>
    
    <v-btn @click="$emit('close')" color="red">
      Close Test
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Effect {
  id: string
  type: string
  state: boolean
  name?: string
  device?: string
  color?: string
  tags?: string[]
  allowGuest?: boolean
}

const props = defineProps<{
  efx: Effect
}>()

const emit = defineEmits(['close'])

onMounted(() => {
  console.log('EffectFormTest: Component mounted successfully')
  console.log('EffectFormTest: Props received:', props.efx)
})
</script>
