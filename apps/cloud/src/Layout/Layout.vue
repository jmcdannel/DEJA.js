<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import { useLayout, useServerStatus, type Device } from '@repo/modules'
import { useDejaJS } from '@repo/deja'
import { DeviceManageCard } from '@repo/ui'
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
const { list: devices, onDragStart, onDragEnd } = useSortableList<Device>(
  rawDevices as any,
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

    <AddDeviceItem :show="showAdd" class="mt-4" @close="showAdd = false" />

    <PortList v-if="layout?.ports?.length" :ports="layout.ports" class="mt-6" />
  </ListPage>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
}
</style>
