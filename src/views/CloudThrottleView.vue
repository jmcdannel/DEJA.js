<script async setup lang="ts">
  import { computed, onMounted, watch, shallowRef, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { useStorage } from '@vueuse/core'
  import router from '../router'

  import ThrottleComponent from '@/throttle/Throttle.component.vue'
  import ThrottleTile from '@/throttle/ThrottleTile.vue'

  import { useLocos } from '@/api/useLocos'
  import { useDejaCloud } from '@/deja-cloud/useDejaCloud'
  import { defaultFunctions } from '@/functions/useFunctions'

  const route = useRoute()
  const carouselElement = ref(null)
  const { releaseThrottle } = useDejaCloud()
  const { getThrottles, getLocos } = useLocos()

  const viewAs = useStorage('@DEJA/prefs/throttleView', 'Array')

  const address = ref(parseInt(route.params.address?.toString()))
  const throttles = getThrottles()
  const locos = getLocos()
  const currentThrottle = computed(() => throttles?.value.find((throttle) => throttle.address === address.value))
  
  onMounted(async () => {
    const throttleIdx = throttles?.value.findIndex((throttle) => throttle.address === address.value)
    console.log('onMounted address', address.value, throttleIdx)
    scrollCarousel(throttleIdx)
  })

  watch(
    () => route.params.address,
    (newId, oldId) => {
      console.log('watch oute.params.address', newId, oldId)
      address.value = parseInt(newId?.toString())
      currentThrottle.value = throttles?.value.find((throttle) => throttle.address === address.value)
    }
  )

  watch(address, async (newAddress, oldAddress) => {
    const throttleIdx = throttles?.value.findIndex((throttle) => throttle.address === newAddress)
    console.log('watch addres', newAddress, oldAddress, throttleIdx)
    scrollCarousel(throttleIdx)
  })

  async function handleRelease(address: number) {
    console.log('handleRelease', address)
    if (address) {
      await releaseThrottle(address)
      router.push({ name: 'home' })
    }
  }

  function getLoco(locoAddress: number) {
    return locos?.value.find((loco) => loco.locoId === locoAddress)
  }

  function scrollCarousel(targetImageNumber) {
    console.log('scrollCarousel', targetImageNumber)
    if (!carouselElement.value) {
      return
    }
    let carouselWidth = carouselElement.value.clientWidth;
    let targetXPixel = (carouselWidth * targetImageNumber) + 1
    carouselElement.value.scrollTo(targetXPixel, 0)
  }

  function handleViewChange(newView:string) {
    console.log('handleViewChange', newView)
    viewAs.value = newView
  }

  const itemClasses = computed(() => {
    return {
      // 'carousel-item': true,
      // 'relative': true,
      'w-full': viewAs.value === 'Array',
      'w-1/2': viewAs.value === 'Split'
    }
  })

</script>

<template>
  <!-- <ThrottleMenu /> -->
  <template v-if="locos?.length  && throttles?.length">
    <template v-if="viewAs === 'Array' || viewAs === 'Split'">
        <div 
          class="flex-grow carousel w-full"          
          ref="carouselElement">
          <div 
            class="carousel-item relative"
            :class="itemClasses"
            v-for="(throttle, index) in throttles"   
            :id="`slide${index.toString()}`"
            :key="throttle.id">
            <ThrottleComponent
              :throttle="throttle" 
              :loco="getLoco(throttle.address)"
              :viewAs="viewAs"
              @release="handleRelease"
            />
          </div>
        </div>
    </template>
    <template v-else-if="viewAs === 'List'">      
      <div class="flex-grow flex flex-col relative overflow-auto">
        <div class="flex-grow"></div>
        <ThrottleTile 
          v-for="throttle in throttles"
          :key="throttle.id"
          :throttle="throttle" 
          :loco="getLoco(throttle.address)"
          @release="handleRelease"
        />
      </div>
    </template>
    <template v-else-if="viewAs === 'Grid'">
      <div class="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        <ThrottleTile 
          v-for="throttle in throttles"
          :key="throttle.id"
          :throttle="throttle" 
          :loco="getLoco(throttle.address)"
          @release="handleRelease"
        />
      </div>
    </template>
  </template>
</template>
