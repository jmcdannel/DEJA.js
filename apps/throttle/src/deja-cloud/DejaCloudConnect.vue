<script setup lang="ts">
  import { onMounted, computed, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useCurrentUser, useDocument } from 'vuefire'
  import { watchArray } from '@vueuse/core'
  import { doc } from "firebase/firestore"
  import { db } from "@/firebase"
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import { useConnectionStore } from '@/connections/connectionStore'
  import { useDejaCloudStore } from '@/deja-cloud/dejaCloudStore'
  import { useDejaCloud } from '@/deja-cloud/useDejaCloud'
  import { useDcc } from '@/api/dccApi'
  import { useLayout } from '@/api/useLayout'
  import DejaCloudConnectDevice from './DejaCloudConnectDevice.vue'

  const user = useCurrentUser()
  const conn = useConnectionStore()
  const dejaCloudStore = useDejaCloudStore()
  const dcc = useDcc()

  dayjs.extend(relativeTime)

  const { layoutId, dccExConnected } = storeToRefs(conn)
  const { getLayout, getDevices } = useLayout()
    
  const layout = getLayout()
  const devices = getDevices()


  const lastUpdated = computed(() => layout?.value?.dccEx?.timestamp?.seconds)
  const lastConnected = computed(() => layout?.value?.dccEx?.lastConnected?.seconds)
  const client = computed(() => layout?.value?.dccEx?.client)

  watch(lastUpdated, (newVal, oldVal) => {
    console.log('layout updated', newVal, oldVal)
    const now = dayjs()
    const updated = dayjs.unix(newVal)
    if (!dccExConnected.value && now.diff(updated, 'minute') < 2) {
      console.log('layout updated', now.diff(updated, 'minute'), now.diff(updated, 'second'), now.diff(updated))
      conn.connectDccEx()
    }
  })

  watch(lastConnected, (newVal, oldVal) => {
    console.log('lastConnected', newVal, oldVal)
    if (newVal) {
      const now = dayjs()
      const connected = dayjs.unix(newVal)
      console.log('layout lastConnected', now.diff(connected, 'minute'), now.diff(connected, 'second'), now.diff(connected))
      if (!dccExConnected.value && now.diff(connected, 'minute') < 2) {
        conn.connectDccEx()
      }
    }
  })

  watch(client, (newVal, oldVal) => {
    console.log('client changed', newVal, oldVal)
    if (newVal) {
      conn.connectionType = newVal
    }
  })

</script>

<template>
  <!-- <pre>{{ layout }}</pre> -->
  <DejaCloudConnectDevice v-for="device in devices" :key="device.id" :deviceId="device.id" :device="device" />
</template>