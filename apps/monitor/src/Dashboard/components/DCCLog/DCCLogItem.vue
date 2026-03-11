<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  entry: Object
})
const item = ref(props.entry)

</script>
<template>
  <div class="flex items-center m-2 gap-x-3" v-if="item">
    <v-chip size="x-small" :color="item?.color || 'orange'" class="shrink-0">{{ item?.action }}</v-chip>
    <div class="flex-1 min-w-0 p-2 bg-teal-900 text-xs text-teal-100 font-mono truncate">
      {{ JSON.stringify(item?.payload, null, 2) }}
    </div>
  </div>  
  <!-- <pre>item: {{ item }}</pre> -->
</template>