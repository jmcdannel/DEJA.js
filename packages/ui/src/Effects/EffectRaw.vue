<script setup lang="ts">
import type { Effect } from '@repo/modules/effects'

interface Props {
  effect: Effect
  state?: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <pre class="m-1 p-2 rounded-lg text-sm">
{{ JSON.stringify({ ...effect, state: props.state !== undefined ? props.state : effect.state }, null, 2) }}
  </pre>
</template>