import type { Meta, StoryObj } from '@storybook/vue3'
import ListMenu from './ListMenu.vue'

const meta: Meta<typeof ListMenu> = {
  title: 'Navigation/ListMenu',
  component: ListMenu,
  tags: ['autodocs'],
  argTypes: {
    moduleName: { control: 'text' },
    disabledMenus: { control: 'object' },
    viewOptions: { control: 'object' },
    sortOptions: { control: 'object' },
    filterOptions: { control: 'object' },
    menuOptions: { control: 'object' },
  },
  decorators: [
    () => ({
      template: '<div class="p-4" style="min-height: 200px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof ListMenu>

export const Default: Story = {
  args: {
    moduleName: 'turnouts',
  },
}

export const SignalsModule: Story = {
  args: {
    moduleName: 'signals',
  },
}

export const WithCustomViewOptions: Story = {
  args: {
    moduleName: 'turnouts',
    viewOptions: [
      { title: 'Switch', value: 'switch' },
      { title: 'Card', value: 'card' },
      { title: 'Table', value: 'table' },
      { title: 'CTC Switch', value: 'ctc' },
    ],
  },
}

export const WithDisabledMenus: Story = {
  args: {
    moduleName: 'effects',
    disabledMenus: ['sort', 'filter'],
  },
}

export const EffectsModule: Story = {
  args: {
    moduleName: 'effects',
    viewOptions: [
      { title: 'Button', value: 'button' },
      { title: 'Card', value: 'card' },
      { title: 'Switch', value: 'switch' },
    ],
  },
}
