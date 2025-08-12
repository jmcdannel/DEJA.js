<script setup lang="ts">
import type { Effect } from '@repo/modules/effects'

interface Props {
  effect: Effect
}

defineProps<Props>()
</script>

<template>
  <pre class="m-1 p-2 rounded-lg text-sm">{{ JSON.stringify(effect, null, 2) }}</pre>
</template>