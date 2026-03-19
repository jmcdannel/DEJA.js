# Architecture Explainer Video — Production Plan

**Date:** 2026-03-19
**Status:** Draft
**Scope:** 60–90 second architecture walkthrough video for the dejajs.com website architecture page
**Placement:** Embedded on the architecture page and referenced from the homepage `VideoPlaceholder` component

---

## Creative Direction

### Tone & Voice

Follow the DEJA.js brand guidelines throughout:

- **Warm but precise.** The narration should feel like a knowledgeable friend walking you through the system — never like a lecture or a sales pitch.
- **Confident but welcoming.** Assume the viewer is smart but may not know what WebSockets or serial protocols are. Make them feel capable without dumbing it down.
- **Elegant but not exclusive.** The visuals should feel premium and modern (dark theme, clean motion) without being intimidating.
- **Clear but never cold.** Every sentence should earn its place. No filler, no buzzwords, no "leveraging cutting-edge synergies."

### Visual Identity

- **Dark canvas** — Match the dejajs.com site: `gray-950` background with subtle grid pattern
- **Brand colors** — Cyan (`#00E5FF`) for DEJA.js platform elements, magenta (`#D500F9`) for accents, lime (`#C6FF00`) for calls to action, purple (`#8B5CF6`) for DCC-EX, yellow/amber (`#EAB308`) for DEJA IO devices, orange (`#F97316`) for track/physical hardware
- **Typography** — Clean sans-serif. Headlines in Bebas Neue (matching the website). Body in system font stack.
- **Motion style** — Smooth, deliberate animations. Elements fade and slide in (not bounce or snap). Think Apple product reveal, not explainer cartoon.

### Emotional Arc

1. **Wonder** (0–10s) — "Wait, I can control my trains from my phone?"
2. **Clarity** (10–55s) — "Oh, that is how it all connects. That is elegant."
3. **Confidence** (55–75s) — "I could set this up. This is built for me."
4. **Action** (75–85s) — "I want to try this."

---

## Narration Script

**Target:** ~200 words at a measured pace. Approximately 150 words per minute for a warm, unhurried delivery.

**Total runtime target:** 80 seconds (narration fills ~65 seconds; remaining 15 seconds are held beats, transitions, and the end card).

---

### SCENE 1 — The Moment (0:00–0:08)

> You tap your phone. A locomotive starts moving on the other side of the room.

*[2-second pause. Let the visual breathe.]*

> That single tap traveled through four layers of technology — in under a second.

---

### SCENE 2 — The Apps (0:08–0:22)

> It starts here. DEJA.js runs in any browser — no app store, no install. The Throttle app gives you speed, direction, and function control. Cloud manages your layout. Monitor shows you what's happening under the hood.

*[Brief pause as all three app nodes settle into the diagram.]*

> Every app connects to one place.

---

### SCENE 3 — The Server (0:22–0:36)

> The DEJA Server. A lightweight Node.js process running on your computer or a Raspberry Pi. It is the bridge between your browser and your hardware — handling WebSockets, Firebase sync, and serial communication simultaneously.

*[Diagram animates connection lines from apps down to server.]*

> One command to install. One command to start.

---

### SCENE 4 — The Hardware (0:36–0:52)

> The server talks to your DCC-EX CommandStation over USB serial. DCC-EX does what it does best — generating the DCC signal that powers your track and controls your decoders.

*[Connection line animates from server to DCC-EX to track.]*

> And with DEJA IO, you can go further. Arduino and Pico W devices connect over MQTT to control lights, servos, signals, sensors, and sounds — bringing your entire layout to life.

*[IO devices and peripheral nodes fade in on the diagram.]*

---

### SCENE 5 — The Full Picture (0:52–0:65)

> That is the full picture. Your phone, the cloud, the server, the command station, the track — all connected, all in sync, all working together.

*[Camera pulls back to reveal the complete architecture diagram. Hold for 3 seconds.]*

