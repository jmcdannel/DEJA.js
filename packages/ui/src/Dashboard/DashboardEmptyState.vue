<script setup lang="ts">
import { ref, computed } from 'vue'
import ServerSetupInfo from '../ServerSetupInfo.vue'

interface Props {
  completed?: number[]
  uid?: string | null
  layoutId?: string
  serverOnline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  completed: () => [],
  uid: undefined,
  layoutId: undefined,
  serverOnline: false,
})

const emit = defineEmits<{
  addLoco: [address: number, name: string]
}>()

const isComplete = (step: number) => props.completed.includes(step)

// Step 2 auto-completes when server is online
const step2Complete = computed(() => isComplete(2) || props.serverOnline)

// Step 3 active when server is online
const step3Active = computed(() => step2Complete.value)

// Quick-add loco form state
const locoAddress = ref('')
const locoName = ref('')
const locoAdded = ref(false)

function handleAddLoco() {
  const address = parseInt(locoAddress.value)
  if (!address || address < 1) return
  emit('addLoco', address, locoName.value || `Loco ${address}`)
  locoAdded.value = true
}

function addAnother() {
  locoAddress.value = ''
  locoName.value = ''
  locoAdded.value = false
}

const ctaLinks = [
  { label: 'Docs', url: 'https://docs.dejajs.com' },
  { label: 'DEJA IO', url: 'https://dejajs.com/io' },
  { label: 'Help', url: 'https://dejajs.com/help' },
  { label: 'FAQ', url: 'https://dejajs.com/faq' },
]
</script>

<template>
  <div class="empty-state">
    <!-- Welcome header -->
    <div class="text-center mb-7">
      <v-icon icon="mdi-train" size="48" color="primary" class="mb-3" />
      <h2 class="text-h5 font-weight-bold text-high-emphasis mb-1">Welcome to DEJA Cloud</h2>
      <p class="text-body-2 text-medium-emphasis mx-auto" style="max-width: 360px">
        Your layout control center. Let's get your railroad connected in a few quick steps.
      </p>
    </div>

    <!-- Prerequisite note -->
    <div class="empty-state__prereq mb-5">
      <v-icon icon="mdi-usb-port" size="16" class="mr-2 text-medium-emphasis" />
      <span class="text-caption text-medium-emphasis">
        Make sure your DCC-EX CommandStation is connected to your computer via USB before installing the server.
      </span>
    </div>

    <!-- Steps -->
    <div class="empty-state__steps">
      <!-- Step 1: Create account -->
      <div class="empty-state__step">
        <div class="empty-state__track">
          <div class="empty-state__circle empty-state__circle--complete">
            <v-icon icon="mdi-check" size="14" />
          </div>
          <div class="empty-state__connector empty-state__connector--complete" />
        </div>
        <div class="empty-state__content empty-state__content--done">
          <p class="empty-state__title">Create your account</p>
          <p class="empty-state__desc">You're signed in — nice!</p>
        </div>
      </div>

      <!-- Step 2: Install server -->
      <div class="empty-state__step">
        <div class="empty-state__track">
          <div
            class="empty-state__circle"
            :class="step2Complete ? 'empty-state__circle--complete' : 'empty-state__circle--active'"
          >
            <v-icon v-if="step2Complete" icon="mdi-check" size="14" />
            <span v-else>2</span>
          </div>
          <div
            class="empty-state__connector"
            :class="step2Complete ? 'empty-state__connector--complete' : ''"
          />
        </div>
        <div
          class="empty-state__content"
          :class="{ 'empty-state__content--done': step2Complete }"
        >
          <p class="empty-state__title">Install the DEJA Server</p>
          <p class="empty-state__desc">Run on Raspberry Pi, Mac, or Linux</p>
          <ServerSetupInfo v-if="!step2Complete" :uid="uid" :layout-id="layoutId" />
          <p v-else class="empty-state__hint">Server connected!</p>
        </div>
      </div>

      <!-- Step 3: Run first train -->
      <div class="empty-state__step">
        <div class="empty-state__track">
          <div
            class="empty-state__circle"
            :class="
              step3Active
                ? 'empty-state__circle--active'
                : 'empty-state__circle--pending'
            "
          >
            <span>3</span>
          </div>
        </div>
        <div
          class="empty-state__content"
          :class="{ 'empty-state__content--pending': !step3Active }"
        >
          <p class="empty-state__title">Run your first train</p>
          <p class="empty-state__desc">Add a locomotive and open the Throttle app</p>

          <template v-if="step3Active">
            <div v-if="!locoAdded" class="mt-3">
              <div class="d-flex ga-3 mb-3 flex-wrap">
                <v-text-field
                  v-model="locoAddress"
                  label="DCC Address"
                  placeholder="3"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="max-width: 120px"
                  @keydown.enter="handleAddLoco"
                />
                <v-text-field
                  v-model="locoName"
                  label="Name (optional)"
                  placeholder="My Engine"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="flex-grow-1"
                  @keydown.enter="handleAddLoco"
                />
              </div>
              <v-btn
                color="primary"
                variant="flat"
                size="small"
                prepend-icon="mdi-plus"
                :disabled="!locoAddress"
                @click="handleAddLoco"
              >
                Add Locomotive
              </v-btn>
            </div>

            <div v-else class="mt-3">
              <v-alert type="success" variant="tonal" density="compact" class="mb-3">
                Locomotive {{ locoAddress }} added to your roster!
              </v-alert>
              <div class="d-flex ga-2 flex-wrap">
                <v-btn
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-plus"
                  @click="addAnother"
                >
                  Add Another
                </v-btn>
                <v-btn
                  color="primary"
                  variant="flat"
                  size="small"
                  href="https://throttle.dejajs.com"
                  target="_blank"
                  prepend-icon="mdi-speedometer"
                >
                  Open Throttle
                </v-btn>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Resource links -->
    <div class="empty-state__links">
      <a
        v-for="link in ctaLinks"
        :key="link.label"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="empty-state__link"
      >{{ link.label }}</a>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  max-width: 520px;
  margin: 0 auto;
  padding: 24px 0;
}

