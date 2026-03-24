/**
 * scripts/tui/commands/server.mjs
 * Slash commands for server lifecycle: start, stop, restart.
 */

import { register } from './registry.mjs'

export function registerServerCommands() {
  register({
    name: 'start',
    aliases: [],
    description: 'Start the DEJA.js server',
    usage: '/start',
    execute(_args, ctx) {
      if (!ctx.childRef.current) {
        ctx.setStatus('starting')
        ctx.spawnServer()
      } else {
        ctx.showHint('Server is already running. Use /restart to restart.')
      }
    },
  })

  register({
    name: 'stop',
    aliases: [],
    description: 'Stop the server and exit',
    usage: '/stop',
    execute(_args, ctx) {
      ctx.addLog('Stopping server...')
      ctx.tunnelCleanup()
      ctx.stopServer()
      setTimeout(() => process.exit(0), 400)
    },
  })

  register({
    name: 'quit',
    aliases: ['exit', 'q'],
    description: 'Exit TUI (server keeps running)',
    usage: '/quit',
    execute(_args, ctx) {
      ctx.addLog('Exiting DEJA TUI...')
      setTimeout(() => process.exit(0), 200)
    },
  })

  register({
    name: 'restart',
    aliases: ['r'],
    description: 'Restart the server',
    usage: '/restart',
    execute(_args, ctx) {
      ctx.restartServer()
    },
  })
}
