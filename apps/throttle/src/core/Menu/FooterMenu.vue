<script setup lang="ts">
import { computed } from 'vue'
import { useMenu } from './useMenu'
import { useRoute } from 'vue-router'

const route = useRoute()
const { menuFavorites, handleMenu } = useMenu()

// Reactively match current route to a favorite menu item
const active = computed(() => {
  const name = route.name?.toString()
  if (!name) return undefined
  const match = menuFavorites.value.find(item => item.name === name)
  return match?.name
})
</script>
<template>
  <v-footer app class="bg-transparent">
    <v-container fluid class="p-0">
      <v-row class="pt-2 pb-3 px-0">
        <v-spacer />
        <v-btn-toggle
          class="border-2 border-primary"
          divided
          rounded="pill"
          variant="flat"
          :model-value="active">
          <v-btn v-for="item in menuFavorites"
            :key="item.label"
            class="sm:px-12"
            :class="route.name === item.name ? `bg-${item.color}-500` : `text-${item.color}-500`"
            @click="handleMenu(item)"
            :color="item.color"
            :icon="item.icon"
            :value="item.name"
          />
        </v-btn-toggle>
        <v-spacer />
      </v-row>
    </v-container>
  </v-footer>
</template>
