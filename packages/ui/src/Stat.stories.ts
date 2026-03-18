import type { Meta, StoryObj } from '@storybook/vue3'
import Stat from './Stat.vue'

const meta: Meta<typeof Stat> = {
  title: 'Chrome/Stat',
  component: Stat,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'number', min: 0, max: 100 } },
    label: { control: 'text' },
    emptyLabel: { control: 'text' },
    color: { control: 'text' },
  },
  decorators: [
    () => ({
      template: '<div class="p-4" style="max-width: 300px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof Stat>

export const Default: Story = {
  args: {
    value: 5,
    label: 'turnout',
    emptyLabel: 'No turnouts configured',
    color: 'indigo',
  },
}

export const SingleItem: Story = {
  args: {
    value: 1,
    label: 'locomotive',
    emptyLabel: 'No locomotives',
    color: 'green',
  },
}

export const ZeroValue: Story = {
  args: {
    value: 0,
    label: 'signal',
    emptyLabel: 'No signals configured yet',
    color: 'cyan',
  },
}

export const LargeNumber: Story = {
  args: {
    value: 42,
    label: 'effect',
    emptyLabel: '',
    color: 'purple',
  },
}

export const AllColors: Story = {
  render: () => ({
    components: { Stat },
    template: `
      <div class="space-y-2">
        <Stat :value="12" label="turnout" color="indigo" />
        <Stat :value="5" label="locomotive" color="green" />
        <Stat :value="8" label="signal" color="cyan" />
        <Stat :value="3" label="effect" color="purple" />
        <Stat :value="2" label="route" color="orange" />
        <Stat :value="0" label="device" empty-label="No devices connected" color="red" />
      </div>
    `,
  }),
}
