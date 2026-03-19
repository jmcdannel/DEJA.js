# Activate WiThrottle Native Support in DEJA.js Throttle App

## Context

The DEJA.js throttle app (`apps/throttle/`) already has a complete WiThrottle protocol
implementation but it is **currently inert on web builds** because raw TCP sockets
require a native Capacitor environment. All the service logic, event bridges, and UI
are already wired up. This plan activates the native layers.

### What is already done (do not re-implement)
- `apps/throttle/src/services/WiThrottleService.ts` — full protocol: acquire/release
  locos, speed+direction, functions, heartbeat, power state (PPA), E-Stop, roster
- `apps/throttle/src/throttle/useThrottle.ts` — dual-write to Firebase + WiThrottle
- `apps/throttle/src/App.vue` — connect/disconnect lifecycle, event bridge handlers
- `apps/throttle/src/composables/useServerDiscovery.ts` — mDNS composable (ready;
  needs Capacitor v7 + capacitor-zeroconf to activate)
- `packages/ui/src/AppHeader.vue` — WiThrottle-aware track power + E-Stop
- `packages/ui/src/Functions/FunctionButton.vue` — real-time function state sync
- `apps/throttle/src/views/SettingsView.vue` — mDNS scan UI + discovered server list

### Socket plugin already installed
`@spryrocks/capacitor-socket-connection-plugin` is already in package.json.
The service dynamically imports it; web builds silently get `null`.

---

## Prerequisites

1. Confirm Capacitor version: `cat apps/throttle/package.json | grep capacitor`
2. If Capacitor < 7, upgrade first (see Step 1 below)

---

## Step-by-Step Implementation Tasks

### Step 1 — Upgrade Capacitor to v7 (if on v6)

```bash
cd apps/throttle
pnpm add @capacitor/core@^7 @capacitor/cli@^7 @capacitor/ios@^7 @capacitor/android@^7
npx cap sync
```

Verify no breaking changes in `capacitor.config.ts`. Check the Capacitor v7 migration
guide for any API changes: https://capacitorjs.com/docs/updating/7-0

### Step 2 — Install capacitor-zeroconf (mDNS)

```bash
cd apps/throttle
pnpm add capacitor-zeroconf
npx cap sync
```

Verify `useServerDiscovery.ts` dynamic import resolves (search for `ZEROCONF_PKG`).

### Step 3 — iOS: Info.plist permissions

Edit `apps/throttle/ios/App/App/Info.plist`. Add inside the top-level `<dict>`:

```xml
<key>NSLocalNetworkUsageDescription</key>
<string>DEJA Throttle uses your local network to discover and connect to WiThrottle servers.</string>
<key>NSBonjourServices</key>
<array>
  <string>_withrottle._tcp.</string>
</array>
```

Without these, iOS 14+ silently blocks mDNS queries and the local network permission
prompt never appears.

### Step 4 — Android: network permissions

Edit `apps/throttle/android/app/src/main/AndroidManifest.xml`.
Verify these permissions exist (add if missing):

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
```

For Android 12+ (API 31+), also add:
```xml
<uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES"
    android:usesPermissionFlags="neverForLocation" />
```

### Step 5 — Build and run on device

```bash
# iOS
cd apps/throttle
npx cap run ios --target <device-id>

# Android
npx cap run android --target <device-id>
```

### Step 6 — End-to-end testing checklist

Test with a real JMRI WiThrottle server or DCC-EX CommandStation on the local network.

**Connection**
- [ ] Open Settings → Connection Type = WiThrottle → enter server IP + port → Save
- [ ] App connects (ConnectionStatusBanner shows CONNECTED)
- [ ] Layout ID watcher fires `wiThrottleService.connect()` on app load

**mDNS Discovery**
- [ ] Settings → "Scan for servers" button appears when type = WiThrottle
- [ ] Tap scan → discovered servers list populates within ~10 seconds
- [ ] Tap a discovered server → fills in host/port fields automatically

**Throttle Control**
- [ ] Open a throttle → loco is acquired on WiThrottle server
- [ ] Speed slider moves loco on the hardware
- [ ] Direction toggle works
- [ ] Close throttle → loco released on server

**Functions**
- [ ] Function buttons send F commands to server
- [ ] Server-side function state changes sync back to button UI
- [ ] Momentary functions (horn, bell) work correctly

**Power & E-Stop**
- [ ] Track Power toggle in AppHeader reflects PPA state from server
- [ ] E-Stop button stops all acquired locos

**DEJA Server compatibility**
- [ ] Switch layout to DEJA Server mode → all above works via Firebase (no regression)
- [ ] Switch back to WiThrottle → reconnects cleanly

**Web build (regression)**
- [ ] Run web build → graceful error message shown, no crash

### Step 7 — Handle WiThrottle function labels (optional enhancement)

`WiThrottleService.parseCommand()` already dispatches `withrottle-function-labels`
events with server-provided function names. Wire these up in `FunctionButton.vue`
or the parent `Functions` component so buttons show the server's label names
instead of the Firestore roster labels when WiThrottle is connected.

---

## Files Reference

| File | Purpose |
|---|---|
| `apps/throttle/src/services/WiThrottleService.ts` | Core protocol service |
| `apps/throttle/src/composables/useServerDiscovery.ts` | mDNS scanning |
| `apps/throttle/src/views/SettingsView.vue` | Connection + scan UI |
| `apps/throttle/src/App.vue` | Lifecycle + event bridge |
| `apps/throttle/capacitor.config.ts` | Capacitor project config |
| `apps/throttle/ios/App/App/Info.plist` | iOS permissions |
| `apps/throttle/android/app/src/main/AndroidManifest.xml` | Android permissions |

---

## Known Constraints

- WiThrottle is **native-only** — TCP sockets unavailable in browsers
- `capacitor-zeroconf` requires Capacitor >= 7
- mDNS on Android emulators is unreliable — test on real hardware
