// TODOS

## P0 — Production Blockers
[ ] Add toast/snackbar error notifications across all apps (silent failures everywhere)
[ ] Enable email/password login (currently disabled, only GitHub OAuth works)
[ ] Offline/disconnection handling in throttle app (failed Firebase writes are silent)
[ ] Server input validation — validate DCC command payloads (address, speed, func ranges)
[ ] Server reconnection logic — serial, Firebase, MQTT auto-reconnect with backoff
[ ] Graceful server shutdown (clean up Firebase listeners, serial ports, WebSocket connections)

## P1 — Core UX
[ ] Loading states and empty states (ThrottleList, RosterView, layout selection)
[ ] Implement "create new layout" flow (SelectLayoutView TODO)
[ ] Sign out buttons across apps
[ ] Handle unknown power state
[ ] Make login / layout select flow better
[ ] Add 404 catch-all route in throttle app
[ ] Remove console.log debug pollution from production code
[ ] Fix guard chain race conditions in cloud app router

## P2 — Existing Bugs
[ ] Fix routes
[ ] Fix AI Main button in throttle
[ ] Monitor change layout bug
[ ] Fix unmet peers pnpm errors

## P3 — Cloud App Gaps
[ ] Labels
[ ] Device Details (incomplete device detail views)
[ ] Settings page (currently non-functional "coming soon")
[ ] Icon picker for effects/routes forms
[ ] Rename "layout" to "devices" in Cloud
[ ] Update DCC-EX page on cloud app
[ ] Test connection button on cloud home
[ ] Drag-to-reorder actually persists for effects/turnouts (currently console.log only)

## P4 — Type Safety
[ ] Replace `any` types in useDcc.ts (setFunction params)
[ ] Replace `any` types in dejaCloud.ts (Firebase refs, callbacks)
[ ] Replace `any` types in useThrottle.ts
[ ] Replace `any` types in cloud form components (EffectForm, TurnoutForm, AddLoco, EditLoco)
[ ] Replace `any` types in ws-server.ts, mqtt.ts

## P5 — Server Improvements
[ ] Refactor broadcast.ts to use event emitter (existing TODO)
[ ] Signal initialization (existing TODO in signals.ts)
[ ] Refactor turnout commands (existing TODO in turnouts.ts)
[ ] Command deduplication / timeout / acknowledgment tracking
[ ] Sensor data handling (commented out in dejaCloud.ts)
[ ] MQTT exponential backoff reconnection (currently max 3 attempts)
[ ] Log level configuration (inconsistent use of signale methods)

## P6 — Tour App
[ ] Auth
[ ] Add `allowTour` prop to deja js modules
[ ] Drive locos w/max
[ ] Effects
[ ] Scavenger hunt
[ ] Scan QR for effect
[ ] Improve sound UI & features
[ ] Play intro
[ ] Guest user management (cloud?)

## P7 — Monitor App
[ ] Enable auto-clear
[ ] Refactor to optimize

## Done
[x] Signals in Cloud
[x] Monitor: UI
[x] Fix serial command pooling
[x] Sync power states across apps
[x] Fix serial auto-connect bug
[x] Refactor signals to own module (+turnout)
[x] Fix route turnouts
[x] Add loco CTA on throttle list
[x] LED
[x] Add sounds
[x] CTC switch
[x] Fix broken views / buttons
[x] Better header
[x] Mobile menu
[x] Sortable / draggable
[x] MQTT as a package
[x] Cloud - fix login component error
[x] Cloud - layout device icons broken
[x] Throttle - park
[x] Consist modal
[x] All modals
[x] Conductor sync speeds
[x] Bigger throttle buttons
[x] Logos
[x] Compact turnouts
[x] Cloud device header
[x] Cloud device detail page
[x] Auto-connect pico
[x] Filter / view / sort everything
[x] Throttle slider
[x] Trim for consist
[x] Throttle list grid cols
[x] Switch layout menu
[x] Add loco FAB on throttle-list
[x] Sort throttles
[x] Optimize command pool to flush at an interval
[x] Remove sound libs from effects page on cloud app
[x] Account menu
[x] DEJA Suite Nav
[x] Login Page / w/signup
