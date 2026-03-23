<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useStorage } from '@vueuse/core'
import { SelectLayout } from '@repo/ui'

const router = useRouter()
const route = useRoute()
const layoutId = useStorage('@DEJA/layoutId', '')

function handleSelected(newLayoutId: string) {
  layoutId.value = newLayoutId
  const redirect = route.query.redirect as string | undefined
  router.push(redirect || '/')
}
</script>

<template>
  <SelectLayout :layout-id="layoutId" variant="page" @selected="handleSelected" />
</template>
