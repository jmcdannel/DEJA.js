# MVP Getting Started Experience — Design Spec

**Date:** 2026-03-23
**Status:** Draft
**Scope:** Redesign the end-to-end getting-started experience — onboarding wizard, persistent prompts, free-tier UX, server auto-detection, serial port auto-detect, documentation, and website messaging

---

## 1. Overview

The getting-started experience is DEJA.js's chance to stand apart in the DCC ecosystem. Where legacy platforms present outdated, unusable interfaces and steep learning curves, DEJA.js makes it **easy**. This spec defines how a user goes from zero to driving trains — and how we communicate that journey.

### Guiding Principles

- **Easy, better, evolving** — the tone across all surfaces
- **The new DCC platform** — confident positioning, let the product speak
- **Productive waiting** — never leave users staring at a spinner
- **Persistent guidance** — onboarding isn't "done" until trains are moving
- **Feature discovery** — free users see what's possible, upgrade when ready

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Onboarding home | Cloud app | Cloud is the management hub; Throttle is the destination |
| Progress tracker | "Pizza tracker" style, persistent | Visual progress keeps users engaged during install |
| Tracker placement | Rich top banner (desktop) / slim bottom bar (mobile) | Visible without blocking productive setup work |
| Install wait time | Productive — add locos + tips/tricks | 3-min install shouldn't feel like dead time |
| Server detection | Firebase real-time listener | Instant, no polling, leverages existing architecture |
| Serial auto-detect | Vendor ID filter + DCC-EX verify | Automatic for 90% case (single Arduino device) |
| Free tier scope | Locos only — no modules, no extra devices, default sounds | Clean upgrade path when users want more |
| Free tier UX | All modules visible with 🔒 upgrade icon + CTA empty states | Feature discovery drives natural upsell |
| Onboarding state | Firestore `users/{uid}.onboarding` — write-once flags | Persistent prompts across sessions until fully set up |
| Docs structure | Replace existing getting-started guide | Single definitive guide matching the new flow |
| Website | Keep aspirational/simple | Docs and in-app handle the detail |
| Tone | Warm, easy, confident | DCC audience = hobbyists; make it approachable |
| JMRI positioning | Don't name-drop; reference "outdated interfaces" confidently | Let the product speak for itself |

---

## 2. Onboarding Flow (Cloud App)

### Revised Wizard Steps

```
Step 1        Step 2        Step 3        Step 4           Step 5
Account  ──▶  Plan    ──▶  Layout  ──▶  Install + Setup ──▶  Ready!
```

#### Step 1 — Create Account
- Sign up via email/password or OAuth (Google, GitHub, Facebook, Apple, Microsoft)
- Uses existing `@repo/auth` `Signup.vue` component
- On success: user doc created in Firestore, advance to Step 2

#### Step 2 — Choose Plan
- 3 tiers: Hobbyist (free), Engineer ($7/mo), Conductor ($18/mo)
- Free tier prominent — this is the default getting-started path
- Annual billing toggle with savings displayed
- Hobbyist: skips payment, creates subscription doc immediately
- Paid: Stripe Elements inline, 14-day free trial with card upfront
- On success: `onboarding.planSelected = true`, advance to Step 3

#### Step 3 — Register Layout
- User enters layout name → auto-generates ID (toggle for custom ID)
- Validation: lowercase, numbers, hyphens, min 3 chars
- Creates Firestore `layouts/{layoutId}` with default DCC-EX device
- Stores `layoutId` in localStorage
- On success: `onboarding.layoutCreated = true`, advance to Step 4

#### Step 4 — Install Server + Setup Your Layout
This is the **key innovation** — a split-screen productive wait state.

**Top/Header: Pizza Tracker Progress Bar**
- Animated progress through install stages
- Desktop: rich top banner with step labels and progress bar
- Mobile: slim bottom bar with minimal progress indicator
- Waits for `onboarding.serverStarted` to flip to `true` in Firestore
- 🎉 Celebration animation when server is detected

