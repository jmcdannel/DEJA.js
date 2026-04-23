<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import { useLayout, useServerStatus, type Device } from '@repo/modules'
import { useDejaJS } from '@repo/deja'
import { DejaServerPanel, DeviceManageCard } from '@repo/ui'
import { useSortableList } from '@/Core/composables/useSortableList'
import ListPage from '@/Core/UI/ListPage.vue'
import AddDeviceItem from '@/Layout/Devices/AddDeviceItem.vue'
import PortList from '@/Layout/PortList.vue'

const router = useRouter()
const { getLayout, getDevices, updateDevice, connectDevice, disconnectDevice } = useLayout()
const { serverStatus } = useServerStatus()
const { sendDejaCommand } = useDejaJS()

const layout = getLayout()
const rawDevices = getDevices()

const allDevices = computed<Device[]>(() => (rawDevices.value ?? []) as Device[])

// 🖥️ deja-server is special — pinned in its own panel above the device grid,
// so it's filtered out of the draggable/sortable list entirely.
const sortableSource = computed(
  () => allDevices.value.filter((d) => d.type !== 'deja-server'),
)
const { list: devices, onDragStart, onDragEnd } = useSortableList<Device>(
  sortableSource,
  (id, data) => updateDevice(id, data),
)

const showAdd = ref(false)

async function handleConnect(deviceId: string, serial?: string, topic?: string) {
  const device = rawDevices.value?.find((d: Device) => d.id === deviceId)
  if (!device) return
  await connectDevice(device, serial, topic)
}

async function handleDisconnect(deviceId: string) {
  await disconnectDevice(deviceId)
}

function navigateToDevice(deviceId: string) {
  router.push({ name: 'DeviceDetails', params: { deviceId } })
}

// 🎉 Toast shown after a new device is created — prompts the user to restart
// the DEJA server so the new device is picked up by its Firestore listener.
const toastOpen = ref(false)
const toastMessage = ref('')

function handleDeviceCreated(device: Device) {
  toastMessage.value = `Added "${device.id}". Restart the DEJA server (\`deja restart\`) to connect to it.`
  toastOpen.value = true
}
</script>

<template>
  <ListPage
    title="Devices"
    icon="mdi-developer-board"
    color="cyan"
    :subtitle="layout?.name"
  >
    <template #actions>
      <v-btn
        variant="tonal"
        size="small"
        :disabled="!serverStatus?.online"
        @click="sendDejaCommand({ action: 'listPorts', payload: {} })"
      >
        <v-icon start icon="mdi-refresh" />
        Refresh Ports
      </v-btn>
      <v-btn
        prepend-icon="mdi-plus"
        color="cyan"
        variant="flat"
        size="small"
        @click="showAdd = true"
      >
        Add Device
      </v-btn>
    </template>

    <DejaServerPanel
      :devices="allDevices"
      class="mb-4"
      @navigate="navigateToDevice"
    />

    <draggable
      :list="devices"
      item-key="id"
      handle=".drag-handle"
      ghost-class="ghost"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
      @start="onDragStart"
      @end="onDragEnd"
    >
      <template #item="{ element }">
        <div>
          <DeviceManageCard
            :device="element as Device"
            :ports="layout?.ports"
            @connect="handleConnect"
            @disconnect="handleDisconnect"
            @navigate="navigateToDevice"
          />
        </div>
      </template>
    </draggable>

    <AddDeviceItem
      :show="showAdd"
      class="mt-4"
      @close="showAdd = false"
      @created="handleDeviceCreated"
    />

    <PortList v-if="layout?.ports?.length" :ports="layout.ports" class="mt-6" />

    <v-snackbar
      v-model="toastOpen"
      :timeout="6000"
      color="cyan-darken-3"
      location="bottom right"
    >
      <div class="flex items-center gap-2">
        <v-icon icon="mdi-restart" size="20" />
        <span class="text-sm">{{ toastMessage }}</span>
      </div>
      <template #actions>
        <v-btn variant="text" @click="toastOpen = false">Dismiss</v-btn>
      </template>
    </v-snackbar>
  </ListPage>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
}
</style>
