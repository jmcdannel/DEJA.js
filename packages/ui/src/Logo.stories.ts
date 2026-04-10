import type { Meta, StoryObj } from '@storybook/vue3'
import Logo from './Logo.vue'
import { appColors, appLogos, appIcons } from './assets/icons'

const meta: Meta<typeof Logo> = {
  title: 'Chrome/Logo',
  component: Logo,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
    },
    variant: {
      control: 'select',
      options: ['default', 'io', 'throttle', 'cloud', 'monitor', 'tour', 'server'],
    },
    markStyle: {
      control: 'radio',
      options: ['icon', 'logo'],
      description:
        '`icon` = MDI glyph on brand color square. `logo` = full combined DEJA.js track/D + MDI mark.',
    },
    showMark: { control: 'boolean' },
    showText: { control: 'boolean' },
    stacked: { control: 'boolean' },
    appTitle: { control: 'text' },
  },
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0b0d10' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
}

export default meta
type Story = StoryObj<typeof Logo>

const APPS = ['io', 'throttle', 'cloud', 'monitor', 'tour', 'server'] as const

/** IO is always all-caps. Other app names are Title Case. */
const appTitleOf = (a: string) => (a === 'io' ? 'IO' : a.charAt(0).toUpperCase() + a.slice(1))

// ═══════════════════════════════════════════════════════════════════
//   Basic stories
// ═══════════════════════════════════════════════════════════════════

export const Default: Story = {
  args: {
    size: 'md',
    variant: 'default',
    showMark: true,
    showText: true,
    markStyle: 'icon',
  },
}

export const WithAppTitle: Story = {
  args: {
    size: 'lg',
    variant: 'throttle',
    showMark: true,
    showText: true,
    appTitle: 'Throttle',
    markStyle: 'icon',
  },
}

export const CombinedLogoMark: Story = {
  name: 'Combined Logo Mark',
  args: {
    size: 'xl',
    variant: 'throttle',
    showMark: true,
    showText: true,
    appTitle: 'Throttle',
    markStyle: 'logo',
  },
}

export const TextOnly: Story = {
  args: { size: 'lg', showMark: false, showText: true },
}

export const MarkOnly: Story = {
  args: { size: 'xl', variant: 'cloud', showMark: true, showText: false, markStyle: 'logo' },
}

export const NoIcon: Story = {
  args: {
    size: 'lg',
    showIcon: false,
    variant: 'default',
  },
}

// ═══════════════════════════════════════════════════════════════════
//   Stacked layout (mobile-friendly)
// ═══════════════════════════════════════════════════════════════════

export const Stacked: Story = {
  args: {
    size: 'sm',
    variant: 'throttle',
    appTitle: 'Throttle',
    stacked: true,
  },
}

