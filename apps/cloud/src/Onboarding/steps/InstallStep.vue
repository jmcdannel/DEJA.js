<script setup lang="ts">
import { ref } from 'vue'
import { QuickStart } from '@repo/ui'
import { useLocos } from '@repo/modules/locos'

defineProps<{
  uid?: string | null
  layoutId?: string
}>()

const emit = defineEmits<{
  complete: []
}>()

const { createLoco } = useLocos()

const locoAddress = ref<string>('')
const locoName = ref('')
const locoLoading = ref(false)
const locoAdded = ref(false)
const locoError = ref<string | null>(null)

async function handleAddLoco() {
  const address = parseInt(locoAddress.value)
  if (!address || address < 1) {
    locoError.value = 'Enter a valid DCC address (1–9999)'
    return
  }
  locoLoading.value = true
  locoError.value = null
  try {
    await createLoco(address, locoName.value || `Loco ${address}`, undefined, true)
    locoAdded.value = true
  } catch {
    locoError.value = 'Failed to add locomotive'
  } finally {
    locoLoading.value = false
  }
}

function addAnother() {
  locoAddress.value = ''
  locoName.value = ''
  locoAdded.value = false
}
</script>

<template>
  <div class="install-step">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-sky-100 mb-2">Install the DEJA Server</h2>
      <p class="opacity-60 text-sm">
        Run the installer on the machine connected to your DCC-EX Command Station — a Raspberry Pi,
        Mac, or Linux box. Your account and layout are linked automatically via the URL below.
      </p>
    </div>

    <div class="glass-card mb-6">
      <QuickStart :completed="[1]" :uid="uid" :layout-id="layoutId" />
    </div>

    <!-- Add First Locomotive -->
    <div class="glass-card mb-6">
      <div class="flex items-center gap-3 mb-4">
        <v-icon color="pink" size="28">mdi-train</v-icon>
        <h2 class="text-lg font-semibold text-sky-100">Add Your First Locomotive</h2>
      </div>
      <p class="opacity-60 text-sm mb-4">
        Enter the DCC address programmed into your locomotive decoder to get running right away.
      </p>

      <v-alert v-if="locoError" type="error" variant="tonal" density="compact" class="mb-4" closable @click:close="locoError = null">
        {{ locoError }}
      </v-alert>

      <div v-if="!locoAdded">
        <div class="flex gap-3 mb-3">
          <v-text-field
            v-model="locoAddress"
            label="DCC Address"
            placeholder="3"
            type="number"
            variant="solo-filled"
            density="compact"
            bg-color="transparent"
            class="setup-input"
            style="max-width: 140px;"
            hide-details
            @keydown.enter="handleAddLoco"
          />
          <v-text-field
            v-model="locoName"
            label="Name (optional)"
            placeholder="My Engine"
            variant="solo-filled"
            density="compact"
            bg-color="transparent"
            class="setup-input flex-1"
            hide-details
            @keydown.enter="handleAddLoco"
          />
        </div>
        <v-btn
          color="pink"
          :loading="locoLoading"
          prepend-icon="mdi-plus"
          class="text-none"
          @click="handleAddLoco"
        >
          Add Locomotive
        </v-btn>
      </div>

      <div v-else>
        <v-alert type="success" variant="tonal" density="compact" class="mb-4">
          Locomotive {{ locoAddress }} added to your roster!
        </v-alert>
        <div class="flex gap-3">
          <v-btn
            variant="tonal"
            prepend-icon="mdi-plus"
            class="text-none"
            @click="addAnother"
          >
            Add Another
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Explore More -->
    <div class="glass-card mb-6">
      <div class="flex items-center gap-3 mb-4">
        <v-icon color="primary" size="28">mdi-compass-outline</v-icon>
        <h2 class="text-lg font-semibold text-sky-100">Explore More</h2>
      </div>
      <p class="opacity-60 text-sm mb-4">
        Ready to dig deeper? Here are some next steps.
      </p>
      <div class="flex flex-col gap-2">
        <a href="https://dejajs.com/docs/install" target="_blank" rel="noopener noreferrer" class="explore-link">
          <v-icon size="18" class="mr-2">mdi-book-open-page-variant-outline</v-icon>
          Installation Guide
          <v-icon size="14" class="ml-auto opacity-40">mdi-open-in-new</v-icon>
        </a>
        <a href="https://dejajs.com/docs/roster" target="_blank" rel="noopener noreferrer" class="explore-link">
          <v-icon size="18" class="mr-2">mdi-train</v-icon>
          Managing Your Roster
          <v-icon size="14" class="ml-auto opacity-40">mdi-open-in-new</v-icon>
        </a>
        <a href="https://dejajs.com/docs/turnouts" target="_blank" rel="noopener noreferrer" class="explore-link">
          <v-icon size="18" class="mr-2">mdi-call-split</v-icon>
          Turnouts &amp; Routes
          <v-icon size="14" class="ml-auto opacity-40">mdi-open-in-new</v-icon>
        </a>
        <a href="https://dejajs.com/docs/effects" target="_blank" rel="noopener noreferrer" class="explore-link">
          <v-icon size="18" class="mr-2">mdi-lightbulb-outline</v-icon>
          Effects &amp; Automation
          <v-icon size="14" class="ml-auto opacity-40">mdi-open-in-new</v-icon>
        </a>
      </div>
    </div>

    <v-btn
      color="primary"
      size="large"
      block
      class="text-none font-weight-bold"
      prepend-icon="mdi-view-dashboard-outline"
      @click="emit('complete')"
    >
      Go to Dashboard
    </v-btn>
  </div>
</template>

<style scoped>
.install-step {
  max-width: 560px;
  margin: 0 auto;
}

.glass-card {
  position: relative;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 28px;
  border: 1px solid transparent;
  background-clip: padding-box;
}
.glass-card::before {
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

.setup-input :deep(.v-field) {
  background: rgba(2, 6, 23, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  min-height: 44px;
  transition: border-color 150ms ease;
}
.setup-input :deep(.v-field:focus-within) {
  border-color: rgba(56, 189, 248, 0.5);
}
.setup-input :deep(.v-field__overlay) {
  display: none;
}
.setup-input :deep(.v-field input) {
  color: #e0f2fe;
  font-size: 0.95rem;
}
.setup-input :deep(.v-field input::placeholder) {
  color: rgba(148, 163, 184, 0.5);
}

.explore-link {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(2, 6, 23, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.08);
  color: #cbd5e1;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 150ms ease;
}
.explore-link:hover {
  background: rgba(56, 189, 248, 0.08);
  border-color: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
}
</style>
