import { Socket } from '@spryrocks/capacitor-socket-connection-plugin'
import { ref } from 'vue'

export type WiThrottleConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'

export class WiThrottleService {
  private host: string
  private port: number
  private socket: Socket | null = null
  private connectionTimer: ReturnType<typeof setInterval> | null = null

  public state = ref<WiThrottleConnectionState>('DISCONNECTED')
  public errorMessage = ref<string>('')

  // Roster arrays etc
  public roster = ref<{ id: string; name: string }[]>([])
  public turnouts = ref<{ id: string; name: string; state: number }[]>([])

  constructor() {
    this.host = ''
    this.port = 44444
  }

  public setHost(host: string, port: number = 44444) {
    this.host = host
    this.port = port
  }

  public async connect(): Promise<void> {
    if (!this.host) {
      this.errorMessage.value = 'Host IP address is required'
      this.state.value = 'ERROR'
      return
    }

    try {
      this.state.value = 'CONNECTING'
      this.errorMessage.value = ''
      
      this.socket = new Socket()

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

      await this.socket.open(this.host, this.port)
      
      this.state.value = 'CONNECTED'
      this.startHeartbeat()
      
      // Handshake: send hardware/app info
      await this.send('NDEJA Throttle')
      await this.send('HU1') // Hardware ID
    } catch (e: any) {
      this.handleDisconnect(e.message || 'Failed to connect')
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
    const payload = data.endsWith('\n') ? data : data + '\n'
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

  private parseRoster(data: string) {
    // Format: name}|{id}|{name}|{id}...
    const parts = data.split(']|[') // Actual delimiter is usually ]\[
    // Just a placeholder for roster parsing
  }

  private parseTurnoutList(data: string) {
    // Format: id}|{name}|{state...
  }

  private handleDisconnect(reason: string) {
    this.stopHeartbeat()
    this.socket = null
    
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
