<script setup lang="ts">
import { NotFoundPage } from '@repo/ui'
</script>

<template>
  <NotFoundPage
    :links="[
      { label: 'Dashboard', to: '/', icon: 'mdi-view-dashboard' },
      { label: 'Roster', to: '/locos', icon: 'mdi-train' },
      { label: 'Effects', to: '/effects', icon: 'mdi-lightning-bolt' },
    ]"
  />
</template>