**Main Content Area (while waiting):**

Panel A — "Set up your roster while you wait"
- Inline loco creation form (DCC address + name — minimal fields)
- List of added locos with edit/delete
- Paid plans: also show turnout, effect, signal setup sections
- Free plan: show locked module sections with upgrade CTAs

Panel B — "What's happening" / Tips & Tricks
- Explain the architecture: "Your server connects to your CommandStation via USB and syncs with the cloud"
- Topology diagram (static SVG, potentially animated)
- Tips: "Pro tip: DCC addresses are usually printed on the decoder" etc.
- FAQ snippets: "Can I run this on a Raspberry Pi? Yes!"
- Rotating tips on a timer or as a scrollable list

**When server comes online:**
- Progress bar completes with celebration
- Main content transitions to "Your railroad is connected!" message
- Big CTA: "Open Throttle →" button

#### Step 5 — Ready!
- Summary of what was set up (plan, layout, locos added, server connected)
- Primary CTA: "Launch Throttle" → `throttle.dejajs.com`
- Secondary: "Explore Cloud Dashboard" → stay in Cloud app
- Confetti or subtle celebration animation 🎉

---

## 3. Onboarding State Machine

### Firestore: `users/{uid}.onboarding`

| Field | Type | Set By | Write-Once | Purpose |
|-------|------|--------|------------|---------|
| `planSelected` | `boolean` | Cloud app | ✅ | Plan step completed |
| `layoutCreated` | `boolean` | Cloud app | ✅ | Layout step completed |
| `installStarted` | `boolean` | Cloud app | ✅ | User reached install step (copied command / clicked install) |
| `installStartedAt` | `Timestamp` | Cloud app | ✅ | When user started install — enables drop-off detection |
| `serverStarted` | `boolean` | Server | ✅ | Server's first successful startup |
| `serverStartedAt` | `Timestamp` | Server | ✅ | When server first connected |

### Conversion Funnel & Drop-Off Detection

Users who have `installStarted = true` but `serverStarted = false` after a reasonable window (e.g., 24–48 hours) are **install drop-offs**. These users copied the install command but never successfully connected their server.

**Use cases:**
- Automated email: "Need help finishing your setup? Here's a troubleshooting guide"
- Dashboard metric: sign-up → install started → server connected conversion rates
- Support outreach: identify users who may be stuck on prerequisites (Node.js, serial permissions, etc.)

**When to set `installStarted`:**
- User clicks "Copy" on the install command, OR
- User reaches the install step in the wizard (entering Step 4)

### Server-Side: Setting `serverStarted`

On first startup, after subscription validation succeeds:

```typescript
const userRef = db.doc(`users/${uid}`)
const userDoc = await userRef.get()
const onboarding = userDoc.data()?.onboarding

if (!onboarding?.serverStarted) {
  await userRef.set({
    onboarding: {
      serverStarted: true,
      serverStartedAt: FieldValue.serverTimestamp()
    }
  }, { merge: true })
}
```

### Cloud App: Listening for Server

```typescript
// In install step — reactive, real-time, no polling
const userDoc = useDocument(doc(db, 'users', uid))
const serverStarted = computed(() => userDoc.value?.onboarding?.serverStarted ?? false)

watch(serverStarted, (started) => {
  if (started) {
    // 🎉 Trigger celebration animation, advance progress bar
  }
})
```

---

## 4. Persistent Prompts (Post-Wizard)

After the wizard closes, prompts continue until the user is fully set up. These appear as banners/cards in both Cloud and Throttle apps.

### Cloud App Prompts

| Condition | Prompt | Location |
|-----------|--------|----------|
| `!onboarding.serverStarted` | "Install & start your server to connect your railroad" + install command + pizza tracker | Dashboard top |
| `serverStarted && !hasLocos` | "Add your first locomotive to get started" + CTA to roster | Dashboard top |
| `serverStarted && hasLocos` | "Your railroad is ready! Open Throttle →" | Dashboard top (dismissable) |

