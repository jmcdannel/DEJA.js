import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta = {
  title: 'Design Guide/HTML Elements',
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
//   Buttons
// ═══════════════════════════════════════════════════════════════════

export const Buttons: Story = {
  name: '🔘 Buttons',
  render: () => ({
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Vuetify Button Variants</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            All buttons use Vuetify's <code class="text-white/70">v-btn</code>. Prefer
            <strong class="text-white/70">flat</strong> for primary actions,
            <strong class="text-white/70">tonal</strong> for secondary, and
            <strong class="text-white/70">text</strong> for tertiary.
          </p>

          <div class="flex flex-col gap-6 p-6 rounded-lg bg-white/5 border border-white/10">
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Flat (primary actions)</span>
              <div class="flex gap-3 flex-wrap">
                <v-btn color="primary" variant="flat">Primary</v-btn>
                <v-btn color="success" variant="flat">Success</v-btn>
                <v-btn color="error" variant="flat">Error</v-btn>
                <v-btn color="warning" variant="flat">Warning</v-btn>
                <v-btn color="info" variant="flat">Info</v-btn>
              </div>
            </div>

            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Tonal (secondary actions)</span>
              <div class="flex gap-3 flex-wrap">
                <v-btn color="primary" variant="tonal">Primary</v-btn>
                <v-btn color="success" variant="tonal">Success</v-btn>
                <v-btn color="error" variant="tonal">Error</v-btn>
                <v-btn color="warning" variant="tonal">Warning</v-btn>
                <v-btn color="info" variant="tonal">Info</v-btn>
              </div>
            </div>

            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Outlined</span>
              <div class="flex gap-3 flex-wrap">
                <v-btn color="primary" variant="outlined">Primary</v-btn>
                <v-btn color="success" variant="outlined">Success</v-btn>
                <v-btn color="error" variant="outlined">Error</v-btn>
              </div>
            </div>

            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Text (tertiary / inline)</span>
              <div class="flex gap-3 flex-wrap">
                <v-btn color="primary" variant="text">Primary</v-btn>
                <v-btn color="success" variant="text">Success</v-btn>
                <v-btn color="error" variant="text">Error</v-btn>
              </div>
            </div>

            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Icon Buttons</span>
              <div class="flex gap-3 flex-wrap items-center">
                <v-btn icon="mdi-power" color="success" size="small" variant="flat" />
                <v-btn icon="mdi-alert-octagon" color="error" size="small" variant="flat" />
                <v-btn icon="mdi-cog" size="small" variant="tonal" />
                <v-btn icon="mdi-pencil" size="small" variant="text" />
                <v-btn icon="mdi-close" size="x-small" variant="text" />
              </div>
            </div>

            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Sizes</span>
              <div class="flex gap-3 flex-wrap items-center">
                <v-btn color="primary" size="x-small" variant="flat">X-Small</v-btn>
                <v-btn color="primary" size="small" variant="flat">Small</v-btn>
                <v-btn color="primary" size="default" variant="flat">Default</v-btn>
                <v-btn color="primary" size="large" variant="flat">Large</v-btn>
                <v-btn color="primary" size="x-large" variant="flat">X-Large</v-btn>
              </div>
            </div>

            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Disabled</span>
              <div class="flex gap-3 flex-wrap">
                <v-btn color="primary" variant="flat" disabled>Disabled Flat</v-btn>
                <v-btn color="primary" variant="tonal" disabled>Disabled Tonal</v-btn>
                <v-btn color="primary" variant="outlined" disabled>Disabled Outlined</v-btn>
              </div>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Cards
// ═══════════════════════════════════════════════════════════════════

export const Cards: Story = {
  name: '🃏 Cards',
  render: () => ({
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Card Variants</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Cards are the primary container element. Use Vuetify's
            <code class="text-white/70">v-card</code> with rounded corners and subtle borders.
          </p>
          <div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
            <v-card class="pa-4" rounded="lg">
              <v-card-title class="text-sm font-semibold">Default Card</v-card-title>
              <v-card-text class="text-xs text-white/60">Standard surface with no elevation. Use for content containers.</v-card-text>
            </v-card>

            <v-card class="pa-4" rounded="lg" variant="outlined">
              <v-card-title class="text-sm font-semibold">Outlined Card</v-card-title>
              <v-card-text class="text-xs text-white/60">Subtle border, transparent background. Use for grouped items.</v-card-text>
            </v-card>

            <v-card class="pa-4" rounded="lg" variant="tonal" color="primary">
              <v-card-title class="text-sm font-semibold">Tonal Card</v-card-title>
              <v-card-text class="text-xs">Tinted background from color prop. Use for highlighted sections.</v-card-text>
            </v-card>

            <v-card class="pa-4" rounded="lg" elevation="4">
              <v-card-title class="text-sm font-semibold">Elevated Card</v-card-title>
              <v-card-text class="text-xs text-white/60">Shadow-based elevation. Use sparingly for dialogs or floating elements.</v-card-text>
            </v-card>
          </div>
        </section>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Form Inputs
// ═══════════════════════════════════════════════════════════════════

export const FormInputs: Story = {
  name: '📝 Form Inputs',
  render: () => ({
    data() {
      return {
        textVal: '',
        selectVal: null,
        switchVal: true,
        sliderVal: 50,
        chipGroupVal: ['mainline'],
      }
    },
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Form Controls</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            All form inputs use Vuetify components with the
            <code class="text-white/70">outlined</code> variant and
            <code class="text-white/70">density="compact"</code> as defaults.
          </p>
          <div class="flex flex-col gap-4 p-6 rounded-lg bg-white/5 border border-white/10 max-w-md">
            <v-text-field
              v-model="textVal"
              label="Locomotive Name"
              placeholder="e.g. BNSF GP38-2"
              variant="outlined"
              density="compact"
              hint="Displayed in the throttle roster"
              persistent-hint
            />

            <v-select
              v-model="selectVal"
              label="Roadname"
              :items="['BNSF', 'Union Pacific', 'CSX', 'Norfolk Southern', 'Amtrak']"
              variant="outlined"
              density="compact"
            />

            <v-text-field
              label="DCC Address"
              type="number"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-pound"
              placeholder="1–9999"
            />

            <v-textarea
              label="Description"
              variant="outlined"
              density="compact"
              rows="2"
              placeholder="Optional notes about this locomotive"
            />

            <div class="flex items-center gap-4">
              <v-switch v-model="switchVal" label="Has Sound" color="success" density="compact" hide-details />
            </div>

            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Speed Slider</span>
              <v-slider v-model="sliderVal" :min="0" :max="126" color="primary" thumb-label hide-details />
            </div>

            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Tag Chips</span>
              <v-chip-group v-model="chipGroupVal" multiple>
                <v-chip value="mainline" variant="outlined" size="small" filter>Mainline</v-chip>
                <v-chip value="yard" variant="outlined" size="small" filter>Yard</v-chip>
                <v-chip value="passenger" variant="outlined" size="small" filter>Passenger</v-chip>
                <v-chip value="freight" variant="outlined" size="small" filter>Freight</v-chip>
              </v-chip-group>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Chips & Badges
// ═══════════════════════════════════════════════════════════════════

export const ChipsAndBadges: Story = {
  name: '🏷️ Chips & Badges',
  render: () => ({
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Chips</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Chips are used for tags, status indicators, and compact metadata.
          </p>
          <div class="flex flex-col gap-4 p-6 rounded-lg bg-white/5 border border-white/10">
            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Status Chips</span>
              <div class="flex gap-2 flex-wrap">
                <v-chip color="success" size="small" prepend-icon="mdi-check-circle">Connected</v-chip>
                <v-chip color="error" size="small" prepend-icon="mdi-alert-circle">Disconnected</v-chip>
                <v-chip color="warning" size="small" prepend-icon="mdi-clock">Pending</v-chip>
                <v-chip color="info" size="small" prepend-icon="mdi-information">Info</v-chip>
              </div>
            </div>

            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Tag Chips</span>
              <div class="flex gap-2 flex-wrap">
                <v-chip size="small" variant="outlined"><v-icon start icon="mdi-train" size="14" /> Mainline</v-chip>
                <v-chip size="small" variant="outlined"><v-icon start icon="mdi-warehouse" size="14" /> Yard</v-chip>
                <v-chip size="small" variant="outlined"><v-icon start icon="mdi-account-group" size="14" /> Passenger</v-chip>
                <v-chip size="small" variant="tonal" color="primary">DCC-EX</v-chip>
                <v-chip size="small" variant="tonal" color="secondary">MQTT</v-chip>
              </div>
            </div>

            <div>
              <span class="text-[10px] font-mono text-white/50 block mb-2">Badges (via v-badge)</span>
              <div class="flex gap-6 flex-wrap items-center">
                <v-badge content="3" color="error">
                  <v-icon icon="mdi-bell" size="24" />
                </v-badge>
                <v-badge content="12" color="primary">
                  <v-icon icon="mdi-train" size="24" />
                </v-badge>
                <v-badge dot color="success">
                  <v-icon icon="mdi-access-point" size="24" />
                </v-badge>
              </div>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Lists & Tables
// ═══════════════════════════════════════════════════════════════════

export const ListsAndTables: Story = {
  name: '📋 Lists & Tables',
  render: () => ({
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">List Items</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Vuetify list items are the foundation for roster views, device lists, and settings panels.
          </p>
          <div class="max-w-md rounded-lg bg-white/5 border border-white/10 overflow-hidden">
            <v-list bg-color="transparent" density="compact">
              <v-list-item prepend-icon="mdi-train" title="BNSF 5801" subtitle="GP38-2 · DCC Address 3">
                <template #append>
                  <v-chip size="x-small" color="success">Active</v-chip>
                </template>
              </v-list-item>
              <v-divider />
              <v-list-item prepend-icon="mdi-train" title="UP 1989" subtitle="SD70M · DCC Address 17">
                <template #append>
                  <v-chip size="x-small" color="warning">Idle</v-chip>
                </template>
              </v-list-item>
              <v-divider />
              <v-list-item prepend-icon="mdi-train" title="CSX 8888" subtitle="SD40-2 · DCC Address 24">
                <template #append>
                  <v-chip size="x-small" variant="outlined">Offline</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-4">Data Table</h2>
          <div class="max-w-xl rounded-lg bg-white/5 border border-white/10 overflow-hidden">
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left">Name</th>
                  <th class="text-left">Type</th>
                  <th class="text-center">State</th>
                  <th class="text-right">Device</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in [
                  { name: 'Yard Entry', type: 'Servo', state: true, device: 'Arduino-01' },
                  { name: 'Main Crossover', type: 'Solenoid', state: false, device: 'Arduino-01' },
                  { name: 'Siding Switch', type: 'Servo', state: true, device: 'Pico-W' },
                ]" :key="row.name">
                  <td>{{ row.name }}</td>
                  <td class="text-white/60">{{ row.type }}</td>
                  <td class="text-center">
                    <v-chip :color="row.state ? 'success' : 'default'" size="x-small">
                      {{ row.state ? 'Thrown' : 'Closed' }}
                    </v-chip>
                  </td>
                  <td class="text-right font-mono text-xs text-white/50">{{ row.device }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </section>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Dialogs & Alerts
// ═══════════════════════════════════════════════════════════════════

export const DialogsAndAlerts: Story = {
  name: '💬 Dialogs & Alerts',
  render: () => ({
    data() {
      return { showDialog: false }
    },
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Alerts</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            Use Vuetify alerts for status messages and inline feedback.
          </p>
          <div class="flex flex-col gap-3 max-w-lg">
            <v-alert type="success" variant="tonal" density="compact" closable>
              CommandStation connected successfully
            </v-alert>
            <v-alert type="error" variant="tonal" density="compact" closable>
              Serial port disconnected unexpectedly
            </v-alert>
            <v-alert type="warning" variant="tonal" density="compact" closable>
              Subscription expires in 3 days
            </v-alert>
            <v-alert type="info" variant="tonal" density="compact" closable>
              Firmware update available for Pico-W device
            </v-alert>
          </div>
        </section>

        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-4">Dialog</h2>
          <v-btn color="primary" variant="flat" @click="showDialog = true">Open Dialog</v-btn>
          <v-dialog v-model="showDialog" max-width="400">
            <v-card rounded="lg">
              <v-card-title class="text-base">Confirm Action</v-card-title>
              <v-card-text class="text-sm text-white/60">
                Are you sure you want to remove locomotive BNSF 5801 from the consist?
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="showDialog = false">Cancel</v-btn>
                <v-btn color="error" variant="flat" @click="showDialog = false">Remove</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </section>
      </div>
    `,
  }),
}

// ═══════════════════════════════════════════════════════════════════
//   Icons
// ═══════════════════════════════════════════════════════════════════

export const Icons: Story = {
  name: '🎯 Icons',
  render: () => ({
    template: `
      <div class="p-8 flex flex-col gap-10">
        <section>
          <h2 class="text-white/80 text-sm font-mono uppercase tracking-wider mb-1">Material Design Icons</h2>
          <p class="text-white/50 text-xs mb-4 max-w-lg">
            DEJA.js uses <code class="text-white/70">@mdi/font</code> exclusively.
            Common domain-specific icons used across the platform:
          </p>
          <div class="grid gap-3" style="grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));">
            <div v-for="i in [
              { icon: 'mdi-train', label: 'Locomotive' },
              { icon: 'mdi-call-split', label: 'Turnout' },
              { icon: 'mdi-traffic-light', label: 'Signal' },
              { icon: 'mdi-auto-fix', label: 'Effect' },
              { icon: 'mdi-map-marker-path', label: 'Route' },
              { icon: 'mdi-power', label: 'Track Power' },
              { icon: 'mdi-alert-octagon', label: 'E-Stop' },
              { icon: 'mdi-usb', label: 'Serial' },
              { icon: 'mdi-access-point', label: 'MQTT' },
              { icon: 'mdi-cloud', label: 'Cloud' },
              { icon: 'mdi-monitor-dashboard', label: 'Monitor' },
              { icon: 'mdi-speedometer', label: 'Throttle' },
              { icon: 'mdi-lightbulb', label: 'Headlight' },
              { icon: 'mdi-bell', label: 'Bell' },
              { icon: 'mdi-bullhorn', label: 'Horn' },
              { icon: 'mdi-cog', label: 'Settings' },
              { icon: 'mdi-link-variant', label: 'Consist' },
              { icon: 'mdi-motion-sensor', label: 'Sensor' },
              { icon: 'mdi-home', label: 'Layout' },
              { icon: 'mdi-fence-electric', label: 'Track Output' },
            ]" :key="i.icon" class="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <v-icon :icon="i.icon" size="20" class="text-white/80" />
              <div>
                <div class="text-xs text-white/80">{{ i.label }}</div>
                <div class="text-[10px] font-mono text-white/40">{{ i.icon }}</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
}
