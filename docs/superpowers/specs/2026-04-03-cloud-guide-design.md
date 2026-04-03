# Cloud Guide Design Spec

**Date:** 2026-04-03
**Branch:** `feature/cloud-guide`
**Status:** Approved

---

## Summary

Create an interactive guide for the DEJA Cloud app on the dejajs-www marketing site, following the same patterns established by the Throttle guide. The guide uses a hybrid structure: a guided "first things to do" flow for new users, followed by a feature reference carousel covering all Cloud app capabilities. Also update the existing Cloud MDX docs to align with the guide content.

## Structure

### Hybrid Approach

**Part 1 — Guided Flow:** Five `FeatureSection` blocks walk new users through their first setup tasks in logical order, with alternating left/right layouts and desktop browser-frame screenshots.

**Part 2 — Feature Reference:** A tabbed carousel (`CloudFeaturesCarousel`) covering all 8 feature areas with light-touch overviews — title, tagline, description, 4-5 bullet features, desktop screenshot, doc link, and illustration placeholder.

### Section Order

1. **Hero** — `SectionLabel` ("Guide"), `Logo` with "Cloud" appTitle, tagline paragraph, `VideoPlaceholder`
2. **Prerequisites callout** — Link to Getting Started guide
3. **Guided Flow** (5 `FeatureSection` blocks):
   - Dashboard — device status, command activity, layout info, Throttle QR code
   - Add a Device — connect DCC-EX command station, port selection
   - Add a Locomotive — roster basics (address, name, road name, sound toggle)
   - Configure a Turnout — name, index, positions, type, device, tags
   - Add an Effect — type selection, device + pin, guest access
4. **Feature Reference Carousel** (8 tabs):
   - Roster (pink) — search, DCC-EX sync, functions, consists, import
   - Turnouts (amber) — filtering, sorting, labels, device/tag grouping
   - Effects (indigo) — 10 types, macros, sounds, IALED strips
   - Signals (emerald) — three-aspect wiring, common anode/cathode
   - Routes (purple) — multi-turnout sequences, run route
   - Sensors (teal) — hardware types, automations, trigger rules
   - DCC-EX Console (lime) — LCD terminal, command grid, cheat sheet
   - Settings (blue) — theme, billing, server setup, tags, backgrounds
5. **What's Next** — 4 link cards: Throttle Guide, Architecture, IO Guide, Monitor

## New Components

### ThrottleNote

Teal-themed callout that mirrors the existing `CloudNote` (indigo). Placed inside guided flow sections where Cloud configuration produces results visible in the Throttle app.

```tsx
function ThrottleNote({ children }: { children: React.ReactNode }) {
  return (
    <AnimateIn>
      <div className="p-4 rounded-lg border border-teal-500/20 bg-teal-950/20">
        <p className="text-xs text-teal-400 font-mono tracking-wider uppercase mb-2">
          🚂 See it in Throttle
        </p>
        <div className="text-sm text-gray-300 leading-relaxed">{children}</div>
      </div>
    </AnimateIn>
  );
}
```

Used in:
- **Dashboard** — "Open Throttle from the QR code on your dashboard to start driving immediately."
- **Add a Locomotive** — "Locomotives you add here appear instantly in the Throttle app — including function labels and consist groups."
- **Configure a Turnout** — "Turnouts configured here appear in Throttle's turnout view with color-coded toggle switches."
- **Add an Effect** — "Effects you create here can be triggered from the Throttle's Effects view — or automatically via sensor automations."

### CloudFeaturesCarousel

Same architecture as `LayoutFeaturesCarousel` from `ThrottleGuide.tsx`. Uses `useState` for active tab index. 8 `CarouselSlide` entries with cloud-specific data and accent colors matching the app's color-coding system.

## Reused Components

All sub-components from `ThrottleGuide.tsx` are reused directly (defined inline in that file, will be duplicated in CloudGuide or extracted if shared):

