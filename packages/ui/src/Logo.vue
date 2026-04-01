<script setup lang="ts">
import { computed } from 'vue'

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
export type LogoVariant = 'default' | 'cloud' | 'throttle' | 'monitor' | 'tour'

interface Props {
  size?: LogoSize
  showIcon?: boolean
  appTitle?: string
  variant?: LogoVariant
  stacked?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showIcon: true,
  variant: 'default',
  stacked: false,
})

const sizeMap = {
  xs:  { brand: 'text-sm',  js: 'text-[0.55rem]', icon: 'w-4 h-4',   gap: 'gap-1',   title: 'text-xs' },
  sm:  { brand: 'text-lg',  js: 'text-[0.7rem]',  icon: 'w-6 h-6',   gap: 'gap-1.5', title: 'text-sm' },
  md:  { brand: 'text-2xl', js: 'text-[1rem]',    icon: 'w-8 h-8',   gap: 'gap-2',   title: 'text-lg' },
  lg:  { brand: 'text-3xl', js: 'text-[1.2rem]',  icon: 'w-10 h-10', gap: 'gap-2',   title: 'text-xl' },
  xl:  { brand: 'text-4xl', js: 'text-[1.5rem]',  icon: 'w-12 h-12', gap: 'gap-3',   title: 'text-2xl' },
  '2xl': { brand: 'text-5xl', js: 'text-[1.8rem]', icon: 'w-14 h-14', gap: 'gap-3', title: 'text-3xl' },
  '3xl': { brand: 'text-6xl', js: 'text-[2.2rem]', icon: 'w-16 h-16', gap: 'gap-4', title: 'text-4xl' },
} as const

const s = computed(() => sizeMap[props.size])

const appIconSrc = computed(() => {
  switch (props.variant) {
    case 'throttle':
      return new URL('./assets/icons/throttle.png', import.meta.url).href
    case 'monitor':
      return new URL('./assets/icons/monitor.png', import.meta.url).href
    case 'cloud':
      return new URL('./assets/icons/cloud.png', import.meta.url).href
    case 'tour':
      return new URL('./assets/icons/tour.png', import.meta.url).href
    default:
      return new URL('./assets/icons/deja.png', import.meta.url).href
  }
})

</script>

<template>
  <div class="deja-logo flex items-center" :class="s.gap">
    <!-- Icon: slot override or default img -->
    <template v-if="showIcon">
      <slot name="icon">
        <img
          :src="appIconSrc"
          :alt="`DEJA.js${appTitle ? ' ' + appTitle : ''}`"
          :class="[s.icon, 'drop-shadow-sm rounded-lg flex-shrink-0']"
        />
      </slot>
    </template>

    <!-- Text container: stacked = flex-col, inline = flex-row -->
    <div
      class="flex"
      :class="stacked && appTitle ? 'flex-col' : `items-center ${s.gap}`"
    >
      <!-- Brand text -->
      <span class="font-bold tracking-[0.08em] leading-none whitespace-nowrap" :class="s.brand">
        <span class="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">DEJA</span><span class="text-lime-400">.</span><span class="text-fuchsia-500 font-mono" :class="s.js">js</span>
      </span>

      <!-- Optional app title suffix -->
      <span
        v-if="appTitle"
        class="font-semibold leading-none whitespace-nowrap"
        style="color: rgba(var(--v-theme-on-surface), 0.9)"
        :class="s.title"
      >
        {{ appTitle }}
      </span>
    </div>
  </div>
</template>
