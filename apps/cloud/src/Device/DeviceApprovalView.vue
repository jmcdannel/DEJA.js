<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDevices } from '../Settings/Devices/useDevices'

const route = useRoute()
const { approveCode } = useDevices()

const code = ref('')
const label = ref('DEJA Server')
const submitting = ref(false)
const done = ref(false)
const error = ref<string | null>(null)

const formatted = computed({
  get: () => code.value,
  set: (v: string) => {
    code.value = v.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 9)
  },
})

onMounted(() => {
  const queryCode = route.query.code
  if (typeof queryCode === 'string') formatted.value = queryCode
})

async function submit() {
  submitting.value = true
  error.value = null
  try {
    await approveCode(code.value, label.value, null)
    done.value = true
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <v-container class="d-flex justify-center pt-8">
    <v-card max-width="480" class="w-100 pa-4">
      <v-card-title>Approve device</v-card-title>
      <v-card-subtitle>
        Enter the code shown in your terminal after running <code>deja login</code>
      </v-card-subtitle>

      <v-card-text v-if="!done">
        <v-text-field
          v-model="formatted"
          label="Device code"
          placeholder="ABCD-2345"
          maxlength="9"
          autofocus
          class="mb-2"
        />
        <v-text-field
          v-model="label"
          label="Device name"
          placeholder="e.g., Basement Pi"
          hint="Helps you recognize this device in the dashboard later"
          persistent-hint
        />
        <v-alert v-if="error" type="error" variant="tonal" class="mt-3">{{ error }}</v-alert>
      </v-card-text>
      <v-card-actions v-if="!done">
        <v-spacer />
        <v-btn variant="text" :to="{ name: 'home' }">Cancel</v-btn>
        <v-btn color="primary" :loading="submitting" :disabled="!code" @click="submit">
          Approve
        </v-btn>
      </v-card-actions>

      <v-card-text v-else>
        <v-alert type="success" variant="tonal">
          <strong>Device approved.</strong> You can close this tab and return to your terminal.
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>
