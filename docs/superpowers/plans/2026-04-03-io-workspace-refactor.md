# IO Workspace Refactor & Shared Device Config Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate duplicated device config generation between the cloud app and io/ build scripts by extracting shared pure-function generators into `@repo/modules`, adding `io/` to the pnpm workspace, and cleaning up the io/ directory structure.

**Architecture:** Pure config generator functions live in `packages/modules/device-config/`. The cloud app wraps them in Vue `computed()` refs. The io/ build/deploy scripts call them directly. Firebase data fetching stays in `io/scripts/lib/firebase.ts` (server-side only). The `io/layouts/` directory is removed — all config is generated from Firebase at build time, output goes to `io/dist/`.

**Tech Stack:** TypeScript, Vue 3 Composition API, pnpm workspaces, Firebase Admin SDK, PlatformIO/arduino-cli

---

## File Map

### New Files
| File | Responsibility |
|------|---------------|
| `packages/modules/device-config/types.ts` | `DeviceConfigInput`, `ArduinoConfigInput`, `PicoConfigInput` interfaces |
| `packages/modules/device-config/arduino-config.ts` | `generateArduinoConfig()` pure function |
| `packages/modules/device-config/pico-config.ts` | `generatePicoSettings()`, `generatePicoConfig()` pure functions |
| `packages/modules/device-config/index.ts` | Re-exports all device-config public API |
| `packages/modules/device-config/__tests__/arduino-config.test.ts` | Unit tests for Arduino config generation |
| `packages/modules/device-config/__tests__/pico-config.test.ts` | Unit tests for Pico W config generation |

### Modified Files
| File | Change |
|------|--------|
| `packages/modules/index.ts` | Add `export * from './device-config'` |
| `packages/modules/package.json` | Add `"./device-config"` export path |
| `pnpm-workspace.yaml` | Add `"io"` to workspace packages |
| `io/package.json` | Add `@repo/modules` as workspace dependency |
| `io/.gitignore` | Remove `layouts` entry (directory will be deleted) |
| `io/scripts/build.ts` | Import generators from `@repo/modules` instead of local `./lib/` |
| `io/scripts/deploy.ts` | Import generators from `@repo/modules` instead of local `./lib/` |
| `io/scripts/lib/firebase.ts` | Import types from `@repo/modules` instead of local `./types.js` |
| `io/scripts/lib/prompts.ts` | Import `Device` from `@repo/modules` instead of local `./types.js` |
| `apps/cloud/src/Layout/Devices/useDeviceConfig.ts` | Replace inline config generation with `@repo/modules` generators |

### Deleted Files
| File | Reason |
|------|--------|
| `io/scripts/lib/config-arduino.ts` | Replaced by `packages/modules/device-config/arduino-config.ts` |
| `io/scripts/lib/config-pico.ts` | Replaced by `packages/modules/device-config/pico-config.ts` |
| `io/scripts/lib/types.ts` | Replaced by `@repo/modules` types + `device-config/types.ts` |
| `io/layouts/` (entire directory) | No longer storing local configs; all generated to `io/dist/` |

### Moved Files
| From | To |
|------|-----|
| `io/src/esp01-wifi-test/` | `io/tests/esp01-wifi-test/` |

---

## Scope Check

This plan covers **Phase 1 only**: shared config generators + workspace integration + cleanup. Phase 2 (`deja deploy` CLI command) and Phase 3 (MQTT OTA config push) are separate plans.

---

### Task 1: Create device-config types in @repo/modules

**Files:**
- Create: `packages/modules/device-config/types.ts`

- [ ] **Step 1: Create the types file**

This file defines the input interfaces for config generators. It uses `Device`, `Effect`, and `Turnout` types that already exist in `@repo/modules`.

