<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  add: [address: number]
}>()

const address = ref('')

const parsedAddress = computed<number | null>(() => {
  if (!address.value) return null
  const trimmed = address.value.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const n = Number(trimmed)
  if (!Number.isInteger(n) || n < 1 || n > 9999) return null
  return n
})

function submit() {
  const addr = parsedAddress.value
  if (addr === null) return
  emit('add', addr)
  address.value = ''
}
</script>

<template>
  <form class="quick-add" @submit.prevent="submit">
    <div class="quick-add__field">
      <label class="quick-add__label">DCC Address</label>
      <input
        v-model="address"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        placeholder="e.g. 3"
        class="quick-add__input quick-add__input--mono"
        @keyup.enter="submit"
      />
    </div>
    <v-btn
      icon
      size="small"
      color="green"
      variant="tonal"
      :disabled="!parsedAddress"
      @click="submit"
    >
      <v-icon size="18">mdi-plus</v-icon>
    </v-btn>
  </form>
</template>

<style scoped>
.quick-add {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.quick-add__field {
  display: flex;
  flex-direction: column;
  padding: 4px 12px 4px;
  background: rgba(2, 6, 23, 0.8);
  border: 1.5px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  min-width: 0;
  width: 110px;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.quick-add__field:focus-within {
  border-color: rgba(74, 222, 128, 0.5);
  box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.1);
}

.quick-add__label {
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(148, 163, 184, 0.5);
  line-height: 1;
}

.quick-add__input {
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

.quick-add__input::placeholder {
  color: rgba(148, 163, 184, 0.3);
}

.quick-add__input--mono {
  font-family: 'DM Mono', 'Courier New', monospace;
  color: rgba(74, 222, 128, 0.8);
}

/* Hide number spinners */
.quick-add__input::-webkit-outer-spin-button,
.quick-add__input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
