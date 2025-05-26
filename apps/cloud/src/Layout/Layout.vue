<script setup lang="ts">
import { ref } from 'vue' 
import { useLayout } from '@repo/modules/layouts'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import ViewJson from '@/Core/UI/ViewJson.vue'
import PortList from '@/Layout/PortList.vue'
import LayoutTags from '@/Layout/LayoutTags.vue'
import DeviceListItem from '@/Layout//Devices/DeviceListItem.vue'
import AddDeviceItem from '@/Layout//Devices/AddDeviceItem.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const { getLayout, getDevices } = useLayout()

const layout = getLayout()
const devices = getDevices()

const showAdd = ref(false)
</script>
<template>
  <ModuleTitle menu="Layout" />  

  <h2 class="text-sky-500 bg-gradient-to-r from-sky-400 to-purple-700 p-3 text-zinc-950 text-3xl ">
    {{ layout?.name }}
  </h2>
  <hr class="my-4 border-sky-500" />
  <h3 class="flex text-sky-500 dark:text-sky-400 mt-4">
    <v-icon icon="mdi-usb" class="w-8 h-8 mr-2"></v-icon>
    <span class="text-xl">Devices</span>
  </h3>
  <hr class="my-4 border-sky-500" />
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <DeviceListItem v-for="item in devices" :key="item.id" :device="item" :ports="layout?.ports" />
    <AddTile v-if="!showAdd" color="cyan" @click="showAdd = !showAdd" />
  </div>
  <AddDeviceItem :show="showAdd" @close="showAdd = false" class="mt-4" />
  <hr class="my-8 border-sky-500" />
  <LayoutTags />
  <hr class="my-8 border-sky-500" />
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <PortList :ports="layout?.ports" />
    <v-card 
      class="mx-auto w-full h-full justify-between flex flex-col border-t-4 border-b-4"
      :prepend-icon="'mdi-usb'"
      title="Modules"
      :color="'cyan'"
      variant="tonal"
      density="compact">
      <v-card-text>
        <v-list lines="one">
          <v-list-item
            v-for="module in layout?.modules"
            :key="module"
            :title="module"
          ></v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </div>
  <ViewJson :json="layout" label="RAW Layout Data"></ViewJson>
  <ViewJson :json="devices" label="RAW Device Data"></ViewJson>
</template>