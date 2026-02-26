---
name: deja-architecture
description: "DEJA.js system architecture, module boundaries, and communication patterns. Use whenever working on server code, MQTT messaging, WebSocket handlers, DCC-EX commands, Firebase data models, or cross-package changes."
user-invocable: false
---

# DEJA.js System Architecture

DEJA.js is a model railroad control system built as a TypeScript monorepo. It controls real hardware (DCC-EX command stations, servos, LEDs, signals) through a Node.js server that bridges Firebase, WebSockets, MQTT, and serial connections.

## Package Dependency Graph

```
Apps (Vue 3 SPAs)                    Server (Node.js)
┌──────────────────┐                 ┌──────────────────┐
│ cloud, monitor,  │                 │ deja-serverts     │
│ throttle, tour   │                 │ (apps/server)     │
└────────┬─────────┘                 └────────┬─────────┘
         │                                    │
    ┌────┴────┐                          ┌────┴────┐
    ▼         ▼                          ▼         ▼
@repo/ui  @repo/auth              @repo/firebase  @repo/utils
    │         │                   -config (admin)
    ▼         ▼
@repo/modules  @repo/dccex  @repo/deja
    │              │              │
    ▼              ▼              ▼
@repo/firebase-config (client)   @repo/sounds
```

### Package Ownership

| Package | Responsibility | Never put here |
|---------|---------------|----------------|
| `@repo/deja` | RTDB command interface (`useDejaJS`) — sends `dejaCommands` | UI code, DCC commands |
| `@repo/dccex` | DCC-EX command composable (`useDcc`) + command constants — sends `dccCommands` | Device handling, serial |
| `@repo/modules` | Domain composables: `useLocos`, `useTurnouts`, `useEfx`, `useSignals`, `useLayout`, `useRoutes` | Direct hardware commands |
| `@repo/ui` | Vue components + `useColors` composable | Business logic, Firebase writes |
| `@repo/auth` | Login/Signout components + route guards | Layout data |
| `@repo/firebase-config` | Firebase init for browser, Node.js, and Admin SDK | Business logic |
| `@repo/sounds` | Sound assets + Vercel Blob management | Non-sound logic |
| `@repo/utils` | Pure utility functions (`slugify`) | Anything with dependencies |
| `apps/server` | Command routing, serial/MQTT/WS bridges, Firestore admin writes | UI code |

## Communication Flow

```
┌─────────────────────────────────┐
│     Vue 3 Apps (browser)        │
│  Cloud · Monitor · Throttle     │
└──────────┬──────────┬───────────┘
           │          │
      Firestore    Firebase RTDB
    (read/subscribe) (write commands)
           │          │
           │     ┌────┴──────────────┐
           │     │  dejaCommands/    │
           │     │  dccCommands/     │
           │     └────┬──────────────┘
           │          │
┌──────────┴──────────┴───────────┐
│       deja-serverts (Node)      │
│  RTDB listeners → command pool  │
│  Firestore admin → state writes │
│  WebSocket server (port 8082)   │
│  MQTT client (optional)         │
│  Serial port handler            │
└──────┬──────┬──────┬────────────┘
       │      │      │
       ▼      ▼      ▼
   DCC-EX   Arduino  MQTT Devices
   (Serial) (Serial)  (WiFi)
```

**Key principle**: Apps never talk to hardware directly. They write commands to Firebase RTDB; the server picks them up and routes to the correct device.

## Firebase Data Models

### Firestore Collections (under `layouts/{layoutId}/`)

| Collection | Key Fields | Notes |
|------------|-----------|-------|
| `devices/{id}` | id, name, type, connection (usb/wifi), port, topic, isConnected | Physical hardware devices |
| `locos/{address}` | address, name, hasSound, functions[], consist[], meta.color | Keyed by DCC address |
| `throttles/{address}` | address, speed, direction, timestamp | One per active loco |
| `turnouts/{id}` | id, name, type (kato/servo/dccex), state, device, turnoutIdx | state is boolean |
| `effects/{id}` | id, name, type, device, pin, state, pattern, config, sound | Many types: light, relay, pin, led, power, ialed, sound |
| `signals/{id}` | id, name, device, aspect (red/yellow/green/null), red/yellow/green pins | Signal aspect control |
| `routes/{id}` | id, name, turnouts[], color | Sequence of turnout states |
| `sensors/{id}` | id, index, deviceId, state, enabled, effectId | Block detection |

### Realtime Database (command queues)

```
/dejaCommands/{layoutId}/{cmdId}  → { action, payload (JSON string), timestamp }
/dccCommands/{layoutId}/{cmdId}   → { action, payload (JSON string), timestamp }
```

Apps push commands; server consumes with `child_added` listener.

## MQTT Topic Conventions

