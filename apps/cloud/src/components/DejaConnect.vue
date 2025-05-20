<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useStorage } from '@vueuse/core'
import CommandStationConnect from './CommandStationConnect.vue'
import Connected from './Connected.vue'
import useDejaCloudDccConnector from './useDejaCloudDccConnector.ts'

const alreadyConnected = ref(false)
const isConnected = ref(false)
const { listen } = useDejaCloudDccConnector()
const layoutId = useStorage('@DEJA/cloud/layoutId', null)
const user = useCurrentUser()

onMounted(async () => {
  console.log('onMounted', window.serialOutputStream)
  alreadyConnected.value = !!window.serialOutputStream
})

watchEffect(() => {
  console.log(`watch layoutId ${layoutId.value} ${isConnected.value}`)
  if (layoutId.value && isConnected.value) {
    listen(layoutId.value)
  }
})

function handleLayoutSelect(layout) {
  layoutId.value = layout.layoutId
}

function handleLayoutClear() {
  layoutId.value = null
}

function handleConnected() {
  console.log('handleConnected')
  isConnected.value = true
}

</script>
<template>
  <main class="flex flex-col justify-start items-start flex-wrap">
    <CommandStationConnect v-if="layoutId" @connected="handleConnected" />
    <Connected v-if="isConnected" />
  </main> 
</template>