/**
 * scripts/tui/lib/brand.mjs
 * ASCII logo, gradient colors, startup tips, and menu items.
 */

// ── ASCII Logo ─────────────────────────────────────────────────────────────────
// Hand-crafted to match install.sh — includes the full "DEJA.js" with colored
// dot and JS suffix.  Each entry is { deja, dot, js } so the renderer can
// apply separate colors per segment.

export const LOGO_SEGMENTS = [
  { deja: '██████╗ ███████╗     ██╗ █████╗   ',      dot: '',    js: '      ██╗███████╗' },
  { deja: '██╔══██╗██╔════╝     ██║██╔══██╗  ',      dot: '',    js: '      ██║██╔════╝' },
  { deja: '██║  ██║█████╗       ██║███████║  ',       dot: '',    js: '      ██║███████╗' },
  { deja: '██║  ██║██╔══╝  ██   ██║██╔══██║  ',       dot: '',    js: '      ██║╚════██║' },
  { deja: '██████╔╝███████╗╚█████╔╝██║  ██║',        dot: '██╗',  js: '╚█████╔╝███████║' },
  { deja: '╚═════╝ ╚══════╝ ╚════╝ ╚═╝  ╚═╝',       dot: '╚═╝',  js: ' ╚════╝ ╚══════╝' },
]

// For backwards compat — plain text lines (used by OnboardingScreen)
export const LOGO_LINES = LOGO_SEGMENTS.map(s => s.deja + s.dot + s.js)

// Colors for each segment type
export const LOGO_DEJA_COLORS = [
  '#00E8FC',   // line 1 — bright cyan
  '#00C3F5',   // line 2
  '#0AA0EB',   // line 3
  '#1982DC',   // line 4
  '#0A6AD0',   // line 5
  '#005FBF',   // line 6 — deep blue
]
export const LOGO_DOT_COLOR = '#32FF32'   // green dot
export const LOGO_JS_COLOR  = '#FF00AA'   // magenta/pink .js

// Legacy single-color-per-line (kept for OnboardingScreen)
export const LOGO_COLORS = LOGO_DEJA_COLORS

// ── Startup Tips (10) ──────────────────────────────────────────────────────────

export const STARTUP_TIPS = [
  'Press [?] to see all keyboard shortcuts',
  'Press [r] to restart the server at any time',
  'Press [m] to open the command menu',
  'Press [l] to cycle log filters  all → error → warn',
  'Press [e] to export logs to ~/.deja/logs/',
  'Use /settings to configure tunnel, MQTT, and WS',
  'Use arrow keys ↑↓ in the menu to navigate',
  'Serial port selection is saved to config.json',
  'Tip: DCC-EX commands are queued in Firebase RTDB',
  'Tip: Use the Cloud app to manage your layout config',
]

// ── Contextual Tips — shown when no system hint is active ────────────────────

/** Tips keyed by context. Each key maps to an array of possible tips. */
export const CONTEXTUAL_TIPS = {
  idle: [
    'Type / to see available commands',
    'Press [?] for keyboard shortcuts',
    'Press [m] to open the command menu',
    'Press [e] to export logs to a file',
    'Use /devices to manage connected hardware',
    'Press [l] to filter logs by severity',
  ],
  serverRunning: [
    'Server is running — press [r] to restart',
    'Use /settings to configure tunnel, MQTT, and more',
    'Use /status to see connection details',
  ],
  serverStopped: [
    'Server stopped — press [r] or type /start',
    'Check logs above for error details',
  ],
  devicesMode: [
    'Press [Enter] to connect/disconnect a device',
    'Press [p] to assign a serial port',
  ],
  menuMode: [
    'Use ↑↓ arrows to navigate, Enter to select',
  ],
  afterRestart: [
    'Server restarting — watching for startup...',
  ],
  afterFilterCycle: [
    'Press [l] again to cycle: all → error → warn',
  ],
}

// ── Menu Items ────────────────────────────────────────────────────────────────

export const MENU_ITEMS = [
  { label: 'Start Server',       action: 'start'    },
  { label: 'Stop Server',        action: 'stop'     },
  { label: 'Restart Server',     action: 'restart'  },
  { label: 'Devices',            action: 'devices'  },
  { label: 'Settings',           action: 'settings' },
  { label: 'DCC-EX Reference',   action: 'dcc-ref'  },
  { label: 'Export Logs',        action: 'export'   },
]