- **Broadcast topic**: `DEJA/{layoutId}/broadcast`
- **Device topics**: Per-device, stored in `device.topic` field in Firestore
- **Message format**: `{ action: string, payload: JSON | string }`
- **ACK on connect**: `{ action: 'ack', payload: { layoutId } }`
- Transport: supports both `mqtt://` and `ws://`/`wss://` protocols
- Max 3 reconnection attempts before requiring restart

## WebSocket Message Protocol

| Action | Direction | Payload |
|--------|-----------|---------|
| `ack` | Server → Client | `{ layoutId, serverId }` |
| `subscribe-device` | Client → Server | `{ deviceId }` |
| `device-subscribed` | Server → Client | `{ deviceId, success }` |
| `serial-data` | Server → Client | `{ deviceId, data, timestamp, direction: 'incoming'/'outgoing' }` |
| `throttle` | Server → Broadcast | Speed/direction change |
| `turnout` | Server → Broadcast | Turnout state change |

Port: `VITE_WS_PORT` (default 8082). Server ID: `VITE_WS_ID` (default 'DEJA.js').

## DCC-EX Command Format

Commands are sent as `<COMMAND>\n` over serial to a DCC-EX CommandStation.

| Command | Format | Example |
|---------|--------|---------|
| Power | `<0>` / `<1>` | Track power off/on |
| Power (track) | `<0 MAIN>` / `<1 MAIN>` | Specific track |
| Throttle | `t {addr} {speed} {dir}` | `t 3 100 1` (forward) |
| Turnout | `T {idx} {state}` | `T 5 1` (thrown) |
| Function | `F {addr} {func} {state}` | `F 3 0 1` (lights on) |
| Output/Pin | `Z {pin} {state}` | `Z 45 1` |
| Status | `<=>` | Query status |
| Reset | `<D RESET>` | System reset |

Direction: 1 = forward, 0 = reverse. State: 1 = on/thrown, 0 = off/closed.

## Composable Pattern

All domain composables in `@repo/modules` follow this pattern:

```typescript
export function useModuleName() {
  const layoutId = useStorage('@DEJA/layoutId', '')

  // Reactive Firestore collection via VueFire
  const items = useCollection(
    collection(db, `layouts/${layoutId.value}/collectionName`)
  )

  // CRUD with merge writes
  async function updateItem(id: string, data: Partial<Item>) {
    await setDoc(doc(db, ..., id), data, { merge: true })
  }

  return { items, updateItem, ... }
}
```

**Client storage keys**: `@DEJA/layoutId`, `@DEJA/isEmulated`, `@DEJA/prefs/{module}/Sort`, `@DEJA/prefs/{module}/Filter`

## Server Command Routing

The server routes commands through modules in `apps/server/src/modules/`:

1. `layout.ts` — Device connections, command pooling, serial/MQTT routing
2. `turnouts.ts` — Turnout command routing (DCC-EX, Kato servo, WiFi MQTT)
3. `effects.ts` — Pin commands, LED patterns, sound playback
4. `signals.ts` — Signal aspect control
5. `throttles.ts` — Locomotive speed updates

**Command flow**: RTDB listener → `handleDccChange()`/`handleDejaChange()` → module handler → serial/MQTT send → WebSocket broadcast

## Environment Variables

| Variable | Default | Used By |
|----------|---------|---------|
| `ENABLE_MQTT` | false | Server — enable MQTT connection |
| `ENABLE_DEJACLOUD` | false | Server — enable Firebase Cloud |
| `ENABLE_WS` | true | Server — enable WebSocket server |
| `LAYOUT_ID` | — | Server — default layout |
| `VITE_FIREBASE_*` | — | All apps — Firebase config |
| `VITE_MQTT_BROKER` | mqtt://localhost | Server — MQTT broker URL |
| `VITE_MQTT_PORT` | 1883 | Server — MQTT port |
| `VITE_WS_PORT` | 8082 | Server — WebSocket port |
| `VITE_WS_ID` | DEJA.js | Server — server identifier |
| `BLOB_READ_WRITE_TOKEN` | — | Sounds — Vercel Blob token |

## Rules for Cross-Package Changes

1. **Don't duplicate state**: If a composable in `@repo/modules` manages it, use that composable — don't create parallel state
2. **Commands go through Firebase RTDB**: Never send serial/MQTT commands from browser apps directly
3. **Server owns hardware writes**: Only the server writes to serial ports, MQTT, or updates device connection status
4. **Firestore is the source of truth** for configuration (layouts, locos, turnouts, effects). RTDB is for transient commands only
5. **VueFire for reactivity**: Use `useCollection`/`useDocument` — don't write custom Firebase listeners in app code
6. **Merge writes**: Always use `{ merge: true }` for Firestore updates to avoid overwriting fields
7. **Check existing packages first**: Before creating a new utility or composable, check if `@repo/modules`, `@repo/deja`, `@repo/dccex`, or `@repo/utils` already provides it
