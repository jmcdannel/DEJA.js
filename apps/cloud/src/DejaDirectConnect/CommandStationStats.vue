<script setup lang="ts">
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

defineProps({
  dccEx: Object
})

</script>
<template>

  <div v-if="dccEx">
    <p class="py-2 text-xs text-cyan-200">Updated: {{ dayjs.unix(dccEx.timestamp.seconds).fromNow() }}</p>
    <p class="py-2 text-xs text-cyan-200" >
      {{dccEx.version}}
    </p>
  </div>

</template>