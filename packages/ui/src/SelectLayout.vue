<script setup lang="ts">
import { ref } from 'vue'
import { useLayout } from '@repo/modules/layouts'

const emit = defineEmits(['selected', 'clear'])

defineProps({
  layoutId: String
})

const { getLayouts } = useLayout()
const layouts = getLayouts()

const isMenuOpen = ref(false)

function handleLayoutSelect(newLayout: string) {
  emit('selected', newLayout)
  isMenuOpen.value = false
}
</script>
<template>
  <v-menu location="bottom" v-model="isMenuOpen">
    <template v-slot:activator="{ props }">
      <v-chip
        v-bind="props"
        size="small"
        class="ma-1 cursor-pointer"
        prepend-icon="mdi-home"
        color="primary"
        variant="elevated"
      >
        Select Layout
      </v-chip>
    </template>
    <v-list>
      <v-list-item
        v-for="layout in layouts"
        :key="layout.id"
        class="cursor-pointer"
        @click="handleLayoutSelect(layout.id)"
      >
        <v-list-item-title>
          <v-chip
            size="small"
            prepend-icon="mdi-home"
            color="primary"
            variant="outlined"
          >
            {{ layout.name || layout.id }}
          </v-chip>
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>