<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import QuickThrottleNumpad from './QuickThrottleNumpad.vue'

const emit = defineEmits<{
  submit: [address: number]
  cancel: []
}>()

const isCoarse = useMediaQuery('(pointer: coarse)')
const value = ref<string>('')

const parsed = computed<number | null>(() => {
  if (!value.value) return null
  if (!/^\d+$/.test(value.value)) return null
  const n = Number(value.value)
  if (!Number.isInteger(n)) return null
  if (n < 1 || n > 9999) return null
  return n
})

const canSubmit = computed(() => parsed.value !== null)

const helperText = computed(() => {
  if (!value.value) return 'Enter a DCC address (1–9999)'
  if (parsed.value === null) return 'Must be a whole number between 1 and 9999'
  return ''
})

function submit() {
  if (parsed.value !== null) {
    emit('submit', parsed.value)
    value.value = ''
  }
}
</script>

<template>
  <div class="quick-throttle-form">
    <QuickThrottleNumpad
      v-if="isCoarse"
      v-model="value"
      :can-submit="canSubmit"
      @submit="submit"
    />
    <template v-else>
      <v-text-field
        v-model="value"
        type="number"
        inputmode="numeric"
        :min="1"
        :max="9999"
        label="DCC Address"
        :hint="helperText"
        persistent-hint
        autofocus
        density="compact"
        variant="outlined"
        @keyup.enter="submit"
      >
        <template #append-inner>
          <v-btn
            icon="mdi-arrow-right"
            size="small"
            variant="text"
            :disabled="!canSubmit"
            aria-label="Go"
            @click="submit"
          />
        </template>
      </v-text-field>
    </template>
  </div>
</template>

<style scoped>
.quick-throttle-form {
  min-width: 220px;
}
</style>
