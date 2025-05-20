<script setup lang="ts">
  import Title from '@/Core/Header/Title.vue'
</script>
<template>
  <main class="flex items-center justify-center">
    <v-sheet class="p-12 flex flex-col items-center" color="surface">
      <div class="my-12"><Title active /></div>
      <slot></slot>
    </v-sheet>
  </main>
</template>