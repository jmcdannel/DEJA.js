import type { DocumentData } from 'firebase-admin/firestore'
import type { Signal } from '@repo/modules/signals'
import { log } from '../utils/logger.js'
import { handleEffect } from './effects.js'

type SignalColor = 'red' | 'yellow' | 'green'

const COLORS: SignalColor[] = ['red', 'yellow', 'green']

function toBooleanState(isActive: boolean, commonAnode?: boolean | null): boolean {
  return commonAnode ? !isActive : isActive
}

async function applySignalAspect(signal: Signal): Promise<void> {
  if (!signal.device) {
    log.error('[SIGNALS] Missing device on signal', signal)
    return
  }

  const tasks = COLORS.map(async (color) => {
    const rawPin = signal[color]
    const pinValue = typeof rawPin === 'string' ? parseInt(rawPin, 10) : rawPin
    if (typeof pinValue !== 'number' || Number.isNaN(pinValue)) {
      return
    }

    const isActive = signal.aspect === color
    const state = toBooleanState(isActive, signal.commonAnode)

    try {
      await handleEffect({
        id: `${signal.id}-${color}`,
        device: signal.device,
        pin: pinValue,
        type: 'pin',
        state,
      } as any)
    } catch (error) {
      log.error('[SIGNALS] Failed to send pin command', { signalId: signal.id, color, error })
    }
  })

  await Promise.all(tasks)
}

export async function handleSignalChange(snapshot: DocumentData): Promise<void> {
  snapshot.docChanges().forEach(async (change: DocumentData) => {
    const data = change.doc.data() as Signal | undefined
    if (!data) return

    const signal: Signal = {
      ...data,
      id: change.doc.id,
    }

    if (change.type === 'added' || change.type === 'modified') {
      await applySignalAspect(signal)
    }

    if (change.type === 'removed') {
      // Turn off all aspects when a signal is removed
      await applySignalAspect({
        ...signal,
        aspect: null,
      })
    }
  })
}

export default {
  handleSignalChange,
}
