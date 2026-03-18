import { computed } from 'vue'
import { useStorage } from '@vueuse/core'

function getDefaultWsHost(): string {
  if (typeof window === 'undefined') {
    return 'localhost:8082'
  }

  const hostname = window.location.hostname

  // On local network, default to same host with WS port
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.')
  ) {
    return `${hostname}:8082`
  }

  // On remote host (Vercel, etc.), default to permanent tunnel domain
  return 'ws.dejajs.com'
}

export function resolveWsUrl(host: string | undefined): string | undefined {
  if (!host) {
    return undefined
  }

  const trimmed = host.trim()
  if (!trimmed) {
    return undefined
  }

  if (trimmed.startsWith('ws://') || trimmed.startsWith('wss://')) {
    return trimmed
  }

  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
    return `${protocol}${trimmed}`
  }

  return `ws://${trimmed}`
}

export function useWsConnection() {
  const wshost = useStorage('@DEJA/pref/ws-host', getDefaultWsHost())
  const wsUrl = computed(() => resolveWsUrl(wshost.value))

  return { wshost, wsUrl }
}
