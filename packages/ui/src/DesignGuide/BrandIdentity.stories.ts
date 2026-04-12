import type { Meta, StoryObj } from '@storybook/vue3'
import Logo from '../Logo.vue'
import { appColors, appLogos, appIcons } from '../assets/icons'

const meta: Meta = {
  title: 'Design Guide/Brand Identity',
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
type Story = StoryObj

const APPS = ['io', 'throttle', 'cloud', 'monitor', 'tour', 'server'] as const
const appTitleOf = (a: string) => (a === 'io' ? 'IO' : a.charAt(0).toUpperCase() + a.slice(1))

// ═══════════════════════════════════════════════════════════════════
//   Wordmark
// ═══════════════════════════════════════════════════════════════════

export const Wordmark: Story = {
  name: '🔤 Wordmark',
  render: () => ({
    components: { Logo },
    setup() {
      const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const
      return { SIZES }
    },
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Primary Wordmark</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            The DEJA.js wordmark uses a gradient treatment — blue-to-cyan for "DEJA",
            lime green for the dot, and fuchsia for "js". This combination ensures brand
            recognition across all apps.
          </p>
          <div class="grid gap-4 p-6 rounded-lg bg-white/5 border border-white/10" style="grid-template-columns: 4rem 1fr;">
            <template v-for="s in SIZES" :key="s">
              <span class="text-[10px] font-mono text-white/50 self-center">{{ s }}</span>
              <Logo :size="s" variant="default" :show-mark="false" />
            </template>
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Wordmark Anatomy</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Three distinct typographic elements compose the wordmark.
          </p>
          <div class="flex items-end gap-4 p-6 rounded-lg bg-white/5 border border-white/10">
            <div class="flex flex-col items-center gap-2">
              <span class="text-5xl font-bold tracking-[0.08em] bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">DEJA</span>
              <span class="text-[10px] font-mono text-white/50">Blue → Cyan gradient</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <span class="text-5xl font-bold text-lime-400">.</span>
              <span class="text-[10px] font-mono text-white/50">Lime #84cc16</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <span class="text-4xl font-mono text-fuchsia-500">js</span>
              <span class="text-[10px] font-mono text-white/50">Fuchsia #d946ef</span>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Logo Marks — Icon vs Combined
// ═══════════════════════════════════════════════════════════════════

export const LogoMarks: Story = {
  name: '🎯 Logo Marks',
  render: () => ({
    components: { Logo },
    setup() {
      const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const
      return { APPS, SIZES, appTitleOf }
    },
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Icon Marks — All Apps</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Compact icon marks use an MDI glyph on a brand-colored square. Ideal for favicons,
            app switchers, and small contexts.
          </p>
          <div class="flex gap-6 p-6 rounded-lg bg-white/5 border border-white/10 flex-wrap">
            <div v-for="a in APPS" :key="a" class="flex flex-col items-center gap-2">
              <Logo size="lg" :variant="a" mark-style="icon" :show-text="false" />
              <span class="text-[10px] font-mono text-white/50">{{ appTitleOf(a) }}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Icon Marks — All Sizes</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Icon marks scale from 16px (xs) through 64px (3xl). Rounded corners are preserved at every size.
          </p>
          <div class="p-6 rounded-lg bg-white/5 border border-white/10 overflow-x-auto">
            <table class="w-full text-xs">
              <thead>
                <tr class="text-white/50">
                  <th class="text-left font-mono pb-3 pr-4">size</th>
                  <th v-for="a in APPS" :key="a" class="font-mono capitalize pb-3 px-3 text-left">{{ appTitleOf(a) }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in SIZES" :key="s" class="border-t border-white/5">
                  <td class="py-3 pr-4 font-mono text-white/50">{{ s }}</td>
                  <td v-for="a in APPS" :key="a" class="py-3 px-3">
                    <Logo :size="s" :variant="a" mark-style="icon" :show-text="false" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Combined Logo Marks — All Apps</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Full combined marks pair the DEJA.js track "D" with an app-specific MDI glyph.
            Use for headers, splash screens, and marketing material.
          </p>
          <div class="flex gap-8 p-6 rounded-lg bg-white/5 border border-white/10 flex-wrap">
            <div v-for="a in APPS" :key="a" class="flex flex-col items-center gap-2">
              <Logo size="xl" :variant="a" mark-style="logo" :show-text="false" />
              <span class="text-[10px] font-mono text-white/50">{{ appTitleOf(a) }}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Combined Marks — All Sizes</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Combined marks scale from 32px (xs) to 128px (3xl). Use the largest practical size
            on splash screens and hero treatments.
          </p>
          <div class="p-6 rounded-lg bg-white/5 border border-white/10 overflow-x-auto">
            <table class="w-full text-xs">
              <thead>
                <tr class="text-white/50">
                  <th class="text-left font-mono pb-3 pr-4">size</th>
                  <th v-for="a in APPS" :key="a" class="font-mono capitalize pb-3 px-3 text-left">{{ appTitleOf(a) }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in SIZES" :key="s" class="border-t border-white/5">
                  <td class="py-3 pr-4 font-mono text-white/50 align-middle">{{ s }}</td>
                  <td v-for="a in APPS" :key="a" class="py-3 px-3 align-middle">
                    <Logo :size="s" :variant="a" mark-style="logo" :show-text="false" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Size Matrix — all sizes × all layouts
// ═══════════════════════════════════════════════════════════════════

export const SizeMatrix: Story = {
  name: '📐 Size Matrix',
  render: () => ({
    components: { Logo },
    setup() {
      const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const
      return { SIZES }
    },
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Inline Layout — All Sizes</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            The default layout for headers and navigation — mark + wordmark + app title on one row.
          </p>
          <div class="grid gap-4 p-6 rounded-lg bg-white/5 border border-white/10" style="grid-template-columns: 4rem 1fr;">
            <template v-for="s in SIZES" :key="s">
              <span class="text-[10px] font-mono text-white/50 self-center">{{ s }}</span>
              <Logo :size="s" variant="throttle" app-title="Throttle" mark-style="icon" />
            </template>
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Stacked Layout — All Sizes</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Wordmark stacked above the app title — for mobile headers and narrow contexts.
          </p>
          <div class="grid gap-6 p-6 rounded-lg bg-white/5 border border-white/10" style="grid-template-columns: 4rem 1fr;">
            <template v-for="s in SIZES" :key="s">
              <span class="text-[10px] font-mono text-white/50 self-center">{{ s }}</span>
              <Logo :size="s" variant="cloud" app-title="Cloud" layout="stacked" />
            </template>
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Product Hero Layout — All Sizes</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Small "DEJA.JS" kicker over a huge brand-colored app title. Reserved for landing pages
            and splash screens where the product is the centerpiece.
          </p>
          <div class="grid gap-8 p-6 rounded-lg bg-white/5 border border-white/10" style="grid-template-columns: 4rem 1fr;">
            <template v-for="s in SIZES" :key="s">
              <span class="text-[10px] font-mono text-white/50 self-center">{{ s }}</span>
              <Logo :size="s" variant="monitor" app-title="Monitor" mark-style="logo" layout="product" />
            </template>
          </div>
        </section>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   App Lockups — Full Logo + Title
// ═══════════════════════════════════════════════════════════════════

export const AppLockups: Story = {
  name: '🏷️ App Lockups',
  render: () => ({
    components: { Logo },
    setup() {
      return { APPS, appTitleOf }
    },
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Inline Layout</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Default layout for navigation bars and headers. Mark + wordmark + app title on a single row.
          </p>
          <div class="flex flex-col gap-5 p-6 rounded-lg bg-white/5 border border-white/10">
            <Logo v-for="a in APPS" :key="a" size="lg" :variant="a" :app-title="appTitleOf(a)" mark-style="icon" />
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Product Hero Layout</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Small "DEJA.JS" kicker above an oversized, brand-colored app title.
            Used on product landing pages and splash screens.
          </p>
          <div class="flex flex-col gap-8 p-6 rounded-lg bg-white/5 border border-white/10">
            <Logo v-for="a in APPS" :key="a" size="xl" :variant="a" :app-title="appTitleOf(a)" mark-style="logo" layout="product" />
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Stacked Layout</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Wordmark above the app title — compact for mobile headers and narrow contexts.
          </p>
          <div class="flex gap-8 p-6 rounded-lg bg-white/5 border border-white/10 flex-wrap">
            <Logo v-for="a in APPS" :key="a" size="sm" :variant="a" :app-title="appTitleOf(a)" layout="stacked" />
          </div>
        </section>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Brand Colors & Assets
// ═══════════════════════════════════════════════════════════════════

export const BrandColorPalette: Story = {
  name: '🎨 Brand Colors',
  render: () => ({
    setup() {
      return { APPS, appColors, appLogos, appIcons, appTitleOf }
    },
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">App Identity Colors</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Each DEJA.js app has a unique brand color. These colors are used for icon marks,
            product hero titles, accent elements, and theme customization via
            <code class="text-white/70">createVuetifyThemes()</code>.
          </p>
          <div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
            <div v-for="a in APPS" :key="a" class="rounded-lg overflow-hidden border border-white/10">
              <div class="h-24 flex items-end justify-between p-4" :style="{ background: appColors[a] }">
                <span class="text-white font-bold text-xl drop-shadow-md">{{ appTitleOf(a) }}</span>
                <span class="text-white/90 font-mono text-xs drop-shadow">{{ appColors[a] }}</span>
              </div>
              <div class="p-4 flex items-center gap-4 bg-black/80">
                <img :src="appIcons[a]" :alt="appTitleOf(a) + ' icon'" class="w-12 h-12 rounded-md" />
                <img :src="appLogos[a]" :alt="appTitleOf(a) + ' logo'" class="w-16 h-16" />
                <div class="ml-auto flex flex-col items-end gap-1">
                  <span class="text-[10px] font-mono text-white/50">Icon + Logo SVG</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Wordmark Palette</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Core brand colors used in the DEJA.js wordmark gradient.
          </p>
          <div class="flex gap-3 flex-wrap">
            <div v-for="c in [
              { name: 'Blue 500', hex: '#3b82f6', desc: 'Gradient start' },
              { name: 'Cyan 400', hex: '#22d3ee', desc: 'Gradient end' },
              { name: 'Lime 400', hex: '#a3e635', desc: 'Dot separator' },
              { name: 'Fuchsia 500', hex: '#d946ef', desc: 'JS suffix' },
            ]" :key="c.hex" class="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 px-4 py-3">
              <div class="w-10 h-10 rounded-md shadow-inner" :style="{ background: c.hex }"></div>
              <div>
                <div class="text-white text-sm font-semibold">{{ c.name }}</div>
                <div class="text-white/50 text-xs font-mono">{{ c.hex }}</div>
                <div class="text-white/40 text-[10px]">{{ c.desc }}</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
}
