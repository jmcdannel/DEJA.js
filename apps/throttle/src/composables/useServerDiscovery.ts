import { ref } from 'vue'

// Dynamic import guard — mDNS requires native Capacitor environment.
// Plugin: capacitor-zeroconf (requires Capacitor >= 7; upgrade from v6 is a prerequisite)
// Install: pnpm add capacitor-zeroconf && npx cap sync
const ZEROCONF_PKG = 'capacitor-zeroconf'

export interface DiscoveredServer {
  name: string
  host: string
  port: number
}

let pluginInstance: any = null

async function getZeroConf(): Promise<any | null> {
  if (pluginInstance) return pluginInstance
  try {
    const mod = await import(/* @vite-ignore */ ZEROCONF_PKG)
    pluginInstance = mod.ZeroConf
    return pluginInstance
  } catch {
    return null
  }
}

export function useServerDiscovery() {
  const isScanning = ref(false)
  const discoveredServers = ref<DiscoveredServer[]>([])
  const isAvailable = ref<boolean | null>(null) // null = not yet checked

  let stopFn: (() => Promise<void>) | null = null

  async function checkAvailability(): Promise<boolean> {
    const zc = await getZeroConf()
    isAvailable.value = zc !== null
    return isAvailable.value
  }

  async function startScan(): Promise<void> {
    discoveredServers.value = []
    isScanning.value = true

    const zc = await getZeroConf()
    if (!zc) {
      isAvailable.value = false
      isScanning.value = false
      return
    }

    isAvailable.value = true

    try {
      const listener = await zc.addListener('discover', (result: any) => {
        if (result.action === 'resolved') {
          const svc = result.service
          const host = svc.ipv4Addresses?.[0] ?? svc.hostname ?? ''
          if (host && svc.port) {
            // Deduplicate by host:port
            const exists = discoveredServers.value.some(
              s => s.host === host && s.port === svc.port
            )
            if (!exists) {
              discoveredServers.value.push({
                name: svc.name || `WiThrottle @ ${host}`,
                host,
                port: svc.port,
              })
            }
          }
        }
      })

      await zc.watch({ type: '_withrottle._tcp.', domain: 'local.' })

      stopFn = async () => {
        try {
          await zc.unwatch({ type: '_withrottle._tcp.', domain: 'local.' })
          await listener.remove()
        } catch {}
      }

      // Auto-stop after 10 seconds
      setTimeout(() => stopScan(), 10_000)
    } catch (e) {
      console.error('ZeroConf scan error', e)
      isScanning.value = false
    }
  }

  async function stopScan(): Promise<void> {
    if (stopFn) {
      await stopFn()
      stopFn = null
    }
    isScanning.value = false
  }

  return {
    isScanning,
    isAvailable,
    discoveredServers,
    startScan,
    stopScan,
    checkAvailability,
  }
}
