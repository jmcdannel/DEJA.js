import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, userEvent, within } from '@storybook/test'
import SensorList from './SensorList.vue'
import { createSensor, createSensors } from '../../.storybook/mocks/data'

const meta: Meta<typeof SensorList> = {
  title: 'Sensors/SensorList',
  component: SensorList,
  tags: ['autodocs'],
  argTypes: {
    sensors: { control: 'object' },
    color: { control: 'color' },
  },
}

export default meta
type Story = StoryObj<typeof SensorList>

export const Default: Story = {
  args: {
    sensors: createSensors(4),
  },
}

export const SingleSensor: Story = {
  args: {
    sensors: [createSensor({ name: 'Block 1 IR Sensor' })],
  },
}

export const MixedStates: Story = {
  args: {
    sensors: [
      createSensor({ name: 'Active Sensor', state: true }),
      createSensor({ name: 'Inactive Sensor', state: false }),
      createSensor({ name: 'Disabled Sensor', state: false, enabled: false }),
    ],
  },
}

export const CustomColor: Story = {
  args: {
    sensors: createSensors(3),
    color: 'purple',
  },
}

export const Empty: Story = {
  args: {
    sensors: [],
  },
}

export const ClickInteraction: Story = {
  args: {
    sensors: [createSensor({ name: 'Clickable Sensor' })],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const listItem = canvas.getByText('Clickable Sensor')
    await expect(listItem).toBeInTheDocument()
    await userEvent.click(listItem)
  },
}
