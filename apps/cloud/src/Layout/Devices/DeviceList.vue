<script setup lang="ts">
import DeviceListItem from './DeviceListItem.vue'

defineProps({
  list: Array
})

</script>
<template>
  <DeviceListItem v-for="item in list" :key="item.id" :item="item" />
</template>