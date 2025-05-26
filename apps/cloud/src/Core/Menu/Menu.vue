<script setup lang="ts">
import { useMenu } from '@/Core/Menu/useMenu'
import { useColors } from '@/Core/UI/useColors'
defineEmits(['change'])
defineProps({ 
  view: String
})
const { menu } = useMenu()
const { colors } = useColors()

</script>
<template>
    <v-list-item v-for="item in menu" 
      :key="item.label" 
      :title="item.label"
      :class="`${colors?.[item.color]?.text}`"
      :active="view === item.label"
      @click="$emit('change', item.label)"
      link
    >
    <template #prepend>
      <v-icon size="32" :class="`text-${item.color}-500 dark:text-${item.color}-400`"
        class="stroke-none mr-4" >{{item.icon}}</v-icon>
    </template>
  </v-list-item>
</template>