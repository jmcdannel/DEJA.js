import type { Meta, StoryObj } from '@storybook/vue3'
import PageBackground from './PageBackground.vue'

const meta: Meta<typeof PageBackground> = {
  title: 'Backgrounds/PageBackground',
  component: PageBackground,
  tags: ['autodocs'],
  argTypes: {
    appName: { control: 'text' },
    backgroundId: { control: 'text' },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
  },
}

export default meta
type Story = StoryObj<typeof PageBackground>

export const Default: Story = {
  args: {
    appName: 'throttle',
  },
  render: (args) => ({
    components: { PageBackground },
    setup() {
      return { args }
    },
    template: `
      <PageBackground v-bind="args">
        <div class="p-8">
          <h1 class="text-2xl font-bold text-white mb-4">Page Content</h1>
          <p class="text-gray-300">This content sits on top of the background layer.</p>
        </div>
      </PageBackground>
    `,
  }),
}

export const WithImageBackground: Story = {
  args: {
    appName: 'throttle',
    backgroundId: 'northernlights',
    opacity: 0.5,
  },
  render: (args) => ({
    components: { PageBackground },
    setup() {
      return { args }
    },
    template: `
      <PageBackground v-bind="args">
        <div class="p-8">
          <h1 class="text-2xl font-bold text-white mb-4">Northern Lights Background</h1>
          <p class="text-gray-300">Content overlaid on the Northern Lights image.</p>
        </div>
      </PageBackground>
    `,
  }),
}

export const WithEffectBackground: Story = {
  args: {
    appName: 'throttle',
    backgroundId: 'decor',
    opacity: 0.3,
  },
  render: (args) => ({
    components: { PageBackground },
    setup() {
      return { args }
    },
    template: `
      <PageBackground v-bind="args">
        <div class="p-8">
          <h1 class="text-2xl font-bold text-white mb-4">Ambient Glow Effect</h1>
          <p class="text-gray-300">Content overlaid on the animated effect background.</p>
        </div>
      </PageBackground>
    `,
  }),
}

export const HighOpacity: Story = {
  args: {
    appName: 'throttle',
    backgroundId: 'tracks',
    opacity: 0.8,
  },
  render: (args) => ({
    components: { PageBackground },
    setup() {
      return { args }
    },
    template: `
      <PageBackground v-bind="args">
        <div class="p-8">
          <h1 class="text-2xl font-bold text-white mb-4">High Opacity Overlay</h1>
          <p class="text-gray-300">Background is mostly obscured by the dark overlay.</p>
        </div>
      </PageBackground>
    `,
  }),
}
