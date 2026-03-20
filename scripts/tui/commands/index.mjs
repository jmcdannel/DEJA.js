/**
 * scripts/tui/commands/index.mjs
 * Registers all built-in slash commands (14 total).
 */

import { registerServerCommands } from './server.mjs'
import { registerTunnelCommands } from './tunnel.mjs'
import { registerNavigationCommands } from './navigation.mjs'
import { registerToolCommands } from './tools.mjs'
import { registerDeviceCommands } from './devices.mjs'

export function registerAllCommands() {
  registerServerCommands()
  registerTunnelCommands()
  registerNavigationCommands()
  registerToolCommands()
  registerDeviceCommands()
}
