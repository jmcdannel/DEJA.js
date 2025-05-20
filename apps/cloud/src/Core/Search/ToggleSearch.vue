<script lang="ts" setup>
import { FaSearch } from 'vue3-icons/fa'

</script>
<template>
  <button
    type="button"
    @click="$emit('toggle')"
    aria-controls="drawer-navigation"
    class="p-2 mr-1 text-gray-500 rounded-lg md:hidden hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
  >
    <span class="sr-only">Toggle search</span>
    <FaSearch aria-hidden="true" class="w-6 h-6" />
  </button>
</template>