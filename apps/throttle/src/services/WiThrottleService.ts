import { ref } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import type { Layout } from '@repo/modules'
import { db } from '@repo/firebase-config'
import { WI_THROTTLE_EVENTS } from '@repo/ui/src/constants/wiThrottleEvents'

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
  // Map from loco DCC address → single-char throttle identifier (A, B, C…)
  private acquiredLocos = new Map<number, string>()
  private nextCharCode = 65 // 'A'
  private releasedChars: string[] = [] // Pool of released chars for reuse

  public state = ref<WiThrottleConnectionState>('DISCONNECTED')
  public errorMessage = ref<string>('')
  public roster = ref<{ id: string; name: string }[]>([])
  public trackPower = ref<0 | 1 | 2>(2) // 0=off, 1=on, 2=unknown

  constructor() {}

  private getRosterAddress(address: number): string {
    // WiThrottle uses S-prefix for short addresses (≤127) and L-prefix for long
    return address > 127 ? `L${address}` : `S${address}`
  }

  private getThrottleChar(address: number): string | null {
    return this.acquiredLocos.get(address) ?? null
  }

  private resetState() {
    this.acquiredLocos.clear()
    this.nextCharCode = 65
    this.releasedChars = []
    this.trackPower.value = 2
  }

  /** Acquire a loco on the WiThrottle server. Must be called before sending speed/function commands. */
  public async acquireLoco(address: number): Promise<void> {
    if (this.state.value !== 'CONNECTED') return
    if (this.acquiredLocos.has(address)) return
    // Reuse a released char slot, or allocate next (max 26 locos: A–Z)
    const char = this.releasedChars.pop() ?? (
      this.nextCharCode <= 90
        ? String.fromCharCode(this.nextCharCode++)
        : null
    )
    if (!char) {
      console.warn('WiThrottle: max 26 locos can be acquired simultaneously')
      return
    }
    this.acquiredLocos.set(address, char)
    const roster = this.getRosterAddress(address)
    await this.send(`M${char}+${roster}<;>${roster}`)
  }

  /** Release a loco from the WiThrottle server. */
  public async releaseLoco(address: number): Promise<void> {
    const char = this.getThrottleChar(address)
    if (!char) return
    const roster = this.getRosterAddress(address)
    await this.send(`M${char}-${roster}<;>r`)
    this.acquiredLocos.delete(address)
    this.releasedChars.push(char)
  }

  /** Send a speed + direction update for an acquired loco. */
  public async setThrottleSpeed(address: number, speed: number, direction: boolean): Promise<void> {
    if (this.state.value !== 'CONNECTED') return
    const char = this.getThrottleChar(address)
    if (!char) return
    const roster = this.getRosterAddress(address)
    // Send speed before direction — sequential is intentional for TCP ordering
    await this.send(`M${char}A${roster}<;>V${speed}`)
    await this.send(`M${char}A${roster}<;>R${direction ? 1 : 0}`)
  }

  /** Send a function on/off command for an acquired loco. */
  public async setThrottleFunction(address: number, func: number, state: boolean): Promise<void> {
    if (this.state.value !== 'CONNECTED') return
    const char = this.getThrottleChar(address)
    if (!char) return
    const roster = this.getRosterAddress(address)
    await this.send(`M${char}A${roster}<;>F${state ? 1 : 0}${func}`)
  }

  /** Send emergency stop to all currently acquired locos. */
  public async emergencyStopAll(): Promise<void> {
    if (this.state.value !== 'CONNECTED') return
    await Promise.all(
      Array.from(this.acquiredLocos.values()).map(char => this.send(`M${char}A*<;>X`))
    )
  }

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
      await this.send('*+') // enable heartbeat monitoring
      const clientId = useStorage('@DEJA/wiThrottleClientId', crypto.randomUUID()).value
      await this.send(`HU${clientId}`)
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
    if (this.state.value === 'CONNECTED') {
      // Release all acquired locos gracefully in parallel
      await Promise.all(
        Array.from(this.acquiredLocos.keys()).map(address => this.releaseLoco(address))
      )
      await this.send('Q')
    }
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
    this.resetState()
    this.state.value = 'DISCONNECTED'
  }

  private startHeartbeat(intervalMs = 10000) {
    this.stopHeartbeat()
    this.connectionTimer = setInterval(() => {
      this.send('*')
    }, intervalMs)
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

    // Server heartbeat interval response: *<seconds>
    if (cmd.startsWith('*') && cmd.length > 1 && /^\*\d+$/.test(cmd)) {
      const seconds = parseInt(cmd.substring(1), 10)
      if (!isNaN(seconds) && seconds > 0) {
        this.startHeartbeat(seconds * 900) // 90% of server interval in ms
      }
    }

    if (cmd.startsWith('RL')) {
      this.parseRoster(cmd.substring(2))
    } else if (cmd.startsWith('PTL')) {
      this.parseTurnoutList(cmd.substring(3))
    } else if (cmd.startsWith('PPA')) {
      const state = parseInt(cmd.substring(3), 10)
      if (state === 0 || state === 1 || state === 2) {
        this.trackPower.value = state as 0 | 1 | 2
        window.dispatchEvent(new CustomEvent(WI_THROTTLE_EVENTS.POWER_STATE, { detail: { state } }))
      }
    }

    // Parse function state updates: M<t>A<addr><;>F<state><num>
    const fnStateMatch = /^M[0-9TGS]A(.+)<;>F([01])(\d+)$/.exec(cmd)
    if (fnStateMatch) {
      const addrStr = fnStateMatch[1] // e.g. 'S3' or 'L341'
      const state = fnStateMatch[2] === '1'
      const func = parseInt(fnStateMatch[3], 10)
      const address = parseInt(addrStr.substring(1), 10)
      if (!isNaN(address) && !isNaN(func)) {
        window.dispatchEvent(new CustomEvent(WI_THROTTLE_EVENTS.FUNCTION_STATE, {
          detail: { address, func, state },
        }))
      }
    }

    // Parse function label lists: M<t>L<addr><;>]\[label1]\[label2...
    const fnLabelMatch = /^M[0-9TGS]L(.+)<;>(.*)$/.exec(cmd)
    if (fnLabelMatch) {
      const addrStr = fnLabelMatch[1]
      const labelsRaw = fnLabelMatch[2]
      const address = parseInt(addrStr.substring(1), 10)
      const labels = labelsRaw.split(']\\[').filter(s => s.length > 0)
      if (!isNaN(address)) {
        window.dispatchEvent(new CustomEvent(WI_THROTTLE_EVENTS.FUNCTION_LABELS, {
          detail: { address, labels },
        }))
      }
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
    this.resetState()

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