export const StackedVsInline: Story = {
  name: 'Stacked vs Inline',
  render: () => ({
    components: { Logo },
    setup() {
      return { APPS, appTitleOf }
    },
    template: `
      <div class="flex flex-col gap-8 p-6">
        <div>
          <p class="text-sm text-white/60 mb-2 font-mono">Inline (desktop)</p>
          <Logo size="md" variant="throttle" app-title="Throttle" />
        </div>
        <div>
          <p class="text-sm text-white/60 mb-2 font-mono">Stacked (mobile)</p>
          <Logo size="sm" variant="throttle" app-title="Throttle" :stacked="true" />
        </div>
        <div>
          <p class="text-sm text-white/60 mb-2 font-mono">Stacked — all variants</p>
          <div class="flex flex-col gap-4">
            <Logo v-for="a in APPS" :key="a" size="sm" :variant="a" :app-title="appTitleOf(a)" :stacked="true" />
          </div>
        </div>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Styleguide: all sizes
// ═══════════════════════════════════════════════════════════════════

export const AllSizes: Story = {
  name: 'Styleguide / All Sizes',
  render: () => ({
    components: { Logo },
    template: `
      <div class="flex flex-col gap-6 p-6">
        <div class="grid grid-cols-[4rem_1fr] items-center gap-4">
          <span class="text-xs font-mono text-white/60">xs</span>  <Logo size="xs"  variant="default" app-title="Dashboard" />
          <span class="text-xs font-mono text-white/60">sm</span>  <Logo size="sm"  variant="default" app-title="Dashboard" />
          <span class="text-xs font-mono text-white/60">md</span>  <Logo size="md"  variant="default" app-title="Dashboard" />
          <span class="text-xs font-mono text-white/60">lg</span>  <Logo size="lg"  variant="default" app-title="Dashboard" />
          <span class="text-xs font-mono text-white/60">xl</span>  <Logo size="xl"  variant="default" app-title="Dashboard" />
          <span class="text-xs font-mono text-white/60">2xl</span> <Logo size="2xl" variant="default" app-title="Dashboard" />
          <span class="text-xs font-mono text-white/60">3xl</span> <Logo size="3xl" variant="default" app-title="Dashboard" />
        </div>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Styleguide: all app variants (icon mark)
// ═══════════════════════════════════════════════════════════════════

export const AllAppsIconMark: Story = {
  name: 'Styleguide / All Apps (Icon Mark)',
  render: () => ({
    components: { Logo },
    setup() {
      return { APPS, appTitleOf }
    },
    template: `
      <div class="flex flex-col gap-5 p-6">
        <Logo size="lg" variant="default" app-title="DEJA.js" mark-style="icon" />
        <Logo v-for="a in APPS" :key="a" size="lg" :variant="a" :app-title="appTitleOf(a)" mark-style="icon" />
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Styleguide: all app variants (combined logo mark)
// ═══════════════════════════════════════════════════════════════════

export const AllAppsCombinedMark: Story = {
  name: 'Styleguide / All Apps (Combined Mark)',
  render: () => ({
    components: { Logo },
    setup() {
      return { APPS, appTitleOf }
    },
    template: `
      <div class="flex flex-col gap-6 p-6">
        <Logo v-for="a in APPS" :key="a" size="xl" :variant="a" :app-title="appTitleOf(a)" mark-style="logo" />
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Styleguide: icon vs logo comparison
// ═══════════════════════════════════════════════════════════════════

export const IconVsLogo: Story = {
  name: 'Styleguide / Icon vs Logo',
  render: () => ({
    components: { Logo },
    setup() {
      return { APPS, appTitleOf }
    },
    template: `
      <div class="p-6">
        <div class="grid gap-8 items-center" style="grid-template-columns: auto 1fr 1fr;">
          <span></span>
          <span class="text-xs font-mono uppercase tracking-wider text-white/60">Combined Logo (markStyle: logo)</span>
          <span class="text-xs font-mono uppercase tracking-wider text-white/60">Icon Only (markStyle: icon)</span>
          <template v-for="a in APPS" :key="a">
            <span class="text-sm font-mono text-white/80 self-center">{{ appTitleOf(a) }}</span>
            <Logo size="lg" :variant="a" mark-style="logo" :app-title="appTitleOf(a)" />
            <Logo size="lg" :variant="a" mark-style="icon" :app-title="appTitleOf(a)" />
          </template>
        </div>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Styleguide: brand color palette + raw asset preview
// ═══════════════════════════════════════════════════════════════════

export const BrandColors: Story = {
  name: 'Styleguide / Brand Colors',
  render: () => ({
    setup() {
      return { APPS, appColors, appLogos, appIcons, appTitleOf }
    },
    template: `
      <div class="p-6">
        <h3 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-4">Brand Palette</h3>
        <div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
          <div v-for="a in APPS" :key="a" class="rounded-lg overflow-hidden border border-white/10 bg-black/40">
            <div class="h-20 flex items-end justify-between p-3" :style="{ background: appColors[a] }">
              <span class="text-white font-bold text-lg drop-shadow">{{ appTitleOf(a) }}</span>
              <span class="text-white/90 font-mono text-xs drop-shadow">{{ appColors[a] }}</span>
            </div>
            <div class="p-4 flex items-center gap-4 bg-black">
              <img :src="appIcons[a]" :alt="appTitleOf(a) + ' icon'" class="w-12 h-12 rounded-md" />
              <img :src="appLogos[a]" :alt="appTitleOf(a) + ' logo'" class="w-16 h-16" />
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Styleguide: PWA / Favicon asset preview (black background per brand)
// ═══════════════════════════════════════════════════════════════════

export const PwaAssets: Story = {
  name: 'Styleguide / PWA & Favicon Assets',
  render: () => ({
    setup() {
      return { APPS, appColors, appLogos, appTitleOf }
    },
    template: `
      <div class="p-6 text-white/90">
        <h3 class="text-sm font-mono uppercase tracking-wider mb-2">PWA + Favicon Output</h3>
        <p class="text-xs text-white/60 mb-6 max-w-xl">
          Generated by <code class="text-white/80">scripts/generate-icons.mjs</code> — each Vue app gets
          <code>favicon.svg</code>, <code>favicon.ico</code>, <code>icon-192/512.png</code>,
          <code>icon-192/512-maskable.png</code>, and <code>apple-touch-icon.png</code> on a
          <b>solid black</b> background.
        </p>

        <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
          <div v-for="a in APPS" :key="a" class="rounded-lg border border-white/10 overflow-hidden">
            <div class="px-4 py-2 flex items-center justify-between" :style="{ background: appColors[a] }">
              <span class="font-bold text-white">{{ appTitleOf(a) }}</span>
              <span class="text-white/90 font-mono text-xs">{{ appColors[a] }}</span>
            </div>
            <div class="bg-black p-4 grid gap-3" style="grid-template-columns: repeat(3, 1fr);">
              <figure class="flex flex-col items-center gap-1">
                <div class="w-16 h-16 bg-black border border-white/10 rounded flex items-center justify-center">
                  <img :src="appLogos[a]" class="w-14 h-14" />
                </div>
                <figcaption class="text-[10px] font-mono text-white/50">512</figcaption>
              </figure>
              <figure class="flex flex-col items-center gap-1">
                <div class="w-16 h-16 bg-black border border-white/10 rounded flex items-center justify-center">
                  <img :src="appLogos[a]" class="w-10 h-10" />
                </div>
                <figcaption class="text-[10px] font-mono text-white/50">192</figcaption>
              </figure>
              <figure class="flex flex-col items-center gap-1">
                <div class="w-16 h-16 bg-black border border-white/10 rounded flex items-center justify-center">
                  <img :src="appLogos[a]" class="w-6 h-6" />
                </div>
                <figcaption class="text-[10px] font-mono text-white/50">48</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Styleguide: raw combined logo SVGs
// ═══════════════════════════════════════════════════════════════════

export const CombinedLogoAssets: Story = {
  name: 'Styleguide / Combined Logo Assets',
  render: () => ({
    setup() {
      return { APPS, appLogos, appColors, appTitleOf }
    },
    template: `
      <div class="p-6">
        <h3 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-4">
          assets/deja-{app}-logo.svg
        </h3>
        <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
          <figure v-for="a in APPS" :key="a" class="flex flex-col items-center gap-3 p-4 rounded-lg bg-black/60 border border-white/10">
            <img :src="appLogos[a]" :alt="appTitleOf(a) + ' combined logo'" class="w-32 h-32" />
            <figcaption class="text-center">
              <div class="text-white font-semibold">{{ appTitleOf(a) }}</div>
              <div class="text-xs font-mono text-white/50">{{ appColors[a] }}</div>
            </figcaption>
          </figure>
        </div>
      </div>
    `,
  }),
}