> Simple to start. Built to grow.

---

### SCENE 6 — End Card (0:65–0:80)

> Get started at dejajs.com.

*[DEJA.js logo centered. URL below. 5-second hold.]*

---

## Shot List

### Shot 1 — "The Tap" (0:00–0:04)
- **Visual:** Close-up of a finger tapping the "Forward" button on the Throttle app (mobile view). The phone is held naturally, slightly angled. Background is softly blurred.
- **Source:** Screen recording of the Throttle app on a real phone, composited into a device mockup if hardware capture is not available.
- **Motion:** The speed slider animates up after the tap. A subtle ripple or glow confirms the action.

### Shot 2 — "The Train Moves" (0:04–0:08)
- **Visual:** A model locomotive begins moving on track. Shallow depth of field. Warm lighting.
- **Source:** Live footage of a real train on a real layout. If unavailable, use a high-quality stock clip of an HO or N scale locomotive starting up.
- **Motion:** Cut or match-dissolve from the phone screen to the moving train. This is the "magic moment."

### Shot 3 — "Four Layers" (0:06–0:10)
- **Visual:** Transition to dark canvas. The number "4" or a subtle layered graphic hints at the architecture before it builds. The text "four layers of technology" could appear as a minimal typographic card.
- **Motion:** Fade from the train footage into the dark diagram canvas.

### Shot 4 — "Apps Layer" (0:08–0:22)
- **Visual:** The architecture diagram begins building. Three app nodes (Throttle, Cloud, Monitor) fade in at the top of the diagram, each with its icon and label. As each is named in narration, it highlights with a subtle glow.
- **Source:** Animated version of the `ArchitectureDiagram` SVG component (full config). Can be built in After Effects, Motion, or animated directly in code and screen-recorded.
- **Intercuts:** Brief picture-in-picture of each app's desktop screenshot fading in and out as it is named:
  - Throttle: `throttle_desktop_throttle.png`
  - Cloud: `cloud_desktop_roster.png`
  - Monitor: `monitor_desktop_dashboard.png`

### Shot 5 — "The Server" (0:22–0:36)
- **Visual:** The DEJA Server node fades in at layer 2 of the diagram. WebSocket connection lines animate from each app node down to the server (cyan, with the cloud icon label). The server node pulses subtly to indicate it is active.
- **Intercut (optional):** Quick flash of the terminal install sequence (matching the `ServerCLISection` terminal block on the homepage):
  ```
  $ curl -fsSL https://install.dejajs.com | bash
  ✓ DEJA Server v1.2.0 installed
  ✓ Server running on ws://localhost:8082
  ✓ CommandStation connected on /dev/ttyUSB0
  ```
- **Motion:** Lines draw themselves from top to bottom, arriving at the server node.

### Shot 6 — "DCC-EX & Track" (0:36–0:48)
- **Visual:** The DCC-EX node fades in at layer 3 (purple). A USB serial connection line animates from server to DCC-EX (purple with USB icon). Then the Track node fades in at layer 4 (orange), with the DCC signal line animating from DCC-EX to track.
- **Intercut (optional):** Brief footage of a DCC-EX CommandStation (Arduino Mega with motor shield) — either real hardware footage or a clean product-style photo with subtle Ken Burns motion.
- **Motion:** Each connection draws in sequence, building the path from server to track.

### Shot 7 — "DEJA IO Expansion" (0:48–0:55)
- **Visual:** The DEJA IO section of the diagram fades in — Arduino and Pico W device nodes (yellow) with MQTT connection lines from the server. Then peripheral mini-nodes (green circles) appear below the IO devices: LED, Servo, Signal, Sensor, Sound, Relay.
- **Motion:** IO devices fade in together, then peripherals pop in with a staggered cascade (50ms delay between each). The DEJA IO area container (yellow border) draws itself around them.

