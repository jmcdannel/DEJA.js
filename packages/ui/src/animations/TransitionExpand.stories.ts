import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import TransitionExpand from './TransitionExpand.vue'

const meta: Meta<typeof TransitionExpand> = {
  title: 'Animations/TransitionExpand',
  component: TransitionExpand,
  tags: ['autodocs'],
  decorators: [
    () => ({
      template: '<div class="p-4" style="min-height: 300px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof TransitionExpand>

export const Default: Story = {
  render: () => ({
    components: { TransitionExpand },
    setup() {
      const show = ref(true)
      return { show }
    },
    template: `
      <div>
        <v-btn @click="show = !show" class="mb-4" color="primary">
          {{ show ? 'Collapse' : 'Expand' }}
        </v-btn>
        <TransitionExpand>
          <div v-if="show" class="bg-slate-800 p-4 rounded">
            <h3 class="text-white font-bold mb-2">Expandable Content</h3>
            <p class="text-gray-300">This content expands and collapses with a smooth height animation.</p>
            <p class="text-gray-400 mt-2">The transition uses cubic-bezier easing for a natural feel.</p>
          </div>
        </TransitionExpand>
      </div>
    `,
  }),
}

export const WithCard: Story = {
  render: () => ({
    components: { TransitionExpand },
    setup() {
      const show = ref(false)
      return { show }
    },
    template: `
      <div>
        <v-btn @click="show = !show" class="mb-4" color="secondary" variant="outlined">
          {{ show ? 'Hide Details' : 'Show Details' }}
        </v-btn>
        <TransitionExpand>
          <v-card v-if="show" class="mt-2" color="surface">
            <v-card-title>Device Details</v-card-title>
            <v-card-text>
              <p>Type: DCC-EX CommandStation</p>
              <p>Port: /dev/ttyUSB0</p>
              <p>Baud Rate: 115200</p>
              <p>Status: Connected</p>
            </v-card-text>
          </v-card>
        </TransitionExpand>
      </div>
    `,
  }),
}

export const MultipleItems: Story = {
  render: () => ({
    components: { TransitionExpand },
    setup() {
      const items = ref([true, false, true])
      const toggle = (i: number) => { items.value[i] = !items.value[i] }
      return { items, toggle }
    },
    template: `
      <div class="space-y-2">
        <div v-for="(visible, i) in items" :key="i">
          <v-btn @click="toggle(i)" size="small" color="primary" variant="tonal" class="mb-1">
            Item {{ i + 1 }} {{ visible ? '[-]' : '[+]' }}
          </v-btn>
          <TransitionExpand>
            <div v-if="visible" class="bg-slate-700 p-3 rounded text-white text-sm">
              Content for item {{ i + 1 }}
            </div>
          </TransitionExpand>
        </div>
      </div>
    `,
  }),
}
