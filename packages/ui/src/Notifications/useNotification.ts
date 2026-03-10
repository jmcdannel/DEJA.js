import { ref, type InjectionKey, provide, inject } from 'vue'

type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface Notification {
  id: number
  message: string
  type: NotificationType
  timeout: number
}

interface NotifyMethods {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

interface NotificationContext {
  notifications: typeof notifications
  notify: NotifyMethods
  dismiss: (id: number) => void
}

const NOTIFICATION_KEY: InjectionKey<NotificationContext> = Symbol('notifications')

const MAX_VISIBLE = 3
const DEFAULT_TIMEOUT = 5000
const ERROR_TIMEOUT = 8000

const notifications = ref<Notification[]>([])
let nextId = 0

function addNotification(message: string, type: NotificationType) {
  const timeout = type === 'error' ? ERROR_TIMEOUT : DEFAULT_TIMEOUT
  const id = nextId++

  notifications.value.push({ id, message, type, timeout })

  if (notifications.value.length > MAX_VISIBLE) {
    notifications.value = notifications.value.slice(-MAX_VISIBLE)
  }

  setTimeout(() => {
    dismiss(id)
  }, timeout)
}

function dismiss(id: number) {
  notifications.value = notifications.value.filter((n) => n.id !== id)
}

const notify: NotifyMethods = {
  success: (message: string) => addNotification(message, 'success'),
  error: (message: string) => addNotification(message, 'error'),
  info: (message: string) => addNotification(message, 'info'),
  warning: (message: string) => addNotification(message, 'warning'),
}

export function provideNotifications() {
  const context: NotificationContext = { notifications, notify, dismiss }
  provide(NOTIFICATION_KEY, context)
  return context
}

export function useNotification() {
  const context = inject(NOTIFICATION_KEY, undefined)
  if (context) {
    return context
  }
  return { notifications, notify, dismiss }
}

export type { Notification, NotificationType, NotifyMethods }
