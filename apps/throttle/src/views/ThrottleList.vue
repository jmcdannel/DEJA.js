<script async setup lang="ts">
import type { Loco, Throttle } from '@repo/modules/locos'
import ThrottleTile from '@/throttle/ThrottleTile.vue'

import { useLocos } from '@repo/modules/locos'

const { throttlesWithLocos } = useLocos()
</script>

<template>
  <div class="@container flex-grow flex flex-col">
    <div v-if="throttlesWithLocos?.length" class="flex-grow flex flex-row flex-wrap relative overflow-auto items-end content-end">
      <div class="flex-grow"></div>
      <div 
        class="basis-full @[960px]:basis-1/2"  
        v-for="item in throttlesWithLocos"        
        :key="item.address">
          <ThrottleTile 
            :throttle="item.throttle as Throttle" 
            :loco="item.loco as Loco" 
          />
      </div>
    </div>
  </div>
</template>
