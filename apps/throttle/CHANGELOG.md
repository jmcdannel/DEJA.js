# deja-throttle

## null

### Minor Changes

- ca184e7: feat: redesign monitor header, device connection cards, and settings navigation

  - Redesign monitor app to use MonitorStatusBar globally with server status, layout selector, and user profile
  - Add deja-server device type support to connection cards with server status integration
  - Move settings navigation to right side with sticky positioning (fix v-responsive overflow)
  - Add server IP broadcasting from server to Firebase RTDB
  - Show device IDs in cloud app port list
  - Add size prop to UserProfile component

### Patch Changes

- b401fbc: added: **[throttle]** **[cloud]** Add DEJA Server auto-detect status card to quick connect panels using same detection as header chip
- 6e33853: added: **[throttle]** Vercel Analytics for real-user page view and visitor tracking of train control interface
- Updated dependencies [83af116]
- Updated dependencies [59c43df]
- Updated dependencies [b401fbc]
- Updated dependencies [7a7be39]
- Updated dependencies [ca184e7]
- Updated dependencies [4412106]
  - @repo/ui@0.1.0
  - @repo/modules@0.1.0
