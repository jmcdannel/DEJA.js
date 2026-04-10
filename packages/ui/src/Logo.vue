<script setup lang="ts">
import { computed } from 'vue'
import { appIcons, appLogos, appColors, type AppIconName } from './assets/icons'

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
export type LogoVariant =
  | 'default'
  | 'io'
  | 'throttle'
  | 'cloud'
  | 'monitor'
  | 'tour'
  | 'server'

/**
 * How the visual mark is rendered.
 *  - 'icon': MDI glyph on a brand-color square (small, favicon-style PNG)
 *  - 'logo': full combined DEJA.js track/D + MDI glyph (transparent SVG)
 */
export type LogoMarkStyle = 'icon' | 'logo'

interface Props {
  /** Controls the visual scale of mark + text. */
  size?: LogoSize
  /** Which app this logo represents. 'default' is the DEJA.js brand. */
  variant?: LogoVariant
  /** Whether to render the visual mark (icon/logo). */
  showMark?: boolean
  /** Whether to render the "DEJA.js" wordmark text. */
  showText?: boolean
  /** Optional suffix text shown after the wordmark (e.g. "Throttle"). */
  appTitle?: string
  /** Which style of visual mark to use. Defaults to 'icon' (backwards compat). */
  markStyle?: LogoMarkStyle
  /** Stack wordmark + app title vertically instead of inline. Useful for tight mobile headers. */
  stacked?: boolean
  /** @deprecated use `showMark` instead. Kept for backwards compatibility. */
  showIcon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'default',
  showMark: true,
  showText: true,
  markStyle: 'icon',
  stacked: false,
})

const sizeMap = {
  xs:    { brand: 'text-sm',  js: 'text-[0.55rem]', icon: 'w-4 h-4',   logo: 'w-8 h-8',   gap: 'gap-1',   title: 'text-xs' },
  sm:    { brand: 'text-lg',  js: 'text-[0.7rem]',  icon: 'w-6 h-6',   logo: 'w-12 h-12', gap: 'gap-1.5', title: 'text-sm' },
  md:    { brand: 'text-2xl', js: 'text-[1rem]',    icon: 'w-8 h-8',   logo: 'w-16 h-16', gap: 'gap-2',   title: 'text-lg' },
  lg:    { brand: 'text-3xl', js: 'text-[1.2rem]',  icon: 'w-10 h-10', logo: 'w-20 h-20', gap: 'gap-2',   title: 'text-xl' },
  xl:    { brand: 'text-4xl', js: 'text-[1.5rem]',  icon: 'w-12 h-12', logo: 'w-24 h-24', gap: 'gap-3',   title: 'text-2xl' },
  '2xl': { brand: 'text-5xl', js: 'text-[1.8rem]',  icon: 'w-14 h-14', logo: 'w-28 h-28', gap: 'gap-3',   title: 'text-3xl' },
  '3xl': { brand: 'text-6xl', js: 'text-[2.2rem]',  icon: 'w-16 h-16', logo: 'w-32 h-32', gap: 'gap-4',   title: 'text-4xl' },
} as const

const s = computed(() => sizeMap[props.size])

/** Backwards compat: if `showIcon` was passed explicitly, honor it. Otherwise use `showMark`. */
const markVisible = computed(() =>
  props.showIcon !== undefined ? props.showIcon : props.showMark !== false,
)

const markClass = computed(() => (props.markStyle === 'logo' ? s.value.logo : s.value.icon))

/** The app key used to look up assets — 'default' falls back to 'deja'. */
const appKey = computed<AppIconName>(
  () => (props.variant === 'default' ? 'deja' : props.variant) as AppIconName,
)

const markSrc = computed(() => {
  if (props.markStyle === 'logo') {
    // The combined DEJA logo only exists for real apps, not 'default'.
    return appLogos[props.variant === 'default' ? 'io' : props.variant]
  }
  return appIcons[appKey.value]
})

const brandColor = computed(() =>
  props.variant === 'default' ? undefined : appColors[props.variant],
)

const textContainerClass = computed(() =>
  props.stacked && props.appTitle ? 'flex-col items-start' : `items-end ${s.value.gap}`,
)
</script>

<template>
  <div class="deja-logo flex items-center" :class="s.gap">
    <!-- Mark (icon PNG or combined logo SVG) -->
    <img
      v-if="markVisible"
      :src="markSrc"
      :alt="`DEJA.js${appTitle ? ' ' + appTitle : ''}`"
      :class="[
        markClass,
        'flex-shrink-0 object-contain',
        markStyle === 'icon' ? 'drop-shadow-sm rounded-lg' : 'drop-shadow',
      ]"
    />

    <!-- Text container: stacked = flex-col, inline = flex-row -->
    <div v-if="showText" class="flex" :class="textContainerClass">
      <!-- Brand wordmark -->
      <span
        class="font-bold tracking-[0.08em] leading-none whitespace-nowrap"
        :class="s.brand"
      >
        <span class="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">DEJA</span><span class="text-lime-400">.</span><span class="text-fuchsia-500 font-mono" :class="s.js">js</span>
      </span>

      <!-- Optional app title suffix -->
      <span
        v-if="appTitle"
        class="font-semibold leading-none whitespace-nowrap"
        :style="brandColor ? `color: ${brandColor}` : 'color: rgba(var(--v-theme-on-surface), 0.9)'"
        :class="s.title"
      >
        {{ appTitle }}
      </span>
    </div>
  </div>
</template>
