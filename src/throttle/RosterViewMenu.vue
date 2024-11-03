<script setup lang="ts">
import { useStorage } from '@vueuse/core'

const viewAs = useStorage('@DEJA/prefs/rosterView', 'list')

</script>
<template>
  <v-btn-toggle v-model="viewAs">
    <v-btn value="list" size="small">
      <v-icon icon="mdi-view-sequential-outline"></v-icon>
    </v-btn>
    <v-btn value="grid" size="small">
      <v-icon icon="mdi-view-grid-plus-outline"></v-icon>
    </v-btn>
  </v-btn-toggle>
</template>
