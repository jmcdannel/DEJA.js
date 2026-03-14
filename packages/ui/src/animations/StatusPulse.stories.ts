import type { Meta, StoryObj } from '@storybook/vue3'
import StatusPulse from './StatusPulse.vue'

const meta: Meta<typeof StatusPulse> = {
  title: 'Animations/StatusPulse',
  component: StatusPulse,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['connected', 'disconnected', 'warning', 'idle'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  decorators: [
    () => ({
      template: '<div class="p-4 flex items-center justify-center" style="min-height: 80px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof StatusPulse>

export const Connected: Story = {
  args: {
    status: 'connected',
    size: 'md',
  },
}

export const Disconnected: Story = {
  args: {
    status: 'disconnected',
    size: 'md',
  },
}

export const Warning: Story = {
  args: {
    status: 'warning',
    size: 'md',
  },
}

export const Idle: Story = {
  args: {
    status: 'idle',
    size: 'md',
  },
}

export const AllStatuses: Story = {
  render: () => ({
    components: { StatusPulse },
    template: `
      <div class="flex items-center gap-8 p-4">
        <div class="flex flex-col items-center gap-2">
          <StatusPulse status="connected" size="lg" />
          <span class="text-xs text-gray-400">Connected</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <StatusPulse status="disconnected" size="lg" />
          <span class="text-xs text-gray-400">Disconnected</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <StatusPulse status="warning" size="lg" />
          <span class="text-xs text-gray-400">Warning</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <StatusPulse status="idle" size="lg" />
          <span class="text-xs text-gray-400">Idle</span>
        </div>
      </div>
    `,
  }),
}

export const AllSizes: Story = {
  render: () => ({
    components: { StatusPulse },
    template: `
      <div class="flex items-center gap-8 p-4">
        <div class="flex flex-col items-center gap-2">
          <StatusPulse status="connected" size="sm" />
          <span class="text-xs text-gray-400">Small</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <StatusPulse status="connected" size="md" />
          <span class="text-xs text-gray-400">Medium</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <StatusPulse status="connected" size="lg" />
          <span class="text-xs text-gray-400">Large</span>
        </div>
      </div>
    `,
  }),
}
