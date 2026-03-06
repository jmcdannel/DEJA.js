<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useRouter } from 'vue-router'
import { useLayout } from '@repo/modules'
import { useStorage } from '@vueuse/core'

const user = useCurrentUser()
const router = useRouter()
const { getLayouts } = useLayout()
const layoutId = useStorage('@DEJA/layoutId', '')


const layouts = getLayouts(user.value?.email)

async function handleLayoutSelect(newLayout: string) {
  layoutId.value = newLayout
  router.push({ name: 'home' })
}
</script>
<template>
  <div class="flex flex-row flex-wrap justify-center items-center h-full w-full flex-grow gap-2">
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
  </div>
  <!-- <v-card title="Select Layout" color="blue" variant="tonal">
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
  </v-card> -->
</template>