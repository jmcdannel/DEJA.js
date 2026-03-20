/**
 * scripts/tui/lib/brand.mjs
 * ASCII logo, gradient colors, startup tips, and menu items.
 */

import figlet from 'figlet'

// ── ASCII Logo ─────────────────────────────────────────────────────────────────

export const LOGO_RAW   = figlet.textSync('DEJA', { font: 'ANSI Shadow', horizontalLayout: 'full' })
export const LOGO_LINES = LOGO_RAW.split('\n').filter(l => l.trim().length > 0)

// Cyan-to-sky-blue gradient — one hex color per logo line (6 lines)
export const LOGO_COLORS = [
  '#00FFFF',
  '#00E0FF',
  '#00C4FF',
  '#00A8FF',
  '#0090FF',
  '#007FFF',
]

// ── Startup Tips (10) ──────────────────────────────────────────────────────────

export const STARTUP_TIPS = [
  'Press [?] to see all keyboard shortcuts',
  'Press [r] to restart the server at any time',
  'Press [m] to open the command menu',
  'Press [l] to cycle log filters  all → error → warn',
  'Press [e] to export logs to ~/.deja/logs/',
  'Press [t] to toggle the Cloudflare tunnel',
  'Use arrow keys ↑↓ in the menu to navigate',
  'Serial port selection is saved to config.json',
  'Tip: DCC-EX commands are queued in Firebase RTDB',
  'Tip: Use the Cloud app to manage your layout config',
]

// ── Menu Items (8) ─────────────────────────────────────────────────────────────

export const MENU_ITEMS = [
  { label: 'Start Server',       action: 'start'   },
  { label: 'Stop Server',        action: 'stop'    },
  { label: 'Restart Server',     action: 'restart' },
  { label: 'Devices',            action: 'devices' },
  { label: 'Status Panel',       action: 'status'  },
  { label: 'Select Serial Port', action: 'ports'   },
  { label: 'Toggle Tunnel',      action: 'tunnel'  },
  { label: 'Export Logs',        action: 'export'  },
]
