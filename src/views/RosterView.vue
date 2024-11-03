<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { useCurrentUser } from 'vuefire'
  import { useConnectionStore } from '@/connections/connectionStore'
  import Roster from '@/core/Roster.vue'
  import DejaCloudRoster from '@/deja-cloud/DejaCloudRoster.vue'
  
  const user = useCurrentUser()
  const connStore = useConnectionStore()
  const { layoutId } = storeToRefs(connStore)
  
</script>
<template>
  <main class="flex flex-col flex-grow p-4 md:p-8 w-full viaduct-background bg-opacity-50 bg-fixed overflow-auto">
    <h2 class="placeholder:font-extrabold text-transparent text-4xl bg-clip-text bg-gradient-to-r from-purple-300 to-pink-600">
      Select
      Your<br>
      <strong class="text-7xl uppercase">Loco</strong>
    </h2>
    <template v-if="!!user && layoutId">
      <DejaCloudRoster />
    </template>
    <template v-else>
      <!-- <Roster /> -->
      <pre>[TODO: implement anon/emulator roster]</pre>
    </template>
  </main>
</template>
