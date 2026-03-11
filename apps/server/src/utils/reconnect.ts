import { log } from './logger.js'

/**
 * Configuration for exponential backoff reconnection.
 */
export interface ReconnectConfig {
  /** Base delay in milliseconds (default: 1000) */
  baseDelay: number
  /** Maximum delay in milliseconds (default: 30000) */
  maxDelay: number
  /** Label for log messages (e.g., "[SERIAL]", "[MQTT]") */
  label: string
}

const DEFAULT_CONFIG: ReconnectConfig = {
  baseDelay: 1000,
  maxDelay: 30_000,
  label: '[RECONNECT]',
}

/**
 * Manages exponential backoff reconnection for a single connection.
 *
 * Delays follow powers of 2: 1s, 2s, 4s, 8s, 16s, capped at maxDelay.
 * Calling `reset()` restores the attempt counter to zero.
 * Calling `stop()` cancels any pending reconnect timer.
 */
export class ReconnectManager {
  private attempts = 0
  private timer: ReturnType<typeof setTimeout> | null = null
  private stopped = false
  private readonly config: ReconnectConfig

  constructor(config?: Partial<ReconnectConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /** Number of reconnection attempts made since last reset / successful connect. */
  get attemptCount(): number {
    return this.attempts
  }

  /** Whether the manager has been explicitly stopped. */
  get isStopped(): boolean {
    return this.stopped
  }

  /**
   * Calculate the delay for the current attempt using exponential backoff.
   * Formula: min(baseDelay * 2^attempts, maxDelay)
   */
  private getDelay(): number {
    const { baseDelay, maxDelay } = this.config
    const delay = Math.min(baseDelay * Math.pow(2, this.attempts), maxDelay)
    return delay
  }

  /**
   * Schedule a reconnection attempt. Calls `connectFn` after the backoff delay.
   *
   * @param connectFn - async function that attempts to reconnect.
   *   Should return `true` on success, `false` on failure.
   */
  schedule(connectFn: () => Promise<boolean>): void {
    if (this.stopped) {
      log.warn(`${this.config.label} Reconnect manager is stopped, not scheduling`)
      return
    }

    // Clear any existing timer
    this.clearTimer()

    const delay = this.getDelay()
    this.attempts += 1

    log.await(
      `${this.config.label} Reconnecting in ${(delay / 1000).toFixed(1)}s (attempt ${this.attempts})`
    )

    this.timer = setTimeout(async () => {
      this.timer = null
      if (this.stopped) return

      try {
        const success = await connectFn()
        if (success) {
          log.success(`${this.config.label} Reconnected successfully after ${this.attempts} attempt(s)`)
          this.reset()
        } else {
          log.warn(`${this.config.label} Reconnection attempt ${this.attempts} failed`)
          this.schedule(connectFn)
        }
      } catch (error) {
        log.error(`${this.config.label} Reconnection attempt ${this.attempts} threw an error:`, error)
        this.schedule(connectFn)
      }
    }, delay)
  }

  /** Reset the attempt counter (call on successful connection). */
  reset(): void {
    this.attempts = 0
    this.stopped = false
    this.clearTimer()
  }

  /** Stop all reconnection attempts and cancel any pending timer. */
  stop(): void {
    this.stopped = true
    this.clearTimer()
    log.info(`${this.config.label} Reconnect manager stopped`)
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }
}
