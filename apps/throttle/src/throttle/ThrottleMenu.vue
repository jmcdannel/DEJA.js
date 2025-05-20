<script setup lang="ts">
import { computed } from 'vue'
import { useStorage } from '@vueuse/core'

const viewAs = useStorage('@DEJA/prefs/throttleView', 'Array')
const viewAsIcon = computed(() => {
  switch (viewAs.value) {
    case 'Array': return 'mdi-view-gallery-outline'
    case 'Split': return 'mdi-view-agenda-outline'
    case 'List': return 'mdi-view-sequential-outline'
    case 'Grid': return 'mdi-view-grid-plus-outline'
  }
})

</script>
<template>
  <!-- <v-btn-toggle v-model="viewAs">
    <v-btn value="Array" size="small">
      <v-icon icon="mdi-view-gallery-outline"></v-icon>
    </v-btn>
    <v-btn value="Split" size="small">
      <v-icon icon="mdi-view-agenda-outline" class="rotate-90"></v-icon>
    </v-btn>
    <v-btn value="List" size="small">
      <v-icon icon="mdi-view-sequential-outline"></v-icon>
    </v-btn>
    <v-btn value="Grid" size="small">
      <v-icon icon="mdi-view-grid-plus-outline"></v-icon>
    </v-btn>
  </v-btn-toggle> -->
  <v-speed-dial location="bottom center" transition="fade-transition">
    <template v-slot:activator="{ props: activatorProps }">
      <!-- <v-fab 
        v-bind="activatorProps" 
        size="large" 
        icon="$vuetify" 
        class="absolute top-28 right-2 fab bg-gradient-to-r from-blue-500 to-purple-500">
      
      </v-fab> -->
      <span class="absolute bottom-20 right-2 w-12 h-12">
        <button class="bg-gradient-to-br from-blue-500 to-purple-500 rounded-full p-1 w-full h-full"
          v-bind="activatorProps" >
            <v-icon class="bg-zinc-800 bg-opacity-80 rounded-full w-10 h-10 p-2 hover:bg-opacity-35" :icon="viewAsIcon" ></v-icon>
        </button>
      </span>
    </template>
    <v-btn key="1" @click="viewAs = 'Array'" icon="mdi-view-gallery-outline"></v-btn>
    <v-btn key="2" @click="viewAs = 'Split'" icon="mdi-view-agenda-outline" class="rotate-90"></v-btn>
    <v-btn key="3" @click="viewAs = 'List'" icon="mdi-view-sequential-outline"></v-btn>
    <v-btn key="4" @click="viewAs = 'Grid'" icon="mdi-view-grid-plus-outline"></v-btn>
  </v-speed-dial>
</template>
