<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Loco, Throttle } from '@/throttle/types'
import { useLocos } from '@/api/useLocos'
import { useDejaCloud } from '@/deja-cloud/useDejaCloud'
import SimpleThrottle from '@/throttle/SimpleThrottle.vue'
import ThrottleList from '@/throttle/ThrottleList.vue'
import Turnouts from '@/turnouts/Turnouts.vue'
import Effects from '@/effects/Effects.vue'

const { releaseThrottle } = useDejaCloud()
const { getThrottles, getLocos } = useLocos()

const address = ref(17) // Example address, replace with actual logic to get the address
const throttles = getThrottles()
const locos = getLocos()

const currentThrottle = computed<Throttle|null>(() => (throttles?.value.find((throttle) => throttle.address === address.value) as Throttle) || null)

async function handleRelease(address: number) {
  if (address) {
    await releaseThrottle(address)
  }
}

function getLoco(locoAddress: number) {
  return locos?.value.find((loco) => loco.locoId === locoAddress)
}

const loco = computed<Loco|null>(() => currentThrottle?.value && (getLoco(currentThrottle.value?.address) as Loco) || null)

</script>

<template>
  <div class="conductor-layout">
    <div class="column">
      <div class="@container column-content">
        <!-- Column 1 content goes here -->
         <ThrottleList />
      </div>
    </div>
    <div class="column">
      <div class="@container column-content">
        <!-- Column 2 content goes here -->
         <!-- <pre>{{throttles}}</pre> -->
        <v-carousel v-if="throttles && throttles.length > 0" height="100%" hideDelimiters>
          <v-carousel-item v-for="(throttle, index) in throttles" :key="throttle.address" draggable>
            <SimpleThrottle
              :throttle="throttle.address"
              :loco="getLoco(throttle.address) as Loco"
              @release="handleRelease"
            />
          </v-carousel-item>
        </v-carousel>
      </div>
    </div>
    <div class="column">
      <div class="@container column-content">
        <!-- Column 3 content goes here -->
        <Turnouts />
      </div>
    </div>
  </div>
</template>

<style scoped>
.conductor-layout {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  height: calc(100vh - var(--v-layout-bottom) - var(--v-layout-top));
  width: 100%;
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