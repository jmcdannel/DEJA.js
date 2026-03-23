<script setup lang="ts">
import { ref } from 'vue'
import draggable from 'vuedraggable'
import { useLayout, type Device } from '@repo/modules'
import { useSortableList } from '@/Core/composables/useSortableList'
import PageHeader from '@/Core/UI/PageHeader.vue'
import DeviceListItem from '@/Layout/Devices/DeviceListItem.vue'
import AddDeviceItem from '@/Layout/Devices/AddDeviceItem.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const { getLayout, getDevices, updateDevice } = useLayout()

const layout = getLayout()
const rawDevices = getDevices()
const { list: devices, onDragStart, onDragEnd } = useSortableList<Device>(rawDevices as any, (id, data) => updateDevice(id, data))

const showAdd = ref(false)
</script>
<template>
  <div class="animate-fade-in-up space-y-4">
    <PageHeader menu="Devices" :subtitle="layout?.name" />

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
      <template #footer>
        <div>
          <AddTile v-if="!showAdd" color="cyan" @click="showAdd = !showAdd" />
        </div>
      </template>
    </draggable>
    <AddDeviceItem :show="showAdd" @close="showAdd = false" class="mt-4" />
  </div>
</template>
<style scoped>
.ghost {
  opacity: 0.5;
}
</style>
