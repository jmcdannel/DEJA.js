import { ref } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import type { Layout } from '@repo/modules'
import { db } from '@repo/firebase-config'

// Dynamically import the Capacitor socket plugin so web/Vercel builds don't fail.
// The plugin only exists in native Capacitor environments.
// Use a variable to hide the specifier from Vite's static import analysis.
const CAPACITOR_SOCKET_PKG = '@spryrocks/capacitor-socket-connection-plugin'
let SocketClass: (new () => unknown) | null = null
async function getSocketClass(): Promise<(new () => unknown) | null> {
  if (SocketClass) return SocketClass
  try {
    const mod = await import(/* @vite-ignore */ CAPACITOR_SOCKET_PKG)
    SocketClass = mod.Socket
    return SocketClass
  } catch {
    return null
  }
}

export type WiThrottleConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'

// Capacitor socket type — loaded dynamically since the plugin is only available in native builds
type CapacitorSocket = {
  open: (host: string, port: number) => Promise<void>
  close: () => Promise<void>
  write: (data: Uint8Array) => Promise<void>
  onData: ((data: Uint8Array) => void) | null
  onClose: (() => void) | null
  onError: ((err: unknown) => void) | null
  onStateChanged: ((state: string) => void) | null
}

export class WiThrottleService {
  private socket: CapacitorSocket | null = null
  private connectionTimer: ReturnType<typeof setInterval> | null = null

  public state = ref<WiThrottleConnectionState>('DISCONNECTED')
  public errorMessage = ref<string>('')

  // Roster arrays etc
  public roster = ref<{ id: string; name: string }[]>([])
  public turnouts = ref<{ id: string; name: string; state: number }[]>([])

  public async connect(): Promise<void> {
    const layoutId = useStorage<string>('@DEJA/layoutId', '').value
    if (!layoutId) {
      this.errorMessage.value = 'No layout selected'
      this.state.value = 'ERROR'
      return
    }

    try {
      const layoutSnap = await getDoc(doc(db, 'layouts', layoutId))
      if (!layoutSnap.exists()) throw new Error('Layout not found')
      const layoutData = layoutSnap.data() as Layout

      const connConfig = layoutData.throttleConnection
      if (connConfig?.type !== 'withrottle') {
        // If not explicitly set to WiThrottle, we default to the DEJA server.
        // For DEJA server via WiThrottle protocol (if eventually supported natively) or 
        // to just skip this TCP connection entirely.
        // For now, DEJA.js App uses Firebase / WebSockets for DEJA Server connection natively,
        // so we just mark it as "DISCONNECTED" from a TCP WiThrottle perspective,
        // since the UI doesn't need this socket to function when using DEJA Server mode.
        this.state.value = 'DISCONNECTED'
        this.errorMessage.value = ''
        return
      }

      const host = connConfig.host
      const port = connConfig.port || 44444

      if (!host) {
        this.errorMessage.value = 'Host IP address is required for WiThrottle connection'
        this.state.value = 'ERROR'
        return
      }
      
      this.state.value = 'CONNECTING'
      this.errorMessage.value = ''
      
      const Socket = await getSocketClass()
      if (!Socket) {
        this.handleDisconnect('WiThrottle requires a native Capacitor environment')
        return
      }
      this.socket = new Socket() as CapacitorSocket

      // Set up listeners
      this.socket.onData = (data: Uint8Array) => {
        this.handleData(data)
      }
      this.socket.onClose = () => {
        this.handleDisconnect('Connection closed by server')
      }
      this.socket.onError = (err: unknown) => {
        this.handleDisconnect(`Socket error: ${err instanceof Error ? err.message : String(err)}`)
      }
      this.socket.onStateChanged = (state: string) => {
        console.log('Socket state changed:', state)
      }

      await this.socket.open(host, port)
      
      this.state.value = 'CONNECTED'
      
      // Set a global flag so UI components (like AppHeader) know they can use sendDccCommand native override
      ;(window as unknown as Record<string, boolean>).__WI_THROTTLE_CONNECTED__ = true

      this.startHeartbeat()
      
      // Handshake: send hardware/app info
      await this.send('NDEJA Throttle')
      await this.send('HU1') // Hardware ID
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to connect'
      // If the Capacitor plugin isn't available (web builds), provide a clear message
      if (message.includes('Failed to fetch dynamically imported module') || message.includes('Cannot find module')) {
        this.handleDisconnect('WiThrottle requires a native (Capacitor) build — TCP sockets are not available in web browsers')
      } else {
        this.handleDisconnect(message)
      }
    }
  }

  public async disconnect(): Promise<void> {
    if (this.socket) {
      try {
        await this.socket.close()
      } catch (e) {
        console.error('Error closing socket', e)
      }
      this.socket = null
    }
    ;(window as unknown as Record<string, boolean>).__WI_THROTTLE_CONNECTED__ = false
    this.stopHeartbeat()
    this.state.value = 'DISCONNECTED'
  }

  private startHeartbeat() {
    this.connectionTimer = setInterval(() => {
      this.send('*')
    }, 10000)
  }

  private stopHeartbeat() {
    if (this.connectionTimer) {
      clearInterval(this.connectionTimer)
      this.connectionTimer = null
    }
  }

  public async send(data: string): Promise<void> {
    if (this.state.value !== 'CONNECTED' || !this.socket) {
      console.warn('Cannot send data, socket not connected')
      return
    }
    
    // WiThrottle commands typically end with newline
    const payload = data.endsWith('\n') ? data : `${data  }\n`
    try {
      const encoder = new TextEncoder()
      const uint8Array = encoder.encode(payload)
      await this.socket.write(uint8Array)
    } catch (e: unknown) {
      this.handleDisconnect(`Write error: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  private handleData(data: Uint8Array) {
    if (!data || data.length === 0) return
    
    try {
      const decoder = new TextDecoder()
      const text = decoder.decode(data)
      const commands = text.split('\n')
      
      for (const cmd of commands) {
        if (!cmd.trim()) continue
        this.parseCommand(cmd)
      }
    } catch (e) {
      console.error('Error parsing socket data', e)
    }
  }

  private parseCommand(cmd: string) {
    // Basic JMRI WiThrottle Protocol parser
    // Roster lists start with RL
    // Turnout lists start with PTL
    // Route lists start with PRL
    // Power status starts with PPA
    
    if (cmd.startsWith('RL')) {
      this.parseRoster(cmd.substring(2))
    } else if (cmd.startsWith('PTL')) {
      this.parseTurnoutList(cmd.substring(3))
    } else if (cmd.startsWith('PPA')) {
      // Power state: PPA1 = on, PPA0 = off
    }
    
    console.log('WiThrottle RX:', cmd)
  }

  private parseRoster(_data: string) {
    // Format: name}|{id}|{name}|{id}...
    const _parts = _data.split(']|[') // Actual delimiter is usually ]\[
    // Just a placeholder for roster parsing
  }

  private parseTurnoutList(_data: string) {
    // Format: id}|{name}|{state...
  }

  private handleDisconnect(reason: string) {
    this.stopHeartbeat()
    this.socket = null
    ;(window as unknown as Record<string, boolean>).__WI_THROTTLE_CONNECTED__ = false

    // If we get an error while connecting, transition to ERROR instead of just DISCONNECTED
    if (this.state.value === 'CONNECTING') {
      this.state.value = 'ERROR'
      this.errorMessage.value = reason
    } else {
      this.state.value = 'DISCONNECTED'
    }
  }
}

// Singleton instance
export const wiThrottleService = new WiThrottleService()
