/**
 * scripts/tui/commands/tools.mjs
 * Slash commands for help, log filtering, and log export.
 */

import { register, list } from './registry.mjs'

export function registerToolCommands() {
  register({
    name: 'help',
    aliases: ['h', '?'],
    description: 'Show available commands',
    usage: '/help',
    execute(_args, ctx) {
      ctx.addLog('── Available Commands ──')
      for (const cmd of list()) {
        const aliasStr = cmd.aliases.length
          ? ` (${cmd.aliases.map(a => `/${a}`).join(', ')})`
          : ''
        ctx.addLog(`  /${cmd.name}${aliasStr} — ${cmd.description}`)
      }
    },
  })

  register({
    name: 'filter',
    aliases: ['f'],
    description: 'Cycle log filter (all → error → warn)',
    usage: '/filter',
    execute(_args, ctx) {
      ctx.cycleFilter()
    },
  })

  register({
    name: 'export',
    aliases: ['e'],
    description: 'Export logs to file',
    usage: '/export',
    execute(_args, ctx) {
      ctx.exportLogs()
    },
  })
}
