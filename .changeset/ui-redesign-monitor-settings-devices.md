---
"deja-monitor": minor
"deja-cloud": minor
"deja-throttle": minor
"@repo/ui": minor
"deja-serverts": patch
"@repo/modules": patch
---

feat: redesign monitor header, device connection cards, and settings navigation

- Redesign monitor app to use MonitorStatusBar globally with server status, layout selector, and user profile
- Add deja-server device type support to connection cards with server status integration
- Move settings navigation to right side with sticky positioning (fix v-responsive overflow)
- Add server IP broadcasting from server to Firebase RTDB
- Show device IDs in cloud app port list
- Add size prop to UserProfile component
