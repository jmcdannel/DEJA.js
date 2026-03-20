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
const step2Complete = computed(() => isComplete(2) || props.serverOnline)
const step3Active = computed(() => step2Complete.value)

// Quick-add loco form
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
  <div class="quick-start">
    <p class="quick-start__section-label">Quick Start</p>

    <!-- Prerequisite note -->
    <div class="quick-start__prereq">
      <v-icon icon="mdi-usb-port" size="16" class="mr-2" style="opacity: 0.5" />
      <span>Make sure your DCC-EX CommandStation is connected via USB.</span>
    </div>

    <!-- Step 1: Register -->
    <div class="quick-start__step">
      <div class="quick-start__track">
        <div
          class="quick-start__circle"
          :class="isComplete(1) ? 'quick-start__circle--complete' : 'quick-start__circle--active'"
        >
          <span>{{ isComplete(1) ? '✓' : '1' }}</span>
        </div>
        <div
          class="quick-start__connector"
          :class="isComplete(1) ? 'quick-start__connector--complete' : ''"
        />
      </div>
      <div class="quick-start__content" :class="{ 'quick-start__content--done': isComplete(1) }">
        <p class="quick-start__title">Create your account</p>
        <p class="quick-start__desc">Sign up at DEJA Cloud to get your Layout ID</p>
        <p v-if="isComplete(1)" class="quick-start__hint">You're already registered</p>
      </div>
    </div>

    <!-- Step 2: Install -->
    <div class="quick-start__step">
      <div class="quick-start__track">
        <div
          class="quick-start__circle"
          :class="
            step2Complete
              ? 'quick-start__circle--complete'
              : isComplete(1)
                ? 'quick-start__circle--active'
                : 'quick-start__circle--pending'
          "
        >
          <span>{{ step2Complete ? '✓' : '2' }}</span>
        </div>
        <div
          class="quick-start__connector"
          :class="step2Complete ? 'quick-start__connector--complete' : ''"
        />
      </div>
      <div class="quick-start__content" :class="{ 'quick-start__content--done': step2Complete }">
        <p class="quick-start__title">Install the server</p>
        <p class="quick-start__desc">Run on Raspberry Pi, Mac, or Linux</p>
        <ServerSetupInfo v-if="!step2Complete" :uid="uid" :layout-id="layoutId" />
        <p v-else class="quick-start__hint">Server connected!</p>
      </div>
    </div>

    <!-- Step 3: Run first train -->
    <div class="quick-start__step">
      <div class="quick-start__track">
        <div
          class="quick-start__circle"
          :class="step3Active ? 'quick-start__circle--active' : 'quick-start__circle--pending'"
        >
          <span>3</span>
        </div>
      </div>
      <div
        class="quick-start__content"
        :class="{ 'quick-start__content--pending': !step3Active }"
      >
        <p class="quick-start__title">Run your first train</p>
        <p class="quick-start__desc">Add a locomotive and open the Throttle app</p>

        <template v-if="step3Active">
          <div v-if="!locoAdded" class="quick-start__loco-form">
            <div class="d-flex ga-2 mb-2 flex-wrap">
              <v-text-field
                v-model="locoAddress"
                label="DCC Address"
                placeholder="3"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 110px"
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
          <div v-else>
            <v-alert type="success" variant="tonal" density="compact" class="mb-2">
              Locomotive {{ locoAddress }} added!
            </v-alert>
            <div class="d-flex ga-2">
              <v-btn variant="tonal" size="small" prepend-icon="mdi-plus" @click="addAnother">
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

    <!-- CTA links -->
    <div class="quick-start__links">
      <a
        v-for="link in ctaLinks"
        :key="link.label"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="quick-start__link"
      >{{ link.label }}</a>
    </div>
  </div>
</template>

<style scoped>
.quick-start {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.quick-start__section-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.7);
  margin-bottom: 1.25rem;
}

/* Step row */
.quick-start__step {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

/* Left track: circle + connector */
.quick-start__track {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

/* Step circle */
.quick-start__circle {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 700;
  flex-shrink: 0;
  transition: background-color 300ms ease, border-color 300ms ease, color 300ms ease;
}

.quick-start__circle--active {
  background-color: #38bdf8;
  color: #0f172a;
}

.quick-start__circle--pending {
  border: 2px solid rgba(56, 189, 248, 0.3);
  color: rgba(148, 163, 184, 0.5);
}

.quick-start__circle--complete {
  background-color: #22c55e;
  color: #fff;
}

/* Connector line between circles */
.quick-start__connector {
  width: 1px;
  height: 4rem;
  margin-top: 0.25rem;
  background-color: rgba(56, 189, 248, 0.25);
  transition: background-color 300ms ease;
}

.quick-start__connector--complete {
  background-color: rgba(34, 197, 94, 0.25);
}

/* Step content */
.quick-start__content {
  flex: 1;
  padding-top: 0.25rem;
  padding-bottom: 1.5rem;
  transition: opacity 300ms ease;
}

.quick-start__content--done {
  opacity: 0.55;
}

.quick-start__title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #e0f2fe;
  margin-bottom: 0.25rem;
}

.quick-start__content--done .quick-start__title {
  text-decoration: line-through;
  text-decoration-color: rgba(148, 163, 184, 0.4);
}

.quick-start__desc {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.7);
  margin-bottom: 0.625rem;
}

.quick-start__hint {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.5);
  font-style: italic;
}

/* CTA links */
.quick-start__links {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
  padding-top: 0.875rem;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  margin-top: 0.25rem;
}

.quick-start__link {
  font-size: 0.75rem;
  color: #38bdf8;
  text-decoration: none;
  transition: color 150ms ease;
}

.quick-start__link:hover {
  color: #bae6fd;
  text-decoration: underline;
}

.quick-start__prereq {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 1.25rem;
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.6);
}

.quick-start__content--pending {
  opacity: 0.4;
}

.quick-start__loco-form {
  margin-top: 8px;
}
</style>