```typescript
// packages/modules/device-config/types.ts
// 🔧 Input types for device config generators

import type { Device } from '../layouts/types'
import type { Effect } from '../effects/types'
import type { Turnout } from '../turnouts/types'

/**
 * Base input for all config generators — a device with its associated effects and turnouts.
 * This is what you get back from a Firestore query for a specific device.
 */
export interface DeviceConfigInput {
  device: Device
  effects: Effect[]
  turnouts: Turnout[]
}

/**
 * Arduino config.h generator input.
 * Extends base with optional hardware feature flags.
 */
export interface ArduinoConfigInput extends DeviceConfigInput {
  enablePwm?: boolean
  enableSignals?: boolean
  enableSensors?: boolean
  sensorPins?: string[]
  signalPins?: number[]
}

/**
 * Pico W settings.toml + config.json generator input.
 * Extends base with WiFi/MQTT connection details.
 */
export interface PicoConfigInput extends DeviceConfigInput {
  wifiSsid?: string
  wifiPassword?: string
  mqttBroker?: string
  topicId?: string
  layoutId: string
}
```

- [ ] **Step 2: Verify the file was created correctly**

Run: `cat packages/modules/device-config/types.ts | head -5`
Expected: Should show the comment header and first import.

- [ ] **Step 3: Commit**

```bash
git add packages/modules/device-config/types.ts
git commit -m "feat(modules): add device-config input types"
```

---

### Task 2: Create Arduino config generator

**Files:**
- Create: `packages/modules/device-config/arduino-config.ts`
- Create: `packages/modules/device-config/__tests__/arduino-config.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// packages/modules/device-config/__tests__/arduino-config.test.ts
import { describe, it, expect } from 'vitest'
import { generateArduinoConfig } from '../arduino-config'
import type { ArduinoConfigInput } from '../types'
import type { Device } from '../../layouts/types'
import type { Effect } from '../../effects/types'
import type { Turnout } from '../../turnouts/types'

function makeDevice(overrides: Partial<Device> = {}): Device {
  return {
    id: 'test-mega',
    name: 'Test Mega',
    type: 'deja-arduino',
    ...overrides,
  }
}

function makeEffect(overrides: Partial<Effect> = {}): Effect {
  return {
    id: 'effect-1',
    type: 'led',
    state: false,
    ...overrides,
  }
}

function makeTurnout(overrides: Partial<Turnout> = {}): Turnout {
  return {
    id: 'turnout-1',
    name: 'Turnout 1',
    device: 'test-mega',
    type: 'servo',
    state: false,
    ...overrides,
  }
}

describe('generateArduinoConfig', () => {
  it('generates config with device ID', () => {
    const input: ArduinoConfigInput = {
      device: makeDevice({ id: 'my-mega-2560' }),
      effects: [],
      turnouts: [],
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain('#define DEVICE_ID "my-mega-2560"')
  })

  it('generates OUTPINS from effects with pins', () => {
    const input: ArduinoConfigInput = {
      device: makeDevice(),
      effects: [
        makeEffect({ pin: 22 }),
        makeEffect({ id: 'e2', pin: 23 }),
        makeEffect({ id: 'e3' }), // no pin — should be excluded
      ],
      turnouts: [],
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain('int OUTPINS[] = { 22, 23 };')
    expect(result).toContain('#define ENABLE_OUTPUTS true')
  })

  it('generates empty OUTPINS when no effects have pins', () => {
    const input: ArduinoConfigInput = {
      device: makeDevice(),
      effects: [makeEffect()], // no pin
      turnouts: [],
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain('int OUTPINS[] = {};')
    expect(result).toContain('#define ENABLE_OUTPUTS false')
  })

  it('generates TurnoutPulser array from turnouts with straight/divergent', () => {
    const input: ArduinoConfigInput = {
      device: makeDevice(),
      effects: [],
      turnouts: [
        makeTurnout({ straight: 150, divergent: 600 }),
        makeTurnout({ id: 't2', name: 'T2', straight: 200, divergent: 500 }),
      ],
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain('TurnoutPulser turnouts[] = { TurnoutPulser(150, 600), TurnoutPulser(200, 500) };')
    expect(result).toContain('#define ENABLE_TURNOUTS true')
  })

  it('sets enable flags from explicit inputs', () => {
    const input: ArduinoConfigInput = {
      device: makeDevice(),
      effects: [],
      turnouts: [],
      enablePwm: true,
      enableSensors: true,
      sensorPins: ['A0', 'A1'],
      enableSignals: true,
      signalPins: [30, 31],
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain('#define ENABLE_PWM true')
    expect(result).toContain('#define ENABLE_SENSORS true')
    expect(result).toContain('int SENSORPINS[] = { A0, A1 };')
    expect(result).toContain('#define ENABLE_SIGNALS true')
    expect(result).toContain('int SIGNALPINS[] = { 30, 31 };')
  })

  it('includes servo calibration constants', () => {
    const input: ArduinoConfigInput = {
      device: makeDevice(),
      effects: [],
      turnouts: [],
    }
    const result = generateArduinoConfig(input)
    expect(result).toContain('#define SERVOMIN 150')
    expect(result).toContain('#define SERVOMAX 600')
    expect(result).toContain('#define SERVO_FREQ 50')
    expect(result).toContain('#define SERVO_COUNT 16')
  })

  it('includes TurnoutPulser.h header', () => {
    const result = generateArduinoConfig({
      device: makeDevice(),
      effects: [],
      turnouts: [],
    })
    expect(result).toContain('#include <TurnoutPulser.h>')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd packages/modules && pnpm vitest run device-config/__tests__/arduino-config.test.ts`
