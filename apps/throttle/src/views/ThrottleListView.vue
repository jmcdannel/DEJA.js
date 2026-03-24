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
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  position: absolute;
  inset: 0;
}
</style>
