<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useDejaJs } from '@/api/useDejaJs'

  const dejaJsApi = useDejaJs()

  onMounted(async () => {
    console.log('connecting from DejaJsConnect')
    // await dejaJsApi.connect()
  })
</script>

<template>
</template>