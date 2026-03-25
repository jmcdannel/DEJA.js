import type { TrackMode, TrackOutputLetter } from './types'

export function buildTrackConfigCommand(
  output: TrackOutputLetter,
  mode: TrackMode,
  cabAddress?: number,
): string {
  if (mode === 'DC' || mode === 'DCX') {
    return `= ${output} ${mode} ${cabAddress}`
  }
  return `= ${output} ${mode}`
}

export function buildTrackPowerCommand(output: TrackOutputLetter, power: boolean): string {
  return `${power ? '1' : '0'} ${output}`
}

export function buildQueryTracksCommand(): string {
  return '='
}
