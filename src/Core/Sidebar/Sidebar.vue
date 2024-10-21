<script setup lang="ts">
import { ref } from 'vue'
import Menu from '@/Core/Menu/Menu.vue'

const emit = defineEmits(['menu'])
const props = defineProps({
  drawer: Boolean
})

const refDrawer = ref(props.drawer)

function handleMenu(item:string) {
  emit('menu', item)
}
</script>
<template>
  <!-- Sidebar -->
    <v-list-item title="My Application" subtitle="Vuetify"></v-list-item>
    <slot name="search"></slot>
    <v-divider></v-divider>
    <slot name="menu"><Menu @change="handleMenu" /></slot>
  <!-- <aside
    class="fixed top-0 left-0 text- z-40 w-64 h-screen pt-14 transition-transform -translate-x-full bg-white border-r border-gray-200 md:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
    aria-label="Sidenav"
    id="drawer-navigation"
  >
    <div class="overflow-y-auto py-5 px-3 h-full bg-white dark:bg-gray-800">
      <slot name="search"></slot>
      <slot name="menu"><Menu @change="handleMenu" /></slot>     
    </div>
    <div
      class="hidden absolute bottom-0 left-0 justify-center p-4 space-x-4 w-full lg:flex bg-white dark:bg-gray-800 z-20"
    >
      <a
        href="#"
        class="inline-flex justify-center p-2 text-gray-500 rounded cursor-pointer dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
      >
        <BsUsbPlugFill
          aria-hidden="true"
          class="w-6 h-6 stroke-none" />
      </a>
      <a
        href="#"
        class="inline-flex justify-center p-2 text-gray-500 rounded cursor-pointer dark:text-gray-400 dark:hover:text-white hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600"
      >        
        <BsFillGearFill
          aria-hidden="true"
          class="w-6 h-6 stroke-none" />
      </a>
    </div> 
  </aside>-->
</template>