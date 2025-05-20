<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { BsCpu } from 'vue3-icons/bs'
  import { FiRefreshCcw } from "vue3-icons/fi";
  import { useConnectionStore } from '@/connections/connectionStore.jsx'
  import { useDcc } from '@/api/dccApi'
  const dccApi = useDcc()
  const { 
    dccExConnected, 
    layoutId
  } = storeToRefs(useConnectionStore())

function handleLayoutClick() {
  dccApi.send('getStatus', { })
}

</script>
<template>
  <v-chip v-if="layoutId" 
    :color="dccExConnected ? 'success' : 'warning'" 
    :class="dccExConnected ? '' : 'animate-pulse'"
    @click="handleLayoutClick"
    size="large"
    :text="layoutId"
    variant="tonal">
    <template #prepend>
      <v-icon icon="mdi-chip" />
    </template>
  </v-chip>
</template>