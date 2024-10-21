<script setup lang="ts">
  import { FaBars, FaPlus } from 'vue3-icons/fa6'

</script>
<template>
  <!-- <button
    @click="$emit('toggle')"
    aria-controls="drawer-navigation"
    class="lg:hidden p-2 mr-2 text-gray-600 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
  >
    <FaBars class="w-6 h-6" />
    <FaPlus class="hidden w-6 h-6 rotate-45" />
    <span class="sr-only">Toggle sidebar</span>
  </button> -->
  <v-app-bar-nav-icon @click="$emit('toggle')"
    aria-controls="drawer-navigation"
    class="lg:hidden p-2 mr-2 text-gray-600 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
  ></v-app-bar-nav-icon>
</template>