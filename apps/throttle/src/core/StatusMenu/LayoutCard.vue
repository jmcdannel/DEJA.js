<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useLayout } from '@/api/useLayout'
import { useDcc } from '@/api/dccApi'
import { useConnectionStore } from '@/connections/connectionStore.jsx'

dayjs.extend(relativeTime)

const dccApi = useDcc()
const connStore = useConnectionStore()
const { getLayout } = useLayout()
const layoutDoc = getLayout()
const { layoutId } = storeToRefs(connStore)
const layout = computed(() => layoutDoc?.value)

const handleDisconnect = () => {
  connStore.disconnect()
}

const handleStatus = () => {
  dccApi.send('getStatus', { })
}

</script>
<template>
  <v-card
    class="bg-blue-950 rounded-3xl p-2 pb-5"
    color="cyan-darken-4"
    variant="text"      
  >
    <template #actions>        
      <v-btn @click="handleStatus"  variant="outlined" color="purple" append-icon="mdi-refresh">
        Get Status
      </v-btn> 
      <v-btn @click="handleDisconnect"  variant="outlined" color="red" append-icon="mdi-lightning-bolt">
        Disconnect
      </v-btn>
    </template>
    <template #append>
      <v-icon icon="mdi-lightning-bolt" :color="!!layoutId ? 'success' : 'error'" size="96" />
    </template>
    <template #item>
    <p class="text-5xl font-bold text-purple-400">{{ layoutId }}</p> 
    </template>
    <template #text>
      <p v-if="layout?.timestamp">
        Updated: <span class="text-pink-500">
          {{ dayjs.unix(layout?.timestamp.seconds).format('h:mm:ss A') }}
        </span>
      </p>

      <p>
        timestamp:
        {{ layout?.timestamp && dayjs.unix(layout.timestamp.seconds).fromNow() }}
      </p>
      <p>
        pong:
        {{ layout?.pong && dayjs.unix(layout.pong.seconds).format('h:mm:ss A') }}
      </p>
    </template>
    <template #title>
      <h3 class="font-bold text-cyan-400 text-2xl">DEJA<span class="text-pink-500">.js</span></h3>
    </template>
  </v-card>
</template>