<script setup lang="ts">
import { ref } from 'vue'
import { useLayout } from '@repo/modules/layouts'

const { getLayouts } = useLayout()
const emit = defineEmits(['selected', 'clear'])

defineProps({
  layoutId: String
})

const layouts = getLayouts()

async function handleLayoutSelect(newLayout: string) {
  emit('selected', newLayout)
}

</script>
<template>
  <v-card title="Select Layout" color="orange" variant="tonal">
    <v-card-text>
      <v-btn v-for="layout in layouts" :key="layout.layoutId"
        variant="outlined" 
        color="primary" 
        class="m-1"
        @click="handleLayoutSelect(layout.layoutId)">
        <template #append>
          <v-chip size="small" variant="outlined" class="m-1">{{ layout.layoutId }}</v-chip>
        </template>
        {{ layout.name }}
      </v-btn>
    </v-card-text>
  </v-card>
</template>