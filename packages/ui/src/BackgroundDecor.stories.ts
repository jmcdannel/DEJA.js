import type { Meta, StoryObj } from '@storybook/vue3'
import BackgroundDecor from './BackgroundDecor.vue'

const meta: Meta<typeof BackgroundDecor> = {
  title: 'Backgrounds/BackgroundDecor',
  component: BackgroundDecor,
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
        <div class="relative bg-slate-900 rounded-lg overflow-hidden" style="width: 100%; height: 300px;">
          <story />
          <div class="relative z-10 p-8">
            <h2 class="text-xl font-bold text-white">Content Layer</h2>
            <p class="text-gray-300 mt-2">This text sits above the decorative background.</p>
          </div>
        </div>
      `,
    }),
  ],
}

export default meta
type Story = StoryObj<typeof BackgroundDecor>

export const Default: Story = {
  args: {
    variant: 'blurred-bubbles-1',
  },
}

export const InHeader: Story = {
  decorators: [
    () => ({
      template: `
        <div class="relative overflow-hidden rounded-lg" style="background: rgba(11, 17, 32, 0.6); height: 64px;">
          <story />
          <div class="relative z-10 flex items-center h-full px-6">
            <span class="text-white font-bold text-lg">DEJA.js App Header</span>
          </div>
        </div>
      `,
    }),
  ],
  args: {
    variant: 'blurred-bubbles-1',
  },
}

export const LargeContainer: Story = {
  decorators: [
    () => ({
      template: `
        <div class="relative bg-slate-950 rounded-lg overflow-hidden" style="width: 100%; height: 500px;">
          <story />
          <div class="relative z-10 flex items-center justify-center h-full">
            <span class="text-2xl font-bold text-white">Full Page Background</span>
          </div>
        </div>
      `,
    }),
  ],
  args: {
    variant: 'blurred-bubbles-1',
  },
}
