<script setup lang="ts">
import { PageHeader } from '@repo/ui'

</script>
<template>
  <PageHeader title="Signals" icon="mdi-traffic-light" color="emerald" />
  <div
  class="border-2 border-dashed rounded-lg border-opacity-30 h-96 mb-4"
  ></div>
  <div class="grid grid-cols-2 gap-4">
    <div
      class="border-2 border-dashed rounded-lg border-opacity-30 h-48 md:h-72"
    ></div>
    <div
      class="border-2 border-dashed rounded-lg border-opacity-30 h-48 md:h-72"
    ></div>
    <div
      class="border-2 border-dashed rounded-lg border-opacity-30 h-48 md:h-72"
    ></div>
    <div
      class="border-2 border-dashed rounded-lg border-opacity-30 h-48 md:h-72"
    ></div>
  </div>
</template>