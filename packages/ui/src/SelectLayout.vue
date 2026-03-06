<script setup lang="ts">
import { useCurrentUser } from 'vuefire'
import { useRouter } from 'vue-router'
import { useLayout } from '@repo/modules'
import { useStorage } from '@vueuse/core'

const emit = defineEmits(['select'])

const user = useCurrentUser()
const router = useRouter()
const { getLayouts } = useLayout()
const layoutId = useStorage('@DEJA/layoutId', '')

const layouts = getLayouts(user.value?.email)

async function handleLayoutSelect(newLayout: string) {
  layoutId.value = newLayout
  router.push({ name: 'home' })
  emit('select', newLayout)
}
</script>
<template>
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
</template>