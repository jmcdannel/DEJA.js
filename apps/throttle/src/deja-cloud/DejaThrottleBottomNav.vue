<script lang="ts" setup>
import { useLocos } from '@repo/modules/locos'

const { getThrottles } = useLocos()
const throttles = getThrottles()

</script>

<template>
  <template v-if="throttles">
    <router-link
      v-for="throttle in throttles"
        :key="throttle.address"
        :to="`/throttle/${throttle?.address}`"
        custom
        v-slot="{ navigate }"
      >
      <button 
        class="text-primary" 
        :class="{ active: ($route?.name === 'home' || $route?.name === 'throttle') }" 
        @click="navigate" 
        style="--va-badge-text-wrapper-border-radius: 50%;"
        role="link">
        <v-badge
          overlap
          :text="throttle.speed.toString()"
        >
          <v-btn size="small">{{ throttle?.id }}</v-btn>
        </v-badge>
      </button>
    </router-link>
  </template>
</template>