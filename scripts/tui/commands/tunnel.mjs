/**
 * scripts/tui/commands/tunnel.mjs
 * Slash command for Cloudflare tunnel toggle.
 */

import { register } from './registry.mjs'

export function registerTunnelCommands() {
  register({
    name: 'tunnel',
    aliases: ['t'],
    description: 'Toggle Cloudflare tunnel on/off',
    usage: '/tunnel',
    execute(_args, ctx) {
      ctx.toggleTunnel()
    },
  })
}
