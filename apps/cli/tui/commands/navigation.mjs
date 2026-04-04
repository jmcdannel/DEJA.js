/**
 * scripts/tui/commands/navigation.mjs
 * Slash commands for TUI mode navigation.
 */

import { register } from './registry.mjs'

export function registerNavigationCommands() {
  register({
    name: 'menu',
    aliases: ['m'],
    description: 'Open the menu',
    usage: '/menu',
    execute(_args, ctx) {
      ctx.transitionMode('menu')
    },
  })

  register({
    name: 'settings',
    aliases: [],
    description: 'Open settings panel',
    usage: '/settings',
    execute(_args, ctx) {
      ctx.transitionMode('settings')
    },
  })

  register({
    name: 'dcc-ref',
    aliases: ['dcc', 'dccex', 'commands', 'ref'],
    description: 'DCC-EX command quick reference',
    usage: '/dcc-ref',
    execute(_args, ctx) {
      ctx.transitionMode('dcc-ref')
    },
  })

  register({
    name: 'logs',
    aliases: ['l'],
    description: 'Show log view',
    usage: '/logs',
    execute(_args, ctx) {
      ctx.transitionMode('logs')
    },
  })
}
