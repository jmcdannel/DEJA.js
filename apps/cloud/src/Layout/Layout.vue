<script setup lang="ts">
import { ref } from 'vue'
import { useLayout, type Device } from '@repo/modules'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
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
    <ModuleTitle menu="Devices" />

    <div class="glass-dark rounded-2xl shadow-soft-dark p-6 bg-gradient-to-r from-brand-cyan/20 to-brand-magenta/20 border border-white/5">
      <h2 class="text-white text-3xl font-bold tracking-tight">
        {{ layout?.name }}
      </h2>
    </div>

    <h3 class="flex items-center text-brand-cyan mt-8 mb-4">
      <v-icon icon="mdi-developer-board" class="w-8 h-8 mr-2"></v-icon>
      <span class="text-2xl font-semibold">Devices</span>
    </h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <DeviceListItem v-for="item in devices" :key="item.id" :device="item as Device" :ports="layout?.ports" />
      <AddTile v-if="!showAdd" color="cyan" @click="showAdd = !showAdd" />
    </div>
    <AddDeviceItem :show="showAdd" @close="showAdd = false" class="mt-4" />
  </div>
</template>
