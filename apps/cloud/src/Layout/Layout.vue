<script setup lang="ts">
import { ref } from 'vue'
import draggable from 'vuedraggable'
import { useLayout, type Device } from '@repo/modules'
import { useSortableList } from '@/Core/composables/useSortableList'
import ListPage from '@/Core/UI/ListPage.vue'
import DeviceListItem from '@/Layout/Devices/DeviceListItem.vue'
import AddDeviceItem from '@/Layout/Devices/AddDeviceItem.vue'
import PortList from '@/Layout/PortList.vue'

const { getLayout, getDevices, updateDevice } = useLayout()

const layout = getLayout()
const rawDevices = getDevices()
const { list: devices, onDragStart, onDragEnd } = useSortableList<Device>(
  rawDevices as any,
  (id, data) => updateDevice(id, data),
)

const showAdd = ref(false)
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
          <DeviceListItem :device="element as Device" :ports="layout?.ports" />
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
