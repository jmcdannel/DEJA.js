import type { Meta, StoryObj } from '@storybook/vue3'
import EffectItem from './EffectItem.vue'
import { createEffect, createSoundEffect, createMacroEffect } from '../../.storybook/mocks/data'

const meta: Meta<typeof EffectItem> = {
  title: 'Effects/EffectItem',
  component: EffectItem,
  tags: ['autodocs'],
  argTypes: {
    effect: { control: 'object' },
    viewAs: {
      control: 'select',
      options: ['switch', 'card', 'button', 'raw'],
    },
  },
}

export default meta
type Story = StoryObj<typeof EffectItem>

export const DefaultButton: Story = {
  args: {
    effect: createEffect(),
  },
}

export const ViewAsSwitch: Story = {
  args: {
    effect: createEffect({ name: 'Station Lights' }),
    viewAs: 'switch',
  },
}

export const ViewAsCard: Story = {
  args: {
    effect: createEffect({ name: 'Yard Floodlights', color: 'amber' }),
    viewAs: 'card',
  },
}

export const ViewAsButton: Story = {
  args: {
    effect: createSoundEffect({ name: 'Horn Blast' }),
    viewAs: 'button',
  },
}

export const ViewAsRaw: Story = {
  args: {
    effect: createMacroEffect({ name: 'Debug Macro' }),
    viewAs: 'raw',
  },
}

export const ActiveState: Story = {
  args: {
    effect: createEffect({ state: true, name: 'Active Light' }),
    viewAs: 'button',
  },
}
