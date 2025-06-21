<script setup lang="ts">
import { computed } from 'vue'
import type { Loco, Throttle } from '@repo/modules/locos'
import { useLocos } from '@repo/modules/locos'
import SimpleThrottle from '@/throttle/SimpleThrottle.vue'
import ThrottleTile from '@/throttle/ThrottleTile.vue'
import Turnouts from '@/turnouts/Turnouts.vue'
// import Effects from '@/effects/Effects.vue'

const { getThrottles } = useLocos()
const throttles = getThrottles()

</script>
<template>
  <main class="@container">
    <div class="conductor-layout grid grid-cols-1 @[960px]:grid-cols-3 gap-2 w-full">
      <div class="bg-black bg-opacity-60 rounded border-1 border-green-500 border-opacity-50 order-2 @[960px]:!order-1">
        <div class="@container column-content">
          <!-- Column 1 content goes here -->
          <div v-if="throttles?.length" class="flex-grow flex flex-row flex-wrap gap-1 relative overflow-auto items-end content-end">
            <div class="flex-grow"></div>
            <div 
              class="basis-full @[960px]:basis-1/2"
              v-for="item in throttles" 
              :key="item.address">
                <ThrottleTile :address="item.address" />
            </div>
          </div>
        </div>
      </div>
      <div class="column order-1 @[960px]:!order-2">
        <div class="@container column-content min-h-[500px]">
          <!-- Column 2 content goes here -->
          <!-- <pre>{{throttles}}</pre> -->
          <v-carousel v-if="throttles && throttles.length > 0" height="100%" hideDelimiters>
            <v-carousel-item v-for="(item) in throttles" :key="item.address" draggable>
              <SimpleThrottle :address="item.address" />
            </v-carousel-item>
          </v-carousel>
        </div>
      </div>
      <div class="column order-3">
        <div class="@container column-content">
          <!-- Column 3 content goes here -->
          <Turnouts />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* .conductor-layout {
  height: calc(100vh - var(--v-layout-bottom) - var(--v-layout-top));
} */

@media (min-width: 960px) {
  .conductor-layout {
    height: calc(100vh - var(--v-layout-bottom) - var(--v-layout-top));
  }
}

.column {
  background-color: rgba(0,0,0,.6);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(50, 205, 50, 0.5);
}

.column-content {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
}
</style>