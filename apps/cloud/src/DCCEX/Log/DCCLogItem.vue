<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  entry: Object
})
const item = ref(props.entry)

</script>
<template>
  <div class="flex items-center" v-if="item">
    <v-avatar :color="item?.color" :icon="item?.icon"></v-avatar>
    <v-chip class="m-4" :color="item?.color">{{ item?.action }}</v-chip>
    <div>{{ item?.payload }}</div>
  </div>  
  <!-- <pre>item: {{ item }}</pre> -->
</template>