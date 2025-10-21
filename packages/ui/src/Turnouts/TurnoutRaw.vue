<script setup lang="ts">
import type { Turnout } from '@repo/modules'

interface Props {
  turnout: Turnout
  state?: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <pre class="m-1 p-2 rounded-lg text-sm">
{{ JSON.stringify({ ...turnout, state: props.state !== undefined ? props.state : turnout.state }, null, 2) }}
  </pre>
</template> 