Expected: FAIL — module `../arduino-config` not found.

- [ ] **Step 3: Write the implementation**

```typescript
// packages/modules/device-config/arduino-config.ts
// 🔧 Arduino config.h generator
// Generates a complete config.h from device, effects, and turnout data

import type { ArduinoConfigInput } from './types'

export function generateArduinoConfig(input: ArduinoConfigInput): string {
  const { device, effects, turnouts } = input

  const outPins = effects
    .filter(e => e.pin !== undefined && e.pin !== null)
    .map(e => e.pin!)

  const turnoutPulsers = turnouts
    .filter(t => t.straight !== undefined && t.divergent !== undefined)
    .map(t => `TurnoutPulser(${t.straight}, ${t.divergent})`)

  const sensorPins = input.sensorPins ?? []
  const signalPins = input.signalPins ?? []

  const hasOutputs = outPins.length > 0
  const hasTurnouts = turnoutPulsers.length > 0
  const hasSensors = sensorPins.length > 0
  const hasSignals = signalPins.length > 0
  const enablePwm = input.enablePwm ?? false

  return `#include <TurnoutPulser.h>

#define DEVICE_ID "${device.id}"
#define ENABLE_PWM ${enablePwm}
#define ENABLE_OUTPUTS ${hasOutputs}
#define ENABLE_SIGNALS ${hasSignals}
#define ENABLE_TURNOUTS ${hasTurnouts}
#define ENABLE_SENSORS ${hasSensors}

#define SERVOMIN 150 // This is the 'minimum' pulse length count (out of 4096)
#define SERVOMAX 600 // This is the 'maximum' pulse length count (out of 4096)
#define MIN_PULSE_WIDTH 650
#define MAX_PULSE_WIDTH 2350
#define USMIN 600     // This is the rounded 'minimum' microsecond length based on the minimum pulse of 150
#define USMAX 2400    // This is the rounded 'maximum' microsecond length based on the maximum pulse of 600
#define SERVO_FREQ 50 // Analog servos run at ~50 Hz updates
#define SERVO_COUNT 16

int OUTPINS[] = {${outPins.length > 0 ? ' ' + outPins.join(', ') + ' ' : ''}};
int SIGNALPINS[] = {${signalPins.length > 0 ? ' ' + signalPins.join(', ') + ' ' : ''}};
int SENSORPINS[] = {${sensorPins.length > 0 ? ' ' + sensorPins.join(', ') + ' ' : ''}};

