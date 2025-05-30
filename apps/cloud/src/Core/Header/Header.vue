<script setup lang="ts">
import ToggleSidebar from '@/Core/UI/ToggleSidebar.vue'
import Title from './Title.vue'

defineEmits(['toggle'])
</script>
<template>
  <v-app-bar class="px-3">
    <ToggleSidebar @toggle="$emit('toggle')" />
    <slot name="title"><Title /></slot>
    <slot name="search"></slot>
    <v-spacer></v-spacer>
    <slot name="menu"></slot>
  </v-app-bar>
</template>