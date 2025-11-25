<script setup lang="ts">
import { useLocos } from '@repo/modules'
import SimpleThrottle from '@/throttle/SimpleThrottle.vue'
import ThrottleList from '@/throttle/ThrottleList.vue'
import { TurnoutList } from '@repo/ui'

const { getThrottles } = useLocos()
const throttles = getThrottles()

</script>
  <template>
    <main class="@container relative">
      <div class="conductor-layout grid grid-cols-1 @[960px]:grid-cols-3 gap-2 w-full">
      <div class=" bg-slate-700 bg-opacity-20 rounded border-1 border-green-500 border-opacity-50 order-2 @[960px]:!order-1 overflow-hidden">
        <div class="@container h-full overflow-y-auto p-4">
          <!-- Column 1 content goes here -->
          <div v-if="throttles?.length" class="flex-grow flex flex-row flex-wrap gap-1 relative overflow-auto items-end content-end">
            <div class="flex-grow"></div>
            <ThrottleList />
          </div>
        </div>
      </div>
      <div class=" bg-slate-700 bg-opacity-20 order-1 @[960px]:!order-2 overflow-hidden">
        <div class="@containermin-h-[500px] h-full overflow-y-auto p-4">
          <!-- Column 2 content goes here -->
           <v-carousel v-if="throttles && throttles.length > 0" height="100%" class="min-h-90vh" hideDelimiters>
            <v-carousel-item v-for="(item) in throttles" :key="item.address" draggable>
              <SimpleThrottle :address="item.address" />
            </v-carousel-item>
          </v-carousel>
        </div>
      </div>
      <div class=" bg-slate-700 bg-opacity-20 order-3 overflow-hidden">
        <div class="@container h-full overflow-y-auto p-4">
          <TurnoutList />
        </div>
      </div>
    </div>
  </main>
  
</template>

<style scoped>
.drawer-closed {
  right: 0;
  transition: right 0.2s;
}

.drawer-open {
  right: var(--v-navigation-drawer-width, 256px);
}

.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

@media (min-width: 960px) {
  .conductor-layout {
    height: calc(100vh - var(--v-layout-bottom) - var(--v-layout-top));
  }
}
</style>