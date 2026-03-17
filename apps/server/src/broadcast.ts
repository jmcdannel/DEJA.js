import { EventEmitter } from 'node:events'
import { log } from './utils/logger'

export interface BroadcastMessage {
  action: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Broadcast payloads vary by action and are defined per-module; a generic type would add complexity without safety
  payload: any
}

/**
 * Typed event emitter for the DEJA broadcast system.
 *
 * Modules call `dejaEmitter.broadcast(data)` to emit messages.
 * Transport layers (WebSocket, MQTT, Cloud) register listeners
 * via `dejaEmitter.on('broadcast', handler)` at startup.
 *
 * This decouples business logic modules from transport implementation details.
 */
class DejaEventEmitter extends EventEmitter {
  /** Emit a broadcast event to all registered transport listeners. */
  broadcast(data: BroadcastMessage): void {
    this.emit('broadcast', data)
  }

  /** Register a listener for broadcast events. */
  onBroadcast(listener: (data: BroadcastMessage) => void): this {
    return this.on('broadcast', listener)
  }

  /** Remove a broadcast event listener. */
  offBroadcast(listener: (data: BroadcastMessage) => void): this {
    return this.off('broadcast', listener)
  }
}

/** Singleton event emitter for the DEJA broadcast system. */
export const dejaEmitter = new DejaEventEmitter()

/**
 * Broadcast a message to all registered transport listeners.
 *
 * This is a convenience wrapper around `dejaEmitter.broadcast()` that
 * maintains backward compatibility with existing call sites. It also
 * handles string-to-object conversion and error logging.
 */
export const broadcast = (data: string | BroadcastMessage): void => {
  try {
    const message: BroadcastMessage =
      typeof data === 'string' ? JSON.parse(data) as BroadcastMessage : data
    dejaEmitter.broadcast(message)
  } catch (err) {
    log.fatal('[DEJA.js] Error sending broadcast:', err, data, typeof data)
  }
}

export default { broadcast, dejaEmitter }
