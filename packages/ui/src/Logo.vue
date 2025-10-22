<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  appName?: string
  appIcon?: string
  appColor?: string
  variant?: 'default' | 'cloud' | 'throttle' | 'monitor'
}

const props = withDefaults(defineProps<Props>(), {
  appName: 'DEJA',
  appIcon: 'mdi-train',
  appColor: 'primary',
  variant: 'default'
})

const logoComponent = computed(() => {
  switch (props.variant) {
    case 'throttle':
      return new URL('./assets/logo-throttle.svg', import.meta.url).href
    case 'monitor':
      return new URL('./assets/logo-monitor.svg', import.meta.url).href
    case 'cloud':
      return new URL('./assets/logo-cloud.svg', import.meta.url).href
    default:
      return new URL('./assets/logo-default.svg', import.meta.url).href
  }
})


</script>

<template>
  <div class="flex items-start">
    <!-- <img 
      :src="logoComponent" 
      :alt="`${appName} Logo`" 
      class="w-10 h-10 drop-shadow-sm" 
    /> -->
    <v-icon
      v-if="appIcon"
      :icon="appIcon"
      size="32"
      :color="appColor"
      style="filter: drop-shadow(1px 1px 0 #fff2);"
    />
    <span
      class="ml-2 font-bold drop-shadow-sm hidden sm:inline text-xl lg:text-2xl bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text"
    >
      DEJA
    </span>
    <span
      class="ml-2 font-bold drop-shadow-sm text-xl lg:text-2xl"
    >
      {{ appName }}
    </span>
  </div>
</template>
