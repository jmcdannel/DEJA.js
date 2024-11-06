<script setup lang="ts">
  import { ref } from 'vue'
  import { useFunctionIcon } from '@/functions/useFunctionIcon'

  const props = defineProps({
    icon: {
      type: String
    }
  })

  const functionIcons = useFunctionIcon()

  const iconCmp = ref(functionIcons.getIconComponent(props?.icon || ''))

</script>
<template>
  <component :is="iconCmp" class="h-8 w-8 stroke-none" />
   <!-- <pre v-if="icon">{{ functionIcons.getIconComponent(icon) }}</pre> -->
</template>