<script lang="ts" setup>
import { useLocos } from '@/api/useLocos'
import { VaAvatar } from 'vuestic-ui'

const { getThrottles } = useLocos()
const throttles = getThrottles()

</script>

<template>
  <template v-if="throttles">
    <router-link
      v-for="throttle in throttles"
        :key="throttle.id"
        :to="`/cloud-throttle/${throttle?.id}`"
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