### Shot 8 — "The Full Picture" (0:52–0:65)
- **Visual:** Camera (virtual) slowly zooms out to reveal the entire architecture diagram — all nodes, all connections, all areas. The diagram is complete and glowing softly. Hold this wide shot for 3 seconds.
- **Text overlay:** "Simple to start. Built to grow." appears below the diagram in Bebas Neue, fading in.
- **Motion:** Smooth zoom-out. Slight parallax if depth layers are separated.

### Shot 9 — "End Card" (0:65–0:80)
- **Visual:** Clean dark canvas. DEJA.js logo (matching the website `Logo` component) centered. Below it: `dejajs.com` in clean white text. Subtle ambient cyan glow behind the logo (matching `FinalCTA` section styling).
- **Motion:** Logo fades in, URL fades in 0.5s later. Hold for 5 seconds. Fade to black.

---

## Asset Requirements

### Screen Recordings Needed

| Asset | Source | Notes |
|-------|--------|-------|
| Throttle app — tap Forward, speed slider animates | `throttle.dejajs.com` (mobile) | Record on a real phone or use browser device emulation. Capture the speed slider moving from 0 to ~50. |
| Throttle app — desktop view | `throttle.dejajs.com` (desktop) | Quick pan showing the throttle interface with a locomotive loaded. |
| Cloud app — roster or turnout view | `cloud.dejajs.com` (desktop) | 2–3 second clip showing the management interface. |
| Monitor app — dashboard | `monitor.dejajs.com` (desktop) | 2–3 second clip showing real-time diagnostics. |
| Terminal install sequence | Terminal emulator | Record or animate the install command sequence matching `ServerCLISection`. Use a clean terminal theme (dark background, green/cyan text). |

### Existing Screenshots (for PIP overlays)

These already exist in `apps/dejajs-www/public/screenshots/`:

- `throttle_desktop_throttle.png`
- `throttle_mobile_home.png`
- `cloud_desktop_roster.png`
- `monitor_desktop_dashboard.png`
- `throttle_desktop_turnouts.png`

### Live Footage Needed

| Asset | Description | Priority |
|-------|-------------|----------|
| Train starting to move | HO or N scale locomotive beginning to move on track. Shallow DOF, warm lighting. 3–5 seconds. | **Required** |
| DCC-EX CommandStation | Close-up of Arduino Mega with motor shield, USB cable connected. Clean workbench or layout setting. 3 seconds. | Nice to have |
| Raspberry Pi running DEJA Server | Pi with power LED on, connected via USB to CommandStation. 2 seconds. | Nice to have |
| DEJA IO device (Arduino or Pico W) | Device on or near the layout with visible LED strips, servo, or signal head. 2 seconds. | Nice to have |

If live footage is unavailable, substitute with:
- High-quality stock footage of model railroad trains (search: "model train HO scale close-up")
- Clean product photos of Arduino Mega, Raspberry Pi, Pico W with subtle Ken Burns motion applied

### Graphics & Animation Assets

| Asset | Description | Format |
|-------|-------------|--------|
| Animated architecture diagram | The core visual. Recreate the `ArchitectureDiagram` SVG (full config) as an animatable composition. Each layer, node, and connection should be on separate layers for staggered reveal. | After Effects / Motion / Lottie |
| DEJA.js logo animation | Logo reveal for the end card. Match the existing `Logo` component styling. | After Effects / SVG animation |
| App icon set | Throttle, Cloud, Monitor, Tour icons at 512px. Already exist in `public/throttle/icon-512.png`, `public/cloud/icon-512.png`, `public/monitor/icon-512.png`, `public/tour/icon-512.png`. | PNG (existing) |
| DCC-EX logo | Already exists at `public/dcc-ex/android-chrome-512x512.png`. | PNG (existing) |
| Device mockup frame | Phone frame for the Throttle app footage. Use a minimal, dark bezel design. | PNG with transparency |

### Typography

- **Headlines / overlays:** Bebas Neue (matches website `--font-bebas-neue`)
- **Body / labels:** System sans-serif (Inter, SF Pro, or similar)
- **Terminal text:** Monospace (JetBrains Mono or SF Mono)

