<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  installUrl: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const dialog = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const command = computed(() => `curl -fsSL ${props.installUrl} | bash`)
const copied = ref(false)

async function copy() {
  await navigator.clipboard.writeText(command.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) copied.value = false
  },
)
</script>

<template>
  <v-dialog v-model="dialog" max-width="640">
    <v-card>
      <v-card-title>Install DEJA on a new device</v-card-title>
      <v-card-subtitle>Run this command on the machine where you want the server</v-card-subtitle>
      <v-card-text>
        <v-alert type="info" variant="tonal" class="mb-3">
          This install link is valid for <strong>15 minutes</strong>. Don't share it.
        </v-alert>
        <v-textarea
          :model-value="command"
          variant="outlined"
          readonly
          auto-grow
          rows="2"
          class="font-mono"
          style="font-family: monospace;"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialog = false">Close</v-btn>
        <v-btn
          color="primary"
          :prepend-icon="copied ? 'mdi-check' : 'mdi-content-copy'"
          @click="copy"
        >
          {{ copied ? 'Copied' : 'Copy' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
