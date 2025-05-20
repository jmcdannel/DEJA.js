<script setup lang="ts">
import { useStorage } from '@vueuse/core'

const throttleView = useStorage('@DEJA/prefs/throttleView', 'Array')

</script>
<template>
  <v-speed-dial location="bottom center" transition="fade-transition">
    <template v-slot:activator="{ props: activatorProps }">
      <!-- <v-fab 
        v-bind="activatorProps" 
        size="large" 
        icon="$vuetify" 
        class="absolute top-28 right-2 fab bg-gradient-to-r from-blue-500 to-purple-500">
      
      </v-fab> -->
      <span class="absolute top-20 right-2 w-12 h-12">
        <button class="bg-gradient-to-br from-blue-500 to-purple-500 rounded-full p-1 w-full h-full"
          v-bind="activatorProps" >
            <v-icon class="bg-zinc-800 bg-opacity-80 rounded-full w-10 h-10 p-2 hover:bg-opacity-35" icon="$vuetify" ></v-icon>
        </button>
      </span>
    </template>
    <v-btn key="1" icon="$success"></v-btn>
    <v-btn key="2" icon="$info"></v-btn>
    <v-btn key="3" icon="$warning"></v-btn>
    <v-btn key="4" icon="$error"></v-btn>
  </v-speed-dial>
</template>
<style scoped>
.fab {
  width: 56px;
  height: 56px; 
}
</style>
