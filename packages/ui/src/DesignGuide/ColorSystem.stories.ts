import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta = {
  title: 'Design Guide/Color System',
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

// ═══════════════════════════════════════════════════════════════════
//   Theme Modes
// ═══════════════════════════════════════════════════════════════════

export const ThemeModes: Story = {
  name: '🌓 Theme Modes',
  render: () => ({
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Three Theme Modes</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            DEJA.js supports dark, light, and high-contrast modes. All apps inherit from
            a shared theme factory (<code class="text-white/70">createVuetifyThemes()</code>)
            that auto-adjusts identity colors for WCAG AA contrast.
          </p>
          <div class="grid gap-4" style="grid-template-columns: repeat(3, 1fr);">
            <div v-for="mode in [
              { name: 'Dark', bg: '#0B1120', surface: '#111827', surfaceBright: '#1F2937', text: '#E2E8F0', desc: 'Default mode — optimized for low-light environments' },
              { name: 'Light', bg: '#F0F4F8', surface: '#FFFFFF', surfaceBright: '#FFFFFF', text: '#334155', desc: 'Full daylight mode with WCAG-darkened brand colors' },
              { name: 'High Contrast', bg: '#000000', surface: '#000000', surfaceBright: '#1A1A1A', text: '#FFFFFF', desc: 'Maximum readability — pure black BG, white text, full opacity' },
            ]" :key="mode.name" class="rounded-lg border border-white/10 overflow-hidden">
              <div class="px-4 py-2 bg-white/5">
                <span class="text-white font-semibold text-sm">{{ mode.name }}</span>
              </div>
              <div class="p-4 flex flex-col gap-2" :style="{ background: mode.bg }">
                <div class="rounded-md p-3" :style="{ background: mode.surface }">
                  <span class="text-xs font-mono" :style="{ color: mode.text }">Surface card</span>
                </div>
                <div class="rounded-md p-3" :style="{ background: mode.surfaceBright }">
                  <span class="text-xs font-mono" :style="{ color: mode.text }">Surface bright</span>
                </div>
                <p class="text-[10px] mt-2" :style="{ color: mode.text, opacity: 0.7 }">{{ mode.desc }}</p>
              </div>
              <div class="px-4 py-2 bg-white/5 flex gap-2">
                <div class="w-5 h-5 rounded" :style="{ background: mode.bg }" :title="'Background: ' + mode.bg"></div>
                <div class="w-5 h-5 rounded" :style="{ background: mode.surface }" :title="'Surface: ' + mode.surface"></div>
                <div class="w-5 h-5 rounded" :style="{ background: mode.surfaceBright }" :title="'Surface Bright: ' + mode.surfaceBright"></div>
                <span class="text-[10px] font-mono text-white/40 ml-auto self-center">{{ mode.bg }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Semantic Colors
// ═══════════════════════════════════════════════════════════════════

export const SemanticColors: Story = {
  name: '🚦 Semantic Colors',
  render: () => ({
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Semantic Colors by Mode</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Semantic colors are tuned per theme mode. Dark mode uses vivid neons;
            light mode uses darker shades for white-background readability;
            high-contrast uses maximally saturated pure colors.
          </p>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-white/10">
                  <th class="text-left text-white/60 font-mono text-xs py-2 px-3">Role</th>
                  <th class="text-left text-white/60 font-mono text-xs py-2 px-3">Dark</th>
                  <th class="text-left text-white/60 font-mono text-xs py-2 px-3">Light</th>
                  <th class="text-left text-white/60 font-mono text-xs py-2 px-3">High Contrast</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in [
                  { role: 'Error', dark: '#FF1744', light: '#C62828', hc: '#FF0000' },
                  { role: 'Info', dark: '#2979FF', light: '#1565C0', hc: '#00BFFF' },
                  { role: 'Success', dark: '#00E676', light: '#2E7D32', hc: '#00FF00' },
                  { role: 'Warning', dark: '#FF9100', light: '#BF360C', hc: '#FFD600' },
                ]" :key="row.role" class="border-b border-white/5">
                  <td class="py-2 px-3 text-white/80 font-medium">{{ row.role }}</td>
                  <td v-for="c in [row.dark, row.light, row.hc]" :key="c" class="py-2 px-3">
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded" :style="{ background: c }"></div>
                      <span class="font-mono text-xs text-white/60">{{ c }}</span>
                    </div>
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
//   Surface & Opacity System
// ═══════════════════════════════════════════════════════════════════

export const SurfacesAndOpacity: Story = {
  name: '📐 Surfaces & Opacity',
  render: () => ({
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Dark Mode Surfaces</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Layered surfaces create depth. Background is the deepest layer;
            surface-bright is the highest elevation.
          </p>
          <div class="flex gap-3 flex-wrap">
            <div v-for="s in [
              { name: 'Background', hex: '#0B1120' },
              { name: 'Surface', hex: '#111827' },
              { name: 'Surface Bright', hex: '#1F2937' },
              { name: 'Surface Light', hex: '#374151' },
              { name: 'Surface Variant', hex: '#374151' },
            ]" :key="s.name" class="flex flex-col items-center gap-2">
              <div class="w-20 h-20 rounded-lg border border-white/10" :style="{ background: s.hex }"></div>
              <span class="text-[10px] font-mono text-white/60">{{ s.name }}</span>
              <span class="text-[10px] font-mono text-white/40">{{ s.hex }}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-4">Emphasis & Opacity Scale</h2>
          <div class="flex gap-3 flex-wrap">
            <div v-for="o in [
              { name: 'High Emphasis', value: 0.87 },
              { name: 'Medium Emphasis', value: 0.60 },
              { name: 'Disabled', value: 0.38 },
              { name: 'Hover', value: 0.04 },
              { name: 'Focus', value: 0.12 },
              { name: 'Selected', value: 0.08 },
              { name: 'Pressed', value: 0.12 },
            ]" :key="o.name" class="flex flex-col items-center gap-2 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
              <div class="w-16 h-10 rounded bg-white flex items-center justify-center" :style="{ opacity: o.value }">
                <span class="text-black text-xs font-bold">Aa</span>
              </div>
              <span class="text-[10px] font-mono text-white/60">{{ o.name }}</span>
              <span class="text-[10px] font-mono text-white/40">{{ o.value }}</span>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
}