---

## Music & Sound Design

### Music Direction

- **Genre:** Ambient electronic / minimal synth. Think: Tycho, Jon Hopkins (quieter tracks), or the ambient scores from Apple product videos.
- **Tempo:** Slow to moderate (80–100 BPM). The video should feel unhurried and confident, not frenetic.
- **Arc:** Starts sparse and atmospheric (just pads or a single synth tone). Builds gently through the middle as the architecture assembles. Reaches a quiet peak at "the full picture" moment. Resolves cleanly for the end card.
- **Avoid:** Anything with lyrics. Anything overly dramatic or cinematic (no Hans Zimmer horns). Anything that sounds like a corporate explainer jingle.
- **Licensing:** Use a royalty-free track from Artlist, Epidemic Sound, or Musicbed. Budget $15–50/month for a subscription license. Alternatively, commission a 90-second custom ambient track.

### Sound Design

| Moment | Sound | Notes |
|--------|-------|-------|
| Phone tap (0:00) | Soft UI click / haptic feedback | Subtle. Should feel like a real phone interaction. |
| Train starts moving (0:04) | Very faint model railroad motor hum | Barely audible under music. Sells the physical reality. |
| Diagram node appears | Soft "materialize" tone — a gentle chime or soft click | One per node. Should not be distracting. Consider omitting if it feels cluttered. |
| Connection line draws | Subtle whoosh or digital pulse | Very quiet. Adds texture without demanding attention. |
| Full diagram reveal (0:55) | Brief swell — a single sustained note that lifts the music | This is the emotional peak. The sound should say "everything clicks." |
| End card logo (0:65) | Clean, resonant tone — like a bell or a single piano note | Signals finality. Clean and elegant. |

---

## Technical Specifications

### Export Format

| Parameter | Value |
|-----------|-------|
| Resolution | 1920 x 1080 (16:9) — also export 1080 x 1920 (9:16) for social media |
| Frame rate | 30 fps (60 fps if smooth diagram animation requires it) |
| Codec | H.264 (web delivery), ProRes 422 (master) |
| Bitrate | 8–12 Mbps for H.264 web delivery |
| Audio | AAC, 48kHz, stereo |
| Color | sRGB, dark theme optimized |

### Web Delivery

- Host on **Vercel Blob** or **YouTube** (unlisted) with an embedded player
- Provide a poster frame (thumbnail) for the `<video>` element — use the "full diagram" shot (Shot 8)
- Implement lazy loading — video should not auto-play on page load
- Provide WebM format as a fallback for better compression

### Accessibility

- Include **closed captions** (SRT file) matching the narration script exactly
- Ensure the poster frame is descriptive (alt text: "DEJA.js architecture diagram showing apps, server, DCC-EX, and track layers")
- The video should make sense with sound off — the diagram animation and text overlays should carry the story visually

---

## Production Workflow

### Phase 1 — Pre-production (1–2 days)

1. **Finalize narration script.** Read it aloud. Time it. Adjust pacing. The script above is a starting point — refine wording until every sentence feels natural when spoken.
2. **Record narration.** Use a quality USB microphone (Blue Yeti, Shure MV7, or similar) in a quiet room. Record in Audacity or GarageBand. Aim for a warm, conversational tone — not a "voiceover guy" voice.
3. **Select music track.** Browse Artlist or Epidemic Sound with the narration playing. The music should complement, not compete.
4. **Storyboard.** Print the shot list. Sketch rough compositions for each shot. Confirm timing against the narration audio.

### Phase 2 — Asset Capture (1–2 days)

5. **Capture screen recordings.** Set up each app in demo mode. Record at 1920x1080. Use a screen recorder that captures at 60fps for smooth scrolling.
6. **Capture live footage.** Set up a small section of track with good lighting. Use a macro lens or phone with portrait mode for shallow DOF. Record at 1080p/30fps minimum.
7. **Photograph hardware.** Clean shots of Arduino Mega, Raspberry Pi, Pico W on a dark surface. Soft, directional lighting.

