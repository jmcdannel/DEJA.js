# 🎬 Throttle App Walkthrough Video — Production Plan

**Date:** 2026-03-24
**Status:** Draft
**Scope:** 90–120 second walkthrough of the Throttle app for the dejajs.com throttle getting-started guide
**Placement:** Hero section of `/docs/throttle/getting-started` + homepage reference

---

## 🎨 Creative Direction

### Tone & Voice
- Match DEJA.js brand guidelines: warm but precise, confident but welcoming
- Narration should feel like showing a friend how the app works
- "Here, let me show you" energy — not a lecture or sales pitch

### Visual Identity
- Dark canvas matching dejajs.com (gray-950 background)
- Brand colors: Cyan (#00E5FF) for highlights, soft white for UI
- Device frames for mobile/desktop screenshots
- Animated callout circles (cyan) highlighting tapped elements
- Smooth crossfade transitions between scenes (not hard cuts)

### Emotional Arc
1. 🧐 **Curiosity** (0–10s) — "This looks clean and simple"
2. 😌 **Satisfaction** (10–50s) — "Oh, driving trains with this is intuitive"
3. 🤩 **Discovery** (50–90s) — "Wait, it does turnouts, routes, and effects too?"
4. 🚀 **Excitement** (90–120s) — "I want to try this"

---

## 🎙️ Narration Script

**Target:** ~250 words at 150 wpm warm delivery
**Total runtime:** ~100 seconds narration + 15s transitions + end card

### SCENE 1 — Connect (0:00–0:15)
> Open Throttle in your browser — no app store, no install. Your command station appears automatically. Tap connect, and you're online.

### SCENE 2 — Add a Locomotive (0:15–0:30)
> Tap the plus button to add a locomotive. Enter a DCC address and a name — that's it. Your loco is ready to drive.

### SCENE 3 — Drive (0:30–0:50)
> Select your loco and slide the throttle. Forward, reverse, any speed you want. The controls feel like they belong in your hand.

*[Hold on the throttle sliding up. Let the visual breathe.]*

### SCENE 4 — Functions (0:50–1:00)
> Tap the function button to toggle lights, horn, bell — anything your decoder supports.

### SCENE 5 — Turnouts & Routes (1:00–1:20)
> Throw turnouts with a tap. Or fire a route to set an entire path at once. Color shows you the state at a glance.

### SCENE 6 — Effects (1:20–1:30)
> Trigger sound effects, lighting scenes, and animations right from the app. Your layout comes alive.

### SCENE 7 — What's Next (1:30–1:45)
> That's the basics. There's a lot more — Conductor mode for full operator stations, signals, cloud management, and settings to make it yours.

### END CARD (1:45–1:55)
> Get started at dejajs.com.
*[DEJA.js logo centered. URL below. 5-second hold.]*

---

## 📋 Shot List

| # | Content | Source | Device | Duration | Notes |
|---|---------|--------|--------|----------|-------|
| 1 | Home screen, connection status | Screen recording | Mobile | 8s | Show auto-detected command station |
| 2 | Tap connect, status turns green | Screen recording | Mobile | 7s | Cyan glow on successful connect |
| 3 | Throttle list, tap + FAB | Screen recording | Desktop | 5s | Show empty → FAB appears |
| 4 | Add loco dialog, fill in address + name | Screen recording | Desktop | 10s | Focus on simplicity — just 2 fields |
| 5 | Select loco from throttle list | Screen recording | Desktop | 5s | Tap → transition to throttle view |
| 6 | Throttle view, slide speed up | Screen recording | Mobile | 10s | Hold on the sliding gesture |
| 7 | Tap direction toggle (forward ↔ reverse) | Screen recording | Mobile | 5s | Quick, satisfying interaction |
| 8 | Function speed dial expand + toggle | Screen recording | Mobile | 10s | Show lights, horn, bell toggling |
| 9 | Turnouts view, throw a turnout | Screen recording | Desktop | 8s | Show color change on throw |
| 10 | Routes view, fire a route | Screen recording | Desktop | 7s | Multiple turnouts change at once |
| 11 | Effects view, trigger an effect | Screen recording | Mobile | 8s | Lighting or sound effect |
| 12 | Conductor mode quick pan | Screen recording | Desktop | 4s | Show the three-pane layout |
| 13 | Signals view quick glance | Screen recording | Desktop | 3s | Brief flash of signal aspects |
| 14 | Cloud dashboard quick glance | Screen recording | Desktop | 3s | Show management capabilities |
| 15 | End card — DEJA.js logo + URL | Animated graphic | — | 10s | Match website FinalCTA styling |

---

## 📸 Screenshot & Asset Needs

### ✅ Existing Screenshots (available in public/screenshots/)
| Screenshot | Status |
|-----------|--------|
| `throttle_mobile_home.png` | ✅ Exists |
| `throttle_desktop_throttle-list.png` | ✅ Exists |
| `throttle_mobile_throttle.png` | ✅ Exists |
| `throttle_desktop_turnouts.png` | ✅ Exists |
| `throttle_desktop_routes.png` | ✅ Exists |
| `throttle_mobile_effects.png` | ✅ Exists |
| `throttle_desktop_conductor.png` | ✅ Exists |
| `throttle_mobile_signals.png` | ✅ Exists |
| `cloud_desktop_dashboard.png` | ✅ Exists |

### 📷 Screenshots Needing Capture
| Screenshot | Device | What to Capture |
|-----------|--------|----------------|
| `throttle_desktop_add-loco.png` | Desktop | Add locomotive dialog from throttle list FAB — show the dialog open with empty address + name fields |
| `throttle_mobile_functions.png` | Mobile | Function speed dial expanded — show lights, horn, bell options visible |

### 🎥 Screen Recordings Needed
| Recording | Device | FPS | Notes |
|-----------|--------|-----|-------|
| Full connect flow | Mobile (portrait) | 60 | Home → connect → status green |
| Add loco flow | Desktop (1920×1080) | 60 | FAB → dialog → fill → confirm |
| Drive flow | Mobile (portrait) | 60 | Select loco → throttle → slide speed → direction |
| Functions flow | Mobile (portrait) | 60 | Tap function button → speed dial → toggle 3 functions |
| Turnouts flow | Desktop (1920×1080) | 60 | Navigate to turnouts → throw 2 turnouts |
| Routes flow | Desktop (1920×1080) | 60 | Navigate to routes → fire a route |
| Effects flow | Mobile (portrait) | 60 | Navigate to effects → trigger an effect |
| Conductor + signals montage | Desktop (1920×1080) | 60 | Quick pan through conductor, signals |

### 🖼️ Graphics Assets
| Asset | Format | Notes |
|-------|--------|-------|
| DEJA.js logo animation | After Effects / SVG | End card — match Logo component styling |
| Device mockup frames | PNG with transparency | Dark bezel phone + laptop frames for compositing |
| Animated callout circles | After Effects / code | Cyan ring that appears around tapped UI elements |

---

## 🎵 Music & Sound Design

### Music Direction
- Ambient electronic, matching architecture video spec
- 80–100 BPM, builds gently through the middle
- Starts sparse (single synth pad), peaks at "turnouts & routes" section (most visual action), resolves for end card
- Source: Artlist or Epidemic Sound ($15–50/month)

### 🔊 Sound Design
| Moment | Sound | Notes |
|--------|-------|-------|
| App open (0:00) | Soft UI open sound | Sets the "app experience" tone |
| Connect success | Subtle chime/confirmation | Matches the app's own connect feedback |
| Speed slider movement | Gentle analog slide sound | Reinforces physicality |
| Turnout throw | Soft click/snap | Quick, satisfying |
| Route fire | Sequential soft clicks | Multiple turnouts changing |
| Effect trigger | Brief ambient swell | Matches whatever effect plays |
| End card | Clean bell tone | Signals finality, matches architecture video |

---

## ⚙️ Technical Specifications

| Parameter | Value |
|-----------|-------|
| Resolution | 1920×1080 (16:9) primary, 1080×1920 (9:16) social cut |
| Frame rate | 30 fps (60 fps for screen recordings) |
| Codec | H.264 (web), ProRes 422 (master) |
| Bitrate | 8–12 Mbps H.264 |
| Audio | AAC, 48kHz, stereo |
| Color | sRGB, dark theme optimized |

### 🌐 Web Delivery
- Host on Vercel Blob or YouTube (unlisted)
- Provide poster frame (screenshot of throttle view with speed slider mid-range)
- Lazy load — no autoplay
- Provide WebM fallback for better compression

### ♿ Accessibility
- Closed captions (SRT) matching narration
- Descriptive poster frame alt text
- Video makes sense without sound (callout animations carry the story)

---

## 🛠️ Production Workflow

### Phase 1 — Pre-production (1 day)
1. Finalize narration script — read aloud, time it, adjust pacing
2. Record narration (USB mic, quiet room, Audacity/GarageBand)
3. Select music track (browse with narration playing)
4. Capture missing screenshots (add-loco dialog, function speed dial)

### Phase 2 — Screen Recordings (1 day)
5. Set up Throttle app in demo/development mode with a connected layout
6. Record each flow at 60fps (OBS Studio or QuickTime)
7. Record mobile flows using browser device emulation or real device
8. Clean up recordings — trim dead time, ensure smooth interactions

### Phase 3 — Assembly (2–3 days)
9. Composite recordings into device mockup frames
10. Add animated callout circles at tap points
11. Lay narration track → music → visuals
12. Add crossfade transitions between scenes
13. Sound design pass — subtle, complementary sounds

### Phase 4 — Polish (1 day)
14. Color grade to match dark theme
15. Review: with sound, without sound, captions only
16. Export H.264 + WebM + ProRes
17. Write SRT captions
18. Replace video placeholder in getting-started guide

---

## 💰 Budget Estimate

| Item | Cost | Notes |
|------|------|-------|
| Music license | $15–50/month | Artlist or Epidemic Sound |
| Narration | $0 (self) or $100–300 (freelance) | Self-recorded preferred for authenticity |
| Screen recordings | $0 | OBS Studio (free) |
| Video editing | $0 (DIY) or $400–1000 (freelance) | iMovie/DaVinci Resolve (free) |
| Sound effects | $0–15 | Included in music subscription |
| **Total (DIY)** | **$15–65** | |
| **Total (outsourced)** | **$500–1350** | |

---

## ✅ Success Criteria

- Viewer understands how to use the Throttle app after a single watch
- Video feels warm and welcoming, not intimidating
- Matches the premium dark aesthetic of dejajs.com
- A model railroad hobbyist with no tech background can follow along
- Works with or without sound (callouts + captions carry the story)
- Total runtime 90–120 seconds
