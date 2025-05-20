<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import { RouterView } from 'vue-router'
  import HeaderView from '@/views/HeaderView.vue'
  import FooterView from '@/views/FooterView.vue'
  import DEJAConnect from '@/core/DEJAConnect.component.vue'
  import { useConnectionStore } from '@/connections/connectionStore'
  
  const conn = useConnectionStore()
  const { layoutId } = storeToRefs(conn)
  
</script>

<template>
  <template v-if="layoutId">
    <DEJAConnect />
  </template>
  <main class="flex flex-col h-screen max-w-screen-md mx-auto">
    <HeaderView />
    <main class="flex-grow flex mb-16 min-h-0">
      <RouterView />
    </main>
    <FooterView />
  </main>
</template>
<style>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  .slide-out-enter-active, .slide-out-leave-active {
    transition: transform 0.5s;
  }
  .slide-out-enter-active {
    transform: translateX(100%);
  }
  .slide-out-enter-to {
    transform: translateX(0);
  }
</style>