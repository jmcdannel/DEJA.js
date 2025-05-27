<script async setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Loco } from '@repo/modules/locos'
import type { Throttle } from '@/throttle/types'
import ThrottleTile from '@/throttle/ThrottleTile.vue'

import { useLocos } from '@repo/modules/locos'
import { useThrottle } from '@/throttle/useThrottle'

const $router = useRouter()
const { releaseThrottle } = useThrottle()
const { getThrottles, getLocos } = useLocos()

const throttles = getThrottles()
const locos = getLocos()

const throttlesWithLocos = computed(() => 
  throttles.value?.map(throttle => ({
    id: throttle.address,
    throttle,
    loco: locos.value?.find(loco => loco.locoId === throttle.address)
  })).filter(t => t.loco)
)

async function handleRelease(address: number) {
  console.log('handleRelease', address)
  if (address) {
    await releaseThrottle(address)
  }
}

async function handleSelect(address: number) {
  console.log('handleRelease', address)
  if (address) {      
    $router.push({ name: 'cloud-throttle', params: { address } })
  }
}

</script>

<template>
  <template v-if="throttlesWithLocos?.length">
    <div class="flex-grow flex flex-row flex-wrap relative overflow-auto items-end content-end">
      <div class="flex-grow"></div>
       <div 
        class="basis-full @[960px]:basis-1/2 p-2"  
        v-for="item in throttlesWithLocos"        
        :key="item.id">
        <ThrottleTile        
          :throttle="item.throttle as Throttle" 
          :loco="item.loco as Loco"
          @release="handleRelease"
          @select="handleSelect"
        />
      </div>
    </div>
  </template>
  <!-- <pre>
    {{ throttles }}
  </pre> -->
</template>
