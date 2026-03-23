import { ref, readonly, computed, watch } from 'vue'
import { createLogger } from '@repo/utils'
import { useConnectionStatus } from '@/composables/useConnectionStatus'

const log = createLogger('CommandQueue')

interface QueuedCommand {
  id: number
  execute: () => Promise<void>
  description: string
  timestamp: number
}

const MAX_QUEUE_SIZE = 50
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

const queue = ref<QueuedCommand[]>([])
const isFlushing = ref(false)
let nextId = 0

/**
 * Wraps a Firebase write with offline queuing and retry logic.
 *
 * When online, the write executes immediately with up to {@link MAX_RETRIES}
 * retries on failure. When offline, the command is queued and automatically
 * flushed when the connection is restored.
 */
export function useCommandQueue() {
  const { isOnline, wasOffline: _wasOffline, acknowledgeReconnection } = useConnectionStatus()

  // Watch for reconnection and flush the queue
  watch(isOnline, (online) => {
    if (online && queue.value.length > 0) {
      flushQueue()
    }
  })

  /**
   * Execute a Firebase write with retry and offline queuing.
   *
   * @param execute - Async function that performs the Firebase write
   * @param description - Human-readable label for logging
   */
  async function enqueue(execute: () => Promise<void>, description: string): Promise<void> {
    if (!isOnline.value) {
      addToQueue(execute, description)
      return
    }

    try {
      await executeWithRetry(execute, description)
    } catch {
      log.debug(`Command failed after retries, queuing: ${description}`)
      addToQueue(execute, description)
    }
  }

  function addToQueue(execute: () => Promise<void>, description: string) {
    if (queue.value.length >= MAX_QUEUE_SIZE) {
      // Drop the oldest command to prevent unbounded growth
      const dropped = queue.value.shift()
      if (dropped) {
        log.debug(`Queue full, dropping oldest command: ${dropped.description}`)
      }
    }

    queue.value.push({
      id: nextId++,
      execute,
      description,
      timestamp: Date.now(),
    })

    log.debug(`Queued command: ${description} (${queue.value.length} pending)`)
  }

  async function executeWithRetry(execute: () => Promise<void>, description: string): Promise<void> {
    let lastError: unknown

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await execute()
        return
      } catch (error: unknown) {
        lastError = error
        log.debug(`Retry ${attempt}/${MAX_RETRIES} for: ${description}`)

        if (attempt < MAX_RETRIES) {
          await delay(RETRY_DELAY_MS * attempt)
        }
      }
    }

    throw lastError
  }

  async function flushQueue(): Promise<void> {
    if (isFlushing.value || queue.value.length === 0) return

    isFlushing.value = true
    log.debug(`Flushing ${queue.value.length} queued commands`)

    // Copy and clear the queue so new commands during flush go to a fresh queue
    const pending = [...queue.value]
    queue.value = []

    let successCount = 0
    let failCount = 0

    for (const command of pending) {
      if (!isOnline.value) {
        // Connection lost again — re-queue remaining commands
        const remaining = pending.slice(pending.indexOf(command))
        queue.value = [...remaining, ...queue.value]
        log.debug(`Connection lost during flush, re-queued ${remaining.length} commands`)
        break
      }

      try {
        await executeWithRetry(command.execute, command.description)
        successCount++
      } catch {
        failCount++
        log.debug(`Failed to flush command: ${command.description}`)
      }
    }

    if (successCount > 0) {
      log.debug(`Flushed ${successCount} commands successfully`)
    }
    if (failCount > 0) {
      log.debug(`${failCount} commands failed during flush`)
    }

    acknowledgeReconnection()
    isFlushing.value = false
  }

  function clearQueue() {
    const count = queue.value.length
    queue.value = []
    if (count > 0) {
      log.debug(`Cleared ${count} queued commands`)
    }
  }

  return {
    /** Execute a write with retry, queuing if offline */
    enqueue,
    /** Number of commands waiting in the queue */
    queueSize: computed(() => queue.value.length),
    /** The reactive queue (read-only) */
    queue: readonly(queue),
    /** Whether the queue is currently being flushed */
    isFlushing: readonly(isFlushing),
    /** Manually flush queued commands */
    flushQueue,
    /** Clear all queued commands */
    clearQueue,
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
