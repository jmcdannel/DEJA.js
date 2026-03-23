# 📢 DEJA.js Promotions

Promotional content managed via JSON files, pushed to **Firestore** (Vue apps) and **Sanity** (dejajs-www) with a single command.

## Quick Start

```bash
# Push a promotion to both Firestore and Sanity
pnpm promo:push promotions/launch-support.json

# Deactivate a promotion (sets active: false)
pnpm promo:deactivate launch-support
```

### Required Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_FIREBASE_PROJECT_ID` | Firebase project (already in `.env`) |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin service account email |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin service account key |
| `SANITY_API_TOKEN` | Sanity write token (optional — Sanity push is skipped if missing) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID (defaults to `c6pxffpo`) |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset (defaults to `production`) |

## JSON Schema

```json
{
  "slug": "unique-slug",
  "title": "Promo Title",
  "body": "Short description shown to users.",
  "icon": "🚀",
  "variant": "info | success | launch | warning",
  "active": true,
  "startDate": "2026-04-01T00:00:00Z",
  "endDate": null,
  "slots": ["banner-top", "hero-section"],
  "ctas": [
    { "label": "Button Text", "url": "https://...", "style": "primary | secondary | ghost" }
  ]
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | string | ✅ | Unique ID, used as Firestore doc ID |
| `title` | string | ✅ | Headline text |
| `body` | string | ✅ | Description text |
| `icon` | string | — | Emoji or icon (e.g., `🚀`) |
| `variant` | string | ✅ | Visual style: `info`, `success`, `launch`, `warning` |
| `active` | boolean | — | Manual on/off (default: `true`) |
| `startDate` | ISO string | — | `null` = immediately active |
| `endDate` | ISO string | — | `null` = no expiration |
| `slots` | string[] | ✅ | Where to show: `banner-top`, `hero-section` |
| `ctas` | array | ✅ | Action buttons (label, url, style) |

## Placement Slots

| Slot | Where It Renders |
|------|-----------------|
| `banner-top` | Top banner in Cloud, Throttle, and dejajs-www (all pages) |
| `hero-section` | Rich card on dejajs-www homepage (between hero and quick start) |

## Variants

| Variant | Vuetify Color | Use For |
|---------|--------------|---------|
| `info` | Blue | General announcements |
| `success` | Green | Positive news, features |
| `launch` | Green | Launch promotions |
| `warning` | Orange | Urgent notices |
