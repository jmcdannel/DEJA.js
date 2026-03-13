<script setup lang="ts">
import { ref } from 'vue'
import { useLayout, type Device } from '@repo/modules'
import PageHeader from '@/Core/UI/PageHeader.vue'
import DeviceListItem from '@/Layout//Devices/DeviceListItem.vue'
import AddDeviceItem from '@/Layout//Devices/AddDeviceItem.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const { getLayout, getDevices } = useLayout()

const layout = getLayout()
const devices = getDevices()

const showAdd = ref(false)
</script>
<template>
  <div class="animate-fade-in-up space-y-6">
    <PageHeader menu="Devices" :subtitle="layout?.name" />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <DeviceListItem v-for="item in devices" :key="item.id" :device="item as Device" :ports="layout?.ports" />
      <AddTile v-if="!showAdd" color="cyan" @click="showAdd = !showAdd" />
    </div>
    <AddDeviceItem :show="showAdd" @close="showAdd = false" class="mt-4" />
  </div>
</template>