### Throttle App Prompts

| Condition | Prompt | Location |
|-----------|--------|----------|
| `!onboarding.serverStarted` | "Connect your server to start driving" + link to Cloud setup | Homepage |
| `serverStarted && !hasLocos` | "Add your first loco to get started" + inline add form | Below Quick Connect |
| `serverStarted && hasLocos` | Normal experience — roster visible, drive away 🚂 | — |

---

## 5. Free Tier UX

### What Free Users Get
- ✅ Up to 5 locomotives in roster
- ✅ Cloud app: roster, settings, devices, DCC-EX console
- ✅ Throttle app: speed/direction/function controls
- ✅ Default DCC-EX device (auto-created)
- ✅ Default sounds only
- ❌ Turnouts, effects, signals, sensors, routes, sounds library, extra devices

### Navigation — All Modules Visible

Both Cloud and Throttle apps show **all module nav items** regardless of plan:

```
Nav (Free Tier)
├── 🚂 Roster           ← active
├── 🔀 Turnouts    🔒   ← visible, locked icon
├── ✨ Effects     🔒   ← visible, locked icon
├── 🚦 Signals    🔒   ← visible, locked icon
├── 🔊 Sounds     🔒   ← visible, locked icon
├── 🗺️ Routes     🔒   ← visible, locked icon
├── ⚙️ Settings         ← active
└── 📟 DCC-EX          ← active
```

### Empty State Upgrade CTA

When a free user taps a locked module:

```
┌─────────────────────────────────────────────┐
│                                             │
│        🔀  Turnout Control                  │
│                                             │
│   Throw and close turnouts from any device  │
│   with real-time sync across all operators  │
│                                             │
│   Available on Engineer and Conductor plans  │
│                                             │
│        [ Upgrade Now → ]                    │
│                                             │
│   Starting at $7/mo · 14-day free trial     │
│                                             │
└─────────────────────────────────────────────┘
```

Each module gets a **unique** empty state with:
- Module icon + name
- One-sentence value prop specific to that module
- Plan availability
- Upgrade CTA button
- Price anchor + trial mention

---

## 6. Serial Port Auto-Detection

### Current State
- `SerialPort.list()` returns full metadata (vendorId, productId, manufacturer)
- Server discards everything except `path` — sends only path strings to clients
- Users manually select ports with no hints

### New Behavior

#### Step 1: Enrich Port Data
Send full metadata to clients:

```typescript
const availablePorts = await SerialPort.list()
const enrichedPorts = availablePorts.map((port) => ({
  path: port.path,
  manufacturer: port.manufacturer ?? null,
  vendorId: port.vendorId ?? null,
  productId: port.productId ?? null,
  isLikelyDccEx: isKnownArduinoChip(port),
}))
```

#### Step 2: Known Chip Detection

```typescript
const KNOWN_ARDUINO_VENDORS: Record<string, string> = {
  '2341': 'Arduino',           // Arduino Mega/Uno (native USB)
  '1a86': 'CH340 (Arduino)',   // CH340 clone chips
  '0403': 'FTDI',             // FTDI serial adapters
  '10c4': 'Silicon Labs',     // CP2102 chips
}

function isKnownArduinoChip(port: PortInfo): boolean {
  const vid = port.vendorId?.toLowerCase()
  if (vid && KNOWN_ARDUINO_VENDORS[vid]) return true
  const mfr = port.manufacturer?.toLowerCase() ?? ''
  return mfr.includes('arduino') || mfr.includes('ftdi') || mfr.includes('silicon')
}
```

#### Step 3: Auto-Connect Logic

```typescript
const likelyPorts = enrichedPorts.filter(p => p.isLikelyDccEx)

if (likelyPorts.length === 1) {
  // Single Arduino device → auto-connect
  await connectDevice({ device: 'dccex', serial: likelyPorts[0].path })
} else if (likelyPorts.length > 1) {
  // Multiple → show picker with manufacturer labels, highlight likely ports
} else {
  // No matches → show all ports with "none detected" message
}
```

