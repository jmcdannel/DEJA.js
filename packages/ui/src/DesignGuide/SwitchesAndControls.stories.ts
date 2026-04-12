import type { Meta, StoryObj } from '@storybook/vue3'
import TurnoutSwitch from '../Turnouts/TurnoutSwitch.vue'
import CTCSwitch from '../Turnouts/CTCSwitch.vue'
import ItemButton from '../ModuleList/ItemButton.vue'
import ItemSwitch from '../ModuleList/ItemSwitch.vue'
import ItemCard from '../ModuleList/ItemCard.vue'
import List from '../ModuleList/List.vue'
import StatusIndicator from '../StatusIndicator.vue'
import { createTurnout, createEffect } from '../../.storybook/mocks/data'

const meta: Meta = {
  title: 'Design Guide/Switches & Controls',
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
//   CTC Switch
// ═══════════════════════════════════════════════════════════════════

export const CTCSwitchGuide: Story = {
  name: '🚦 CTC Switch',
  render: () => ({
    components: { CTCSwitch },
    setup() {
      return {
        normal: createTurnout({ name: 'Main Crossover', color: 'blue', state: false }),
        reversed: createTurnout({ name: 'Yard Ladder', color: 'green', state: true }),
        red: createTurnout({ name: 'Industrial Spur', color: 'red', state: false }),
        purple: createTurnout({ name: 'Branch Line', color: 'purple', state: true }),
      }
    },
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">CTC Switch</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            The Centralized Traffic Control switch is an SVG-based toggle inspired by real CTC panels.
            The handle rotates between Normal (N) and Reverse (R) positions. Indicator lights use
            <span class="text-red-400">red</span> for normal and
            <span class="text-green-400">green</span> for reverse — matching real railroad signal conventions.
          </p>
          <div class="flex gap-6 flex-wrap items-start">
            <div class="flex flex-col items-center gap-2">
              <div style="width: 200px; height: 240px;">
                <CTCSwitch :turnout="normal" :state="false" />
              </div>
              <span class="text-[10px] font-mono text-white/50">Normal (blue)</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <div style="width: 200px; height: 240px;">
                <CTCSwitch :turnout="reversed" :state="true" />
              </div>
              <span class="text-[10px] font-mono text-white/50">Reversed (green)</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <div style="width: 200px; height: 240px;">
                <CTCSwitch :turnout="red" :state="false" />
              </div>
              <span class="text-[10px] font-mono text-white/50">Normal (red)</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <div style="width: 200px; height: 240px;">
                <CTCSwitch :turnout="purple" :state="true" />
              </div>
              <span class="text-[10px] font-mono text-white/50">Reversed (purple)</span>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-4">CTC Design Language</h2>
          <div class="flex gap-4 flex-wrap">
            <div v-for="c in [
              { label: 'Normal Indicator', hex: 'rgb(242,13,13)', desc: 'Red — track aligned to main' },
              { label: 'Reverse Indicator', hex: 'rgb(67,242,13)', desc: 'Green — track diverged' },
              { label: 'Inactive Indicator', hex: 'rgb(200,200,200)', desc: 'Grey — opposite position' },
              { label: 'Knob', hex: 'rgb(128,128,128)', desc: 'Neutral grey handle' },
            ]" :key="c.label" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
              <div class="w-8 h-8 rounded-md border border-white/10" :style="{ background: c.hex }"></div>
              <div>
                <div class="text-white text-sm font-semibold">{{ c.label }}</div>
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
//   Turnout Switch
// ═══════════════════════════════════════════════════════════════════

export const TurnoutSwitchGuide: Story = {
  name: '🔀 Turnout Switch',
  render: () => ({
    components: { TurnoutSwitch },
    setup() {
      return {
        closed: createTurnout({ name: 'Yard Entry', state: false, color: 'blue' }),
        thrown: createTurnout({ name: 'Yard Ladder', state: true, color: 'green' }),
        running: createTurnout({ name: 'Crossing', state: false, color: 'red' }),
        electric: createTurnout({ name: 'Electric Switch', type: 'electric', color: 'purple' }),
      }
    },
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Turnout Switch</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Pill-shaped toggle for turnout control. Shows the turnout name, device, and type icon.
            When running (animating), a gradient border and inner shadow appear for visual feedback.
            Servo turnouts use <code class="text-white/70">mdi-call-split</code>, electric use
            <code class="text-white/70">mdi-electric-switch</code>.
          </p>
          <div class="flex flex-col gap-3 max-w-md">
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-1">Closed (default)</span>
              <TurnoutSwitch :turnout="closed" :is-running="false" />
            </div>
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-1">Thrown (active)</span>
              <TurnoutSwitch :turnout="thrown" :is-running="false" :state="true" />
            </div>
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-1">Running (animating)</span>
              <TurnoutSwitch :turnout="running" :is-running="true" />
            </div>
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-1">Electric type</span>
              <TurnoutSwitch :turnout="electric" :is-running="false" />
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-4">Running State Feedback</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            When a turnout is transitioning, the card applies a gradient border
            (<code class="text-white/70">from-indigo-400 to-pink-900</code>) and an inner
            pink shadow (<code class="text-white/70">shadow-inner shadow-pink-500</code>).
            This pattern is shared across all module switch components.
          </p>
          <div class="flex gap-4 flex-wrap">
            <div v-for="c in [
              { label: 'Gradient Start', hex: '#818cf8', desc: 'indigo-400' },
              { label: 'Gradient End', hex: '#831843', desc: 'pink-900' },
              { label: 'Inner Shadow', hex: '#ec4899', desc: 'pink-500 glow' },
            ]" :key="c.label" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
              <div class="w-8 h-8 rounded-md" :style="{ background: c.hex }"></div>
              <div>
                <div class="text-white text-sm font-semibold">{{ c.label }}</div>
                <div class="text-white/50 text-[10px] font-mono">{{ c.desc }}</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Module View Types — Button, Switch, Card
// ═══════════════════════════════════════════════════════════════════

export const ModuleViewTypes: Story = {
  name: '📦 Module View Types',
  render: () => ({
    components: { ItemButton, ItemSwitch, ItemCard },
    setup() {
      const yardLights = createEffect({ name: 'Yard Lights', color: 'yellow', icon: 'mdi-lightbulb', device: 'arduino-01' })
      const stationBell = createEffect({ name: 'Station Bell', color: 'cyan', icon: 'mdi-bell', device: 'deja-server' })
      const crossingGate = createEffect({ name: 'Crossing Gate', color: 'indigo', icon: 'mdi-gate', device: 'arduino-01' })
      return { yardLights, stationBell, crossingGate }
    },
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Module View Types</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Modules (effects, turnouts, signals, etc.) can be displayed in multiple view types.
            Each view uses the same data model but presents it differently. The
            <code class="text-white/70">ModuleList</code> component switches between them
            via the <code class="text-white/70">viewAs</code> prop.
          </p>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">🔘 Button View</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Compact, tonal buttons with a status indicator circle. Best for quick toggling
            in space-constrained layouts. Color and icon are driven by item data.
          </p>
          <div class="flex flex-col gap-2 max-w-sm">
            <ItemButton :item="yardLights" :is-running="false" :state="false" />
            <ItemButton :item="stationBell" :is-running="false" :state="true" />
            <ItemButton :item="crossingGate" :is-running="true" :state="false" />
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">🔀 Switch View</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Pill-shaped cards with a Vuetify switch control. Shows name, device, and a large icon.
            Uses the same gradient-border running state as TurnoutSwitch.
          </p>
          <div class="flex flex-col gap-2 max-w-md">
            <ItemSwitch :item="yardLights" :is-running="false" :state="false" />
            <ItemSwitch :item="stationBell" :is-running="false" :state="true" />
            <ItemSwitch :item="crossingGate" :is-running="true" :state="false" />
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">🃏 Card View</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Full detail cards with metadata badges (device, type, tags, guest access),
            edit/delete actions, and a switch control. Best for configuration and management views.
          </p>
          <div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
            <ItemCard :item="yardLights" :is-running="false" :state="false" />
            <ItemCard :item="stationBell" :is-running="false" :state="true" />
            <ItemCard :item="crossingGate" :is-running="true" :state="false" />
          </div>
        </section>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Module List — Grid & Table
// ═══════════════════════════════════════════════════════════════════

export const ModuleListLayouts: Story = {
  name: '📋 Module List Layouts',
  render: () => ({
    components: { List },
    setup() {
      const effects = [
        createEffect({ name: 'Yard Lights', color: 'yellow', icon: 'mdi-lightbulb', device: 'arduino-01', state: true }),
        createEffect({ name: 'Station Bell', color: 'cyan', icon: 'mdi-bell', device: 'deja-server', state: false }),
        createEffect({ name: 'Crossing Gate', color: 'indigo', icon: 'mdi-gate', device: 'arduino-01', state: true }),
        createEffect({ name: 'LED Strip', color: 'teal', icon: 'mdi-led-strip-variant', device: 'arduino-02', state: false }),
        createEffect({ name: 'Smoke Generator', color: 'orange', icon: 'mdi-weather-fog', device: 'arduino-01', state: true }),
        createEffect({ name: 'Sound Effect', color: 'purple', icon: 'mdi-music', device: 'deja-server', state: false }),
      ]
      return { effects }
    },
    template: `
      <div class="p-8 flex flex-col gap-12">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Responsive Grid — Card View</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            The <code class="text-white/70">ModuleList</code> renders items in a responsive grid.
            Breakpoints: xs=12, sm=6, md=4, lg=4, xl=3, xxl=2 columns.
            Layout transitions are animated with <code class="text-white/70">@formkit/auto-animate</code>.
          </p>
          <List :list="effects" view-as="card" />
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Switch View</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Same data, rendered as pill-shaped switch toggles in a grid.
          </p>
          <List :list="effects" view-as="switch" />
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Button View</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Compact tonal buttons — the most space-efficient layout.
          </p>
          <List :list="effects" view-as="button" />
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Table View</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Tabular layout with columns for name, device, type, guest access, and status switch.
            Best for data management and bulk operations.
          </p>
          <List :list="effects" view-as="table" />
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Empty State</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            When no items exist, the list shows an empty state with customizable icon, title, and description.
          </p>
          <List
            :list="[]"
            view-as="card"
            empty-icon="mdi-auto-fix"
            empty-title="No Effects"
            empty-description="Add effects to control lights, sounds, and animations on your layout."
          />
        </section>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Status Indicators
// ═══════════════════════════════════════════════════════════════════

export const StatusIndicators: Story = {
  name: '🔴 Status Indicators',
  render: () => ({
    components: { StatusIndicator },
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">StatusIndicator Component</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            The <code class="text-white/70">StatusIndicator</code> component from
            <code class="text-white/70">@repo/ui</code> is the <strong class="text-white/80">canonical</strong>
            way to render state across all DEJA apps. Pass a <code class="text-white/70">status</code>
            string — the component handles icon, color, and animation. Never hand-pick
            <code class="text-white/70">mdi-circle</code> and colors inline.
          </p>
          <div class="flex flex-col gap-3 p-6 rounded-lg bg-white/5 border border-white/10">
            <div class="flex items-center gap-4">
              <StatusIndicator status="active" label="Active / On / Connected" />
              <span class="text-white/40 text-xs font-mono ml-auto">status=&quot;active&quot;</span>
            </div>
            <div class="flex items-center gap-4">
              <StatusIndicator status="inactive" label="Inactive / Off / Disconnected" />
              <span class="text-white/40 text-xs font-mono ml-auto">status=&quot;inactive&quot;</span>
            </div>
            <div class="flex items-center gap-4">
              <StatusIndicator status="idle" label="Idle / Default" />
              <span class="text-white/40 text-xs font-mono ml-auto">status=&quot;idle&quot;</span>
            </div>
            <div class="flex items-center gap-4">
              <StatusIndicator status="pending" label="Transitioning / Pending" />
              <span class="text-white/40 text-xs font-mono ml-auto">status=&quot;pending&quot; (pulses)</span>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Signal Aspects</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            For railroad signals, use the dedicated aspect statuses. These map to traditional
            signal colors (red/yellow/green) and should be used everywhere a signal aspect is rendered.
          </p>
          <div class="flex gap-6 flex-wrap p-6 rounded-lg bg-white/5 border border-white/10">
            <StatusIndicator aspect="red" label="Stop" size="24" />
            <StatusIndicator aspect="yellow" label="Approach" size="24" />
            <StatusIndicator aspect="green" label="Clear" size="24" />
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-4">Module Color Vocabulary</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Module items (effects, turnouts, etc.) carry a <code class="text-white/70">color</code>
            property from Firestore that drives their accent. These are Vuetify color tokens.
            For <em>state</em> use <code class="text-white/70">StatusIndicator</code>;
            for <em>identity</em> use the color prop directly.
          </p>
          <div class="flex gap-3 flex-wrap">
            <div v-for="c in [
              'yellow', 'cyan', 'indigo', 'teal', 'orange', 'purple', 'red', 'green', 'blue', 'lime', 'pink', 'amber',
            ]" :key="c" class="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <v-icon icon="mdi-circle" :color="c" size="14" />
              <span class="text-white/70 text-xs font-mono">{{ c }}</span>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
}
