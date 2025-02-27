<script lang="ts" setup>
import type { Loco, Throttle } from '@/throttle/types'
import { useLocos } from '@/api/useLocos'
import { useRouter } from 'vue-router'
import LocoAvatar from '@/core/LocoAvatar/LocoAvatar.vue'
const $router = useRouter()

const { getLocos, getThrottles } = useLocos()
const locos = getLocos()
const throttles = getThrottles()

function getSignedSpeed({speed, direction}: Throttle) {
    return speed && !!direction ? speed : -speed || 0
  }
function getColor(speed: number) {
  if (speed === 0) return 'black'
  if (speed < 0) return 'red'
  return 'green'
}

function handleThrottleClick(throttle: Throttle) {
  $router.push({ name: 'cloud-throttle', params: { address: throttle.id } })
}

function handleListCkick() {
  $router.push({ name: 'throttle-list' })
}

</script>

<template>
  <template v-if="throttles?.length && locos?.length">
    <div class="p-2 flex justify-between">
      <v-slide-group show-arrows>
        <v-slide-group-item
          v-for="throttle in throttles" 
          :key="throttle.id">
          <div class="p-1">
            <LocoAvatar
              class="m-2"
              :loco="locos.find(loco => loco.locoId === throttle.address) as Loco"
              :throttle="throttle as Throttle"
              :showCard="true"
              :size="48"
            />
          </div>
        </v-slide-group-item>
      </v-slide-group>

      <v-btn :size="48" @click="handleListCkick" icon="mdi-view-sequential-outline" variant="tonal" color="cyan"></v-btn>
    </div>
  </template>
</template>