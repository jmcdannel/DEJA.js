<script setup lang="ts">
import { ref } from 'vue'
import { useMenu } from './useMenu'
import { useRoute } from 'vue-router'
import { useLocos } from '@repo/modules'

const route = useRoute()
const { getThrottles } = useLocos()
const active = ref(route.path)
const throttles = getThrottles()
const { menuFavorites } = useMenu()
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
          v-model="active">
          <v-btn v-for="item in menuFavorites"
            :key="item.label"
            class="sm:px-12"
            :class="$route.path === item.name ? `bg-${item.color}-500` : `text-${item.color}-500`"
            @click="$router.push(item.name)"
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