<script setup lang="ts">
import { useMenu } from '@/Core/Menu/useMenu'
defineEmits(['change'])
const { currentItem, menu, handleMenu } = useMenu()

</script>
<template>
    <v-list-item v-for="item in menu" 
      :key="item.label" 
      :title="item.label"
      :color="item.color || 'primary'"
      :active="currentItem === item.label"
      @click="handleMenu(item)"
      link
    >
    <template #prepend>
      <v-icon size="32" :class="`text-${item.color}-500 dark:text-${item.color}-400`"
        class="stroke-none mr-4" >{{item.icon}}</v-icon>
    </template>
  </v-list-item>
</template>