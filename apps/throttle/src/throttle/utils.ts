export function getSignedSpeed({
  speed,
  direction,
}: {
  speed: number
  direction: boolean
}): number {
  return speed && !!direction ? speed : -speed || 0
}