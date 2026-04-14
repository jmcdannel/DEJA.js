// 🚂 DCC-EX myAutomation.h orchestrator
//
// Iterates the registered EXRAIL sections, wraps each non-empty body in
// marker comments, and joins them with a blank line. Adding a new section
// is a one-line change: import it and add it to `SECTIONS`.

import { wrapSection } from './markers'
import { rosterSection } from './roster'
import type { DccExConfigInput, DccExSection } from './types'

// Order is significant — sections appear in this order in the output file.
const SECTIONS: DccExSection[] = [
  rosterSection,
  // future: automationSection, sequencesSection, routesSection, ...
]

/**
 * Generate the full `myAutomation.h` body for a DCC-EX device.
 *
 * @param input  Device + layout context + locos roster.
 * @param sections  Optional override of the default section list. Used by
 *   tests; production callers should omit this and use the default.
 */
export function generateDccExAutomation(
  input: DccExConfigInput,
  sections: DccExSection[] = SECTIONS,
): string {
  return sections
    .map(section => {
      const body = section.generate(input)
      return body ? wrapSection(section.name, body) : ''
    })
    .filter(chunk => chunk !== '')
    .join('\n\n')
}

export { rosterSection } from './roster'
export { wrapSection } from './markers'
export type { DccExConfigInput, DccExSection } from './types'
export {
  generateDccExConfig,
  DCC_EX_MOTOR_SHIELD_MACROS,
  DCC_EX_MOTOR_SHIELD_LABELS,
} from './config'
export type { DccExMotorShield, DccExConfigHInput } from './config'