#### Step 4: Verify with DCC-EX Status

After connecting (whether auto or manual), send `<=>` and listen for `iDCC-EX V-X.X.X` response:
- ✅ Confirmed → update device doc with version info
- ❌ No response after 2s → warn user, suggest trying a different port

---

## 7. Getting Started Guide (dejajs.com)

### Content Architecture on dejajs.com

The website (`dejajs.com`) hosts two types of content with different tone and depth:

| Content Type | Tone | Depth | Audience | Example |
|-------------|------|-------|----------|---------|
| **Guides** | Warm, easy, encouraging | Step-by-step walkthrough | New users | "Getting Started" |
| **Docs** | Reference, precise | Technical detail per feature | Active users | "Throttle: Consist Controls" |

The getting-started guide is a **guide**, not a doc. It lives on dejajs.com alongside the app docs but serves a fundamentally different purpose — it's a user journey, not a feature reference.

### Replaces
- Remove `docs/getting-started.mdx` (current overview)
- Remove `docs/quick-start.mdx` (current step-by-step)
- New guide lives in the **guides** section of dejajs.com (not the docs section)
- Keep `docs/installation.mdx` as a reference doc for advanced/developer setup

### Tone & Voice
- **Warm and confident** — "You'll be running trains in minutes"
- **Easy** — every step feels achievable, no jargon without explanation
- **The new DCC platform** — don't name-drop competitors, but confidently reference "outdated interfaces" we're here to replace
- Use emojis where they add warmth (🚂, ✅, 🎉)
- Screenshots of the actual onboarding process

### Structure

```
# Getting Started with DEJA.js

## What is DEJA.js?
- Brief pitch: the new DCC platform, built for today's devices
- One sentence on "outdated interfaces" → we're the modern alternative
- Browser-based, multi-device, cloud-synced

## What You'll Need
- A DCC-EX CommandStation (Arduino Mega + Motor Shield)
- A computer to run the server (Raspberry Pi, Mac, Linux, Windows)
- A phone, tablet, or laptop to control your trains
- ~5 minutes

## How It Works
- [Topology graphic]: Phone/Tablet ↔ Cloud ↔ Server ↔ CommandStation
- Explain the three pieces simply:
  1. CommandStation (the hardware you already have)
  2. DEJA Server (runs on the computer connected to your CommandStation)
  3. DEJA Apps (open in any browser — phone, tablet, laptop)

## Step 1: Create Your Account
- Go to cloud.dejajs.com
- Sign up with email or Google/GitHub
- Screenshot of sign-up screen

## Step 2: Choose a Plan
- Free tier gets you started — upgrade anytime
- Brief plan comparison (keep it light)
- Screenshot of plan selection

## Step 3: Name Your Layout
- Give your layout a name and ID
- This is how DEJA.js organizes everything for your railroad
- Screenshot of layout step

## Step 4: Install the Server
- Copy the one-line install command
- Run it on the machine connected to your CommandStation
- What's happening: downloading, configuring, connecting
- Screenshot of install step with progress tracker

## Step 5: Add Your First Locomotive
- While the server installs, add a loco to your roster
- You just need the DCC address and a name
- Screenshot of loco add form

## Step 6: Open the Throttle
- Server connected → open throttle.dejajs.com on your phone
- Select your loco → drive! 🚂
- Screenshot of throttle in action

## What's Next?
- Explore the Cloud dashboard
- Add more locos to your roster
- Upgrade to unlock turnouts, effects, signals, and more
- Join the community
```

### Visual Assets Required

