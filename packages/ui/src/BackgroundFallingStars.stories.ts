import type { Meta, StoryObj } from '@storybook/vue3'
import BackgroundFallingStars from './BackgroundFallingStars.vue'

const meta: Meta<typeof BackgroundFallingStars> = {
  title: 'Backgrounds/BackgroundFallingStars',
  component: BackgroundFallingStars,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['blurred-bubbles-1'],
    },
  },
  decorators: [
    () => ({
      template: `
        <div class="relative bg-slate-950 rounded-lg overflow-hidden" style="width: 100%; height: 400px;">
          <story />
          <div class="relative z-10 flex items-center justify-center h-full">
            <h2 class="text-xl font-bold text-white">Falling Stars Effect</h2>
          </div>
        </div>
      `,
    }),
  ],
}

export default meta
type Story = StoryObj<typeof BackgroundFallingStars>

export const Default: Story = {
  args: {
    variant: 'blurred-bubbles-1',
  },
}

export const FullScreen: Story = {
  decorators: [
    () => ({
      template: `
        <div class="relative bg-black overflow-hidden" style="width: 100%; height: 600px;">
          <story />
          <div class="relative z-10 flex flex-col items-center justify-center h-full">
            <h1 class="text-3xl font-bold text-white mb-2">DEJA.js</h1>
            <p class="text-gray-400">Model Railroad Control System</p>
          </div>
        </div>
      `,
    }),
  ],
  args: {
    variant: 'blurred-bubbles-1',
  },
}

export const CompactContainer: Story = {
  decorators: [
    () => ({
      template: `
        <div class="relative bg-slate-900 rounded-lg overflow-hidden" style="width: 300px; height: 200px;">
          <story />
          <div class="relative z-10 flex items-center justify-center h-full">
            <span class="text-sm text-white">Compact view</span>
          </div>
        </div>
      `,
    }),
  ],
  args: {
    variant: 'blurred-bubbles-1',
  },
}
