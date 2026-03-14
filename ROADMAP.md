# DEJA.js Roadmap

> Auto-generated from Track & Trestle Dashboard on 2026-03-14

## In Progress
- [ ] Offline/disconnection handling in throttle app — Failed Firebase writes are silent — need offline/disconnection handling

## To Do
- [ ] Add 404 catch-all route in throttle app — Add a 404 catch-all route to the throttle app
- [ ] Handle unknown power state — Handle the case when power state is unknown

## Done
- [x] Server input validation — Validate DCC command payloads (address, speed, func ranges)
- [x] Server reconnection logic — Serial, Firebase, MQTT auto-reconnect with backoff
- [x] Fix guard chain race conditions — Fix guard chain race conditions in cloud app router
- [x] Graceful server shutdown — Clean up Firebase listeners, serial ports, WebSocket connections on shutdown
- [x] Loading states and empty states — Add loading/empty states for ThrottleList, RosterView, layout selection
- [x] Implement "create new layout" flow — SelectLayoutView TODO — implement the create new layout flow
- [x] Remove console.log debug pollution — Remove console.log debug statements from production code
- [x] Sign out buttons across apps — Add sign out buttons to all apps
- [x] Improve login/layout select flow — Make the login and layout select flow better
- [x] Enable email/password login — Currently disabled, only GitHub OAuth works

