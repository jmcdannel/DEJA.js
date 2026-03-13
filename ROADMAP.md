# DEJA.js Roadmap

## P0 — Critical / Production Blockers
- [ ] Offline/disconnection handling with retry
- [ ] Server reconnection logic — serial, Firebase, MQTT auto-reconnect with backoff
- [ ] Graceful server shutdown (clean up Firebase listeners, serial ports, WebSocket connections)
- [ ] MQTT exponential backoff reconnection

## P1 — Core UX & Stability
- [ ] Add missing Firebase auth providers — Google, GitHub, Apple sign-in
- [ ] Redesign login / signup pages — modern split-layout, better visual hierarchy, social auth prominent
- [ ] Make login / layout select flow better
- [ ] Guest Mode / Demo Mode
- [ ] Fix guard chain race conditions in cloud app router
- [ ] Sync device statuses across all apps — ensure connect/disconnect events write to Firebase so status updates propagate to cloud, monitor, throttle in real-time
- [ ] Command deduplication / timeout / acknowledgment tracking
- [ ] Log level configuration
- [ ] Refactor broadcast.ts to use event emitter
- [ ] Signal initialization
- [ ] Refactor turnout commands
- [ ] WiThrottle protocol support — implement WiThrottle server so JMRI-compatible throttle apps can connect to DEJA.js
- [ ] Redesign settings pages across all apps — unified settings UI for theme, connection config, user preferences, layout options
- [ ] Update README & quickstart guide — simple 3-step getting started + advanced repo clone mode
- [ ] Stripe subscriptions & pricing — add pricing page, update onboarding for subscriptions, support sales/discount codes

### Cloud App
- [ ] Device detail views (incomplete)
- [ ] Rename "layout" to "devices" in Cloud
- [ ] Update DCC-EX page on cloud app
- [ ] Redesign cloud 404 page — current one is ugly
- [ ] Test connection button on cloud home
- [ ] Drag-to-reorder persistence for effects/turnouts

### Monitor App
- [ ] Enable auto-clear
- [ ] Refactor to optimize

