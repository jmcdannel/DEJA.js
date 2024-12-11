<script lang="ts" setup>
import { useLocos } from '@/api/useLocos'
import ThrottleMenu from '@/throttle/ThrottleMenu.vue'

const { getThrottles } = useLocos()
const throttles = getThrottles()

function getSignedSpeed({speed, direction}) {
    return speed && !!direction ? speed : -speed || 0
  }
function getColor(speed: number) {
  if (speed === 0) return 'black'
  if (speed < 0) return 'red'
  return 'green'
}

</script>

<template>
  <template v-if="throttles?.length">
    <div class="py-4 p-2 flex justify-between">
      <nav class="grid grid-flow-col gap-4">
        <button 
          v-for="throttle in throttles"
          :key="throttle.id"
          class="text-primary" 
          :class="{ active: ($route?.name === 'home' || $route?.name === 'throttle') }"
          @click="$router.push({ name: 'cloud-throttle', params: { address: throttle.id } })"
          >
          <v-badge
            :color="getColor(getSignedSpeed(throttle))"
            :content="throttle.speed.toString()"
          >
            <v-avatar size="default" color="primary">{{ throttle?.id }}</v-avatar>
          </v-badge>
        </button>
      </nav>

      <!-- <v-spacer></v-spacer> -->
        <ThrottleMenu />
    </div>
  </template>
</template>