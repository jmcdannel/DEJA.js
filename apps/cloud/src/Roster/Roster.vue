<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { onValue, ref as dbRef } from 'firebase/database'
import { useStorage } from '@vueuse/core'
import { rtdb } from '@repo/firebase-config'
import type { Loco } from '@repo/modules/locos'
import { useLocos, ROADNAMES } from '@repo/modules/locos'
import { useLayout, useServerStatus, useSubscription, PLAN_DISPLAY } from '@repo/modules'
import { useDcc } from '@repo/dccex'
import { ListControlBar, useListControls, LocoRoster, ThrottleLaunchQR } from '@repo/ui'
import type { ListFilter } from '@repo/ui'
import ListPage from '@/Core/UI/ListPage.vue'
import EmptyState from '@/Core/UI/EmptyState.vue'

const router = useRouter()
const layoutId = useStorage('@DEJA/layoutId', '')
const { getLocos } = useLocos()
const { syncAllRoster, importRoster } = useDcc()
const { getDevices } = useLayout()
const { serverStatus } = useServerStatus()
const { plan } = useSubscription()

const locos = getLocos()
const devices = getDevices()

// 🔄 Loading state
const isLoaded = ref(false)
let loadingTimeout: ReturnType<typeof setTimeout> | undefined
onMounted(async () => {
  loadingTimeout = setTimeout(() => { isLoaded.value = true }, 3000)
  try {
    await (locos as any).promise
  } finally {
    clearTimeout(loadingTimeout)
    isLoaded.value = true
  }
})

const isLoading = computed(() => !isLoaded.value)
const isFreePlan = computed(() => plan.value === 'hobbyist')

const isDisconnected = computed(() => {
  const serverOffline = !serverStatus.value?.online
  const noDccExConnected = !devices.value?.some(
    (d) => d.type === 'dcc-ex' && d.isConnected
  )
  return serverOffline || noDccExConnected
})

const rosterList = computed(() =>
  locos?.value ? (locos.value as Loco[]).map((l) => ({
    ...l,
    id: String(l.address),
    roadname: l.meta?.roadname || '',
    locoType: l.consist?.length ? 'consist' : 'single',
  })) : []
)

// 🔍 Filter & sort options
const roadnameOptions = ROADNAMES.map((r) => ({ label: r.label, value: r.value }))

const typeOptions = [
  { label: 'Consist', value: 'consist' },
  { label: 'Single', value: 'single' },
]

const filters = computed<ListFilter[]>(() => [
  { type: 'roadname', label: 'Road', options: roadnameOptions },
  { type: 'locoType', label: 'Type', options: typeOptions },
])

const sortOptions = [
  { value: 'order', label: 'Default' },
  { value: 'name', label: 'Name' },
  { value: 'address', label: 'Address' },
]

const rosterControls = useListControls('cloud-roster', {
  list: rosterList,
  filters: filters.value,
  sortOptions,
})

// 📡 Roster sync status
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
  clearTimeout(loadingTimeout)
  if (unsubscribeStatus) unsubscribeStatus()
})

function handleEditLoco(loco: Loco) {
  router.push({ name: 'Edit Loco', params: { address: loco.address } })
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
  <ListPage
    title="Roster"
    icon="mdi-train"
    color="pink"
    :add-to="{ name: 'Add Loco' }"
    add-label="New Loco"
    :loading="isLoading"
    :empty="isLoaded && rosterList.length === 0"
  >
    <template #subtitle>
      <span class="hidden sm:inline">Manage your locomotive fleet and decoder configurations.</span>
    </template>

    <template #controls>
      <ListControlBar
        :controls="rosterControls"
        color="pink"
        :sort-options="sortOptions"
        :filters="filters"
        :show-view="true"
        :show-search="false"
        :view-options="[
          { value: 'cab', icon: 'mdi-train', label: 'Cab' },
          { value: 'avatar', icon: 'mdi-circle-outline', label: 'Avatar' },
          { value: 'plate', icon: 'mdi-card-text-outline', label: 'Plate' },
          { value: 'card', icon: 'mdi-view-grid-outline', label: 'Card' },
          { value: 'table', icon: 'mdi-table', label: 'Table' },
          { value: 'raw', icon: 'mdi-code-json', label: 'Raw' },
        ]"
      />
    </template>

    <template #actions>
      <v-btn
        :loading="rosterSyncStatus?.status === 'syncing'"
        :disabled="isSyncing || isDisconnected"
        prepend-icon="mdi-sync"
        variant="tonal"
        color="pink"
        size="small"
        @click="syncToCS"
      >
        Sync to DCC-EX
      </v-btn>
      <v-btn
        :loading="rosterSyncStatus?.status === 'importing'"
        :disabled="isSyncing || isDisconnected"
        prepend-icon="mdi-download"
        variant="tonal"
        color="pink"
        size="small"
        @click="importFromCS"
      >
        Import from DCC-EX
      </v-btn>
    </template>

    <LocoRoster
      :locos="rosterControls.filteredList.value"
      default-view="card"
      module-name="cloud-roster"
      @select="handleEditLoco"
    />

    <v-card variant="outlined" class="d-flex flex-column align-center justify-center pa-4 text-center mt-4" min-height="120">
      <ThrottleLaunchQR :size="100" label="Open Throttle on phone" />
    </v-card>

    <template #empty-state>
      <EmptyState
        icon="mdi-train"
        color="pink"
        title="No Locomotives Yet"
        :description="isFreePlan
          ? `Upgrade to ${PLAN_DISPLAY.engineer.name} to unlock the full roster experience with up to 25 locomotives and advanced features.`
          : 'Build your digital roster by adding locomotives with their DCC addresses, decoder functions, and custom configurations.'"
        :use-cases="[
          { icon: 'mdi-memory', text: 'Program DCC decoders' },
          { icon: 'mdi-tune', text: 'Configure functions & lights' },
          { icon: 'mdi-train-car', text: 'Build consists' },
        ]"
        :action-label="isFreePlan ? `Upgrade to ${PLAN_DISPLAY.engineer.name}` : 'Add Your First Loco'"
        :action-to="isFreePlan ? '/upgrade' : '/locos/new'"
      />
    </template>
  </ListPage>

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
