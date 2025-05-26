<script setup lang="ts">
import { FaUsb } from 'vue3-icons/fa6'

defineProps({
  dccEx: Object
})

</script>
<template>
  <div v-if="dccEx" class="flex-grow relative max-w-64">
    <FaUsb class="w-12 h-12 text-green-500 absolute right-2 top-2" />
    <pre class="bg-black text-green-300 p-2 rounded-md text-xs bg-opacity-40 border border-slate-500 pr-16">
{{ dccEx.LCD2 }}
{{ dccEx.LCD3 }}
&gt; <span class="blink">_</span>
    </pre>
  </div>
</template>