import type { Meta, StoryObj } from '@storybook/vue3'
import BackgroundSettings from './BackgroundSettings.vue'

const meta: Meta<typeof BackgroundSettings> = {
  title: 'Backgrounds/BackgroundSettings',
  component: BackgroundSettings,
  tags: ['autodocs'],
  argTypes: {
    appName: { control: 'text' },
    pages: { control: 'object' },
  },
  decorators: [
    () => ({
      template: '<div class="p-4" style="max-width: 600px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof BackgroundSettings>

export const Default: Story = {
  args: {
    appName: 'throttle',
  },
}

export const WithPages: Story = {
  args: {
    appName: 'throttle',
    pages: [
      { path: '/throttle', label: 'Throttle', icon: 'mdi-gamepad-variant' },
      { path: '/turnouts', label: 'Turnouts', icon: 'mdi-source-branch' },
      { path: '/effects', label: 'Effects', icon: 'mdi-magic-staff' },
      { path: '/signals', label: 'Signals', icon: 'mdi-traffic-light' },
      { path: '/routes', label: 'Routes', icon: 'mdi-map' },
    ],
  },
}

export const CloudApp: Story = {
  args: {
    appName: 'cloud',
    pages: [
      { path: '/dashboard', label: 'Dashboard', icon: 'mdi-view-dashboard' },
      { path: '/roster', label: 'Roster', icon: 'mdi-train' },
      { path: '/turnouts', label: 'Turnouts', icon: 'mdi-source-branch' },
      { path: '/effects', label: 'Effects', icon: 'mdi-magic-staff' },
    ],
  },
}

export const NoPages: Story = {
  args: {
    appName: 'monitor',
  },
}
