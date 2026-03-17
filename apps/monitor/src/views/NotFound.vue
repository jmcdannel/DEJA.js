<script setup lang="ts">
import { NotFoundPage } from '@repo/ui'
</script>

<template>
  <NotFoundPage
    :links="[
      { label: 'Dashboard', to: '/', icon: 'mdi-view-dashboard' },
      { label: 'Logs', to: '/logs', icon: 'mdi-text-box-outline' },
    ]"
  />
</template>
