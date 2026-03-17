<script setup lang="ts">
import { NotFoundPage } from '@repo/ui'
</script>

<template>
  <NotFoundPage
    :links="[
      { label: 'Throttle', to: '/', icon: 'mdi-train' },
      { label: 'Roster', to: '/locos', icon: 'mdi-format-list-bulleted' },
      { label: 'Turnouts', to: '/turnouts', icon: 'mdi-call-split' },
    ]"
  />
</template>
