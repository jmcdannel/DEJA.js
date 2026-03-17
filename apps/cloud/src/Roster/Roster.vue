<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { onValue, ref as dbRef } from 'firebase/database'
import { useStorage } from '@vueuse/core'
import { rtdb } from '@repo/firebase-config'
import type { Loco } from '@repo/modules/locos'
import { useLocos } from '@repo/modules/locos'
import { useDcc } from '@repo/dccex'
import PageHeader from '@/Core/UI/PageHeader.vue'
import RosterList from '@/Roster/RosterList.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const router = useRouter()
const layoutId = useStorage('@DEJA/layoutId', '')
const { getLocos } = useLocos()
const { syncAllRoster, importRoster } = useDcc()

const locos = getLocos()

interface RosterSyncStatus {
  status: 'syncing' | 'success' | 'error' | 'importing'
  message: string
  importedCount: number
}

const rosterSyncStatus = ref<RosterSyncStatus | null>(null)
const snackbarOpen = ref(false)

const isSyncing = computed(() =>
  rosterSyncStatus.value?.status === 'syncing' || rosterSyncStatus.value?.status === 'importing'
)

const snackbarColor = computed(() => {
  switch (rosterSyncStatus.value?.status) {
    case 'success': return 'success'
    case 'error': return 'error'
    default: return 'info'
  }
})

const snackbarTimeout = computed(() =>
  rosterSyncStatus.value?.status === 'error' ? -1 : 4000
)

let unsubscribeStatus: (() => void) | null = null

onMounted(() => {
  if (!layoutId.value) return
  const statusRef = dbRef(rtdb, `rosterSync/${layoutId.value}`)
  unsubscribeStatus = onValue(statusRef, (snapshot) => {
    const val = snapshot.val() as RosterSyncStatus | null
    if (val) {
      rosterSyncStatus.value = val
      snackbarOpen.value = true
    }
  })
})

onUnmounted(() => {
  if (unsubscribeStatus) unsubscribeStatus()
})

function handleEditLoco(loco: Loco) {
  router.push({ name: 'Edit Loco', params: { address: loco.address } })
}

function handleAddLoco() {
  router.push({ name: 'Add Loco' })
}

async function syncToCS() {
  if (!locos.value?.length) return
  await syncAllRoster(locos.value as Loco[])
}

async function importFromCS() {
  await importRoster()
}
</script>

<template>
  <PageHeader menu="Roster" />

  <div class="flex gap-2 px-4 mb-4">
    <v-btn
      :loading="rosterSyncStatus?.status === 'syncing'"
      :disabled="isSyncing"
      prepend-icon="mdi-sync"
      variant="tonal"
      color="primary"
      size="small"
      @click="syncToCS"
    >
      Sync to DCC-EX
    </v-btn>
    <v-btn
      :loading="rosterSyncStatus?.status === 'importing'"
      :disabled="isSyncing"
      prepend-icon="mdi-download"
      variant="tonal"
      color="secondary"
      size="small"
      @click="importFromCS"
    >
      Import from DCC-EX
    </v-btn>
  </div>

  <RosterList @edit="handleEditLoco">
    <template #prepend>
      <AddTile @click="handleAddLoco" />
    </template>
  </RosterList>

  <v-snackbar
    v-model="snackbarOpen"
    :color="snackbarColor"
    :timeout="snackbarTimeout"
    location="bottom right"
  >
    {{ rosterSyncStatus?.message }}
    <template #actions>
      <v-btn variant="text" @click="snackbarOpen = false">Close</v-btn>
    </template>
  </v-snackbar>
</template>