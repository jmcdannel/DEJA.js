import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import TransitionFade from './TransitionFade.vue'

const meta: Meta<typeof TransitionFade> = {
  title: 'Animations/TransitionFade',
  component: TransitionFade,
  tags: ['autodocs'],
  argTypes: {
    duration: { control: { type: 'range', min: 100, max: 1000, step: 50 } },
    mode: {
      control: 'select',
      options: ['in-out', 'out-in', 'default'],
    },
  },
  decorators: [
    () => ({
      template: '<div class="p-4" style="min-height: 200px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof TransitionFade>

export const Default: Story = {
  render: (args) => ({
    components: { TransitionFade },
    setup() {
      const show = ref(true)
      return { show, args }
    },
    template: `
      <div>
        <v-btn @click="show = !show" class="mb-4" color="primary">
          {{ show ? 'Fade Out' : 'Fade In' }}
        </v-btn>
        <TransitionFade v-bind="args">
          <div v-if="show" class="bg-slate-800 p-4 rounded">
            <p class="text-white">This content fades in and out smoothly.</p>
          </div>
        </TransitionFade>
      </div>
    `,
  }),
  args: {
    duration: 250,
    mode: 'out-in',
  },
}

export const SlowFade: Story = {
  render: (args) => ({
    components: { TransitionFade },
    setup() {
      const show = ref(true)
      return { show, args }
    },
    template: `
      <div>
        <v-btn @click="show = !show" class="mb-4" color="secondary">Toggle</v-btn>
        <TransitionFade v-bind="args">
          <div v-if="show" class="bg-indigo-900 p-6 rounded-lg">
            <h3 class="text-white font-bold">Slow Fade</h3>
            <p class="text-gray-300 mt-2">Duration: 800ms</p>
          </div>
        </TransitionFade>
      </div>
    `,
  }),
  args: {
    duration: 800,
    mode: 'out-in',
  },
}

export const ContentSwap: Story = {
  render: () => ({
    components: { TransitionFade },
    setup() {
      const current = ref(0)
      const items = ['First View', 'Second View', 'Third View']
      const next = () => { current.value = (current.value + 1) % items.length }
      return { current, items, next }
    },
    template: `
      <div>
        <v-btn @click="next" class="mb-4" color="primary">Next View</v-btn>
        <TransitionFade mode="out-in">
          <div :key="current" class="bg-slate-800 p-4 rounded">
            <p class="text-white text-lg font-bold">{{ items[current] }}</p>
          </div>
        </TransitionFade>
      </div>
    `,
  }),
}
