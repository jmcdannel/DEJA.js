import { createLogger } from '@repo/utils'

const log = createLogger('ThrottleUtils')

export function getSignedSpeed({ speed, direction }
: { speed: number; direction?: boolean }): number {
  if (typeof speed !== 'number' || isNaN(speed)) {
    log.warn('Invalid speed value:', speed)
    return 0
  }
  if (typeof direction !== 'boolean') {
    log.warn('Invalid direction value:', direction)
    return speed
  }
  return speed && Boolean(direction) ? speed : -speed || 0
}
