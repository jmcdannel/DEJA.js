<script setup lang="ts">
import { useRouter } from 'vue-router'
import { DeviceStatusList } from '@repo/ui'
import Speedometer from '@/throttle/Speedometer.vue'

const router = useRouter()

function handleThrottleClick(address: number) {
  router.push({ name: 'throttle', params: { address } })
}

</script>
<template>
  <DeviceStatusList 
    :show-throttles="true"
    @disconnect="$emit('disconnect')"
    @throttle-click="handleThrottleClick">
    <template #throttles="{ throttles, handleThrottleClick }">
      <Speedometer
        v-for="throttle in throttles"
        :key="throttle.address"
        :speed="throttle.speed"
        :address="throttle.address"
        @click="handleThrottleClick(throttle.address)"
      />
    </template>
  </DeviceStatusList>
</template>