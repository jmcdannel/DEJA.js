import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, userEvent, within } from '@storybook/test'
import SensorCard from './SensorCard.vue'
import { createSensor } from '../../.storybook/mocks/data'

const meta: Meta<typeof SensorCard> = {
  title: 'Sensors/SensorCard',
  component: SensorCard,
  tags: ['autodocs'],
  argTypes: {
    sensor: { control: 'object' },
    color: { control: 'color' },
  },
}

export default meta
type Story = StoryObj<typeof SensorCard>

export const Inactive: Story = {
  args: {
    sensor: createSensor({ state: false }),
  },
}

export const Active: Story = {
  args: {
    sensor: createSensor({ state: true, name: 'Block 3 Detector' }),
  },
}

export const WithBlockId: Story = {
  args: {
    sensor: createSensor({ blockId: 'block-main-1', name: 'Block Sensor' }),
  },
}

export const AnalogType: Story = {
  args: {
    sensor: createSensor({ type: 'analog', inputType: 'current', name: 'Current Detector', pin: 45 }),
  },
}

export const CustomColor: Story = {
  args: {
    sensor: createSensor({ name: 'Purple Card Sensor' }),
    color: 'purple',
  },
}

export const MinimalData: Story = {
  args: {
    sensor: createSensor({
      name: 'Minimal Sensor',
      device: undefined,
      pin: undefined,
      blockId: undefined,
      inputType: undefined,
    }),
  },
}

export const ClickInteraction: Story = {
  args: {
    sensor: createSensor({ name: 'Clickable Card' }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const cardTitle = canvas.getByText('Clickable Card')
    await expect(cardTitle).toBeInTheDocument()
    await userEvent.click(cardTitle)
  },
}
