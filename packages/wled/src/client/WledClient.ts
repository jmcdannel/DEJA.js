import type { WledState, WledSegment, WledInfo } from '../types/state'
import { WLED_DEFAULT_PORT } from '../types/device'

type StateChangeCallback = (state: WledState) => void
type DisconnectCallback = () => void

/**
 * Framework-agnostic WebSocket client for WLED devices.
 * Works in Node.js (via `ws` package) and browsers (native WebSocket).
 */
export class WledClient {
  private ws: WebSocket | null = null
  private _host: string
  private _port: number
  private _isConnected = false
  private stateCallbacks: StateChangeCallback[] = []
  private disconnectCallbacks: DisconnectCallback[] = []
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 5
  private readonly reconnectDelayMs = 3000

  constructor(host: string, port: number = WLED_DEFAULT_PORT) {
    this._host = host
    this._port = port
  }

  get host(): string { return this._host }
  get port(): number { return this._port }
  get isConnected(): boolean { return this._isConnected }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = `ws://${this._host}:${this._port}/ws`
        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
          this._isConnected = true
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event: MessageEvent) => {
          try {
            const data = JSON.parse(
              typeof event.data === 'string' ? event.data : event.data.toString()
            )
            if (data.state) {
              this.stateCallbacks.forEach((cb) => cb(data.state))
            } else if (data.seg !== undefined || data.on !== undefined) {
              this.stateCallbacks.forEach((cb) => cb(data as WledState))
            }
          } catch {
            // Non-JSON message, ignore
          }
        }

        this.ws.onclose = () => {
          this._isConnected = false
          this.disconnectCallbacks.forEach((cb) => cb())
          this.attemptReconnect()
        }

        this.ws.onerror = (_err) => {
          if (!this._isConnected) {
            reject(new Error(`Failed to connect to WLED at ${this._host}:${this._port}`))
          }
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  disconnect(): void {
    this.clearReconnect()
    if (this.ws) {
      this.ws.onclose = null
      this.ws.close()
      this.ws = null
    }
    this._isConnected = false
  }

  /** Fetch current state via HTTP JSON API */
  async getState(): Promise<WledState> {
    const res = await fetch(`http://${this._host}:${this._port}/json/state`)
    return res.json()
  }

  /** Fetch device info via HTTP JSON API */
  async getInfo(): Promise<WledInfo> {
    const res = await fetch(`http://${this._host}:${this._port}/json/info`)
    return res.json()
  }

  /** Fetch all effect names */
  async getEffects(): Promise<string[]> {
    const res = await fetch(`http://${this._host}:${this._port}/json/eff`)
    return res.json()
  }

  /** Fetch all palette names */
  async getPalettes(): Promise<string[]> {
    const res = await fetch(`http://${this._host}:${this._port}/json/pal`)
    return res.json()
  }

  /** Send partial state update — WLED merges with current state */
  setState(partial: Partial<WledState>): void {
    this.send(partial)
  }

  /** Update a single segment by ID */
  setSegment(id: number, seg: Partial<WledSegment>): void {
    this.send({ seg: [{ id, ...seg }] })
  }

  /** Register callback for state changes pushed by WLED */
  onStateChange(callback: StateChangeCallback): void {
    this.stateCallbacks.push(callback)
  }

  /** Register callback for disconnection */
  onDisconnect(callback: DisconnectCallback): void {
    this.disconnectCallbacks.push(callback)
  }

  private send(data: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return
    this.reconnectAttempts++
    // Exponential backoff: 3s, 6s, 12s, 24s, 48s
    const delay = this.reconnectDelayMs * Math.pow(2, this.reconnectAttempts - 1)
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // Will retry via onclose handler
      })
    }, delay)
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}
