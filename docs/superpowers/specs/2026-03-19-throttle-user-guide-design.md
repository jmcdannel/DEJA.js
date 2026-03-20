# Throttle User Guide — Design Spec

**Date:** 2026-03-19
**Status:** Approved
**Location:** `docs/throttle/getting-started.mdx`
**URL:** `/docs/throttle/getting-started`

---

## Overview

A single walkthrough guide that takes users step-by-step through a real Throttle session — from connecting to running trains, throwing turnouts, firing routes, and triggering effects. Clean and minimal tone. Screenshots carry the narrative. Links to existing reference docs for deeper dives.

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Format | Single MDX file | One cohesive walkthrough, not fragmented across pages |
| Tone | Clean & minimal | Short declarative sentences; let screenshots do the talking |
| Screenshots | Mixed mobile + desktop | Mobile for hands-on controls, desktop for management views |
| Video | Hero placement at top | "Prefer to watch?" followed by the written guide below |
| Relationship to existing docs | Complements, doesn't replace | Links to reference docs throughout for deeper dives |
| Section ordering | Matches a real session flow | Connect → Add → Select → Drive → Interact → Explore |
| Image path format | `/screenshots/{filename}.png` | Matches current convention; existing reference docs use older `/images/docs/` paths — do not follow that pattern |
| File slug | `getting-started` | Matches the title "Getting Started with Throttle" for URL/SEO consistency |

---

## Frontmatter

```yaml
---
title: Getting Started with Throttle
description: A step-by-step walkthrough of the Throttle app — connect, add a locomotive, control speed, throw turnouts, fire routes, and trigger effects.
section: apps
order: 1.5
---
```

Order `1.5` places it between the Throttle App overview (`order: 1`) and the Home Screen doc (`order: 2`), avoiding collisions with existing docs.

---

## Content Structure

### 1. Hero Video Placeholder

Short intro line + video embed placeholder.

```
Prefer to watch? Here's the full walkthrough.

{/* VIDEO: Throttle app complete walkthrough — connect, add a loco, control speed, throw turnouts, fire a route, trigger effects */}
```

### 2. Introduction

One paragraph. What Throttle is, what this guide covers, what you'll be doing by the end. Include a prerequisites note:

> "Throttle is the main app for controlling your model railroad. This guide walks you through a complete session — from connecting to your command station to running trains, throwing turnouts, and triggering effects."

> Before you begin, make sure you've [installed DEJA.js](/docs/installation) and [set up your layout](/docs/quick-start).

### 3. Connect

- **Screenshot:** `throttle_mobile_home.png` (mobile) — home screen showing connection status
- **Content:** 2-3 sentences. Open the app, connect to your command station.
- **Link:** [Connection Setup](/docs/throttle/connect)

### 4. Add a Locomotive

- **Screenshot:** Placeholder — `throttle_desktop_add-loco.png` (desktop) — add locomotive dialog from throttle list FAB
- **Content:** 2-3 sentences. Tap the + button on the throttle list to add a locomotive to your session. Enter a DCC address and name.
- **Link:** [Roster](/docs/throttle/roster)

### 5. Select a Locomotive

- **Screenshot:** `throttle_desktop_throttle-list.png` (desktop) — locomotive picker / throttle list
- **Content:** 2 sentences. Pick a loco from the list to open its throttle.
- **Link:** [Throttle List](/docs/throttle/throttle-list)

### 6. Control Speed & Direction

- **Screenshot:** `throttle_mobile_throttle.png` (mobile) — throttle view with speed controls
- **Content:** 2-3 sentences. Slide or tap to set speed. Tap direction to switch forward/reverse.
- **Link:** [Throttle Control](/docs/throttle/throttle)

### 7. Use Functions

- **Screenshot:** Placeholder — `throttle_mobile_functions.png` (mobile) — function speed dial expanded
- **Content:** 2-3 sentences. Tap the function button to open the speed dial. Toggle lights, horn, bell.
- **Link:** [Throttle Control — Functions](/docs/throttle/throttle)

### 8. Throw Turnouts

- **Screenshot:** `throttle_desktop_turnouts.png` (desktop) — turnouts view
- **Content:** 2-3 sentences. Tap a turnout to throw or close it. Color indicates state.
- **Link:** [Turnouts](/docs/throttle/turnouts)

### 9. Fire a Route

- **Screenshot:** `throttle_desktop_routes.png` (desktop) — routes view with route list
- **Content:** 2-3 sentences. Select a route to execute a sequence of turnout changes.
- **Link:** [Routes](/docs/throttle/routes)

### 10. Try Effects

- **Screenshot:** `throttle_mobile_effects.png` (mobile) — effects view
- **Content:** 2-3 sentences. Trigger sound and lighting effects on your layout.
- **Link:** [Effects](/docs/throttle/effects)

### 11. What's Next

Short bulleted list linking to advanced features:

- [Conductor Mode](/docs/throttle/conductor) — full operator station with three-pane layout
- [Signals](/docs/throttle/signals) — monitor signal aspects across your layout
- [Settings](/docs/throttle/settings) — customize navigation, themes, and preferences
- [Home Screen](/docs/throttle/home) — speedometer widgets and layout overview

Closing line: "There's a lot more to explore. Each link above has a full reference guide."

---

## Screenshot Plan

| Section | Screenshot | Device | Status |
|---|---|---|---|
| Connect | `throttle_mobile_home.png` | Mobile | ✅ Exists |
| Add a Locomotive | `throttle_desktop_add-loco.png` | Desktop | 📸 Needs capture |
| Select a Locomotive | `throttle_desktop_throttle-list.png` | Desktop | ✅ Exists |
| Speed & Direction | `throttle_mobile_throttle.png` | Mobile | ✅ Exists |
| Functions | `throttle_mobile_functions.png` | Mobile | 📸 Needs capture |
| Turnouts | `throttle_desktop_turnouts.png` | Desktop | ✅ Exists |
| Routes | `throttle_desktop_routes.png` | Desktop | ✅ Exists |
| Effects | `throttle_mobile_effects.png` | Mobile | ✅ Exists |

**6 of 8 screenshots already exist.** Two need to be captured:
- Add loco dialog (desktop)
- Functions speed dial expanded (mobile)

---

## Scope

### In scope
- Single MDX guide file at `docs/throttle/getting-started.mdx`
- Hero video placeholder
- 8 screenshot-driven sections (connect → effects)
- "What's Next" section linking to advanced features
- Links to existing reference docs throughout every section

### Out of scope
- New screenshots (tracked above, captured separately via `/capture-screenshots`)
- Video production (placeholder only)
- Changes to existing reference docs
- Navigation/sidebar changes (auto-discovered by existing doc system)
