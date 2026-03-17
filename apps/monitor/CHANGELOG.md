# deja-monitor

## 0.1.0

### Minor Changes

- ca184e7: feat: redesign monitor header, device connection cards, and settings navigation

  - Redesign monitor app to use MonitorStatusBar globally with server status, layout selector, and user profile
  - Add deja-server device type support to connection cards with server status integration
  - Move settings navigation to right side with sticky positioning (fix v-responsive overflow)
  - Add server IP broadcasting from server to Firebase RTDB
  - Show device IDs in cloud app port list
  - Add size prop to UserProfile component

### Patch Changes

- d93ac8d: fixed: **[monitor]** Add missing build script and fix type errors preventing production builds
- 7fcb835: changed: **[monitor]** Default remote WebSocket host to ws.dejajs.com via Cloudflare Tunnel
- 8f0ea00: fixed: **[monitor]** Fix hardcoded `ws://` protocol that blocked WebSocket connections from HTTPS hosts (Vercel)
  improved: **[monitor]** Extract shared WebSocket connection composable with smart protocol detection and auto-reconnect
  added: **[monitor]** Dashboard banner guiding remote users to configure server connection via Cloudflare tunnel
  improved: **[monitor]** Settings page shows live connection status and expandable tunnel setup instructions
