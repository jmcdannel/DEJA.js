<script setup lang="ts">
import { ref } from 'vue'
import { useLocos } from '@repo/modules/locos'

withDefaults(
  defineProps<{
    /** `card` — compact tile for the grid. `rich` — larger, centered for empty states. */
    variant?: 'card' | 'rich'
  }>(),
  { variant: 'card' }
)

const emit = defineEmits<{ 'open-roster': [] }>()

const { acquireThrottle } = useLocos()

const isAddressMode = ref(false)
const quickAddress = ref('')

async function handleAddByAddress() {
  const addr = parseInt(quickAddress.value.trim())
  if (!addr || isNaN(addr) || addr < 1) return
  await acquireThrottle(addr)
  quickAddress.value = ''
  isAddressMode.value = false
}
</script>

<template>
  <div class="add-card" :class="`add-card--${variant}`">
    <div class="add-card__accent" />
    <div class="add-card__body">
      <span class="add-card__title">Add Throttle</span>

      <!-- Default: two action buttons -->
      <div v-if="!isAddressMode" class="add-card__actions">
        <button class="add-card__btn" @click="isAddressMode = true">
          <v-icon size="18" class="mr-1">mdi-pound</v-icon>
          Enter Loco #
        </button>
        <button class="add-card__btn" @click="emit('open-roster')">
          <v-icon size="18" class="mr-1">mdi-train</v-icon>
          From Roster
        </button>
      </div>

      <!-- Address entry mode -->
      <form v-else class="add-card__form" @submit.prevent="handleAddByAddress">
        <input
          v-model="quickAddress"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          placeholder="DCC #"
          class="add-card__input"
          autofocus
        />
        <v-btn size="default" color="green" variant="tonal" :disabled="!quickAddress.trim()" @click="handleAddByAddress">
          <v-icon size="20">mdi-plus</v-icon>
        </v-btn>
        <v-btn size="default" variant="text" @click="isAddressMode = false; quickAddress = ''">
          <v-icon size="20">mdi-close</v-icon>
        </v-btn>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* 🚂 Add Throttle card */
.add-card {
  display: flex;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(var(--v-theme-surface), 0.5);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(148, 163, 184, 0.25);
}

/* Larger, centered presentation for empty states */
.add-card--rich {
  width: 100%;
  max-width: 420px;
}

.add-card__accent {
  width: 5px;
  flex-shrink: 0;
  background: rgba(74, 222, 128, 0.5);
}

.add-card__body {
  flex: 1;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.add-card__title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(148, 163, 184, 0.6);
}

.add-card__actions {
  display: flex;
  gap: 8px;
}

.add-card__btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(var(--v-theme-surface), 0.4);
  color: rgba(226, 232, 240, 0.85);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 150ms ease,
    border-color 150ms ease;
}

.add-card__btn:hover {
  background: rgba(var(--v-theme-surface), 0.7);
  border-color: rgba(148, 163, 184, 0.3);
}

.add-card__form {
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-card__input {
  flex: 1;
  background: rgba(2, 6, 23, 0.8);
  border: 1.5px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  padding: 10px 12px;
  color: rgba(74, 222, 128, 0.85);
  font-family: 'DM Mono', 'Courier New', monospace;
  font-size: 16px;
  outline: none;
  min-width: 0;
}

.add-card__input:focus {
  border-color: rgba(74, 222, 128, 0.5);
  box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.1);
}

.add-card__input::placeholder {
  color: rgba(148, 163, 184, 0.3);
}

/* Hide number spinners */
.add-card__input::-webkit-outer-spin-button,
.add-card__input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
