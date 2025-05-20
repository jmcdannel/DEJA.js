<script setup lang="ts">
import ToggleSidebar from '@/Core/Sidebar/ToggleSidebar.vue'
import ToggleSearch from '@/Core/Search/ToggleSearch.vue'
import Title from './Title.vue'

defineProps({
  layoutId: String
})
</script>
<template>
  <v-app-bar class="px-3">
    <ToggleSidebar @toggle="$emit('toggle')" />
    <slot name="title"><Title /></slot>
    <slot name="search"></slot>
    <v-spacer></v-spacer>
    <ToggleSearch @toggle="$emit('toggle')" />
    <slot name="menu"></slot>
  </v-app-bar>
  <!-- <nav class="bg-white border-b border-gray-200 px-4 py-2.5 dark:bg-gray-800 dark:border-gray-700 fixed left-0 right-0 top-0 z-50">
    <div class="flex flex-wrap justify-between items-center">
      <div class="flex justify-start items-center">
        
      </div>
      <div class="flex items-center lg:order-2">
        
      </div>
    </div>
  </nav> -->
</template>