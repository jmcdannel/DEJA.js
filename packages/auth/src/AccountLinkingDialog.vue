<script setup lang="ts">
import type { ProviderName } from './useAuthProvider'

const props = defineProps<{
  modelValue: boolean
  email: string | null
  loadingProvider: ProviderName | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'link-provider': [provider: ProviderName]
  dismiss: []
}>()

const providers: { name: ProviderName; label: string; icon: string }[] = [
  { name: 'google', label: 'Google', icon: 'google' },
  { name: 'github', label: 'GitHub', icon: 'github' },
  { name: 'facebook', label: 'Facebook', icon: 'facebook' },
  { name: 'apple', label: 'Apple', icon: 'apple' },
  { name: 'microsoft', label: 'Microsoft', icon: 'microsoft' },
]

function handleLink(provider: ProviderName) {
  emit('link-provider', provider)
}

function handleDismiss() {
  emit('dismiss')
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="420"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="link-dialog">
      <div class="flex flex-col items-center mb-5">
        <v-icon size="48" color="warning" class="mb-3">mdi-link-variant</v-icon>
        <h3 class="text-lg font-semibold text-sky-100 text-center">Link Your Account</h3>
      </div>

      <p class="text-slate-400 text-sm text-center mb-2">
        An account already exists with
      </p>
      <p v-if="email" class="text-sky-300 font-medium text-center mb-4">
        {{ email }}
      </p>
      <p class="text-slate-400 text-sm text-center mb-6">
        Sign in with your original method to link both accounts together.
      </p>

      <div class="flex flex-col gap-3 mb-4">
        <button
          v-for="provider in providers"
          :key="provider.name"
          class="social-btn"
          :disabled="loadingProvider !== null"
          @click="handleLink(provider.name)"
        >
          <v-progress-circular
            v-if="loadingProvider === provider.name"
            size="20"
            width="2"
            indeterminate
          />
          <v-icon v-else size="20">mdi-{{ provider.icon }}</v-icon>
          <span>Continue with {{ provider.label }}</span>
        </button>
      </div>

      <div class="divider-line my-4" />

      <button class="cancel-btn" @click="handleDismiss">
        Cancel — I'll use a different email
      </button>
    </div>
  </v-dialog>
</template>

<style scoped>
.link-dialog {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 32px;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.4);
  color: #e0f2fe;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}
.social-btn:hover:not(:disabled) {
  border-color: rgba(148, 163, 184, 0.4);
  background: rgba(15, 23, 42, 0.7);
}
.social-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  display: block;
  width: 100%;
  padding: 10px;
  background: transparent;
  border: none;
  color: rgba(148, 163, 184, 0.6);
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  transition: color 0.2s;
  text-align: center;
}
.cancel-btn:hover {
  color: #38bdf8;
}

.divider-line {
  height: 1px;
  background: rgba(148, 163, 184, 0.12);
}
</style>
