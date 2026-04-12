<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { ROADNAMES } from '@repo/modules/locos'
import { createLogger } from '@repo/utils'

const log = createLogger('RosterQuickAdd')
const layoutId = useStorage('@DEJA/layoutId', '')

const address = ref<string>('')
const name = ref('')
const roadname = ref<string | null>(null)
const saving = ref(false)
const error = ref<string | null>(null)

const parsedAddress = computed<number | null>(() => {
  if (!address.value) return null
  if (!/^\d+$/.test(address.value)) return null
  const n = Number(address.value)
  if (!Number.isInteger(n) || n < 1 || n > 9999) return null
  return n
})

const canSave = computed(() => parsedAddress.value !== null && !saving.value)

async function save() {
  const addr = parsedAddress.value
  if (addr === null || !layoutId.value) return
  error.value = null
  saving.value = true
  try {
    await setDoc(
      doc(db, `layouts/${layoutId.value}/locos`, String(addr)),
      {
        address: addr,
        name: name.value || `Loco ${addr}`,
        meta: { roadname: roadname.value || '' },
        timestamp: serverTimestamp(),
      },
      { merge: true },
    )
    address.value = ''
    name.value = ''
    roadname.value = null
  } catch (e) {
    log.error('Failed to save loco', e)
    error.value = e instanceof Error ? e.message : 'Failed to save loco'
  } finally {
    saving.value = false
  }
}

defineExpose({ address, name, roadname, error, save })
</script>

<template>
  <v-card class="roster-quick-add pa-3 mb-3" variant="tonal">
    <div class="flex items-center gap-3 flex-wrap">
      <v-text-field
        v-model="address"
        type="number"
        inputmode="numeric"
        :min="1"
        :max="9999"
        label="DCC Address"
        density="compact"
        variant="outlined"
        hide-details
        class="qa-field qa-field-address"
        @keyup.enter="save"
      />
      <v-text-field
        v-model="name"
        label="Name"
        placeholder="e.g. GP38"
        density="compact"
        variant="outlined"
        hide-details
        class="qa-field qa-field-name"
        @keyup.enter="save"
      />
      <v-select
        v-model="roadname"
        :items="ROADNAMES"
        item-title="label"
        item-value="value"
        label="Roadname"
        density="compact"
        variant="outlined"
        clearable
        hide-details
        class="qa-field qa-field-roadname"
      />
      <v-btn
        color="pink"
        prepend-icon="mdi-plus"
        :disabled="!canSave"
        :loading="saving"
        aria-label="Add to roster"
        @click="save"
      >
        Add
      </v-btn>
    </div>
    <div v-if="error" class="text-caption text-error mt-2">{{ error }}</div>
  </v-card>
</template>

<style scoped>
.qa-field-address { max-width: 140px; }
.qa-field-name { min-width: 180px; flex: 1; }
.qa-field-roadname { max-width: 200px; }
</style>