### Phase 3 — Animation & Assembly (3–5 days)

8. **Build the animated diagram.** Recreate the architecture diagram in After Effects (or similar). Each node, connection, and area should be a separate layer. Animate in the order prescribed by the shot list. Match the exact colors from `layout.ts` (`COLORS` and `CONN_COLORS`).
9. **Composite screen recordings.** Place app screenshots and recordings into device mockups. Apply the dark theme framing.
10. **Assemble the timeline.** Lay narration first, then music, then visuals. Let the narration drive the pacing — visuals should land slightly before or on the narration cue, never after.
11. **Sound design pass.** Add UI sounds, transition sounds, and the ambient textures described above. Keep everything subtle.

### Phase 4 — Polish & Delivery (1–2 days)

12. **Color grade.** Ensure all footage matches the dark, cinematic tone of the website. Slightly desaturate live footage to blend with the diagram graphics.
13. **Review.** Watch the video three times: once with sound, once without (checking visual storytelling), once with captions only.
14. **Export.** Render H.264 and WebM for web. Render ProRes master for archival.
15. **Write captions.** Generate SRT from the narration script with accurate timestamps.
16. **Integrate into website.** Replace the `VideoPlaceholder` component with an actual `<video>` element (or a YouTube/Vimeo embed). Update the poster frame.

---

## Website Integration

The `VideoPlaceholder` component at `apps/dejajs-www/components/home/VideoPlaceholder.tsx` currently displays a mock terminal with "Video coming soon." Once the video is produced:

1. Replace `VideoPlaceholder` with a real video player component
2. The video should live in the "See It In Action" section on the homepage
3. Also embed on the `/docs/architecture` page as the opening visual
4. Consider a shorter 30-second cut for social media (Instagram Reels, YouTube Shorts, Twitter/X)

### Architecture Page Video Embed

On the architecture docs page (`content/docs/architecture.mdx`), add the video at the top, before the "System Overview" heading. The video serves as the visual introduction that the text content then expands on in detail.

---

## Alternative: Code-Animated Version

If motion graphics production capacity is limited, consider building the diagram animation directly in code using the existing `ArchitectureDiagram` component system:

1. Add a `animated` prop to `ArchitectureDiagram` that triggers a timed reveal sequence
2. Use CSS transitions or Framer Motion to stagger node and connection appearances
3. Screen-record the animated diagram with narration playing
4. This approach reuses existing code, stays perfectly in sync with the actual diagram, and is trivially updatable when the architecture changes

The existing diagram infrastructure (`DiagramNode`, `DiagramArrow`, `DiagramArea`, `layout.ts`) already separates nodes, connections, and areas into discrete layers — making staggered animation straightforward.

---

## Success Criteria

- Viewer understands the four-layer architecture (apps, server, DCC-EX, track) after a single watch
- Viewer feels welcomed and capable, not intimidated by technical complexity
- The video matches the premium, dark aesthetic of dejajs.com
- A model railroad hobbyist with no web development background can follow the narrative
- The video works equally well with or without sound (visual storytelling + captions)
- Total runtime stays between 60 and 90 seconds

---

## Budget Estimate

| Item | Cost | Notes |
|------|------|-------|
| Music license | $15–50/month | Artlist or Epidemic Sound subscription |
| Narration | $0 (self-recorded) or $100–300 (freelance VO) | Self-recorded is more authentic to the brand voice |
| Motion graphics | $0 (DIY in After Effects / code-animated) or $500–1500 (freelance) | Code-animated approach is free and maintainable |
| Screen recording tools | $0 | OBS Studio (free) or QuickTime |
| Sound effects | $0–15 | Most SFX libraries include UI sounds in the music subscription |
| **Total (DIY)** | **$15–65** | |
| **Total (outsourced)** | **$600–1850** | |
