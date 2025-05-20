<script setup lang="ts">

import { FaSearch } from 'vue3-icons/fa'
</script>
<template>
  <form action="#" method="GET" class="md:pl-2">
    <label for="topbar-search" class="sr-only">Search</label>
    <div class="relative w-full md:w-32 lg:w-48">
      <div
        class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none"
      >
        <FaSearch
          class="w-5 h-5 text-gray-500 dark:text-gray-400"
        />
      </div>
      <input
        type="text"
        name="email"
        id="topbar-search"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        placeholder="Search"
        disabled
      />
    </div>
  </form>
</template>