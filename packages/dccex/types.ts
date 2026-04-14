export type TrackMode =
  | 'MAIN'
  | 'MAIN_INV'
  | 'MAIN_AUTO'
  | 'PROG'
  | 'DC'
  | 'DCX'
  | 'BOOST'
  | 'BOOST_INV'
  | 'BOOST_AUTO'
  | 'NONE'

export type TrackOutputLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'

export interface TrackOutput {
  mode: TrackMode
  cabAddress?: number
  power: boolean | null
}
