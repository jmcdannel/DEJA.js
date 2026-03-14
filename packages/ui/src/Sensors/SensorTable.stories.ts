import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, within } from '@storybook/test'
import SensorTable from './SensorTable.vue'
import { createSensor, createSensors } from '../../.storybook/mocks/data'

const meta: Meta<typeof SensorTable> = {
  title: 'Sensors/SensorTable',
  component: SensorTable,
  tags: ['autodocs'],
  argTypes: {
    sensors: { control: 'object' },
  },
}

export default meta
type Story = StoryObj<typeof SensorTable>

export const Default: Story = {
  args: {
    sensors: createSensors(5),
  },
}

export const SingleSensor: Story = {
  args: {
    sensors: [createSensor({ name: 'Solo Sensor', device: 'mega-01' })],
  },
}

export const MixedTypes: Story = {
  args: {
    sensors: [
      createSensor({ name: 'IR Detector', type: 'digital', inputType: 'ir', device: 'arduino-01' }),
      createSensor({ name: 'Current Sensor', type: 'analog', inputType: 'current', device: 'arduino-02' }),
      createSensor({ name: 'Reed Switch', type: 'dcc-ex', inputType: 'reed', device: 'dcc-ex-01' }),
    ],
  },
}

export const MixedStates: Story = {
  args: {
    sensors: [
      createSensor({ name: 'Active Sensor', state: true, enabled: true }),
      createSensor({ name: 'Inactive Sensor', state: false, enabled: true }),
      createSensor({ name: 'Disabled Sensor', state: false, enabled: false }),
    ],
  },
}

export const EmptyTable: Story = {
  args: {
    sensors: [],
  },
}

export const VerifyHeaders: Story = {
  args: {
    sensors: createSensors(2),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Name')).toBeInTheDocument()
    await expect(canvas.getByText('Type')).toBeInTheDocument()
    await expect(canvas.getByText('Device')).toBeInTheDocument()
    await expect(canvas.getByText('State')).toBeInTheDocument()
  },
}
