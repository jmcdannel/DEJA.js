import type { Meta, StoryObj } from '@storybook/vue3'
import Logo from './Logo.vue'

const meta: Meta<typeof Logo> = {
  title: 'Chrome/Logo',
  component: Logo,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
    },
    showIcon: { control: 'boolean' },
    appTitle: { control: 'text' },
    variant: {
      control: 'select',
      options: ['default', 'cloud', 'throttle', 'monitor', 'tour'],
    },
    stacked: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Logo>

export const Default: Story = {
  args: {
    size: 'md',
    showIcon: true,
    variant: 'default',
  },
}

export const WithAppTitle: Story = {
  args: {
    size: 'md',
    showIcon: true,
    appTitle: 'Throttle',
    variant: 'throttle',
  },
}

export const AllSizes: Story = {
  render: () => ({
    components: { Logo },
    template: `
      <div class="flex flex-col gap-6 p-4">
        <Logo size="xs" variant="default" />
        <Logo size="sm" variant="default" />
        <Logo size="md" variant="default" />
        <Logo size="lg" variant="default" />
        <Logo size="xl" variant="default" />
        <Logo size="2xl" variant="default" />
        <Logo size="3xl" variant="default" />
      </div>
    `,
  }),
}

export const AllVariants: Story = {
  render: () => ({
    components: { Logo },
    template: `
      <div class="flex flex-col gap-4 p-4">
        <Logo size="lg" variant="default" app-title="Default" />
        <Logo size="lg" variant="cloud" app-title="Cloud" />
        <Logo size="lg" variant="throttle" app-title="Throttle" />
        <Logo size="lg" variant="monitor" app-title="Monitor" />
        <Logo size="lg" variant="tour" app-title="Tour" />
      </div>
    `,
  }),
}

export const Stacked: Story = {
  args: {
    size: 'sm',
    showIcon: true,
    appTitle: 'Throttle',
    variant: 'throttle',
    stacked: true,
  },
}

export const StackedVsInline: Story = {
  render: () => ({
    components: { Logo },
    template: `
      <div class="flex flex-col gap-8 p-4">
        <div>
          <p class="text-sm text-gray-400 mb-2">Inline (desktop)</p>
          <Logo size="md" variant="throttle" app-title="Throttle" />
        </div>
        <div>
          <p class="text-sm text-gray-400 mb-2">Stacked (mobile)</p>
          <Logo size="sm" variant="throttle" app-title="Throttle" :stacked="true" />
        </div>
        <div>
          <p class="text-sm text-gray-400 mb-2">Stacked — all variants</p>
          <div class="flex flex-col gap-4">
            <Logo size="sm" variant="default" app-title="Default" :stacked="true" />
            <Logo size="sm" variant="cloud" app-title="Cloud" :stacked="true" />
            <Logo size="sm" variant="throttle" app-title="Throttle" :stacked="true" />
            <Logo size="sm" variant="monitor" app-title="Monitor" :stacked="true" />
            <Logo size="sm" variant="tour" app-title="Tour" :stacked="true" />
          </div>
        </div>
      </div>
    `,
  }),
}

export const NoIcon: Story = {
  args: {
    size: 'lg',
    showIcon: false,
    variant: 'default',
  },
}
