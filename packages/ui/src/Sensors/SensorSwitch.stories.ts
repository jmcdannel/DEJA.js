import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, userEvent, within } from '@storybook/test'
import SensorSwitch from './SensorSwitch.vue'
import { createSensor } from '../../.storybook/mocks/data'

const meta: Meta<typeof SensorSwitch> = {
  title: 'Sensors/SensorSwitch',
  component: SensorSwitch,
  tags: ['autodocs'],
  argTypes: {
    sensor: { control: 'object' },
    color: { control: 'color' },
  },
}

export default meta
type Story = StoryObj<typeof SensorSwitch>

export const Inactive: Story = {
  args: {
    sensor: createSensor({ state: false }),
  },
}

export const Active: Story = {
  args: {
    sensor: createSensor({ state: true, name: 'Active Block Sensor' }),
  },
}

export const Disabled: Story = {
  args: {
    sensor: createSensor({ enabled: false, name: 'Disabled Sensor' }),
  },
}

export const CustomColor: Story = {
  args: {
    sensor: createSensor({ name: 'Purple Sensor' }),
    color: 'purple',
  },
}

export const ToggleInteraction: Story = {
  args: {
    sensor: createSensor({ name: 'Toggle Sensor', enabled: true }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switchInput = canvas.getByRole('checkbox')
    await expect(switchInput).toBeInTheDocument()
    await userEvent.click(switchInput)
  },
}

export const DisabledNoToggle: Story = {
  args: {
    sensor: createSensor({ name: 'Cannot Toggle', enabled: false }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switchInput = canvas.getByRole('checkbox')
    await expect(switchInput).toBeDisabled()
  },
}