TurnoutPulser turnouts[] = {${turnoutPulsers.length > 0 ? ' ' + turnoutPulsers.join(', ') + ' ' : ''}};
`
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd packages/modules && pnpm vitest run device-config/__tests__/arduino-config.test.ts`
Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/modules/device-config/arduino-config.ts packages/modules/device-config/__tests__/arduino-config.test.ts
git commit -m "feat(modules): add Arduino config.h generator with tests"
```

---

### Task 3: Create Pico W config generators

**Files:**
- Create: `packages/modules/device-config/pico-config.ts`
- Create: `packages/modules/device-config/__tests__/pico-config.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// packages/modules/device-config/__tests__/pico-config.test.ts
import { describe, it, expect } from 'vitest'
import { generatePicoSettings, generatePicoConfig } from '../pico-config'
import type { PicoConfigInput } from '../types'
import type { Device } from '../../layouts/types'
import type { Effect } from '../../effects/types'

function makeDevice(overrides: Partial<Device> = {}): Device {
  return {
    id: 'test-pico',
    name: 'Test Pico',
    type: 'deja-mqtt',
    topic: 'deja',
    ...overrides,
  }
}

function makeEffect(overrides: Partial<Effect> = {}): Effect {
  return {
    id: 'effect-1',
    type: 'led',
    state: false,
    ...overrides,
  }
}

function makeInput(overrides: Partial<PicoConfigInput> = {}): PicoConfigInput {
  return {
    device: makeDevice(),
    effects: [],
    turnouts: [],
    layoutId: 'test-layout',
    ...overrides,
  }
}

describe('generatePicoSettings', () => {
  it('generates settings.toml with device ID and layout ID', () => {
    const result = generatePicoSettings(makeInput({ layoutId: 'my-layout' }))
    expect(result).toContain('DEVICE_ID = "test-pico"')
    expect(result).toContain('LAYOUT_ID = "my-layout"')
  })

  it('includes WiFi credentials when provided', () => {
    const result = generatePicoSettings(
      makeInput({ wifiSsid: 'MyNetwork', wifiPassword: 's3cret' })
    )
    expect(result).toContain('CIRCUITPY_WIFI_SSID = "MyNetwork"')
    expect(result).toContain('CIRCUITPY_WIFI_PASSWORD = "s3cret"')
  })

  it('defaults WiFi credentials to empty strings', () => {
    const result = generatePicoSettings(makeInput())
    expect(result).toContain('CIRCUITPY_WIFI_SSID = ""')
    expect(result).toContain('CIRCUITPY_WIFI_PASSWORD = ""')
  })

  it('includes MQTT broker when provided', () => {
    const result = generatePicoSettings(makeInput({ mqttBroker: '192.168.1.100' }))
    expect(result).toContain('MQTT_BROKER = "192.168.1.100"')
  })

  it('uses device.topic for TOPIC_ID, falls back to topicId input', () => {
    const result = generatePicoSettings(
      makeInput({ device: makeDevice({ topic: 'custom-topic' }) })
    )
    expect(result).toContain('TOPIC_ID = "custom-topic"')
  })

  it('uses topicId input when device has no topic', () => {
    const result = generatePicoSettings(
      makeInput({
        device: makeDevice({ topic: undefined }),
        topicId: 'fallback-topic',
      })
    )
    expect(result).toContain('TOPIC_ID = "fallback-topic"')
  })

  it('reads enablePwm from device.config', () => {
    const result = generatePicoSettings(
      makeInput({ device: makeDevice({ config: { enablePwm: true } }) })
    )
    expect(result).toContain('ENABLE_PWM = "true"')
  })
})

