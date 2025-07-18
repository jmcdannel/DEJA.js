<script setup lang="ts">
import { useLayout } from '@repo/modules/layouts'

const emit = defineEmits(['selected', 'clear'])

defineProps({
  layoutId: String
})

const { getLayouts } = useLayout()
const layouts = getLayouts()

async function handleLayoutSelect(newLayout: string) {
  emit('selected', newLayout)
}

</script>
<template>
    <v-card v-for="layout in layouts" :key="layout.layoutId" 
      :title="layout.name" 
      color="blue" 
      variant="tonal">
      <v-card-text class="">
        <v-chip size="small" variant="outlined" class="m-1">{{ layout.layoutId }}</v-chip><v-divider class="my-4"></v-divider>
        <v-chip v-for="(item, index) in layout.tags" :key="index" class="my-1 mx-2" :color="item.color" :prepend-icon="`mdi-${item.icon}`">
          {{ item.name }}
        </v-chip>
        <!-- <pre>
          {{ layout }}
        </pre> -->
      </v-card-text>
      <v-card-actions>
        <v-btn 
          variant="flat" 
          color="primary" 
          @click="handleLayoutSelect(layout.layoutId)">
          Select
        </v-btn>
      </v-card-actions>
    </v-card>
</template>