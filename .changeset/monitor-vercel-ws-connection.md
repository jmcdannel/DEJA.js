---
"deja-monitor": patch
---

fixed: **[monitor]** Fix hardcoded `ws://` protocol that blocked WebSocket connections from HTTPS hosts (Vercel)
improved: **[monitor]** Extract shared WebSocket connection composable with smart protocol detection and auto-reconnect
added: **[monitor]** Dashboard banner guiding remote users to configure server connection via Cloudflare tunnel
improved: **[monitor]** Settings page shows live connection status and expandable tunnel setup instructions
