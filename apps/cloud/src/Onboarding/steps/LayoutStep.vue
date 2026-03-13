<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useStorage } from '@vueuse/core'
import { useLayout } from '@repo/modules'
import { slugify } from '@repo/utils'

const emit = defineEmits<{
  complete: []
}>()

const user = useCurrentUser()
const { createLayout } = useLayout()

const layoutName = ref('')
const layoutId = ref('')
const customId = ref(false)
const error = ref<string | null>(null)
const loading = ref(false)

const storedLayoutId = useStorage('@DEJA/layoutId', '')

// Auto-slugify layout name into ID when not in custom mode
watch(layoutName, (name) => {
  if (!customId.value) {
    layoutId.value = slugify(name)
  }
})

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
    storedLayoutId.value = layoutId.value
    emit('complete')
  } catch (err: unknown) {
    const fbErr = err as { message?: string }
    error.value = fbErr.message || 'Failed to create layout'
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <div class="layout-step">
    <div class="layout-container">
      <div class="layout-card">
        <div class="flex items-center gap-3 mb-2">
          <v-icon color="primary" size="24">mdi-map-marker-path</v-icon>
          <h2 class="text-lg font-semibold text-sky-100">Register Your Layout</h2>
        </div>
        <p class="text-sm text-slate-400 mb-6">Give your railroad a name and we'll generate a unique ID for it.</p>

        <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-5" closable @click:close="error = null">
          {{ error }}
        </v-alert>

        <v-form v-slot="{ isValid }">
          <p class="text-xs text-slate-500 uppercase tracking-widest mb-2 font-medium">Layout Name</p>
          <v-text-field
            v-model="layoutName"
            placeholder="My Railroad"
            :rules="layoutNameRules"
            variant="solo-filled"
            density="compact"
            bg-color="transparent"
            class="layout-input mb-1"
            hide-details="auto"
            required
          />

          <div class="flex items-center gap-2 mt-4 mb-2">
            <v-switch
              v-model="customId"
              label="Custom Layout ID"
              density="compact"
              hide-details
              color="primary"
              class="text-slate-400 text-sm"
            />
          </div>

          <p class="text-xs text-slate-500 uppercase tracking-widest mb-2 font-medium">Layout ID</p>
          <v-text-field
            v-model="layoutId"
            placeholder="my-railroad"
            :rules="layoutIdRules"
            :readonly="!customId"
            variant="solo-filled"
            density="compact"
            bg-color="transparent"
            class="layout-input"
            :class="{ 'layout-input--readonly': !customId }"
            hide-details="auto"
            required
          />
          <p class="text-xs text-slate-500 mt-1 mb-5">Lowercase letters, numbers, and hyphens only</p>

          <v-btn
            @click="handleCreate"
            :disabled="!isValid"
            :loading="loading"
            color="primary"
            size="large"
            block
            class="text-none font-weight-bold"
          >
            <v-icon start>mdi-check-circle-outline</v-icon>
            Register Layout
          </v-btn>
        </v-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout-step {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}
.layout-container {
  width: 100%;
  max-width: 480px;
}

.layout-card {
  position: relative;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 28px;
  border: 1px solid transparent;
  background-clip: padding-box;
}
.layout-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 17px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(148, 163, 184, 0.1) 40%, rgba(20, 184, 166, 0.2));
  z-index: -1;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  padding: 1px;
}

.layout-input :deep(.v-field) {
  background: rgba(2, 6, 23, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  min-height: 44px;
  transition: border-color 150ms ease;
}
.layout-input :deep(.v-field:focus-within) {
  border-color: rgba(56, 189, 248, 0.5);
}
.layout-input :deep(.v-field__overlay) {
  display: none;
}
.layout-input :deep(.v-field input) {
  color: #e0f2fe;
  font-size: 0.95rem;
}
.layout-input :deep(.v-field input::placeholder) {
  color: rgba(148, 163, 184, 0.5);
}

.layout-input--readonly :deep(.v-field) {
  background: rgba(2, 6, 23, 0.5);
  border-color: rgba(148, 163, 184, 0.1);
}
.layout-input--readonly :deep(.v-field input) {
  color: rgba(148, 163, 184, 0.6);
}
</style>