describe('generatePicoConfig', () => {
  it('generates JSON with pin-to-GPIO mappings from effects', () => {
    const input = makeInput({
      effects: [
        makeEffect({ pin: 8 }),
        makeEffect({ id: 'e2', pin: 9 }),
      ],
    })
    const result = generatePicoConfig(input)
    const parsed = JSON.parse(result)
    expect(parsed.pins).toEqual({ '8': 'GP8', '9': 'GP9' })
  })

  it('skips effects without pins', () => {
    const input = makeInput({
      effects: [
        makeEffect({ pin: 5 }),
        makeEffect({ id: 'e2' }), // no pin
      ],
    })
    const result = generatePicoConfig(input)
    const parsed = JSON.parse(result)
    expect(parsed.pins).toEqual({ '5': 'GP5' })
  })

  it('returns empty pins object when no effects have pins', () => {
    const result = generatePicoConfig(makeInput())
    const parsed = JSON.parse(result)
    expect(parsed.pins).toEqual({})
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd packages/modules && pnpm vitest run device-config/__tests__/pico-config.test.ts`
Expected: FAIL — module `../pico-config` not found.

- [ ] **Step 3: Write the implementation**

```typescript
// packages/modules/device-config/pico-config.ts
// 🍓 Pico W config generator
// Generates settings.toml and config.json for CircuitPython devices

import type { PicoConfigInput } from './types'

/**
 * Generate settings.toml for Pico W (WiFi creds, MQTT broker, layout/device ID).
 * WiFi credentials are NOT stored in Firebase — passed in at generation time.
 */
export function generatePicoSettings(input: PicoConfigInput): string {
  const { device, layoutId } = input
  const wifiSsid = input.wifiSsid ?? ''
  const wifiPassword = input.wifiPassword ?? ''
  const mqttBroker = input.mqttBroker ?? ''
  const topicId = input.topicId ?? device.topic ?? 'deja'

  return `# 🍓 DEJA.js Pico W Configuration
# Generated for device: ${device.id}

CIRCUITPY_WIFI_SSID = "${wifiSsid}"
CIRCUITPY_WIFI_PASSWORD = "${wifiPassword}"

ENABLE_CONFIG = "true"
ENABLE_PWM = "${device.config?.enablePwm === true ? 'true' : 'false'}"
ENABLE_MQTT = "true"

MQTT_BROKER = "${mqttBroker}"
LAYOUT_ID = "${layoutId}"
DEVICE_ID = "${device.id}"
TOPIC_ID = "${topicId}"
`
}

/**
 * Generate config.json for Pico W (pin → GP mapping from effects).
 */
export function generatePicoConfig(input: PicoConfigInput): string {
  const { effects } = input

  const pins: Record<string, string> = {}
  for (const effect of effects) {
    if (effect.pin !== undefined && effect.pin !== null) {
      pins[String(effect.pin)] = `GP${effect.pin}`
    }
  }

  return JSON.stringify({ pins }, null, 2) + '\n'
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd packages/modules && pnpm vitest run device-config/__tests__/pico-config.test.ts`
Expected: All 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/modules/device-config/pico-config.ts packages/modules/device-config/__tests__/pico-config.test.ts
git commit -m "feat(modules): add Pico W config generators with tests"
```

---

### Task 4: Create device-config index and wire into @repo/modules

**Files:**
- Create: `packages/modules/device-config/index.ts`
- Modify: `packages/modules/index.ts:77` (append export)
- Modify: `packages/modules/package.json:23` (add export path)

- [ ] **Step 1: Create the index file**

```typescript
// packages/modules/device-config/index.ts
export * from './types'
export { generateArduinoConfig } from './arduino-config'
export { generatePicoSettings, generatePicoConfig } from './pico-config'
```

- [ ] **Step 2: Add re-export to packages/modules/index.ts**

Append this line at the end of `packages/modules/index.ts`:

```typescript
// Device Config module
export * from './device-config'
```

- [ ] **Step 3: Add export path to packages/modules/package.json**

Add to the `"exports"` object in `packages/modules/package.json`:

```json
"./device-config": "./device-config/index.ts"
```

- [ ] **Step 4: Run all device-config tests together**

Run: `cd packages/modules && pnpm vitest run device-config/`
Expected: All 17 tests PASS (7 Arduino + 10 Pico).

- [ ] **Step 5: Run type-check on the modules package**

Run: `cd packages/modules && pnpm type-check`
Expected: No type errors.

- [ ] **Step 6: Commit**

```bash
git add packages/modules/device-config/index.ts packages/modules/index.ts packages/modules/package.json
git commit -m "feat(modules): export device-config generators from package root"
```

---

### Task 5: Add io/ to pnpm workspace

**Files:**
- Modify: `pnpm-workspace.yaml`
- Modify: `io/package.json`

- [ ] **Step 1: Add io/ to pnpm-workspace.yaml**

Change `pnpm-workspace.yaml` to:

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "scripts"
  - "io"
```

- [ ] **Step 2: Add @repo/modules as a workspace dependency in io/package.json**

Add `"@repo/modules": "workspace:*"` to the `dependencies` section of `io/package.json`. The result should be:

```json
{
  "name": "@deja/io",
  "version": "0.0.0",
  "private": true,
  "license": "MIT",
  "type": "module",
  "scripts": {
    "build": "tsx ./scripts/build.ts",
    "deploy": "tsx ./scripts/deploy.ts"
  },
  "dependencies": {
    "@repo/modules": "workspace:*",
    "dotenv": "^16.4.7",
    "firebase-admin": "^13.4.0",
    "@inquirer/prompts": "^7.3.2"
  },
  "devDependencies": {
    "fs-extra": "^11.3.0",
    "tsx": "^4.19.0"
  }
}
```

- [ ] **Step 3: Run pnpm install to link the workspace dependency**

Run: `pnpm install`
Expected: Completes successfully. The `io/` package is now part of the workspace.

- [ ] **Step 4: Verify the workspace link works**

Run: `pnpm --filter=@deja/io exec -- node -e "import('@repo/modules').then(m => console.log(Object.keys(m).filter(k => k.includes('Config'))))"`
Expected: Should print array containing `DeviceConfigInput`, `ArduinoConfigInput`, `PicoConfigInput`, `generateArduinoConfig`, `generatePicoSettings`, `generatePicoConfig` (or similar).

- [ ] **Step 5: Commit**

```bash
git add pnpm-workspace.yaml io/package.json
git commit -m "chore: add io/ to pnpm workspace with @repo/modules dependency"
```

Note: Do NOT commit `pnpm-lock.yaml` changes via `git add` — pnpm manages it. But do run `git add pnpm-lock.yaml` if it changed, since the lockfile should stay in sync.

---

### Task 6: Update io/ scripts to use @repo/modules generators

**Files:**
- Modify: `io/scripts/build.ts`
- Modify: `io/scripts/deploy.ts`
- Modify: `io/scripts/lib/firebase.ts`
- Modify: `io/scripts/lib/prompts.ts`
- Delete: `io/scripts/lib/config-arduino.ts`
- Delete: `io/scripts/lib/config-pico.ts`
- Delete: `io/scripts/lib/types.ts`

- [ ] **Step 1: Update firebase.ts imports**

Replace the import in `io/scripts/lib/firebase.ts` line 6:

```typescript
// Before:
import type { Device, Effect, Turnout, DeviceConfig } from './types.js'

// After:
import type { Device, Effect, Turnout, DeviceConfigInput } from '@repo/modules'
```

Also update the return type on line 35:

```typescript
// Before:
export async function getDeviceConfig(layoutId: string, deviceId: string): Promise<DeviceConfig> {

// After:
export async function getDeviceConfig(layoutId: string, deviceId: string): Promise<DeviceConfigInput> {
```

- [ ] **Step 2: Update prompts.ts imports**

Replace the import in `io/scripts/lib/prompts.ts` line 4:

```typescript
// Before:
import type { Device } from './types.js'

// After:
import type { Device } from '@repo/modules'
```

- [ ] **Step 3: Update build.ts imports**

Replace imports in `io/scripts/build.ts` lines 42-44:

```typescript
// Before:
  const { getDeviceConfig } = await import('./lib/firebase.js')
  const { generateArduinoConfig } = await import('./lib/config-arduino.js')
  const { generatePicoSettings, generatePicoConfig } = await import('./lib/config-pico.js')

// After:
  const { getDeviceConfig } = await import('./lib/firebase.js')
  const { generateArduinoConfig, generatePicoSettings, generatePicoConfig } = await import('@repo/modules')
```

- [ ] **Step 4: Update deploy.ts imports**

Replace imports in `io/scripts/deploy.ts` lines 12-14:

```typescript
// Before:
import { getDeviceConfig, listDevices } from './lib/firebase.js'
import { generateArduinoConfig } from './lib/config-arduino.js'
import { generatePicoSettings, generatePicoConfig } from './lib/config-pico.js'

// After:
import { getDeviceConfig, listDevices } from './lib/firebase.js'
import { generateArduinoConfig, generatePicoSettings, generatePicoConfig } from '@repo/modules'
```

- [ ] **Step 5: Delete the old local files**

```bash
rm io/scripts/lib/config-arduino.ts
rm io/scripts/lib/config-pico.ts
rm io/scripts/lib/types.ts
```

- [ ] **Step 6: Verify the build script still resolves correctly**

Run: `cd io && pnpm build 2>&1 | head -5`
Expected: Should either complete the default build (copies src/ to dist/) or show Firebase-related errors (which is fine — means imports resolved).

- [ ] **Step 7: Commit**

```bash
git add io/scripts/build.ts io/scripts/deploy.ts io/scripts/lib/firebase.ts io/scripts/lib/prompts.ts
git rm io/scripts/lib/config-arduino.ts io/scripts/lib/config-pico.ts io/scripts/lib/types.ts
git commit -m "refactor(io): use @repo/modules device-config generators instead of local copies"
```

---

### Task 7: Update cloud app useDeviceConfig to use shared generators

**Files:**
- Modify: `apps/cloud/src/Layout/Devices/useDeviceConfig.ts`

- [ ] **Step 1: Rewrite useDeviceConfig.ts**

Replace the entire file content of `apps/cloud/src/Layout/Devices/useDeviceConfig.ts` with:

```typescript
// 🔧 Device config composable for cloud app
// Wraps shared generators from @repo/modules in Vue computed() refs + triggers ZIP download

import { computed, type Ref, type ComputedRef } from 'vue'
import type { Device, Effect, Turnout } from '@repo/modules'
import {
  generateArduinoConfig,
  generatePicoSettings,
  generatePicoConfig,
} from '@repo/modules'

interface UseDeviceConfigOptions {
  device: Ref<Device | null>
  effects: Ref<Effect[]> | ComputedRef<Effect[]>
  turnouts: Ref<Turnout[]> | ComputedRef<Turnout[]>
}

export function useDeviceConfig({ device, effects, turnouts }: UseDeviceConfigOptions) {
  const isArduino = computed(() =>
    ['dcc-ex', 'deja-arduino', 'deja-arduino-led'].includes(device.value?.type || '')
  )

  const isPicoW = computed(() => device.value?.type === 'deja-mqtt')

  // 🔧 Arduino config.h
  const arduinoConfigH = computed(() => {
    if (!device.value) return ''
    return generateArduinoConfig({
      device: device.value,
      effects: effects.value,
      turnouts: turnouts.value,
    })
  })

  // 🍓 Pico W settings.toml (WiFi creds left empty — filled at download time)
  const picoSettingsToml = computed(() => {
    if (!device.value) return ''
    return generatePicoSettings({
      device: device.value,
      effects: effects.value,
      turnouts: turnouts.value,
      layoutId: '', // filled at download time
    })
  })

  // 🍓 Pico W config.json (pin → GP mapping from effects)
  const picoConfigJson = computed(() => {
    if (!device.value) return ''
    return generatePicoConfig({
      device: device.value,
      effects: effects.value,
      turnouts: turnouts.value,
      layoutId: '', // not needed for config.json
    })
  })

  /**
   * 📦 Download a ready-to-deploy ZIP for this device
   */
  async function downloadPackage(wifiSsid?: string, wifiPassword?: string, mqttBroker?: string, layoutId?: string) {
    if (!device.value) return

    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    const folder = zip.folder(device.value.id)!

    if (isArduino.value) {
      folder.file('config.h', arduinoConfigH.value)
    } else if (isPicoW.value) {
      // Generate settings.toml with user-provided WiFi creds
      const settings = generatePicoSettings({
        device: device.value,
        effects: effects.value,
        turnouts: turnouts.value,
        layoutId: layoutId ?? '',
        wifiSsid,
        wifiPassword,
        mqttBroker,
      })
      folder.file('settings.toml', settings)
      folder.file('config.json', picoConfigJson.value)
    }

    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${device.value.id}-firmware.zip`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    isArduino,
    isPicoW,
    arduinoConfigH,
    picoSettingsToml,
    picoConfigJson,
    downloadPackage,
  }
}
```

- [ ] **Step 2: Type-check the cloud app**

Run: `pnpm --filter=deja-cloud exec -- vue-tsc --noEmit 2>&1 | tail -10`
Expected: No type errors (or only pre-existing errors unrelated to this change).

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/src/Layout/Devices/useDeviceConfig.ts
git commit -m "refactor(cloud): use @repo/modules device-config generators in useDeviceConfig"
```

---

### Task 8: Move esp01-wifi-test to io/tests/ and clean up io/layouts/

**Files:**
- Move: `io/src/esp01-wifi-test/` → `io/tests/esp01-wifi-test/`
- Delete: `io/layouts/` (entire directory)
- Modify: `io/.gitignore`

- [ ] **Step 1: Create io/tests/ directory and move the test project**

```bash
mkdir -p io/tests
git mv io/src/esp01-wifi-test io/tests/esp01-wifi-test
```

- [ ] **Step 2: Delete io/layouts/ directory**

The `io/layouts/` directory is gitignored, so it won't be in git. Remove it from disk:

```bash
rm -rf io/layouts/
```

- [ ] **Step 3: Update io/.gitignore**

Replace the contents of `io/.gitignore` with:

```gitignore
dist/
node_modules/

# 🔐 Device credentials
**/credentials.h
```

The `layouts` entry is removed since that directory no longer exists.

- [ ] **Step 4: Verify the move worked**

Run: `ls io/tests/esp01-wifi-test/src/esp01-wifi-test.ino`
Expected: File exists.

Run: `ls io/src/esp01-wifi-test/ 2>/dev/null && echo "STILL EXISTS" || echo "MOVED OK"`
Expected: `MOVED OK`

- [ ] **Step 5: Commit**

```bash
git add io/tests/ io/.gitignore
git rm -r --cached io/src/esp01-wifi-test/ 2>/dev/null || true
git commit -m "chore(io): move esp01-wifi-test to io/tests/, remove layouts/ directory"
```

---

### Task 9: Final verification

**Files:** None (verification only)

- [ ] **Step 1: Run device-config tests**

Run: `cd packages/modules && pnpm vitest run device-config/`
Expected: All 17 tests PASS.

- [ ] **Step 2: Run monorepo type-check**

Run: `pnpm check-types 2>&1 | tail -20`
Expected: No new type errors introduced by these changes.

- [ ] **Step 3: Run monorepo lint**

Run: `pnpm lint 2>&1 | tail -20`
Expected: No new lint errors from changed files.

- [ ] **Step 4: Verify io/ build script works**

Run: `cd io && pnpm build`
Expected: `✅ Build completed! Files copied from src/ to dist/` (the default mode that doesn't need Firebase).

- [ ] **Step 5: Verify directory structure**

```bash
echo "=== @repo/modules device-config ==="
ls packages/modules/device-config/

echo "=== io/scripts/lib (no config-*.ts or types.ts) ==="
ls io/scripts/lib/

echo "=== io/tests ==="
ls io/tests/

echo "=== io/layouts should NOT exist ==="
ls io/layouts/ 2>/dev/null && echo "STILL EXISTS — ERROR" || echo "REMOVED OK"
```

Expected:
- `device-config/` has: `types.ts`, `arduino-config.ts`, `pico-config.ts`, `index.ts`, `__tests__/`
- `io/scripts/lib/` has: `firebase.ts`, `detect.ts`, `deploy-arduino.ts`, `deploy-pico.ts`, `prompts.ts` (no `config-arduino.ts`, `config-pico.ts`, or `types.ts`)
- `io/tests/` has: `esp01-wifi-test/`
- `io/layouts/` does not exist

- [ ] **Step 6: Final commit (if any lint/type fixes were needed)**

Only if previous steps required fixes:

```bash
git add -A
git commit -m "fix: resolve lint and type errors from io workspace refactor"
```
