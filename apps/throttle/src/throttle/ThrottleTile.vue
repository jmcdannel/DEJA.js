<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { useRouter } from 'vue-router'
import ThrottleButtonControls from './ThrottleButtonControls.vue'
import CurrentSpeed from './CurrentSpeed.vue'
import RoadnameLogo from '@/throttle/RoadnameLogo.vue'
import { useThrottle } from './useThrottle'

const props = defineProps({
  address: {
    type: Number,
    required: true
  }
})

const $router = useRouter()
const addressRef = toRef(props, 'address')
const isMenuOpen = ref(false)
const {
  adjustSpeed: handleAdjustSpeed,
  currentSpeed,
  loco,
  releaseThrottle,
  stop: handleStop,
  throttle,
} = useThrottle(addressRef)

const locoColor = computed(() => loco?.meta?.color || 'primary')
</script>
<template>
  <main v-if="throttle" class="rounded-2xl shadow-xl relative bg-gradient-to-br from-violet-800 to-cyan-500 bg-gradient-border ">
    <section class="p-1 flex flex-row flex-wrap items-center justify-between overflow-auto">
      <div class="order-1 basis-1/3 pl-2" >
        <CurrentSpeed
          class="!justify-start drag-handle cursor-grab active:cursor-grabbing select-none"
          :speed="currentSpeed"
        />
      </div>
      <div class="flex-grow order-4 basis-full my-1">
        <ThrottleButtonControls
          horizontal
          @stop="handleStop" 
          @update:currentSpeed="handleAdjustSpeed" 
        />
      </div>
      <div class="order-2 basis-1/3 py-2 flex justify-center text-base @[960px]:text-xl gap-2 items-center">
        <RoadnameLogo :roadname="loco?.meta?.roadname" size="sm" />
        <span class="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-cyan-400 font-bold">{{loco?.name || throttle.address}}</span>
      </div>
      <div class="order-2 basis-1/3 pr-2 flex justify-end">
        <v-speed-dial
          v-if="loco"
          v-model="isMenuOpen"
          location="left center"
          transition="fade-transition"
          contained
        >
          <template v-slot:activator="{ props: activatorProps }">
            <component
              :is="loco.consist?.length ? 'v-badge' : 'div'"
              :color="loco.consist?.length ? 'primary' : undefined"
              :content="loco.consist?.length"
            >
              <v-btn
                v-bind="activatorProps"
                :color="locoColor"
                rounded="circle"
                :size="48"
                :text="loco.address?.toString() || '?'"
                variant="tonal"
              />
            </component>
          </template>
          <v-btn @click="$router.push({ name: 'throttle', params: { address: loco.address } })" :color="locoColor" icon="mdi-gamepad-square" />
          <v-btn @click="$router.push({ name: 'throttle-list' })" :color="locoColor" icon="mdi-view-sequential-outline" />
          <v-btn @click="releaseThrottle" :color="locoColor" icon="mdi-parking" />
          <v-btn @click="handleStop" :color="locoColor" icon="mdi-stop-circle-outline" />
        </v-speed-dial>
      </div>
    </section>
  </main>
  <main v-else>
    <div class="flex items-center justify-center h-full">
      <p class="opacity-50">Loading throttle...</p>
      {{address}}
      {{throttle}}
    </div>
  </main>
</template>