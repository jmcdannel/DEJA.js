<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useLayout } from '@/api/useLayout'
import { useConnectionStore } from '@/connections/connectionStore.jsx'
import { useCurrentUser } from 'vuefire'
import DejaCloudCard from '@/core/StatusMenu/DejaCloudCard.vue'
import LayoutCard from '@/core/StatusMenu/LayoutCard.vue'
import StatusMenuItem from '@/core/StatusMenu/StatusMenuItem.component.vue'
import useSerial from '@/api/serialApi'
import { useDcc } from '@/api/dccApi'

dayjs.extend(relativeTime)

const { getLayout } = useLayout()
const user = useCurrentUser()
const dccApi = useDcc()
const serialApi = useSerial()
const connStore = useConnectionStore()
const layoutDoc = getLayout()
console.log('layout', layoutDoc, layoutDoc?.data, layoutDoc?.data?.value)
const lastUpdated = computed(() => layoutDoc?.value?.dccEx?.timestamp?.seconds)
const lastConnected = computed(() => layoutDoc?.value?.dccEx?.lastConnected?.seconds)
const client = computed(() => layoutDoc?.value?.dccEx?.client)
const layout = computed(() => layoutDoc?.value)
console.log('lastUpdated', lastUpdated.value, lastConnected.value, client.value, layout.value)
const { isDejaServer, isDejaJS, isSerial, isEmulated, dccExConnected, layoutId } = storeToRefs(connStore)

const handleDisconnect = () => {
  connStore.disconnect()
}

const handleStatus = () => {
  dccApi.send('getStatus', { })
}

const handleSerial = () => {
  console.log('handleSerial', isSerial.value)
  try {
    if (isSerial.value) {
      serialApi.disconnect()
    } else {
      serialApi.connect()
    }
  } catch (err) {
    console.error(err);
  }
}

const handleEmulator = () => {
  console.log('handleEmulator', isEmulated.value)
  if (isEmulated.value) {
    connStore.disconnect()
  } else {
    connStore.connect('emulator')
  }
}

</script>
<template>
  <div class="grid grid-cols-1 gap-4">

    <DejaCloudCard v-if="!!user" />
    <LayoutCard v-if="!!layoutId" />
    

    <v-card v-if="(dccExConnected || isSerial || isEmulated)"
      class="bg-blue-950 rounded-3xl p-2 pb-5"
      color="green"
      variant="text"
    >
      <template #title>
        DCC-EX CommandStation
      </template>
      <template #actions>
        <v-btn @click="handleStatus"  variant="outlined" color="purple" append-icon="mdi-refresh">
          Get Status
        </v-btn>
      </template>
      <template #append>
        <v-icon icon="mdi-chip" :color="!!user ? 'success' : 'error'" size="96" />
      </template>
      <template #item>
        <span v-if="layoutId && lastConnected" class="text-4xl bg-gradient-to-r from-cyan-300 to-violet-600 text-transparent bg-clip-text">
          Connected
        </span>
        <span v-else class="text-4xl bg-gradient-to-r from-red-700 to-violet-600 text-transparent bg-clip-text">
          Disconnected
        </span> 
      </template>
      <template #text>
        <p>{{ layout?.dccEx.version }}</p>
        <pre>
{{ layout?.dccEx?.LCD2 }}
{{ layout?.dccEx?.LCD3 }}
{{ layout?.dccEx?.LCD4 }}
</pre>
      </template>
      <template #subtitle>
        <span class="text-pink-500">
          {{ lastConnected ? dayjs.unix(lastConnected).format('h:mm:ss A') : '' }}
        </span>
      </template>
    </v-card>

    <template v-if="!(isDejaServer || isDejaJS || isEmulated || isSerial)">
      
    </template>


    <template v-else>
      <StatusMenuItem 
        v-if="isDejaServer"
        icon="mdi-access-point" 
        :is-connected="isDejaServer"
        item-label="DEJA.js" 
        page="dejajd"
        @disconnect="handleDisconnect"
        class="text-pink-400">
        <template #desc>
          <span class="text-pink-500">
            {{ dayjs.unix(lastConnected).format('h:mm:ss A') }}
          </span>
        </template>
        {{ isDejaServer ? layoutId : '' }}
      </StatusMenuItem>      
      <StatusMenuItem 
        v-if="isSerial"
        icon="mdi-usb" 
        :is-connected="isSerial"
        item-label="USB Serial" 
        @disconnect="handleDisconnect"
        @connect="handleSerial">    
        {{ isSerial ? 'Connected' : '' }}
      </StatusMenuItem>
      <StatusMenuItem 
        v-if="isEmulated"
        icon="mdi-coffee" 
        :is-connected="isEmulated"
        item-label="Emulator"
        class="text-pink-400"
        @disconnect="handleDisconnect"
        @connect="handleEmulator">    
        {{ isEmulated ? 'Connected' : '' }}
      </StatusMenuItem>
    </template>

    </div>
</template>