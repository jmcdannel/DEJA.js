<script setup lang="ts">
  import { useMenu } from '@/Core/Menu/useMenu'
  import { useColors } from '@/Core/UI/useColors'

  defineProps({ 
    view: String
  })
  const { menu } = useMenu()
  const { colors } = useColors()

  console.log('colors', colors )

</script>
<template>
    <v-list-item v-for="item in menu" 
      :key="item.label" 
      :title="item.label"
      :class="`${colors[item.color]?.text}`"
      :active="view === item.label"
      @click="$emit('change', item.label)"
      link
    >
    <template #prepend>
      <component 
          :is="item.icon" 
          :class="`text-${item.color}-500 dark:text-${item.color}-400`"
          class="w-6 h-6 stroke-none mr-4" 
        />
    </template>
  </v-list-item>
</template>