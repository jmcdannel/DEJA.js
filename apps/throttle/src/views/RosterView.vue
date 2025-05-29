<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { useCurrentUser } from 'vuefire'
  import { useConnectionStore } from '@/connections/connectionStore'
  import RosterList from '@/roster/RosterList.vue'
  
  const user = useCurrentUser()
  const connStore = useConnectionStore()
  const { layoutId } = storeToRefs(connStore)
  
</script>
<template>
  <main class="flex flex-col flex-grow p-4 md:p-8 w-full h-screen forest-background bg-opacity-10 bg-fixed overflow-auto">
    <template v-if="!!user && layoutId">
      <RosterList />
    </template>
  </main>
</template>
