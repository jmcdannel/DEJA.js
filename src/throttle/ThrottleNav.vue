<script lang="ts" setup>
import { useLocos } from '@/api/useLocos'
import { useRouter } from 'vue-router'
const $router = useRouter()

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

function handleThrottleClick(throttle) {
  $router.push({ name: 'cloud-throttle', params: { address: throttle.id } })
}

function handleListCkick() {
  $router.push({ name: 'throttle-list' })
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
          @click="handleThrottleClick(throttle)"
          >
          <v-badge
            :color="getColor(getSignedSpeed(throttle))"
            :content="throttle.speed.toString()"
          >
            <v-avatar size="default" color="primary">{{ throttle?.id }}</v-avatar>
          </v-badge>
        </button>
      </nav>
        <v-btn key="3" @click="handleListCkick" icon="mdi-view-sequential-outline"></v-btn>
    </div>
  </template>
</template>