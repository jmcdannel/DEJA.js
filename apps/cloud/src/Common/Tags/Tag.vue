<script setup lang="ts">
import type { Tag } from '@repo/modules/layouts'

defineProps<{
  tag: Tag
}>()

</script>
<template>
  <v-chip 
    :value="tag.id"
    :append-icon="`mdi-${tag.icon}`"
    color="red">
    {{ tag.name }}
    <template #prepend>
      <span :style="{ backgroundColor: tag.color }" class="w-4 h-4 rounded-full mr-2"></span>
    </template>
  </v-chip>
</template>