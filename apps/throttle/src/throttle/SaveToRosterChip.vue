<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { useLocos, ROADNAMES, type Loco } from '@repo/modules/locos'
import { createLogger } from '@repo/utils'

const props = defineProps<{
  address: number
}>()

const log = createLogger('SaveToRosterChip')
const layoutId = useStorage('@DEJA/layoutId', '')
const { getLocos } = useLocos()
const locos = getLocos()

const hasLoco = computed(() => {
  if (!props.address) return false
  return ((locos.value || []) as Loco[]).some((l) => l.address === props.address)
})

const dialog = ref(false)
const name = ref('')
const roadname = ref<string | null>(null)
const saving = ref(false)

async function save() {
  if (!layoutId.value || !props.address) return
  saving.value = true
  try {
    await setDoc(
      doc(db, `layouts/${layoutId.value}/locos`, props.address.toString()),
      {
        address: props.address,
        name: name.value || `Loco ${props.address}`,
        meta: { roadname: roadname.value || '' },
        timestamp: serverTimestamp(),
      },
      { merge: true },
    )
    dialog.value = false
    name.value = ''
    roadname.value = null
  } catch (e) {
    log.error('Failed to save loco to roster', e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <template v-if="!hasLoco && address">
    <v-chip
      color="amber"
      size="small"
      variant="tonal"
      prepend-icon="mdi-tag-plus-outline"
      class="save-to-roster-chip"
      @click="dialog = true"
    >
      Not in roster · Save
    </v-chip>
    <v-dialog v-model="dialog" max-width="360">
      <v-card class="pa-4">
        <div class="text-subtitle-1 mb-3 font-weight-bold">Save Loco #{{ address }}</div>
        <v-text-field
          v-model="name"
          label="Name"
          placeholder="e.g. GP38"
          density="compact"
          variant="outlined"
          autofocus
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
        />
        <div class="flex justify-end gap-2 mt-2">
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="save">Save</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </template>
</template>

<style scoped>
.save-to-roster-chip {
  cursor: pointer;
}
</style>