## P2 — Feature Development
- [ ] Refine themes — polish Vuetify/Tailwind theming across all apps (dark/light mode, color palettes, consistent branding, typography)
- [ ] CV/Decoder Programming — read/write CVs from the browser (service track + POM)
- [ ] Store roster on DCC-EX command station (sync with DEJA cloud)
- [ ] EXRAIL Automation Studio — visual EXRAIL script editor in the cloud app for building and uploading automation sequences to DCC-EX
- [ ] Visual Automation Builder — drag-and-drop automation sequences (DEJA's answer to EX-RAIL/Logix)
      - Set turnout → wait → set signal → drive train → stop at sensor
      - No code required, runs in the cloud, triggers via Firebase
- [ ] Scheduled Operations — time-based automation
- [ ] AI Conductor — LLM-powered train dispatcher that manages traffic, signals, and routing
      - "Run the evening commuter schedule" → AI sets routes, signals, and drives trains
      - Collision avoidance via block occupancy + reservation system
- [ ] Track Diagram Editor — draw your layout in the browser (tracks, turnouts, signals, blocks)
      - Real-time state overlay (turnout positions, block occupancy, signal aspects)
      - Click-to-control (throw turnouts, set routes, dispatch trains)
- [ ] Operations Mode — car routing, switch lists, manifests (like JMRI OperationsPro)
      - Industries, spurs, yards, staging
      - Car types, loads, scheduling
      - Crew instructions and timetables

### Tour App
- [ ] Auth
- [ ] Add `allowTour` prop to DEJA modules
- [ ] Drive locos w/max speed limit
- [ ] Effects
- [ ] Scavenger hunt
- [ ] Scan QR for effect
- [ ] Improve sound UI & features
- [ ] Play intro
- [ ] Guest user management

### dejajs.com Website
- [ ] Architecture diagrams — SVG-based graphics showing common scenarios (use MDI icons from https://pictogrammers.com/library/mdi/)
      - DEJA Cloud → DCC-EX CommandStation → Track
      - Throttle App → Firebase → Server → Serial → DCC-EX
      - Multi-device setup (Arduino LED + Pico W MQTT + DCC-EX)
      - Tour App guest flow
- [ ] Pricing page with Stripe integration

### IO / Firmware
- [x] Finalize io package builds — generate device config files into `dist/{layoutId}/` per device

## P3 — Hardware & Platform Expansion
- [ ] Multi-command-station support — connect to multiple DCC-EX stations simultaneously
- [ ] DC (analog) support via DCC-EX TrackManager
- [ ] RFID tag tracking — identify specific rolling stock by tag reader

## P4 — Dream Features
- [ ] Voice Control — "Hey DEJA, throw turnout 5 and set signal to clear"
- [ ] AR Layout Overlay — point your phone at the layout, see train info, turnout states, and signals in AR
- [ ] Sound Spatialization — position virtual speakers on the layout, sound follows the train
- [ ] AI Scenery Generator — describe a scene, AI generates Arduino/Pico animation sequences

## Dropped / Deferred
- [-] ttt-io as packages
- [-] ttt-io build scripts
- [-] DEJA.js marketing site
- [-] TTT Site
- [-] Sound mixer / mute
- [-] LED designer

---

## Completed
- [x] Account menu *(P1 — Core UX)*
- [x] DEJA Suite Nav *(P1 — Core UX)*
- [x] Login Page / w/signup *(P1 — Core UX)*
- [x] Error notification system — toast/snackbar across all apps *(P0 — Production)*
- [x] Complete auth flow — email/password, password reset, email verification *(P0 — Production)*
- [x] Loading/empty states across all views *(P1 — Core UX)*
- [x] Complete onboarding / create layout flow *(P1 — Core UX)*
- [x] Type safety cleanup — eliminate `any` types *(P1 — Core UX)*
- [x] Production logging — remove console.log, configure log levels *(P1 — Core UX)*
- [x] Sign out buttons across apps *(P1 — Core UX)*
- [x] Add 404 catch-all route in throttle *(P1 — Core UX)*
- [x] Icon picker for effects/routes forms *(P1 — Cloud App)*
- [x] Sensor data handling *(P1 — Server)*
- [x] Server input validation — validate DCC command payloads *(P0 — Production)*
- [x] Sensor & Block Occupancy — digital/analog sensor input, block detection display *(P2 — Feature Development)*
- [x] Function map — momentary vs latching toggle behavior *(P2 — Feature Development)*
- [x] Route Automation — entry/exit click-to-route on a visual layout *(P2 — Feature Development)*
- [x] Sensor-Triggered Events — crossing gates, sound effects, signals on block entry *(P2 — Feature Development)*
- [x] CTC Dispatcher Panel — prototype-accurate CTC control panel builder *(P2 — Feature Development)*
- [x] Multi-layout Dashboard — manage multiple layouts from one account *(P2 — Feature Development)*
- [x] Mobile Haptic Feedback — phone vibrates based on throttle position and train acceleration *(P4 — Dream Features)*
- [x] Fix routes *(P0 — Bug Fix)*
- [x] Fix AI Main button in throttle *(P0 — Bug Fix)*
- [x] Monitor change layout bug *(P0 — Bug Fix)*
- [x] Fix unmet peers pnpm errors *(P0 — Bug Fix)*
- [x] Signals in Cloud *(P1 — Cloud App)*
- [x] Monitor: UI *(P1 — Monitor App)*
- [x] Fix serial command pooling *(P0 — Server)*
- [x] Sync power states across apps *(P0 — Production)*
- [x] Fix serial auto-connect bug *(P0 — Server)*
- [x] Refactor signals to own module (+turnout) *(P1 — Server)*
- [x] Fix route turnouts *(P0 — Bug Fix)*
- [x] Add loco CTA on throttle list *(P1 — Core UX)*
- [x] LED *(P2 — Feature Development)*
- [x] Add sounds *(P2 — Feature Development)*
- [x] CTC switch *(P2 — Feature Development)*
- [x] Fix broken views / buttons *(P0 — Bug Fix)*
- [x] Better header *(P1 — Core UX)*
- [x] Mobile menu *(P1 — Core UX)*
- [x] Sortable / draggable *(P1 — Core UX)*
- [x] MQTT as a package *(P1 — Server)*
- [x] Cloud - fix login component error *(P0 — Bug Fix)*
- [x] Cloud - layout device icons broken *(P0 — Bug Fix)*
- [x] Throttle - park *(P2 — Feature Development)*
- [x] Consist modal *(P1 — Core UX)*
- [x] All modals *(P1 — Core UX)*
- [x] Conductor sync speeds *(P1 — Core UX)*
- [x] Bigger throttle buttons *(P1 — Core UX)*
- [x] Logos *(P1 — Core UX)*
- [x] Compact turnouts *(P1 — Core UX)*
- [x] Cloud device header *(P1 — Cloud App)*
- [x] Cloud device detail page *(P1 — Cloud App)*
- [x] Auto-connect pico *(P1 — Server)*
- [x] Filter / view / sort everything *(P1 — Core UX)*
- [x] Throttle slider *(P1 — Core UX)*
- [x] Trim for consist *(P1 — Core UX)*
- [x] Throttle list grid cols *(P1 — Core UX)*
- [x] Switch layout menu *(P1 — Core UX)*
- [x] Add loco FAB on throttle-list *(P1 — Core UX)*
- [x] Sort throttles *(P1 — Core UX)*
- [x] Optimize command pool to flush at an interval *(P0 — Server)*
- [x] Remove sound libs from effects page on cloud app *(P1 — Cloud App)*
