<script setup lang="ts">
  import { ref, watch, onMounted } from 'vue'
  import { useRoute } from 'vue-router'

  import Throttle from '@/throttle/Throttle.component.vue'
  import SelectLoco from '@/throttle/SelectLoco.component.vue'
  import { useThrottleStore, localStorageKey } from '@/throttle/throttleStore'

  import type { Loco } from '../throttle/types'

  const route = useRoute()

  const throttleStore = useThrottleStore()
  watch(() => throttleStore.$state?.locos,
    (state) => {
      localStorage.setItem(localStorageKey, JSON.stringify(state));
    },
    { deep: true }
  )

  onMounted(async () => {
    // try {
    //   const dccExInfo = {
    //     "status": "connected",
    //     "version": "6.1.4",
    //     "locos": [
    //       {
    //         "address": 79,
    //         "consist": [],
    //         "functions": [
    //           {
    //             "id": 0,
    //             "label": "Light",
    //             "icon": "light"
    //           }
    //         ]
    //       },
    //       {
    //         "address": 11,
    //         "consist": [],
    //         "functions": []
    //       }
    //     ]
    //   }
    //   const awsDccStatusUrl = 'https://z5uvdkxykfigbgbe4ysvkxzgc40kfzmf.lambda-url.us-east-1.on.aws/'
    //   const awsParams = {
    //     body: JSON.stringify({
    //       dccExInfo
    //     }),
    //     method: 'POST'
    //   }
    //   const res = await fetch(awsDccStatusUrl, awsParams)
    //   console.log('AWS DCC Status:', res, res?.body, await res?.json())
    // } catch (error) {
    //   console.error('AWS DCC Status:', error)
    // }
  })

  
  
</script>

<template>
  <template v-if="route.params.locoId">
    <Throttle :locos="throttleStore.locos" :address="parseInt(route.params.locoId?.toString())" />
  </template>
  <template v-else>
    <SelectLoco :locos="throttleStore.locos" />
  </template>
</template>
