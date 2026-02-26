<script async setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Throttle } from '@repo/modules/locos'
import ThrottleTile from '@/throttle/ThrottleTile.vue'
import { useLocos, type Loco } from '@repo/modules/locos'
import { LocoAvatar, ListMenu } from '@repo/ui'
import { useStorage } from '@vueuse/core'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import draggable from 'vuedraggable'

const { getLocos, getThrottles, acquireThrottle } = useLocos()
const locos = getLocos()
const throttles = getThrottles()

const isRosterOpen = ref(false)

const throttleOrder = useStorage<number[]>('@DEJA/throttles/order', [])

const orderedThrottles = computed<Throttle[]>({
  get: () => {
    const list = (throttles.value || []) as unknown as Throttle[]
    const order = throttleOrder.value
    const byOrder = [...list].sort((a, b) => {
      const indexA = order.indexOf(a.address)
      const indexB = order.indexOf(b.address)

      if (indexA === -1 && indexB === -1) {
        return a.address - b.address
      }
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })

    return byOrder
  },
  set: (newOrder) => {
    throttleOrder.value = newOrder.map((item) => item.address)
  }
})

watch(
  throttles,
  (newThrottles) => {
    const items = (newThrottles || []) as unknown as Throttle[]
    const addresses = items.map((item) => item.address)
    const filteredOrder = throttleOrder.value.filter((address) =>
      addresses.includes(address)
    )
    const missingAddresses = addresses.filter(
      (address) => !filteredOrder.includes(address)
    )
    const updatedOrder = [...filteredOrder, ...missingAddresses]

    if (
      updatedOrder.length !== throttleOrder.value.length ||
      updatedOrder.some((address, index) => address !== throttleOrder.value[index])
    ) {
      throttleOrder.value = updatedOrder
    }
  },
  { immediate: true }
)

</script>

<template>
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[100px] -top-[200px] -left-[300px]"></div>
    <div class="absolute w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[80px] -bottom-[100px] -right-[200px]"></div>
    <div class="absolute w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[90px] top-[30%] left-[40%]"></div>
  </div>
  <div v-if="throttles" class="flex-grow flex pb-16 flex-row flex-wrap relative overflow-auto items-end content-end justify-end">
    <draggable
      v-model="orderedThrottles"
      item-key="address"
      handle=".drag-handle"
      class="flex flex-row flex-wrap content-end items-end justify-end w-full"
      :animation="150"
    >
      <template #item="{ element }">
        <div class="basis-full md:basis-1/2 p-1">
          <ThrottleTile v-if="element.address" :address="element.address" />
        </div>
      </template>
    </draggable>
    <v-fab icon="mdi-plus" color="primary" size="56" @click="isRosterOpen = true"  app />
  </div>
  <v-dialog v-model="isRosterOpen" max-width="800px">
    <template v-slot:default>
      <v-sheet class="p-4">
        <v-row v-auto-animate class="flex justify-center">
          <v-col cols="auto"
            v-for="loco in locos"
            :key="loco.address" 
            >
            <LocoAvatar 
              :loco="loco as Loco"
              @select="async () => { await acquireThrottle(loco.address); isRosterOpen = false }"
              :showMenu="false" 
              variant="flat"
              class="m-2"
            />
          </v-col>
        </v-row>
      </v-sheet>
    </template>    
  </v-dialog>
</template>
