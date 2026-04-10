// 🚂 ROSTER section — DCC-EX myAutomation.h
//
// Emits one `ROSTER(address,"Name","F0/F1/...")` line per loco in the
// layout, sorted by address ascending. Stable: identical input → byte-
// identical output across calls.

import type { Loco, LocoFunction } from '../../locos/types'
import type { DccExConfigInput, DccExSection } from './types'

export const rosterSection: DccExSection = {
  name: 'ROSTER',
  generate({ locos }: DccExConfigInput): string {
    if (!locos || locos.length === 0) return ''

    const lines = [...locos]
      .sort((a, b) => a.address - b.address)
      .map(formatRosterLine)

    return lines.join('\n')
  },
}

function formatRosterLine(loco: Loco): string {
  const name = escapeCString(loco.name ?? '')
  const functionsStr = formatFunctions(loco.functions ?? [])
  return `ROSTER(${loco.address},"${name}","${functionsStr}")`
}

function formatFunctions(functions: LocoFunction[]): string {
  if (!functions || functions.length === 0) return ''

  // Sort by id ascending and pad gaps with empty slots so positional
  // F-numbers stay correct (DCC-EX reads them in order from F0).
  const sorted = [...functions].sort((a, b) => a.id - b.id)
  const maxId = sorted[sorted.length - 1].id
  const slots: string[] = []

  for (let id = 0; id <= maxId; id++) {
    const fn = sorted.find(f => f.id === id)
    if (!fn) {
      slots.push('') // gap → empty slot
      continue
    }
    const rawLabel = fn.label && fn.label.trim() ? fn.label : `F${id}`
    // `/`, `"`, newline, CR can't appear inside the joined functions string —
    // slash is the EXRAIL separator and quotes would close the C string.
    // Replacing with space is safer than escaping.
    const sanitized = rawLabel.replace(/[/\n\r"]/g, ' ').trim()
    slots.push(fn.isMomentary ? `*${sanitized}` : sanitized)
  }

  return slots.join('/')
}

function escapeCString(s: string): string {
  // Order matters: backslashes first, otherwise the `\"` we just inserted
  // would get its backslash doubled to `\\"` on the next pass.
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/[\n\r]/g, ' ')
}
