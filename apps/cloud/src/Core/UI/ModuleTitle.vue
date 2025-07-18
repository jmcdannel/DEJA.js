<script setup lang="ts">
import { useMenu } from '@/Core/Menu/useMenu'

const { getMenuItem } = useMenu()

  const props = defineProps({
    label: { type: String },
    icon: { type: String },
    color: { type: String },
    menu: { type: String }
  })

  const menuItem = props.menu ? getMenuItem(props.menu) : null
  const { label, color, icon } = menuItem
    ?? { label: props.label, color: props.color, icon: props.icon }

</script>
<template>
  <v-sheet class="flex">
    <h2 class="flex" :class="`text-${color}-500 dark:text-${color}-400`">
      <v-icon size="32" :class="`text-${color}-500 dark:text-${color}-400`"
        class="mr-2 stroke-non" >{{icon}}</v-icon>
      <span class="text-2xl">{{ label }}</span>
    </h2>
    <v-spacer></v-spacer>
    <slot></slot>
  </v-sheet>
  <hr class="my-4 border-sky-500" />
</template>