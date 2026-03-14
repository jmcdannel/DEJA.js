import type { Meta, StoryObj } from '@storybook/vue3'
import NotificationContainer from './NotificationContainer.vue'
import { provideNotifications } from './useNotification'

const meta: Meta<typeof NotificationContainer> = {
  title: 'Notifications/NotificationContainer',
  component: NotificationContainer,
  tags: ['autodocs'],
  decorators: [
    (story) => ({
      setup() {
        provideNotifications()
        return {}
      },
      components: { story },
      template: '<div style="min-height: 300px; position: relative;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof NotificationContainer>

export const Default: Story = {
  render: () => ({
    components: { NotificationContainer },
    setup() {
      const { notify } = provideNotifications()
      return { notify }
    },
    template: `
      <div style="min-height: 300px; position: relative;">
        <NotificationContainer />
        <div class="d-flex ga-2 flex-wrap">
          <v-btn color="success" @click="notify.success('Turnout switched successfully')">Success</v-btn>
          <v-btn color="error" @click="notify.error('Failed to connect to device')">Error</v-btn>
          <v-btn color="info" @click="notify.info('Server status updated')">Info</v-btn>
          <v-btn color="warning" @click="notify.warning('Track power is off')">Warning</v-btn>
        </div>
      </div>
    `,
  }),
}

export const SuccessNotification: Story = {
  render: () => ({
    components: { NotificationContainer },
    setup() {
      const { notify } = provideNotifications()
      notify.success('Device connected successfully')
      return {}
    },
    template: '<div style="min-height: 200px; position: relative;"><NotificationContainer /></div>',
  }),
}

export const ErrorNotification: Story = {
  render: () => ({
    components: { NotificationContainer },
    setup() {
      const { notify } = provideNotifications()
      notify.error('Serial port connection failed: Device not found')
      return {}
    },
    template: '<div style="min-height: 200px; position: relative;"><NotificationContainer /></div>',
  }),
}

export const MultipleNotifications: Story = {
  render: () => ({
    components: { NotificationContainer },
    setup() {
      const { notify } = provideNotifications()
      notify.success('Turnout 1 switched to thrown')
      notify.info('Server heartbeat received')
      notify.warning('MQTT broker reconnecting...')
      return {}
    },
    template: '<div style="min-height: 300px; position: relative;"><NotificationContainer /></div>',
  }),
}
