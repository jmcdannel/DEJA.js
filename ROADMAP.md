# DEJA.js Roadmap

> Auto-generated from Track & Trestle Dashboard on 2026-03-14

## In Progress
- [ ] Test connection button on cloud home — Add a test connection button to the cloud app home page
- [ ] Cloud-hosted monitor — Deploy monitor app to Vercel, switch serial/system logging to Firebase RTDB so real-time data is accessible remotely. Use WebSocket as fallback. Use Cloudflare Tunnel if needed.
- [ ] Architecture diagrams for dejajs.com — SVG-based graphics showing common scenarios (MDI icons). DEJA Cloud → DCC-EX → Track, Throttle App → Firebase → Server → Serial → DCC-EX, Multi-device setup, Tour App guest flow.
- [ ] WiThrottle protocol support — Implement WiThrottle server so JMRI-compatible throttle apps can connect to DEJA.js

## To Do
- [ ] Refactor turnout commands — Clean up turnout command handling
- [ ] Visual Automation Builder — Drag-and-drop automation sequences (DEJA's answer to EX-RAIL/Logix). Set turnout → wait → set signal → drive train → stop at sensor. No code required, runs in the cloud, triggers via Firebase.
- [ ] EXRAIL Automation Studio — Visual EXRAIL script editor in the cloud app for building and uploading automation sequences to DCC-EX
- [ ] Store roster on DCC-EX command station — Sync roster with DEJA cloud
- [ ] Refine themes — Polish Vuetify/Tailwind theming across all apps (dark/light mode, color palettes, consistent branding, typography)
- [ ] Drag-to-reorder persistence for effects/turnouts — Persist drag-to-reorder ordering for effects and turnouts
- [ ] Redesign cloud 404 page — Current one is ugly — needs a proper design
- [ ] Signal initialization — Initialize signals properly on startup
- [ ] Multi-command-station support — Connect to multiple DCC-EX stations simultaneously
- [ ] DC (analog) support via DCC-EX TrackManager — Add DC/analog support through DCC-EX TrackManager
- [ ] Guest Mode / Demo Mode — Allow users to explore the app without signing up
- [ ] Add missing Firebase auth providers — Google, GitHub, Apple sign-in

## Backlog
- [ ] Scheduled Operations — Time-based automation
- [ ] AI Conductor — LLM-powered train dispatcher that manages traffic, signals, and routing. "Run the evening commuter schedule" → AI sets routes, signals, and drives trains. Collision avoidance via block occupancy + reservation system.
- [ ] Operations Mode — Car routing, switch lists, manifests (like JMRI OperationsPro). Industries, spurs, yards, staging. Car types, loads, scheduling. Crew instructions and timetables.
- [ ] Tour App: Auth — Add authentication to the Tour App
- [ ] Tour App: Add allowTour prop to DEJA modules — Add allowTour prop to DEJA modules for tour mode support
- [ ] Tour App: Drive locos w/max speed limit — Allow tour users to drive locos with a maximum speed limit
- [ ] Tour App: Effects — Add effects support to the Tour App
- [ ] Tour App: Scavenger hunt — Add scavenger hunt feature to the Tour App
- [ ] Tour App: Scan QR for effect — Scan QR codes to trigger effects in the Tour App
- [ ] Tour App: Improve sound UI & features — Improve the sound user interface and features in the Tour App
- [ ] Tour App: Play intro — Add intro playback to the Tour App
- [ ] Tour App: Guest user management — Manage guest users in the Tour App
- [ ] RFID tag tracking — Identify specific rolling stock by tag reader
- [ ] Voice Control — "Hey DEJA, throw turnout 5 and set signal to clear"
- [ ] AR Layout Overlay — Point your phone at the layout, see train info, turnout states, and signals in AR
- [ ] Sound Spatialization — Position virtual speakers on the layout, sound follows the train
- [ ] AI Scenery Generator — Describe a scene, AI generates Arduino/Pico animation sequences

## Done
- [x] Sync device statuses across all apps — Ensure connect/disconnect events write to Firebase so status updates propagate to cloud, monitor, throttle in real-time
- [x] Redesign settings pages across all apps — Unified settings UI for theme, connection config, user preferences, layout options
- [x] Update DCC-EX page on cloud app — Update the DCC-EX configuration page in the cloud app
- [x] Stripe subscriptions & pricing — Add pricing page, update onboarding for subscriptions, support sales/discount codes
- [x] Update README & quickstart guide — Simple 3-step getting started + advanced repo clone mode
- [x] Pricing page with Stripe integration — Add pricing page to dejajs.com with Stripe integration
- [x] Redesign login / signup pages — Modern split-layout, better visual hierarchy, social auth prominent

