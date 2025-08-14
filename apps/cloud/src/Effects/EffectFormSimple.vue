<template>
  <div>
    <h1>Simple EffectForm</h1>
    <p>This is a minimal test version.</p>
    
    <div class="debug-info" style="background: #f0f0f0; padding: 10px; margin: 10px; border: 1px solid #ccc;">
      <strong>Props:</strong> {{ JSON.stringify(efx) }}<br>
      <strong>Component loaded at:</strong> {{ new Date().toISOString() }}
    </div>
    
    <v-btn @click="$emit('close')" color="red">
      Close
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

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
  console.log('EffectFormSimple: Component mounted successfully')
  console.log('EffectFormSimple: Props received:', props.efx)
})
</script>
