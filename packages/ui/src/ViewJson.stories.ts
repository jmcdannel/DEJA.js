import type { Meta, StoryObj } from '@storybook/vue3'
import ViewJson from './ViewJson.vue'
import { createTurnout, createLoco, createDevice } from '../.storybook/mocks/data'

const meta: Meta<typeof ViewJson> = {
  title: 'Chrome/ViewJson',
  component: ViewJson,
  tags: ['autodocs'],
  argTypes: {
    json: { control: 'object' },
    label: { control: 'text' },
  },
  decorators: [
    () => ({
      template: '<div class="p-4" style="max-width: 600px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof ViewJson>

export const Default: Story = {
  args: {
    json: { name: 'Test Object', value: 42, nested: { key: 'data' } },
    label: 'View JSON',
  },
}

export const TurnoutData: Story = {
  args: {
    json: createTurnout(),
    label: 'Turnout Data',
  },
}

export const LocoData: Story = {
  args: {
    json: createLoco(),
    label: 'Locomotive Data',
  },
}

export const DeviceData: Story = {
  args: {
    json: createDevice(),
    label: 'Device Configuration',
  },
}

export const LargePayload: Story = {
  args: {
    json: {
      devices: [createDevice(), createDevice({ id: 'dev-2', name: 'Arduino Mega', type: 'deja-arduino' })],
      locos: [createLoco(), createLoco({ name: 'UP SD70M', address: 4 })],
      turnouts: [createTurnout(), createTurnout({ name: 'Yard Exit', state: true })],
    },
    label: 'Layout Snapshot',
  },
}
