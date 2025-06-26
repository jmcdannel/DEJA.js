<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  entry: Object
})
const item = ref(props.entry)

</script>
<template>
  <div class="flex items-center justify-between m-2 gap-x-4" v-if="item">
    <span class="basis-1/3 ">
      <v-chip size="x-small" :color="item?.color || 'orange'">{{ item?.action }}</v-chip>
    </span>
    
    <pre class="flex-grow p-2 bg-teal-900 text-xs text-teal-100">{{ JSON.stringify(item?.payload, null, 2) }}</pre>
  </div>  
  <!-- <pre>item: {{ item }}</pre> -->
</template>