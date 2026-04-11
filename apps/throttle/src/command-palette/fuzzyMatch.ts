import type { Command } from './types'

const MAX_RESULTS = 50

export function scoreMatch(cmd: Command, query: string): number {
  const q = query.trim().toLowerCase()
  if (!q) return 1
  const title = cmd.title.toLowerCase()
  const keywords = (cmd.keywords || []).map((k) => k.toLowerCase())

  if (title === q) return 1000
  if (title.startsWith(q)) return 500
  if (title.includes(q)) return 300
  for (const kw of keywords) {
    if (kw.includes(q)) return 250
  }

  // Fuzzy subsequence: all chars of q appear in title in order
  let i = 0
  for (const ch of title) {
    if (ch === q[i]) i++
    if (i === q.length) {
      return 100 + Math.floor((q.length / Math.max(title.length, 1)) * 50)
    }
  }

  return 0
}

interface FilterResult {
  command: Command
  score: number
}

export function filterCommands(commands: Command[], query: string): Command[] {
  if (!query.trim()) return commands.slice(0, MAX_RESULTS)

  const results: FilterResult[] = []
  for (const cmd of commands) {
    const score = scoreMatch(cmd, query)
    if (score > 0) results.push({ command: cmd, score })
  }
  results.sort((a, b) => b.score - a.score || a.command.title.localeCompare(b.command.title))
  return results.slice(0, MAX_RESULTS).map((r) => r.command)
}

export function buildNumericShortcut(
  query: string,
  locoLookup: (address: number) => { name?: string; roadname?: string } | null,
  openThrottle: (address: number) => Promise<void>,
): Command | null {
  const q = query.trim()
  if (!/^\d+$/.test(q)) return null
  const n = Number(q)
  if (!Number.isInteger(n) || n < 1 || n > 9999) return null
  const match = locoLookup(n)
  return {
    id: `throttle.numeric.${n}`,
    title: `Open throttle #${n}`,
    description: match
      ? `${match.name || `Loco ${n}`}${match.roadname ? ` · ${match.roadname}` : ''}`
      : undefined,
    icon: 'mdi-train',
    category: 'throttle',
    run: () => openThrottle(n),
  }
}
