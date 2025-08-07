<script setup lang="ts">
import type { Turnout } from '@repo/modules/turnouts'

interface Props {
  turnout: Turnout
}

defineProps<Props>()
</script>

<template>
  <pre class="m-1 p-2 rounded-lg text-sm">
{{ JSON.stringify(turnout, null, 2) }}
  </pre>
</template> 