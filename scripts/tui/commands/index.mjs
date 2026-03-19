/**
 * scripts/tui/commands/index.mjs
 * Registers all built-in slash commands.
 * Device commands are NOT included here — they are registered in Task 10.
 */

import { registerServerCommands } from './server.mjs'
import { registerTunnelCommands } from './tunnel.mjs'
import { registerNavigationCommands } from './navigation.mjs'
import { registerToolCommands } from './tools.mjs'

export function registerAllCommands() {
  registerServerCommands()
  registerTunnelCommands()
  registerNavigationCommands()
  registerToolCommands()
}
