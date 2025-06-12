<script lang="ts" setup>
import { computed } from 'vue'
import type { Loco } from '@repo/modules/locos'
import type { Throttle } from '@/throttle/types'
import { useLocos } from '@repo/modules/locos'
import { LocoAvatar } from '@repo/ui'

const { getLoco, getThrottles } = useLocos()
const throttles = getThrottles()

const getLocoData = (address: Number) => computed(() => getLoco(address)?.value || {} as Loco)
</script>

<template>
  <div v-if="throttles?.length" 
    class="p-1" 
    v-for="item in throttles" 
    :key="item.id">
    <LocoAvatar
      :loco="getLocoData(item.address).value"
      :throttle="item.throttle as Throttle"
      :size="48"
    />
    />
  </div>
</template>
