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
    <v-toolbar 
      class="bg-clip-text bg-gradient-to-r from-purple-300 to-pink-600"  
      color="purple" 
      variant="tonal"
    >
      <v-toolbar-title class="text-3xl text-purple-400">Roster</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items color="purple">
        <v-btn icon="mdi-eye"></v-btn>
        <v-btn  icon="mdi-filter"></v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <template v-if="!!user && layoutId">
      <RosterList />
    </template>
  </main>
</template>
