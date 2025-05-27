<script lang="ts" setup>
import { computed } from 'vue'
import type { Loco } from '@repo/modules/locos'
import type { Throttle } from '@/throttle/types'
import { useLocos } from '@repo/modules/locos'
import LocoAvatar from '@/core/LocoAvatar/LocoAvatar.vue'

const { getLocos, getThrottles } = useLocos()
const locos = getLocos()
const throttles = getThrottles()

const throttlesWithLocos = computed(() => 
  throttles.value?.map(throttle => ({
    id: throttle.address,
    throttle,
    loco: locos.value?.find(loco => loco.locoId === throttle.address)
  })).filter(t => t.loco)
)
</script>

<template>
  <div v-if="throttlesWithLocos?.length" 
    class="p-1" 
    v-for="item in throttlesWithLocos" 
    :key="item.id"
  >
    <LocoAvatar
      :loco="item.loco as Loco"
      :throttle="item.throttle as Throttle"
      :showCard="true"
      :size="48"
    />
  </div>
</template>
