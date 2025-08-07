<script setup lang="ts">
import type { Effect } from '@repo/modules/effects'

interface Props {
  event: Effect
}

const props = defineProps<Props>()
</script>

<template>
  <pre class="text-xs p-2 bg-gray-100 rounded">{{JSON.stringify(event, null, 2)}}</pre>
</template>