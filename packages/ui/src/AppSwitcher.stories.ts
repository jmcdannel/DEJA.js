import type { Meta, StoryObj } from '@storybook/vue3'
import AppSwitcher from './AppSwitcher.vue'

const meta: Meta<typeof AppSwitcher> = {
  title: 'Chrome/AppSwitcher',
  component: AppSwitcher,
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'radio', options: ['row', 'column'] },
    showLabels: { control: 'boolean' },
    exclude: { control: 'object' },
  },
  decorators: [
    () => ({
      template: '<div class="p-4 flex items-center justify-center" style="min-height: 80px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof AppSwitcher>

export const Default: Story = {
  args: { direction: 'row', showLabels: false },
}

export const WithLabels: Story = {
  args: { direction: 'row', showLabels: true },
}

export const Column: Story = {
  args: { direction: 'column', showLabels: true },
}

export const ExcludeCurrentApp: Story = {
  name: 'Exclude Current App',
  args: { direction: 'row', showLabels: true, exclude: ['throttle'] },
}

export const InMenuFooter: Story = {
  name: 'In Menu Footer',
  render: () => ({
    components: { AppSwitcher },
    template: `
      <div class="w-64 bg-slate-900/95 rounded-lg overflow-hidden border border-white/10">
        <div class="p-3 text-white/50 text-xs">Menu items above…</div>
        <div class="flex-1" />
        <v-divider class="border-slate-700" />
        <div class="px-2 py-2">
          <AppSwitcher />
        </div>
      </div>
    `,
  }),
}
