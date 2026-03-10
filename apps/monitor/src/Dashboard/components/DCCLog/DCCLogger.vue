<script setup lang="ts">
import { watch } from 'vue'
import { useStorage } from '@vueuse/core';
import { useWebSocket } from '@vueuse/core'
import { createLogger } from '@repo/utils'
import { useDccLog } from '@/DCCEX/Log/useDccLog'

const log = createLogger('DCCLogger')

const wshost = useStorage('@DEJA/pref/ws-host', '192.168.86.22:8082')
const { append } = useDccLog()

log.debug('wshost', wshost)
//http://192.168.86.249:5173/
const { status, data, send, open, close } = useWebSocket(`ws://${wshost.value}/`)

watch(data, (newData) => {
  log.debug('data', newData)
  append(newData)
})

</script>
<template>
  <v-card title="Listening" :subtitle="wshost" :text="status">
    <v-card-actions>
      <v-btn color="green" variant="flat" @click="close">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>