<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useConnectionStore } from '@/connections/connectionStore'

const conn = useConnectionStore()

const props = defineProps({
  device: {
    type: Object
  },
  deviceId: {
    type: String
  }
})

const isConnected = ref(props?.device?.isConnected)

// onMounted(() => {
//   console.log('device', props?.device)
// })

watch(isConnected, (val) => {
  // console.log('isConnected', val, props?.deviceId)
  if (props?.device?.type === 'dcc-ex') {
    conn.connectDccEx()
  }
  if (props?.device?.type === 'dcc-ex') {
    // conn.connectDccEx()
    // conn.connect(props?.device?.client, conn.layoutId)
  }


}, {immediate: true})

</script>
<template>
  <!-- <pre>{{ device }}</pre> -->
</template>
