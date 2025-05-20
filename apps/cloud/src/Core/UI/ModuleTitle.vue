<script setup lang="ts">
import { useMenu } from '@/Core/Menu/useMenu'

const { getMenuItem } = useMenu()

  const props = defineProps({
    label: String,
    icon: String,
    color: String,
    menu: 'String'
  })

  const { label, color, icon } = props.menu
    ? getMenuItem(props.menu)
    : { label: props.label, color: props.color, icon: props.icon }

</script>
<template>
  <h2 class="flex" :class="`text-${color}-500 dark:text-${color}-400`">
    <component :is="icon" class="w-8 h-8 mr-2 stroke-none" /> 
    <span class="text-2xl">{{ label }}</span>
  </h2>
  <hr class="my-4 border-sky-500" />
</template>