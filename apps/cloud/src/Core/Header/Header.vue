<script setup lang="ts">
import ToggleSidebar from '@/Core/UI/ToggleSidebar.vue'

defineEmits(['toggle'])
</script>
<template>
  <v-app-bar class="px-3">
    <template v-slot:prepend>
      <v-icon icon="mdi-icon-cloud"></v-icon>
    </template>
    <ToggleSidebar @toggle="$emit('toggle')" />
    <slot name="title">DEJA Cloud</slot>
    <slot name="search"></slot>
    <v-spacer></v-spacer>
    <slot name="menu"></slot>
  </v-app-bar>
</template>