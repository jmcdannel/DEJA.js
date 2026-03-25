<script setup lang="ts">
import ThrottleList from '@/throttle/ThrottleList.vue'
</script>
<template>
  <main class="throttle-list-page">
    <ThrottleList />
  </main>
</template>
<style scoped>
.throttle-list-page {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
</style>