| Asset | Type | Used In |
|-------|------|---------|
| Architecture/topology diagram | Static SVG (provided separately) | Guide, website, onboarding tips |
| Animated topology diagram | Animated SVG | Onboarding install step |
| Hardware photo composite | Photo + screenshot overlay | Guide "What You'll Need" |
| Onboarding screenshots (6+) | PNG captures | Each guide step |
| Throttle-in-action screenshot | PNG capture (mobile frame) | Guide final step, website |

### Screenshots to Capture

1. Sign-up screen (Cloud)
2. Plan selection step
3. Layout registration step
4. Install step with progress tracker + loco setup
5. Server connected celebration state
6. Throttle app with loco controls
7. Cloud dashboard with roster
8. Locked module empty state (upgrade CTA)

---

## 8. Website Updates

### Keep Simple & Aspirational

The homepage quick-start section stays high-level but updated to match the new flow:

```
1. Sign Up & Pick a Plan → Free to start
2. Install → One command, that's it
3. Run Trains → From any device
```

### Tone Updates
- Reference "outdated, unusable interfaces" that DEJA.js replaces — confidently, without naming names
- Position as "The New DCC Platform"
- Emphasize: easy, better, evolving

### No Major Website Restructure
- Website drives users to Cloud app for onboarding
- dejajs.com hosts both **guides** (warm, step-by-step) and **docs** (reference, per-feature)
- Getting-started guide lives in the guides section, not the docs section
- In-app onboarding handles the interactive experience

---

## 9. Implementation Phases

### Phase 1: Onboarding State Machine + Persistent Prompts
- Add `onboarding` field to `users/{uid}` Firestore doc
- Server writes `serverStarted` on first startup
- Cloud app: persistent banners based on onboarding state
- Throttle app: persistent prompts based on onboarding state

### Phase 2: Onboarding Wizard Redesign
- Pizza tracker progress bar component
- Responsive: rich top (desktop) / slim bottom (mobile)
- Install step with productive wait (loco setup + tips)
- Firebase real-time listener for server detection
- Celebration animation on server connect

### Phase 3: Free Tier UX
- Locked nav items with upgrade icon
- Per-module empty state upgrade CTAs
- Plan-aware feature gating in both apps

### Phase 4: Serial Port Auto-Detection
- Enrich port data with vendor/manufacturer metadata
- Known Arduino chip detection
- Single-match auto-connect
- DCC-EX verification via `<=>` command

### Phase 5: Guide & Website
- Write getting-started guide for dejajs.com guides section
- Remove old `docs/getting-started.mdx` and `docs/quick-start.mdx`
- Capture onboarding screenshots
- Update website quick-start copy and tone
- Architecture diagram integration

---

## 10. Open Questions

- [x] ~~Throttle app server discovery~~ — **Resolved: WebSocket is not required for throttle/DCC-EX operation.** Everything flows through Firebase. No server IP/port entry needed in the Throttle app. This simplifies onboarding significantly — users never need to know their server's local IP.
- [x] ~~Can users explore Cloud app before server install?~~ — **Resolved: Yes.** Users can access Cloud and add roster items, configure settings, etc. before the server has ever started. All Firestore writes work independently of the server.
- [x] ~~`deja` CLI PATH~~ — **Resolved:** Install script both exports PATH inline (works in same terminal) and appends to `.zshrc`/`.bashrc` (works in new terminals). Only edge case: different already-open terminal needs `source ~/.zshrc`. Final install output should say: "Run `deja start` to connect your railroad! (If 'deja' isn't found, open a new terminal first)"
- [x] ~~Plan limits config~~ — **Resolved:** Config already exists at `packages/modules/plans/constants.ts` with `PLAN_LIMITS` and `PLAN_DISPLAY`. `useSubscription()` composable provides `canAdd()` and `requiresPlan()` helpers. Need to add `devices` and `sensors` limits. Module lock icons can derive from limits being 0.
- [x] ~~Minimum loco fields~~ — **Resolved:** Address (required) + name (optional, defaults to address). After adding, user can either edit more loco info or proceed. Keep the barrier minimal.