- `FeatureCard` / `FeatureGrid` — bullet feature lists
- `FeatureSection` — two-column section with screenshot
- `VideoPlaceholder` — video coming soon placeholder
- `AnimateIn` — intersection observer scroll animation
- `SectionLabel` — colored section label
- `Logo` — DEJA app logo with title
- `DocLink` — documentation link component
- `PhoneMockup` — used in carousel PiP overlay (Cloud is desktop-first but carousel pattern includes mobile PiP)

## Screenshots

Existing screenshots to use:

| Section | Screenshot |
|---------|-----------|
| Dashboard | `cloud_desktop_dashboard.png` |
| Add a Device | `cloud_desktop_dashboard.png` (device panel area) |
| Add a Locomotive | `cloud_desktop_roster.png` |
| Configure a Turnout | `cloud_desktop_turnouts.png` |
| Add an Effect | `cloud_desktop_effects.png` or `cloud_desktop_add-effect.png` |
| Carousel: Roster | `cloud_desktop_roster.png` |
| Carousel: Turnouts | `cloud_desktop_turnouts.png` |
| Carousel: Effects | `cloud_desktop_effects.png` |
| Carousel: Signals | `cloud_desktop_signals.png` |
| Carousel: Routes | `cloud_desktop_routes.png` |
| Carousel: Sensors | `cloud_desktop_dashboard.png` (placeholder) |
| Carousel: DCC-EX | `cloud_desktop_dashboard.png` (placeholder) |
| Carousel: Settings | `cloud_desktop_settings.png` |

New screenshots will be captured after UI tasks are completed.

## Carousel Tab Data

| Tab | Emoji | Accent Color | Tagline | Doc Link |
|-----|-------|-------------|---------|----------|
| Roster | 🚂 | pink (#ec407a) | Your fleet, fully configured | /docs/cloud/roster |
| Turnouts | 🔀 | amber (#ffb74d) | Every switch, mapped and named | /docs/cloud/turnouts |
| Effects | 💡 | indigo (#7986cb) | Lights, sounds, and automation | /docs/cloud/effects |
| Signals | 🚦 | emerald (#66bb6a) | Three-aspect signaling | /docs/cloud/signals |
| Routes | 🛤️ | purple (#ab47bc) | One tap, multiple turnouts | /docs/cloud/routes |
| Sensors | 📡 | teal (#4db6ac) | Detect and automate | /docs/cloud/sensors |
| DCC-EX | ⌨️ | lime (#76ff03) | Direct command access | /docs/cloud/dcc-ex |
| Settings | ⚙️ | blue (#42a5f5) | Customize everything | /docs/cloud/settings |

## Files to Create

| File | Purpose |
|------|---------|
| `apps/dejajs-www/components/guides/CloudGuide.tsx` | Main guide component |
| `apps/dejajs-www/app/guides/cloud/page.tsx` | Next.js route page |

## Files to Modify

| File | Change |
|------|--------|
| `apps/dejajs-www/app/guides/page.tsx` | Remove `comingSoon` from Cloud entry, add active color/iconBg |
| `apps/dejajs-www/components/GuidesSidebar.tsx` | Remove `comingSoon` from Cloud entry |
| `docs/cloud/overview.mdx` | Restructure to align with guide flow order, add links to guide |

## Docs Update Scope

The `docs/cloud/overview.mdx` file will be restructured to:
- Reorder sections to match the guide flow: Dashboard → Devices → Roster → Turnouts → Effects → Signals → Routes → Sensors → DCC-EX → Settings
- Add a prominent link to the Cloud guide at the top
- Update "Next Steps" to include the guide link
- Keep existing content accurate — no screenshot updates in this PR (deferred to after UI tasks)

## Out of Scope

- New screenshot capture (deferred)
- Other guide pages (Monitor, Server, IO)
- Changes to the Cloud app itself
- Shared component extraction (ThrottleGuide sub-components stay inline per existing pattern)
