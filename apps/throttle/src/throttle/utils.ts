export function getSignedSpeed({ speed, direction }
: { speed: number; direction?: boolean }): number {
  if (typeof speed !== 'number' || isNaN(speed)) {
    console.warn('Invalid speed value:', speed)
    return 0
  }
  if (typeof direction !== 'boolean') {
    console.warn('Invalid direction value:', direction)
    return speed
  }
  return speed && !!direction ? speed : -speed || 0
}