.empty-state__prereq {
  display: flex;
  align-items: center;
  background: rgba(var(--v-theme-on-surface), 0.02);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  border-radius: 6px;
  padding: 8px 12px;
}

.empty-state__steps {
  display: flex;
  flex-direction: column;
}

.empty-state__step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.empty-state__track {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.empty-state__circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 700;
  flex-shrink: 0;
  transition: background-color 300ms ease, border-color 300ms ease, color 300ms ease;
}

.empty-state__circle--active {
  background-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.empty-state__circle--pending {
  border: 2px solid rgba(var(--v-theme-primary), 0.2);
  color: rgba(var(--v-theme-on-surface), 0.4);
}

.empty-state__circle--complete {
  background-color: rgb(var(--v-theme-success));
  color: rgb(var(--v-theme-on-success, 255, 255, 255));
}

.empty-state__connector {
  width: 1px;
  height: 4rem;
  margin-top: 4px;
  background-color: rgba(var(--v-theme-primary), 0.2);
  transition: background-color 300ms ease;
}

.empty-state__connector--complete {
  background-color: rgba(var(--v-theme-success), 0.25);
}

.empty-state__content {
  flex: 1;
  padding-top: 3px;
  padding-bottom: 16px;
  transition: opacity 300ms ease;
}

.empty-state__content--done {
  opacity: 0.55;
}

.empty-state__content--pending {
  opacity: 0.4;
}

.empty-state__title {
  font-size: 0.875rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 2px;
}

.empty-state__content--done .empty-state__title {
  text-decoration: line-through;
  text-decoration-color: rgba(var(--v-theme-on-surface), 0.3);
}

.empty-state__desc {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin-bottom: 8px;
}

.empty-state__hint {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.4);
  font-style: italic;
}

.empty-state__links {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding-top: 14px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  margin-top: 8px;
  justify-content: center;
}

.empty-state__link {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  transition: color 150ms ease;
}

.empty-state__link:hover {
  color: rgba(var(--v-theme-primary), 0.7);
  text-decoration: underline;
}
</style>
