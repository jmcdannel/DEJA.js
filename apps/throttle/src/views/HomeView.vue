<script setup lang="ts">
  import StatusCardGrid from '@/core/StatusMenu/StatusCardGrid.vue'

</script>
<template>
  <main class="flex flex-col flex-grow p-8 w-full viaduct-background bg-opacity-50 bg-fixed overflow-auto">
    <header>
      <h2 class="text-transparent text-3xl bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-600 my-4">
          Welcome to <br>
          <span class="text-8xl font-bold uppercase bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600">DEJA</span>
          <br>
          <span class="text-6xl font-bold uppercase bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-400">Throttle</span>
      </h2>
    </header>
    <StatusCardGrid />
  </main>
</template>