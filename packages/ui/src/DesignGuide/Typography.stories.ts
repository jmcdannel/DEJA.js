import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta = {
  title: 'Design Guide/Typography',
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
//   Type Scale
// ═══════════════════════════════════════════════════════════════════

export const TypeScale: Story = {
  name: '📏 Type Scale',
  render: () => ({
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Font Families</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            DEJA.js uses a focused font stack: <strong class="text-white/70">Roboto</strong> for UI text (via Vuetify),
            <strong class="text-white/70">Roboto Mono</strong> for code and technical displays, and
            <strong class="text-white/70">Roboto Condensed</strong> for number plates and data-dense contexts.
          </p>
          <div class="flex flex-col gap-6 p-6 rounded-lg bg-white/5 border border-white/10">
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-1">Roboto (sans-serif) — UI text</span>
              <span class="text-2xl text-white" style="font-family: Roboto, sans-serif;">
                The quick brown fox jumps over the lazy dog
              </span>
            </div>
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-1">Roboto Mono — Code & technical</span>
              <span class="text-2xl text-white font-mono">
                const speed = 126; // max DCC
              </span>
            </div>
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-1">Roboto Condensed — Number plates & data</span>
              <span class="text-2xl text-white" style="font-family: 'Roboto Condensed', sans-serif; font-weight: 700; letter-spacing: 2px;">
                BNSF 5801
              </span>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-4">Heading Scale</h2>
          <div class="flex flex-col gap-4 p-6 rounded-lg bg-white/5 border border-white/10">
            <div v-for="h in [
              { tag: 'h1', class: 'text-4xl font-bold', label: 'text-4xl · bold' },
              { tag: 'h2', class: 'text-3xl font-bold', label: 'text-3xl · bold' },
              { tag: 'h3', class: 'text-2xl font-semibold', label: 'text-2xl · semibold' },
              { tag: 'h4', class: 'text-xl font-semibold', label: 'text-xl · semibold' },
              { tag: 'h5', class: 'text-lg font-medium', label: 'text-lg · medium' },
              { tag: 'h6', class: 'text-base font-medium', label: 'text-base · medium' },
            ]" :key="h.tag" class="flex items-baseline gap-4">
              <span class="text-white/40 font-mono text-xs w-20 text-right shrink-0">{{ h.tag }}</span>
              <span class="text-white" :class="h.class">Locomotive Roster</span>
              <span class="text-white/30 font-mono text-[10px]">{{ h.label }}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-4">Body Text</h2>
          <div class="flex flex-col gap-4 p-6 rounded-lg bg-white/5 border border-white/10 max-w-xl">
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-1">text-base · Regular (body)</span>
              <p class="text-white/87 text-base">
                DEJA.js connects your model railroad to the digital world. Control locomotives,
                throw turnouts, trigger effects, and monitor your layout — all from any device.
              </p>
            </div>
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-1">text-sm · Regular (secondary)</span>
              <p class="text-white/60 text-sm">
                DCC-EX CommandStation connected via USB serial at 115200 baud.
                WebSocket server running on port 8082.
              </p>
            </div>
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-1">text-xs · Regular (caption)</span>
              <p class="text-white/40 text-xs">
                Last updated 3 minutes ago · Layout ID: ttt-mountain-division
              </p>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Monospace & Code
// ═══════════════════════════════════════════════════════════════════

export const CodeAndMono: Story = {
  name: '💻 Code & Monospace',
  render: () => ({
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Monospace Contexts</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Monospace type is used for DCC commands, serial output, addresses,
            technical labels, and code snippets.
          </p>
          <div class="flex flex-col gap-4 p-6 rounded-lg bg-white/5 border border-white/10">
            <div>
              <span class="text-[10px] text-white/50 block mb-1">DCC Command</span>
              <code class="text-lime-400 font-mono text-lg">&lt;t 3 50 1&gt;</code>
              <span class="text-white/40 text-xs ml-3">Throttle addr:3, speed:50, forward</span>
            </div>
            <div>
              <span class="text-[10px] text-white/50 block mb-1">Serial Output</span>
              <div class="bg-black/60 rounded px-3 py-2 font-mono text-sm text-green-400">
                <div>&lt;p1 MAIN&gt;</div>
                <div>&lt;l 3 0 50 1&gt;</div>
                <div>&lt;H 1 1&gt;</div>
              </div>
            </div>
            <div>
              <span class="text-[10px] text-white/50 block mb-1">Inline Code</span>
              <p class="text-white/80 text-sm">
                Use <code class="bg-white/10 text-cyan-400 px-1.5 py-0.5 rounded text-xs font-mono">useDcc()</code> to send
                commands via <code class="bg-white/10 text-cyan-400 px-1.5 py-0.5 rounded text-xs font-mono">@repo/dccex</code>.
              </p>
            </div>
            <div>
              <span class="text-[10px] text-white/50 block mb-1">Loco Address</span>
              <span class="font-mono text-white text-2xl font-bold tracking-wider">5801</span>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-4">Keyboard Shortcuts</h2>
          <div class="flex gap-3 flex-wrap p-6 rounded-lg bg-white/5 border border-white/10">
            <div v-for="k in [
              { keys: '⌘ K', desc: 'Command Palette' },
              { keys: 'W', desc: 'Increase Speed' },
              { keys: 'S', desc: 'Decrease Speed' },
              { keys: 'X', desc: 'Emergency Stop' },
              { keys: 'Space', desc: 'Toggle Direction' },
            ]" :key="k.keys" class="flex items-center gap-2">
              <kbd class="bg-[#212529] text-white px-2 py-1 rounded text-xs font-mono border border-white/20 shadow-sm">{{ k.keys }}</kbd>
              <span class="text-white/50 text-xs">{{ k.desc }}</span>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Page Headers
// ═══════════════════════════════════════════════════════════════════

export const PageHeaderStyles: Story = {
  name: '📄 Page Headers',
  render: () => ({
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Gradient Page Headers</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Page titles use uppercase, font-black weight with a left-edge color gradient (20% opacity).
            Each page can define its own accent color.
          </p>
          <div class="flex flex-col gap-3">
            <div v-for="h in [
              { title: 'Throttle', icon: 'mdi-train', color: 'cyan' },
              { title: 'Turnouts', icon: 'mdi-call-split', color: 'lime' },
              { title: 'Effects', icon: 'mdi-auto-fix', color: 'pink' },
              { title: 'Roster', icon: 'mdi-format-list-bulleted', color: 'amber' },
              { title: 'Signals', icon: 'mdi-traffic-light', color: 'emerald' },
              { title: 'Routes', icon: 'mdi-map-marker-path', color: 'purple' },
            ]" :key="h.title"
              class="px-6 py-4 rounded-lg"
              :class="'bg-gradient-to-r from-' + h.color + '-500/20 to-transparent'"
            >
              <div class="flex items-center gap-3">
                <v-icon :icon="h.icon" size="28" :class="'text-' + h.color + '-400'" />
                <span class="text-white text-2xl font-black uppercase tracking-wide">{{ h.title }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
}
