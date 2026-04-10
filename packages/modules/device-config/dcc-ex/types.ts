// 🚂 DCC-EX myAutomation.h generator types
//
// Each EXRAIL section (ROSTER, AUTOMATION, SEQUENCE, ROUTE, ...) implements
// `DccExSection` and is registered with the orchestrator in `./index.ts`.

import type { Device } from '../../layouts/types'
import type { Loco } from '../../locos/types'

/**
 * Input passed to every DCC-EX section generator.
 * `locos` is the layout-wide loco roster — DCC-EX devices emit a roster of
 * every loco in their parent layout (locos are not device-bound).
 */
export interface DccExConfigInput {
  device: Device
  layoutId: string
  locos: Loco[]
}

/**
 * Contract every EXRAIL section implements. Pure function — no side effects,
 * no Node-only imports — so the generator runs in both the io/ build and the
 * cloud preview.
 */
export interface DccExSection {
  /** Marker name written into the comment delimiters (UPPERCASE convention). */
  name: string
  /**
   * Returns the section body (no markers).
   * Returns `''` when there's nothing to emit — orchestrator skips empty
   * sections entirely so the file never contains empty marker pairs.
   */
  generate(input: DccExConfigInput): string
}
