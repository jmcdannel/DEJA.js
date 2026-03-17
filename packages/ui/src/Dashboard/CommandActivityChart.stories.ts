import type { Meta, StoryObj } from '@storybook/vue3'
import CommandActivityChart from './CommandActivityChart.vue'

const meta: Meta<typeof CommandActivityChart> = {
  title: 'Dashboard/CommandActivityChart',
  component: CommandActivityChart,
  tags: ['autodocs'],
  argTypes: {
    data: { control: 'object' },
  },
}

export default meta
type Story = StoryObj<typeof CommandActivityChart>

function generateActivityData(count: number, maxCount: number): { timestamp: number; count: number }[] {
  const now = Date.now()
  const interval = 60000 // 1 minute intervals
  return Array.from({ length: count }, (_, i) => ({
    timestamp: now - (count - 1 - i) * interval,
    count: Math.floor(Math.random() * maxCount),
  }))
}

export const Default: Story = {
  args: {
    data: generateActivityData(30, 50),
  },
}

export const HighActivity: Story = {
  args: {
    data: generateActivityData(30, 200),
  },
}

export const LowActivity: Story = {
  args: {
    data: generateActivityData(30, 5),
  },
}

export const Empty: Story = {
  args: {
    data: [],
  },
}

export const FewDataPoints: Story = {
  args: {
    data: generateActivityData(5, 30),
  },
}
