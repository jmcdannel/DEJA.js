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
import { useThrottleSettings } from '@/throttle/useThrottleSettings'

const { getThrottles } = useLocos()
const throttles = getThrottles()

const { variant, rightPanel, speedDisplayType, showFunctions, showSpeedometer, showConsist } = useThrottleSettings()

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

      <!-- Column 1: Throttle list (compact) -->
      <div class="rounded border-1 border-green-500 border-opacity-50 order-2 @[960px]:!order-1 overflow-hidden min-h-[40vh] @[960px]:min-h-0" style="background: rgba(var(--v-theme-surface), 0.2)">
        <div class="@container h-full overflow-hidden p-2">
          <div v-if="throttles?.length" class="relative h-full w-full">
            <ThrottleList />
          </div>
        </div>
      </div>

      <!-- Column 2: Swipeable throttle controls (compact) -->
      <div class="order-1 @[960px]:!order-2 overflow-hidden min-h-[60vh] @[960px]:min-h-0" style="background: rgba(var(--v-theme-surface), 0.2)">
        <div class="@container h-full overflow-hidden">
          <ThrottleSwipeContainer
            v-if="throttles && throttles.length > 0"
            :throttles="throttles"
            :model-value="activeThrottleAddress"
            :variant-component="variantComponent"
            :variant-props="{ showSpeedometer: showSpeedometer, showConsist: showConsist, showFunctions: showFunctions, speedDisplayType: speedDisplayType }"
            @update:model-value="activeThrottleAddress = $event"
          />
        </div>
      </div>

      <!-- Column 3: Right panel (full-width items) -->
      <div class="order-3 overflow-hidden min-h-[40vh] @[960px]:min-h-0 conductor-right-panel" style="background: rgba(var(--v-theme-surface), 0.2)">
        <div class="@container h-full overflow-y-auto p-2">
          <component :is="rightPanelComponent" compact />
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

<!-- 🔀 Unscoped styles to override Vuetify's @media responsive grid inside conductor right panel -->
<style>
/* Force all list items to full width in conductor right panel */
.conductor-right-panel .v-col,
.conductor-right-panel .v-col-12,
.conductor-right-panel [class*="v-col-sm"],
.conductor-right-panel [class*="v-col-md"],
.conductor-right-panel [class*="v-col-lg"],
.conductor-right-panel [class*="v-col-xl"],
.conductor-right-panel [class*="v-col-xxl"] {
  flex: 0 0 100% !important;
  max-width: 100% !important;
}

/* CTC switches — 2 per row, centered */
.conductor-right-panel .v-col-auto {
  flex: 0 0 50% !important;
  max-width: 50% !important;
  display: flex;
  justify-content: center;
}

.conductor-right-panel .v-row {
  justify-content: center;
}
</style>
