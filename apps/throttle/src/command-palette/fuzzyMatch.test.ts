import { describe, it, expect, vi } from 'vitest'
import { scoreMatch, filterCommands, buildNumericShortcut } from './fuzzyMatch'
import type { Command } from './types'

const makeCmd = (title: string, keywords: string[] = []): Command => ({
  id: title,
  title,
  category: 'navigation',
  icon: 'mdi-star',
  keywords,
  run: () => {},
})

describe('scoreMatch', () => {
  it('empty query returns 1 (everything passes)', () => {
    expect(scoreMatch(makeCmd('Throw Main Yard'), '')).toBe(1)
  })

  it('exact title match scores 1000', () => {
    expect(scoreMatch(makeCmd('Throw Main Yard'), 'throw main yard')).toBe(1000)
  })

  it('title prefix scores 500', () => {
    expect(scoreMatch(makeCmd('Throw Main Yard'), 'throw main')).toBe(500)
  })

  it('title substring scores 300', () => {
    expect(scoreMatch(makeCmd('Throw Main Yard'), 'main yard')).toBe(300)
  })

  it('keyword substring scores 250', () => {
    expect(scoreMatch(makeCmd('Go to Roster', ['locos', 'trains']), 'trains')).toBe(250)
  })

  it('fuzzy subsequence returns > 0', () => {
    const score = scoreMatch(makeCmd('Throw Main Yard'), 'tmy')
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(300)
  })

  it('fuzzy match where characters are not in order returns 0', () => {
    expect(scoreMatch(makeCmd('Throw Main Yard'), 'zzz')).toBe(0)
  })

  it('case-insensitive matching', () => {
    expect(scoreMatch(makeCmd('THROW main YARD'), 'throw')).toBe(500)
  })
})

describe('filterCommands', () => {
  const commands = [
    makeCmd('Throw Main Yard'),
    makeCmd('Close Main Yard'),
    makeCmd('Throw Main Siding'),
    makeCmd('Go to Roster', ['locos']),
  ]

  it('empty query returns all commands up to MAX_RESULTS', () => {
    expect(filterCommands(commands, '')).toHaveLength(4)
  })

  it('filters by title substring', () => {
    const result = filterCommands(commands, 'main yard')
    expect(result.map((c) => c.title)).toContain('Throw Main Yard')
    expect(result.map((c) => c.title)).toContain('Close Main Yard')
    expect(result.map((c) => c.title)).not.toContain('Go to Roster')
  })

  it('sorts by score descending', () => {
    const result = filterCommands(commands, 'throw main yard')
    expect(result[0].title).toBe('Throw Main Yard') // exact match first
  })

  it('ties broken alphabetically', () => {
    const ties = [
      makeCmd('Throw Bravo'),
      makeCmd('Throw Alpha'),
    ]
    const result = filterCommands(ties, 'throw')
    expect(result[0].title).toBe('Throw Alpha')
    expect(result[1].title).toBe('Throw Bravo')
  })

  it('filters by keyword', () => {
    const result = filterCommands(commands, 'locos')
    expect(result.map((c) => c.title)).toContain('Go to Roster')
  })
})

describe('buildNumericShortcut', () => {
  const noLookup = vi.fn(() => null)
  const openThrottle = vi.fn(async () => {})

  it('returns null for non-numeric query', () => {
    expect(buildNumericShortcut('main', noLookup, openThrottle)).toBeNull()
  })

  it('returns null for empty query', () => {
    expect(buildNumericShortcut('', noLookup, openThrottle)).toBeNull()
  })

  it('returns null for address 0', () => {
    expect(buildNumericShortcut('0', noLookup, openThrottle)).toBeNull()
  })

  it('returns null for address above 9999', () => {
    expect(buildNumericShortcut('10000', noLookup, openThrottle)).toBeNull()
  })

  it('returns null for decimal', () => {
    expect(buildNumericShortcut('3.5', noLookup, openThrottle)).toBeNull()
  })

  it('returns null for scientific notation', () => {
    expect(buildNumericShortcut('1e3', noLookup, openThrottle)).toBeNull()
  })

  it('returns a command for a valid address with no roster match', () => {
    const cmd = buildNumericShortcut('42', noLookup, openThrottle)
    expect(cmd).not.toBeNull()
    expect(cmd!.id).toBe('throttle.numeric.42')
    expect(cmd!.title).toBe('Open throttle #42')
    expect(cmd!.description).toBeUndefined()
    expect(cmd!.category).toBe('throttle')
  })

  it('populates description with roster lookup when present', () => {
    const lookup = vi.fn(() => ({ name: 'GP38', roadname: 'Cuyama' }))
    const cmd = buildNumericShortcut('42', lookup, openThrottle)
    expect(cmd!.description).toBe('GP38 · Cuyama')
  })

  it('run() invokes openThrottle with the parsed address', async () => {
    const cmd = buildNumericShortcut('42', noLookup, openThrottle)
    await cmd!.run()
    expect(openThrottle).toHaveBeenCalledWith(42)
  })

  it('accepts leading # prefix', () => {
    const cmd = buildNumericShortcut('#42', noLookup, openThrottle)
    expect(cmd).not.toBeNull()
    expect(cmd!.id).toBe('throttle.numeric.42')
    expect(cmd!.title).toBe('Open throttle #42')
  })

  it('accepts # prefix with single digit', () => {
    const cmd = buildNumericShortcut('#3', noLookup, openThrottle)
    expect(cmd).not.toBeNull()
    expect(cmd!.id).toBe('throttle.numeric.3')
  })

  it('rejects # alone', () => {
    expect(buildNumericShortcut('#', noLookup, openThrottle)).toBeNull()
  })

  it('rejects # followed by non-digits', () => {
    expect(buildNumericShortcut('#abc', noLookup, openThrottle)).toBeNull()
  })

  it('rejects # followed by out-of-range address', () => {
    expect(buildNumericShortcut('#10000', noLookup, openThrottle)).toBeNull()
  })
})
