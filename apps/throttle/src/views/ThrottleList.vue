<script async setup lang="ts">
import type { Throttle } from '@repo/modules/locos'
import ThrottleTile from '@/throttle/ThrottleTile.vue'
import { useLocos } from '@repo/modules/locos'

const { getThrottles } = useLocos()
const throttles = getThrottles()
</script>

<template>
  <div class="@container flex-grow flex flex-col">
    <div v-if="throttles" class="flex-grow flex flex-row flex-wrap relative overflow-auto items-end content-end justify-end">
      <!-- <div class="basis-full @[960px]:basis-1/2 flex-grow"></div> -->
      <div 
        class="basis-full @[960px]:basis-1/2 p-1"  
        v-for="item in throttles"
        :key="((item as unknown) as Throttle).id">
          <ThrottleTile 
            :address="((item as unknown) as Throttle).address" 
          />
      </div>
    </div>
  </div>
</template>
