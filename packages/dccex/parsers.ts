import type { TrackMode, TrackOutputLetter } from './types'

interface ParsedTrackState {
  output: TrackOutputLetter
  mode: TrackMode
  cabAddress?: number
}

interface ParsedPowerState {
  output: TrackOutputLetter
  power: boolean
}

const TRACK_STATE_REGEX = /^=\s([A-H])\s(\S+)(?:\s(\d+))?$/
const POWER_STATE_REGEX = /^p([01])\s([A-H])$/

export function parseTrackState(response: string): ParsedTrackState | null {
  const match = response.match(TRACK_STATE_REGEX)
  if (!match) return null

  const result: ParsedTrackState = {
    output: match[1] as TrackOutputLetter,
    mode: match[2] as TrackMode,
  }

  if (match[3]) {
    result.cabAddress = parseInt(match[3], 10)
  }

  return result
}

export function parsePowerState(response: string): ParsedPowerState | null {
  const match = response.match(POWER_STATE_REGEX)
  if (!match) return null

  return {
    output: match[2] as TrackOutputLetter,
    power: match[1] === '1',
  }
}
