<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import { useCurrentUser } from 'vuefire'
import { slugify } from '@repo/utils'

const emit = defineEmits<{
  complete: [payload: { name: string; id: string }]
}>()

const user = useCurrentUser()

const layoutName = ref('')
const layoutId = ref('')
const customSlug = ref(false)
const activeField = ref<'name' | 'slug'>('name')
const nameRef = ref<HTMLInputElement | null>(null)
const slugRef = ref<HTMLInputElement | null>(null)
const error = ref<string | null>(null)

// Pre-fill layout name from email prefix
onMounted(() => {
  if (user.value?.email) {
    const prefix = user.value.email.split('@')[0]
    layoutName.value = prefix
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }
  nextTick(() => nameRef.value?.focus())
})

// Auto-slugify name → ID (unless user has manually edited slug)
watch(layoutName, (name) => {
  if (!customSlug.value) {
    layoutId.value = slugify(name)
  }
})

// Validation
const nameValid = computed(() => layoutName.value.trim().length >= 2)
const slugValid = computed(() =>
  /^[a-z0-9-]+$/.test(layoutId.value) && layoutId.value.length >= 3
)
const canSubmit = computed(() => nameValid.value && slugValid.value)

function handleNameKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === 'Tab') {
    e.preventDefault()
    if (nameValid.value) {
      advanceToSlug()
    }
  }
}

function handleSlugKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleSubmit()
  }
  if (e.key === 'Backspace' && layoutId.value === '') {
    e.preventDefault()
    customSlug.value = false
    activeField.value = 'name'
    nextTick(() => nameRef.value?.focus())
  }
}

function handleSlugInput() {
  customSlug.value = true
}

function advanceToSlug() {
  activeField.value = 'slug'
  nextTick(() => {
    slugRef.value?.focus()
    slugRef.value?.select()
  })
}

function handleSubmit() {
  if (!canSubmit.value) {
    if (!nameValid.value) {
      error.value = 'Layout name must be at least 2 characters'
      activeField.value = 'name'
      nextTick(() => nameRef.value?.focus())
    } else if (!slugValid.value) {
      error.value = 'Layout ID must be at least 3 characters (lowercase letters, numbers, hyphens)'
    }
    return
  }
  error.value = null
  emit('complete', { name: layoutName.value.trim(), id: layoutId.value })
}
</script>

<template>
  <div class="name-layout-step">
    <div class="step-container">
      <div class="step-card">
        <div class="flex items-center gap-3 mb-2">
          <v-icon color="primary" size="24">mdi-map-marker-path</v-icon>
          <h2 class="text-lg font-semibold text-sky-100">Name Your Railroad</h2>
        </div>
        <p class="text-sm opacity-60 mb-6">
          Every great railroad starts with a name. We'll create a unique ID for your layout automatically.
        </p>

        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-5"
          closable
          @click:close="error = null"
        >
          {{ error }}
        </v-alert>

        <!-- 🎯 Stripe-like dual-field input -->
        <div
          class="stripe-input"
          :class="{
            'stripe-input--name-active': activeField === 'name',
            'stripe-input--slug-active': activeField === 'slug',
          }"
        >
          <!-- Layout Name field -->
          <div class="stripe-input__field stripe-input__name">
            <label class="stripe-input__label">
              Layout Name
            </label>
            <input
              ref="nameRef"
              v-model="layoutName"
              class="stripe-input__input"
              placeholder="My Railroad"
              @focus="activeField = 'name'"
              @keydown="handleNameKeydown"
            />
          </div>

          <!-- Separator -->
          <div class="stripe-input__sep">
            <span class="stripe-input__sep-icon">/</span>
          </div>

          <!-- Layout ID (slug) field -->
          <div class="stripe-input__field stripe-input__slug">
            <label class="stripe-input__label">
              Layout ID
            </label>
            <input
              ref="slugRef"
              v-model="layoutId"
              class="stripe-input__input stripe-input__input--mono"
              placeholder="my-railroad"
              @focus="activeField = 'slug'"
              @keydown="handleSlugKeydown"
              @input="handleSlugInput"
            />
          </div>
        </div>

        <p class="text-xs opacity-40 mt-2 mb-5">
          Press <kbd class="kbd">Enter</kbd> to advance · Layout ID: lowercase letters, numbers, hyphens
        </p>

        <v-btn
          @click="handleSubmit"
          :disabled="!canSubmit"
          color="primary"
          size="large"
          block
          class="text-none font-weight-bold"
        >
          <v-icon start>mdi-arrow-right</v-icon>
          Continue
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.name-layout-step {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}
.step-container {
  width: 100%;
  max-width: 520px;
}

.step-card {
  position: relative;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 28px;
  border: 1px solid transparent;
  background-clip: padding-box;
}
.step-card::before {
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

/* ── Stripe-like dual-field input ── */
.stripe-input {
  display: flex;
  align-items: stretch;
  background: rgba(2, 6, 23, 0.9);
  border: 1.5px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}
.stripe-input:focus-within {
  border-color: rgba(56, 189, 248, 0.5);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
}

.stripe-input__field {
  flex: 1;
  padding: 12px 16px 10px;
  transition: background 200ms ease, flex 250ms cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 0;
}

/* Active field gets slight emphasis */
.stripe-input--name-active .stripe-input__name {
  flex: 1.4;
  background: rgba(56, 189, 248, 0.03);
}
.stripe-input--slug-active .stripe-input__slug {
  flex: 1.4;
  background: rgba(56, 189, 248, 0.03);
}

.stripe-input__label {
  display: block;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(148, 163, 184, 0.5);
  margin-bottom: 4px;
  font-weight: 600;
  transition: color 200ms ease;
}
.stripe-input--name-active .stripe-input__name .stripe-input__label,
.stripe-input--slug-active .stripe-input__slug .stripe-input__label {
  color: rgba(56, 189, 248, 0.7);
}

.stripe-input__input {
  display: block;
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: #e0f2fe;
  font-size: 0.95rem;
  line-height: 1.4;
  padding: 0;
}
.stripe-input__input::placeholder {
  color: rgba(148, 163, 184, 0.35);
}
.stripe-input__input--mono {
  font-family: 'DM Mono', monospace;
  font-size: 0.85rem;
  color: rgba(56, 189, 248, 0.8);
}

/* Separator */
.stripe-input__sep {
  display: flex;
  align-items: center;
  padding: 0 2px;
}
.stripe-input__sep-icon {
  font-size: 1.2rem;
  color: rgba(148, 163, 184, 0.2);
  font-weight: 300;
  user-select: none;
}

/* Keyboard hint */
.kbd {
  display: inline-block;
  padding: 1px 5px;
  font-size: 0.65rem;
  font-family: 'DM Mono', monospace;
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 4px;
  color: rgba(148, 163, 184, 0.6);
}
</style>
