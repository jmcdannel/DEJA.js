import type { Meta, StoryObj } from '@storybook/vue3'
import Logo from '../Logo.vue'
import AppSwitcher from '../AppSwitcher.vue'
import ConsistIndicator from '../Consist/ConsistIndicator.vue'
import EmergencyStop from '../EmergencyStop.vue'
import LocoFront from '../LocoFront/LocoFront.vue'
import LocoNumberPlate from '../Roster/LocoNumberPlate.vue'
import Stat from '../Stat.vue'
import ThemeSwitcher from '../ThemeSwitcher.vue'
import { createLoco, createConsistLoco } from '../../.storybook/mocks/data'
import { appColors } from '../assets/icons'

const meta: Meta = {
  title: 'Design Guide/Branded Components',
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
//   EZ Consist System
// ═══════════════════════════════════════════════════════════════════

export const EZConsist: Story = {
  name: '🚂 EZ Consist',
  render: () => ({
    components: { ConsistIndicator },
    setup() {
      const singleLoco = createLoco({
        address: 5801,
        name: 'BNSF 5801',
        consist: [
          createConsistLoco({ address: 1989, direction: true, trim: 0 }),
        ],
      })
      const multiLoco = createLoco({
        address: 5801,
        name: 'BNSF 5801',
        consist: [
          createConsistLoco({ address: 1989, direction: true, trim: 0 }),
          createConsistLoco({ address: 8888, direction: false, trim: -2 }),
          createConsistLoco({ address: 4400, direction: true, trim: 3 }),
        ],
      })
      const emptyLoco = createLoco({
        address: 5801,
        name: 'BNSF 5801',
        consist: [],
      })
      const mixedDigitsLoco = createLoco({
        address: 3,
        name: 'BNSF 3',
        consist: [
          createConsistLoco({ address: 42, direction: true, trim: 0 }),
          createConsistLoco({ address: 512, direction: false, trim: 0 }),
          createConsistLoco({ address: 9999, direction: true, trim: 0 }),
        ],
      })
      return { singleLoco, multiLoco, emptyLoco, mixedDigitsLoco }
    },
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">EZ Consist Badge</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            The EZ Consist system uses a distinctive <strong class="text-purple-400">violet/purple (#7c3aed)</strong>
            accent color across all consist-related UI. Direction is color-coded:
            <span class="text-green-400">green</span> for forward,
            <span class="text-red-400">red</span> for reverse.
          </p>
          <div class="flex flex-col gap-6 p-6 rounded-lg bg-white/5 border border-white/10 max-w-md">
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Multi-unit consist (3 members)</span>
              <ConsistIndicator :loco="multiLoco" />
            </div>
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Single member</span>
              <ConsistIndicator :loco="singleLoco" />
            </div>
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Mixed address widths (1–4 digits)</span>
              <ConsistIndicator :loco="mixedDigitsLoco" />
            </div>
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Empty consist</span>
              <ConsistIndicator :loco="emptyLoco" />
            </div>
          </div>
          <p class="text-white/40 text-[11px] mt-3 max-w-lg">
            🔢 Badges auto-size to fit any DCC address (1–9999). Short addresses stay circular;
            longer ones grow into pills with <code class="text-white/60">tabular-nums</code> for even digit spacing.
          </p>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-4">EZ Consist Color Language</h2>
          <div class="flex gap-4 flex-wrap">
            <div v-for="c in [
              { label: 'EZ Brand', hex: '#7c3aed', desc: 'All consist UI elements' },
              { label: 'Lead Loco', hex: '#7c3aed', desc: 'Lead locomotive badge' },
              { label: 'Forward', hex: '#059669', desc: 'Same direction as lead' },
              { label: 'Reverse', hex: '#dc2626', desc: 'Opposite direction' },
            ]" :key="c.label" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
              <div class="w-8 h-8 rounded-md" :style="{ background: c.hex }"></div>
              <div>
                <div class="text-white text-sm font-semibold">{{ c.label }}</div>
                <div class="text-white/50 text-[10px] font-mono">{{ c.hex }}</div>
                <div class="text-white/40 text-[10px]">{{ c.desc }}</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Locomotive Visuals
// ═══════════════════════════════════════════════════════════════════

export const LocomotiveVisuals: Story = {
  name: '🚃 Locomotive Visuals',
  render: () => ({
    components: { LocoFront, LocoNumberPlate },
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Locomotive Front Views</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            SVG locomotive front-face illustrations render livery colors, number boards,
            nose text, and stripe patterns based on roadname data. Each design is
            authentic to the real railroad's paint scheme.
          </p>
          <div class="flex gap-6 flex-wrap items-end">
            <div v-for="loco in [
              { roadname: 'bnsf', number: '5801' },
              { roadname: 'up', number: '1989' },
              { roadname: 'csx', number: '8888' },
              { roadname: 'ns', number: '9574' },
              { roadname: 'cn', number: '2100' },
              { roadname: 'amtrak', number: '42' },
            ]" :key="loco.roadname" class="flex flex-col items-center gap-2">
              <LocoFront :roadname="loco.roadname" :road-number="loco.number" :size="160" />
              <span class="text-[10px] font-mono text-white/50 uppercase">{{ loco.roadname }}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Number Plates</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Cast-brass styled number plates with metallic gradients, rivets, and roadname-specific
            colors. Available in 6 sizes from xs to 2xl.
          </p>

          <div class="flex flex-col gap-6 p-6 rounded-lg bg-white/5 border border-white/10">
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-3">Roadname Colors</span>
              <div class="flex gap-4 flex-wrap items-end">
                <div v-for="c in ['orange', 'sky', 'yellow', 'red', 'indigo', 'zinc', 'blue', 'green']"
                  :key="c" class="flex flex-col items-center gap-1">
                  <LocoNumberPlate :address="5801" :color="c" size="md" />
                  <span class="text-[10px] font-mono text-white/40">{{ c }}</span>
                </div>
              </div>
            </div>

            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-3">Size Scale</span>
              <div class="flex gap-4 flex-wrap items-end">
                <div v-for="s in ['xs', 'sm', 'md', 'lg', 'xl', '2xl']"
                  :key="s" class="flex flex-col items-center gap-1">
                  <LocoNumberPlate :address="3" :color="'orange'" :size="s" />
                  <span class="text-[10px] font-mono text-white/40">{{ s }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Emergency Stop & Track Power
// ═══════════════════════════════════════════════════════════════════

export const SafetyControls: Story = {
  name: '🛑 Safety Controls',
  render: () => ({
    components: { EmergencyStop },
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Emergency Stop</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            The emergency stop button is always red, always visible, and uses
            <code class="text-white/70">mdi-alert-octagon</code> for instant recognition.
            It appears in app headers and control groups.
          </p>
          <div class="flex flex-col gap-6 p-6 rounded-lg bg-white/5 border border-white/10">
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Default</span>
              <EmergencyStop />
            </div>
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Disabled</span>
              <EmergencyStop disabled />
            </div>
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">In Control Group</span>
              <div class="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                <v-btn icon="mdi-power" size="small" color="success" variant="flat" />
                <v-btn icon="mdi-fence-electric" size="small" variant="flat" />
                <EmergencyStop />
              </div>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Stats & Data Display
// ═══════════════════════════════════════════════════════════════════

export const StatsAndData: Story = {
  name: '📊 Stats & Data',
  render: () => ({
    components: { Stat },
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Stat Badges</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Compact stat badges show counts with auto-pluralization. Used in dashboard
            widgets and overview panels.
          </p>
          <div class="flex gap-4 flex-wrap p-6 rounded-lg bg-white/5 border border-white/10">
            <Stat :value="4" label="train" color="indigo" />
            <Stat :value="12" label="turnout" color="teal" />
            <Stat :value="1" label="device" color="success" />
            <Stat :value="8" label="effect" color="amber" />
            <Stat :value="0" label="signal" empty-label="No signals" />
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-4">App Identity Colors in Context</h2>
          <div class="flex gap-3 flex-wrap">
            <div v-for="(color, app) in appColors" :key="app"
              class="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/10"
              :style="{ background: color + '15', borderColor: color + '40' }">
              <div class="w-3 h-3 rounded-full" :style="{ background: color }"></div>
              <span class="text-white text-sm font-semibold capitalize">{{ app }}</span>
              <span class="text-white/40 font-mono text-[10px]">{{ color }}</span>
            </div>
          </div>
        </section>
      </div>
    `,
    setup() {
      return { appColors }
    },
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Chrome Components
// ═══════════════════════════════════════════════════════════════════

export const ChromeComponents: Story = {
  name: '🪟 Chrome & Navigation',
  render: () => ({
    components: { Logo, AppSwitcher, ThemeSwitcher, EmergencyStop },
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">App Header Pattern</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            The standard app header combines Logo, ThemeSwitcher, and EmergencyStop.
            This pattern is shared across all DEJA.js apps.
          </p>
          <div class="rounded-lg overflow-hidden border border-white/10">
            <v-app-bar color="surface" flat class="px-4 border-b border-white/10">
              <Logo size="sm" variant="throttle" app-title="Throttle" mark-style="icon" />
              <v-spacer />
              <ThemeSwitcher />
              <EmergencyStop class="ml-2" />
            </v-app-bar>
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">App Switcher</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            The <code class="text-white/70">AppSwitcher</code> component is the canonical way to
            render cross-app navigation links. It uses centralized URLs and branded icon assets from
            <code class="text-white/70">assets/icons/index.ts</code>. Use it in menu footers,
            splash pages, and anywhere apps link to each other.
            <strong class="text-white/70">Never hardcode app URLs or brand colors inline.</strong>
          </p>
          <div class="flex flex-col gap-4 p-6 rounded-lg bg-white/5 border border-white/10">
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Row (menu footer)</span>
              <div class="w-64 bg-slate-900/80 rounded-lg border border-white/10 px-2 py-2">
                <AppSwitcher />
              </div>
            </div>
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Row with labels</span>
              <AppSwitcher show-labels />
            </div>
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Excluding current app</span>
              <AppSwitcher show-labels :exclude="['throttle']" />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-4">App Header Variants</h2>
          <div class="flex flex-col gap-3">
            <div v-for="app in [
              { variant: 'throttle', title: 'Throttle' },
              { variant: 'cloud', title: 'Cloud' },
              { variant: 'monitor', title: 'Monitor' },
              { variant: 'tour', title: 'Tour' },
            ]" :key="app.variant" class="rounded-lg overflow-hidden border border-white/10">
              <v-toolbar color="surface" flat density="compact" class="px-3 border-b border-white/10">
                <Logo size="xs" :variant="app.variant" :app-title="app.title" mark-style="icon" />
                <v-spacer />
                <v-btn icon="mdi-magnify" size="x-small" variant="text" />
                <v-btn icon="mdi-cog" size="x-small" variant="text" />
              </v-toolbar>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
}
