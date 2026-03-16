import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import TransitionSlide from './TransitionSlide.vue'

const meta: Meta<typeof TransitionSlide> = {
  title: 'Animations/TransitionSlide',
  component: TransitionSlide,
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['up', 'down', 'left', 'right'],
    },
    duration: { control: { type: 'range', min: 100, max: 1000, step: 50 } },
    mode: {
      control: 'select',
      options: ['in-out', 'out-in', 'default'],
    },
  },
  decorators: [
    () => ({
      template: '<div class="p-4" style="min-height: 250px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof TransitionSlide>

export const SlideUp: Story = {
  render: (args) => ({
    components: { TransitionSlide },
    setup() {
      const show = ref(true)
      return { show, args }
    },
    template: `
      <div>
        <v-btn @click="show = !show" class="mb-4" color="primary">Toggle</v-btn>
        <TransitionSlide v-bind="args">
          <div v-if="show" class="bg-slate-800 p-4 rounded">
            <p class="text-white">Slides up on enter, up on leave.</p>
          </div>
        </TransitionSlide>
      </div>
    `,
  }),
  args: {
    direction: 'up',
    duration: 300,
    mode: 'out-in',
  },
}

export const SlideDown: Story = {
  render: (args) => ({
    components: { TransitionSlide },
    setup() {
      const show = ref(true)
      return { show, args }
    },
    template: `
      <div>
        <v-btn @click="show = !show" class="mb-4" color="secondary">Toggle</v-btn>
        <TransitionSlide v-bind="args">
          <div v-if="show" class="bg-indigo-900 p-4 rounded">
            <p class="text-white">Slides down direction.</p>
          </div>
        </TransitionSlide>
      </div>
    `,
  }),
  args: {
    direction: 'down',
    duration: 300,
    mode: 'out-in',
  },
}

export const SlideLeft: Story = {
  render: (args) => ({
    components: { TransitionSlide },
    setup() {
      const show = ref(true)
      return { show, args }
    },
    template: `
      <div>
        <v-btn @click="show = !show" class="mb-4" color="success">Toggle</v-btn>
        <TransitionSlide v-bind="args">
          <div v-if="show" class="bg-teal-900 p-4 rounded">
            <p class="text-white">Slides left direction.</p>
          </div>
        </TransitionSlide>
      </div>
    `,
  }),
  args: {
    direction: 'left',
    duration: 300,
    mode: 'out-in',
  },
}

export const SlideRight: Story = {
  render: (args) => ({
    components: { TransitionSlide },
    setup() {
      const show = ref(true)
      return { show, args }
    },
    template: `
      <div>
        <v-btn @click="show = !show" class="mb-4" color="warning">Toggle</v-btn>
        <TransitionSlide v-bind="args">
          <div v-if="show" class="bg-amber-900 p-4 rounded">
            <p class="text-white">Slides right direction.</p>
          </div>
        </TransitionSlide>
      </div>
    `,
  }),
  args: {
    direction: 'right',
    duration: 300,
    mode: 'out-in',
  },
}

export const AllDirections: Story = {
  render: () => ({
    components: { TransitionSlide },
    setup() {
      const show = ref(true)
      return { show }
    },
    template: `
      <div>
        <v-btn @click="show = !show" class="mb-4" color="primary">Toggle All</v-btn>
        <div class="grid grid-cols-2 gap-4">
          <TransitionSlide direction="up">
            <div v-if="show" class="bg-slate-800 p-3 rounded text-center">
              <p class="text-white text-sm">Up</p>
            </div>
          </TransitionSlide>
          <TransitionSlide direction="down">
            <div v-if="show" class="bg-indigo-900 p-3 rounded text-center">
              <p class="text-white text-sm">Down</p>
            </div>
          </TransitionSlide>
          <TransitionSlide direction="left">
            <div v-if="show" class="bg-teal-900 p-3 rounded text-center">
              <p class="text-white text-sm">Left</p>
            </div>
          </TransitionSlide>
          <TransitionSlide direction="right">
            <div v-if="show" class="bg-amber-900 p-3 rounded text-center">
              <p class="text-white text-sm">Right</p>
            </div>
          </TransitionSlide>
        </div>
      </div>
    `,
  }),
}
