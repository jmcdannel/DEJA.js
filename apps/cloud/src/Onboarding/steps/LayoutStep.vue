<script setup lang="ts">
import { ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useStorage } from '@vueuse/core'
import { useLayout, useUserProfile } from '@repo/modules'

const user = useCurrentUser()
const { createLayout } = useLayout()
const { addLayoutToProfile } = useUserProfile()

const layoutName = ref('')
const layoutId = ref('')
const useExisting = ref(false)
const error = ref<string | null>(null)
const success = ref(false)
const loading = ref(false)

const storedLayoutId = useStorage('@DEJA/layoutId', '')

const layoutIdRules = [
  (v: string) => !!v || 'Layout ID is required',
  (v: string) => /^[a-z0-9-]+$/.test(v) || 'Lowercase letters, numbers, and hyphens only',
  (v: string) => v.length >= 3 || 'Must be at least 3 characters',
]

const layoutNameRules = [
  (v: string) => !!v || 'Layout name is required',
  (v: string) => v.length >= 2 || 'Must be at least 2 characters',
]

async function handleCreate() {
  if (!user.value) return
  loading.value = true
  error.value = null
  try {
    await createLayout(layoutId.value, { name: layoutName.value, id: layoutId.value })
    await addLayoutToProfile(user.value.uid, layoutId.value)
    storedLayoutId.value = layoutId.value
    success.value = true
  } catch (err: unknown) {
    const fbErr = err as { message?: string }
    error.value = fbErr.message || 'Failed to create layout'
  } finally {
    loading.value = false
  }
}

async function handleUseExisting() {
  if (!user.value) return
  loading.value = true
  error.value = null
  try {
    await addLayoutToProfile(user.value.uid, layoutId.value)
    storedLayoutId.value = layoutId.value
    success.value = true
  } catch (err: unknown) {
    const fbErr = err as { message?: string }
    error.value = fbErr.message || 'Failed to set layout'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-card flat class="bg-transparent">
    <v-card-text>
      <v-alert v-if="error" type="error" class="mb-4" closable @click:close="error = null">
        {{ error }}
      </v-alert>
      <v-alert v-if="success" type="success" class="mb-4">
        Layout "{{ layoutId }}" configured successfully!
      </v-alert>

      <template v-if="!success">
        <v-btn-toggle v-model="useExisting" mandatory class="mb-4">
          <v-btn :value="false">Create New Layout</v-btn>
          <v-btn :value="true">Use Existing Layout</v-btn>
        </v-btn-toggle>

        <v-form v-if="!useExisting" v-slot="{ isValid }">
          <v-text-field
            v-model="layoutName"
            label="Layout Name"
            placeholder="My Railroad"
            :rules="layoutNameRules"
            required
          />
          <v-text-field
            v-model="layoutId"
            label="Layout ID"
            placeholder="my-railroad"
            hint="Lowercase letters, numbers, and hyphens only"
            :rules="layoutIdRules"
            required
          />
          <v-btn
            @click="handleCreate"
            :disabled="!isValid"
            :loading="loading"
            color="primary"
            class="mt-4"
          >
            Create Layout
          </v-btn>
        </v-form>

        <v-form v-else v-slot="{ isValid }">
          <v-text-field
            v-model="layoutId"
            label="Existing Layout ID"
            placeholder="my-railroad"
            :rules="layoutIdRules"
            required
          />
          <v-btn
            @click="handleUseExisting"
            :disabled="!isValid"
            :loading="loading"
            color="primary"
            class="mt-4"
          >
            Use This Layout
          </v-btn>
        </v-form>
      </template>
    </v-card-text>
  </v-card>
</template>
