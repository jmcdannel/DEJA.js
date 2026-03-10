# DEJA.js Roadmap

## Phase 1: Production Ready (Current Focus)
- [x] Account menu
- [x] DEJA Suite Nav
- [x] Login Page / w/signup
- [x] Error notification system (toast/snackbar across all apps)
- [ ] Complete auth flow (email/password, password reset, email verification)
- [ ] Offline/disconnection handling with retry
- [x] Server robustness (input validation, reconnection, graceful shutdown)
- [x] Loading/empty states across all views
- [ ] Complete onboarding / create layout flow
- [x] Type safety cleanup (eliminate `any` types)
- [x] Production logging (remove console.log, configure log levels)
- [ ] Guest Mode / Demo Mode

## Phase 2: Feature Parity with DCC-EX Ecosystem
- [ ] CV/Decoder Programming — read/write CVs from the browser (service track + POM)
- [ ] Sensor & Block Occupancy — digital/analog sensor input, block detection display
- [ ] Fast Clock — accelerated model time for operations sessions
- [ ] Enhanced Consisting — advanced consist management (CV19, command station consists)
- [ ] Store roster on DCC-EX command station (sync with DEJA cloud)
- [ ] Function map — momentary vs latching toggle behavior (like EX-WebThrottle)

## Phase 3: Automation & Intelligence
- [ ] Visual Automation Builder — drag-and-drop automation sequences (DEJA's answer to EX-RAIL/Logix)
      - Set turnout → wait → set signal → drive train → stop at sensor
      - No code required, runs in the cloud, triggers via Firebase
- [ ] Route Automation — entry/exit click-to-route on a visual layout
- [ ] Sensor-Triggered Events — crossing gates, sound effects, signals on block entry
- [ ] Scheduled Operations — time-based automation via fast clock integration
- [ ] AI Conductor — LLM-powered train dispatcher that manages traffic, signals, and routing
      - "Run the evening commuter schedule" → AI sets routes, signals, and drives trains
      - Collision avoidance via block occupancy + reservation system

## Phase 4: Layout Visualization
- [ ] Track Diagram Editor — draw your layout in the browser (tracks, turnouts, signals, blocks)
      - Real-time state overlay (turnout positions, block occupancy, signal aspects)
      - Click-to-control (throw turnouts, set routes, dispatch trains)
- [ ] 3D Layout Viewer — WebGL-based 3D visualization of your layout with live train positions
- [ ] CTC Dispatcher Panel — prototype-accurate CTC control panel builder

## Phase 5: Operations & Community
- [ ] Operations Mode — car routing, switch lists, manifests (like JMRI OperationsPro)
      - Industries, spurs, yards, staging
      - Car types, loads, scheduling
      - Crew instructions and timetables
- [ ] Layout Sharing — publish your layout config for others to use as a template
- [ ] Public Layout Gallery — browse and clone community layouts
- [ ] Multi-layout Dashboard — manage multiple layouts from one account

## Phase 6: Hardware Expansion
- [ ] WiThrottle Protocol Server — allow Engine Driver, WiThrottle iOS, and other apps to connect
- [ ] Multi-command-station support — connect to multiple DCC-EX stations simultaneously
- [ ] DC (analog) support via DCC-EX TrackManager
- [ ] RFID tag tracking — identify specific rolling stock by tag reader
- [ ] Turntable control — integrate with EX-Turntable via I2C

## Dream Features
- [ ] Voice Control — "Hey DEJA, throw turnout 5 and set signal to clear"
- [ ] AR Layout Overlay — point your phone at the layout, see train info, turnout states, and signals in AR
- [ ] Sound Spatialization — position virtual speakers on the layout, sound follows the train
- [ ] AI Scenery Generator — describe a scene, AI generates Arduino/Pico animation sequences
- [ ] Replay Mode — record and replay an entire operating session
- [ ] Live Streaming Integration — stream layout camera feeds with real-time data overlay
- [ ] Multiplayer Operations — multiple users dispatch trains on the same layout in real-time (already possible with Firebase!)
- [ ] Mobile Haptic Feedback — phone vibrates based on throttle position and train acceleration

## Dropped / Deferred
- [-] ttt-io as packages
- [-] ttt-io build scripts
- [-] DEJA.js marketing site
- [-] TTT Site
- [-] Sound mixer / mute
- [-] LED designer
