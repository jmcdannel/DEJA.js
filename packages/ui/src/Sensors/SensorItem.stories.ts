import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, userEvent, within } from '@storybook/test'
import SensorItem from './SensorItem.vue'
import { createSensor } from '../../.storybook/mocks/data'

const meta: Meta<typeof SensorItem> = {
  title: 'Sensors/SensorItem',
  component: SensorItem,
  tags: ['autodocs'],
  argTypes: {
    sensor: { control: 'object' },
    color: { control: 'color' },
  },
}

export default meta
type Story = StoryObj<typeof SensorItem>

export const Inactive: Story = {
  args: {
    sensor: createSensor({ state: false }),
  },
}

export const Active: Story = {
  args: {
    sensor: createSensor({ state: true, name: 'Block 2 Detector' }),
  },
}

export const Disabled: Story = {
  args: {
    sensor: createSensor({ enabled: false, name: 'Disabled Sensor' }),
  },
}

export const AnalogSensor: Story = {
  args: {
    sensor: createSensor({ type: 'analog', inputType: 'current', name: 'Current Sensor' }),
  },
}

export const DccExSensor: Story = {
  args: {
    sensor: createSensor({ type: 'dcc-ex', inputType: 'reed', name: 'DCC-EX Reed Switch' }),
  },
}

export const CustomColor: Story = {
  args: {
    sensor: createSensor({ name: 'Purple Sensor' }),
    color: 'purple',
  },
}

export const ClickInteraction: Story = {
  args: {
    sensor: createSensor({ name: 'Clickable Item' }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const item = canvas.getByText('Clickable Item')
    await expect(item).toBeInTheDocument()
    await userEvent.click(item)
  },
}
