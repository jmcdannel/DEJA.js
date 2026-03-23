<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { onValue, ref as dbRef } from 'firebase/database'
import { useStorage } from '@vueuse/core'
import { rtdb } from '@repo/firebase-config'
import type { Loco } from '@repo/modules/locos'
import { useLocos } from '@repo/modules/locos'
import { useDcc } from '@repo/dccex'
import { PageHeader, ListControlBar, useListControls } from '@repo/ui'
import RosterList from '@/Roster/RosterList.vue'
import AddTile from '@/Core/UI/AddTile.vue'
import { ThrottleLaunchQR } from '@repo/ui'

const router = useRouter()
const layoutId = useStorage('@DEJA/layoutId', '')
const { getLocos } = useLocos()
const { syncAllRoster, importRoster } = useDcc()

const locos = getLocos()

const rosterList = computed(() =>
  locos?.value ? locos.value.map((l) => ({ ...l, id: l.address })) : []
)
const rosterControls = useListControls('cloud-roster', { list: rosterList })

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
  <PageHeader title="Roster" icon="mdi-train" color="pink">
    <template #controls>
      <ListControlBar
        :controls="rosterControls"
        color="pink"
        :show-filters="false"
        :show-view="false"
        :show-sort="false"
        search-placeholder="Search roster..."
      />
    </template>
    <template #actions>
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
    </template>
  </PageHeader>

  <RosterList @edit="handleEditLoco">
    <template #prepend>
      <AddTile @click="handleAddLoco" />
    </template>
    <template #append>
      <v-card variant="outlined" class="d-flex flex-column align-center justify-center pa-4 text-center" min-height="120">
        <ThrottleLaunchQR :size="100" label="Open Throttle on phone" />
      </v-card>
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