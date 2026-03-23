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
    name: 'status',
    aliases: ['s'],
    description: 'Show status panel',
    usage: '/status',
    execute(_args, ctx) {
      ctx.transitionMode('status')
    },
  })

  register({
    name: 'ports',
    aliases: ['p'],
    description: 'Show serial port selector',
    usage: '/ports',
    execute(_args, ctx) {
      ctx.transitionMode('ports')
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
