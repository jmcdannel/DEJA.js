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

/**
 * How the wordmark + app title are arranged.
 *  - 'inline': DEJA.js wordmark and app title sit on a single row
 *  - 'stacked': wordmark above app title, both same scale
 *  - 'product': small DEJA.JS kicker above an oversized brand-coloured app title
 *               (the product page hero treatment)
 */
export type LogoLayout = 'inline' | 'stacked' | 'product'

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
  /** Wordmark + app title arrangement. Defaults to 'inline'. */
  layout?: LogoLayout
  /** @deprecated use `layout="stacked"` instead. */
  stacked?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'default',
  showMark: true,
  showText: true,
  markStyle: 'icon',
  layout: 'inline',
  stacked: false,
})

/** Resolved layout — `stacked` boolean wins for backwards compat. */
const layoutMode = computed<LogoLayout>(() => (props.stacked ? 'stacked' : props.layout))

const sizeMap = {
  xs:    { brand: 'text-sm',  js: 'text-[0.55rem]', icon: 'w-4 h-4',   logo: 'w-5 h-5',   stackedLogo: 'w-8 h-8',   productLogo: 'w-8 h-8',   gap: 'gap-1',   title: 'text-sm' },
  sm:    { brand: 'text-lg',  js: 'text-[0.7rem]',  icon: 'w-6 h-6',   logo: 'w-7 h-7',   stackedLogo: 'w-10 h-10', productLogo: 'w-10 h-10', gap: 'gap-1.5', title: 'text-lg' },
  md:    { brand: 'text-2xl', js: 'text-[1rem]',    icon: 'w-8 h-8',   logo: 'w-8 h-8',   stackedLogo: 'w-14 h-14', productLogo: 'w-12 h-12', gap: 'gap-2',   title: 'text-2xl' },
  lg:    { brand: 'text-3xl', js: 'text-[1.2rem]',  icon: 'w-10 h-10', logo: 'w-9 h-9',   stackedLogo: 'w-16 h-16', productLogo: 'w-16 h-16', gap: 'gap-2',   title: 'text-3xl' },
  xl:    { brand: 'text-4xl', js: 'text-[1.5rem]',  icon: 'w-12 h-12', logo: 'w-10 h-10', stackedLogo: 'w-20 h-20', productLogo: 'w-20 h-20', gap: 'gap-3',   title: 'text-4xl' },
  '2xl': { brand: 'text-5xl', js: 'text-[1.8rem]',  icon: 'w-14 h-14', logo: 'w-12 h-12', stackedLogo: 'w-24 h-24', productLogo: 'w-24 h-24', gap: 'gap-3',   title: 'text-5xl' },
  '3xl': { brand: 'text-6xl', js: 'text-[2.2rem]',  icon: 'w-16 h-16', logo: 'w-16 h-16', stackedLogo: 'w-28 h-28', productLogo: 'w-32 h-32', gap: 'gap-4',   title: 'text-6xl' },
} as const

const s = computed(() => sizeMap[props.size])

const markVisible = computed(() => props.showMark !== false)

const markClass = computed(() => {
  if (props.markStyle === 'logo') {
    if (layoutMode.value === 'product') return s.value.productLogo
    if (layoutMode.value === 'stacked') return s.value.stackedLogo
    return s.value.logo
  }
  return s.value.icon
})

/** The app key used to look up assets — 'default' falls back to 'deja'. */
const appKey = computed<AppIconName>(
  () => (props.variant === 'default' ? 'deja' : props.variant) as AppIconName,
)

const markSrc = computed(() => {
  if (props.markStyle === 'logo') {
    // 'default' uses the bare DEJA "D" logo with no app glyph.
    return appLogos[props.variant === 'default' ? 'deja' : props.variant]
  }
  return appIcons[appKey.value]
})

const brandColor = computed(() =>
  props.variant === 'default' ? undefined : appColors[props.variant],
)

const textContainerClass = computed(() =>
  layoutMode.value !== 'inline' && props.appTitle
    ? 'flex-col items-start gap-1'
    : `items-end ${s.value.gap}`,
)

/** Class for the small DEJA.JS kicker shown above the big app title in product layout. */
const kickerClass = computed(() => {
  switch (props.size) {
    case 'xs':
    case 'sm':
      return 'text-[0.55rem]'
    case 'md':
      return 'text-[0.65rem]'
    case 'lg':
      return 'text-xs'
    case 'xl':
      return 'text-sm'
    case '2xl':
      return 'text-base'
    case '3xl':
    default:
      return 'text-lg'
  }
})

/** Class for the oversized app title in product layout. */
const productTitleClass = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'text-2xl'
    case 'sm':
      return 'text-3xl'
    case 'md':
      return 'text-4xl'
    case 'lg':
      return 'text-5xl'
    case 'xl':
      return 'text-6xl'
    case '2xl':
      return 'text-7xl'
    case '3xl':
    default:
      return 'text-8xl'
  }
})
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

    <!-- Text container: layout determines arrangement (inline | stacked | product) -->
    <div v-if="showText" class="flex" :class="textContainerClass">
      <!-- Product layout: small DEJA.JS kicker over big app title -->
      <template v-if="layoutMode === 'product' && appTitle">
        <span
          class="font-bold tracking-[0.08em] leading-none whitespace-nowrap font-mono uppercase"
          :class="kickerClass"
        >
          <span class="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">DEJA</span><span class="text-lime-400">.</span><span class="text-fuchsia-500">JS</span>
        </span>
        <span
          class="font-bold leading-none whitespace-nowrap"
          :style="brandColor ? `color: ${brandColor}` : 'color: rgba(var(--v-theme-on-surface), 0.95)'"
          :class="productTitleClass"
        >
          {{ appTitle }}
        </span>
      </template>

      <!-- Inline / stacked layouts: gradient DEJA.js wordmark + optional app title -->
      <template v-else>
        <span
          class="font-bold tracking-[0.08em] leading-none whitespace-nowrap"
          :class="s.brand"
        >
          <span class="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">DEJA</span><span class="text-lime-400">.</span><span class="text-fuchsia-500 font-mono" :class="s.js">js</span>
        </span>

        <span
          v-if="appTitle"
          class="font-semibold leading-none whitespace-nowrap"
          :style="brandColor ? `color: ${brandColor}` : 'color: rgba(var(--v-theme-on-surface), 0.9)'"
          :class="s.title"
        >
          {{ appTitle }}
        </span>
      </template>
    </div>
  </div>
</template>
