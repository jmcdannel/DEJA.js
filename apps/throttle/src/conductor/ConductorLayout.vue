<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useLocos } from '@repo/modules'
import ButtonsThrottle from '@/throttle/ButtonsThrottle.vue'
import SliderThrottle from '@/throttle/SliderThrottle.vue'
import Dashboard from '@/throttle/Dashboard.vue'
import ThrottleList from '@/throttle/ThrottleList.vue'
import ThrottleSwipeContainer from '@/throttle/ThrottleSwipeContainer.vue'
import Routes from '@/routes/Routes.vue'
import {
  TurnoutList,
  EffectList,
  SignalList,
  DeviceConnectionList,
} from '@repo/ui'
import { useConductorSettings } from '@/conductor/useConductorSettings'

const { getThrottles } = useLocos()
const throttles = getThrottles()

const { variant, rightPanel } = useConductorSettings()

const variantMap = {
  buttons: ButtonsThrottle,
  slider: SliderThrottle,
  dashboard: Dashboard,
} as const

const variantComponent = computed(() => variantMap[variant.value] ?? ButtonsThrottle)

const rightPanelMap = {
  turnouts: TurnoutList,
  effects: EffectList,
  signals: SignalList,
  devices: DeviceConnectionList,
  routes: Routes,
} as const

const rightPanelComponent = computed(() => rightPanelMap[rightPanel.value] ?? TurnoutList)

const activeThrottleAddress = ref<number | null>(null)

watch(throttles, (newThrottles) => {
  if (newThrottles?.length && activeThrottleAddress.value == null) {
    activeThrottleAddress.value = newThrottles[0].address
  }
}, { immediate: true })
</script>

<template>
  <main class="@container relative">
    <div class="conductor-layout grid grid-cols-1 @[960px]:grid-cols-3 gap-2 w-full">

      <!-- Column 1: Throttle list -->
      <div class="rounded border-1 border-green-500 border-opacity-50 order-2 @[960px]:!order-1 overflow-hidden min-h-[70vh] @[960px]:min-h-0" style="background: rgba(var(--v-theme-surface), 0.2)">
        <div class="@container h-full overflow-hidden p-4">
          <div v-if="throttles?.length" class="relative h-full w-full">
            <ThrottleList />
          </div>
        </div>
      </div>

      <!-- Column 2: Swipeable throttle controls -->
      <div class="order-1 @[960px]:!order-2 overflow-hidden min-h-[90vh] @[960px]:min-h-0" style="background: rgba(var(--v-theme-surface), 0.2)">
        <div class="@container h-full overflow-hidden">
          <ThrottleSwipeContainer
            v-if="throttles && throttles.length > 0"
            :throttles="throttles"
            :model-value="activeThrottleAddress"
            :variant-component="variantComponent"
            :variant-props="{ showSpeedometer: false, showConsist: false }"
            @update:model-value="activeThrottleAddress = $event"
          />
        </div>
      </div>

      <!-- Column 3: Right panel -->
      <div class="order-3 overflow-hidden min-h-[70vh] @[960px]:min-h-0" style="background: rgba(var(--v-theme-surface), 0.2)">
        <div class="@container h-full overflow-y-auto p-4">
          <component :is="rightPanelComponent" />
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
