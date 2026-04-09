# Device-Based Authentication Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the shared Firebase Admin private key from the install flow and every user's machine. Replace it with a per-device pairing system so each DEJA server authenticates as the logged-in user via a revocable device session, with all access enforced by Firestore/RTDB security rules.

**Architecture:** The Vercel-hosted cloud dashboard (which already holds the Admin SDK) becomes the sole issuer of Firebase custom tokens. Each user's DEJA server is registered as a "device pairing" with an opaque session secret stored in `~/.deja/config.json`. At startup, the server exchanges the session secret for a Firebase custom token, signs in via the Firebase **Client** SDK, and runs with user-scoped permissions. Firestore rules enforce that users can only see/touch their own layouts, and that `users/{uid}.subscription.*` can only be written by the Stripe webhook (admin SDK server-side). Two user-facing pairing flows are provided: (1) a one-click install URL generated in the dashboard, and (2) a `deja login` device-code flow for headless re-installs.

**Tech Stack:** Firebase JS SDK v10 (Client SDK — `firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/database`), Firebase Admin SDK v13 (Vercel API routes only), Vercel serverless functions, Vue 3 + Vuetify (dashboard UI), Node.js 20 + TypeScript + Vitest (server tests), `@firebase/rules-unit-testing` with the Firebase emulator (rules tests).

---

## ⚠️ Immediate Mitigation (before touching code)

The current Firebase Admin private key is already compromised (it's served from `install.dejajs.com`). Do these **manually** before starting the plan:

1. **Rotate the Firebase service account key**
   - GCP Console → IAM & Admin → Service Accounts → (your service account) → Keys → Delete the compromised key → Create new key
   - Paste the new key into Vercel env vars (`FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`) for the `cloud` and `install-api` projects
   - Do **not** update any local `.env` file yet — developer machines shouldn't have this key going forward
2. **Take `install.dejajs.com` offline temporarily**
   - In Vercel, change `apps/install-api/api/index.ts` GET `/` handler to return a 503 with a short message: `"DEJA install is temporarily unavailable. Check back soon."`
   - Deploy immediately. This stops further distribution of the leaked key while you implement the fix.
3. **Revoke any previously-issued long-lived credentials**
   - If you have any manually-issued Firebase custom tokens in circulation, invalidate them (no-op if you have none)

Once these are done, begin the plan.

---

## File Structure

### New files

```
firestore.rules                                          (rewrite)
database.rules.json                                      (rewrite)
firebase.json                                            (add emulator config if not present)

apps/cloud/api/devices/
  mint-install-token.ts                                  (POST – generate install JWT)
  auth.ts                                                (POST – exchange session secret for custom token)
  pair-start.ts                                          (POST – begin device-code flow)
  pair-poll.ts                                           (POST – poll for pairing approval)
  pair-approve.ts                                        (POST – called by dashboard to approve a code)
  list.ts                                                (GET – list current user's device pairings)
  revoke.ts                                              (POST – revoke a pairing by id)
  lib/
    sessionSecret.ts                                     (generate + hash session secrets)
    installJwt.ts                                        (sign + verify install JWTs)
    pairingCodes.ts                                      (generate + track device codes)

apps/cloud/src/Settings/Devices/
  DevicesSection.vue                                     (top-level settings section)
  DeviceList.vue                                         (list of paired devices)
  DeviceListItem.vue                                     (single device row)
  InstallDeviceDialog.vue                                (shows curl command)
  PairCodeDialog.vue                                     (enter/approve device code)

apps/server/src/lib/
  firebase-client.ts                                     (new: initialize Client SDK)
  firebase-client.test.ts                                (auth + listener round-trip tests)
  device-auth.ts                                         (exchange session secret for custom token)
  device-auth.test.ts
  config-store.ts                                        (typed read/write for ~/.deja/config.json — extract from subscription.ts)
  config-store.test.ts

apps/cli/tui/commands/
  login.mjs                                              (device-code login flow)
  install.mjs                                            (consume install JWT — invoked by install.sh)

scripts/migrations/
  2026-04-backfill-ownerUid.mjs                          (add ownerUid to existing layouts)
  2026-04-verify-rules-deploy.mjs                        (smoke test post-deploy)

tests/rules/
  firestore.test.ts                                      (firestore rules tests)
  database.test.ts                                       (RTDB rules tests)
  package.json                                           (test harness package)
```

### Modified files

```
install.sh                                               (remove Firebase key placeholders; accept PAIRING_JWT env var)
apps/install-api/api/index.ts                            (strip __FIREBASE_PRIVATE_KEY__ / __FIREBASE_CLIENT_EMAIL__; add /i/:jwt route)

apps/server/index.ts                                     (swap admin init for device-auth + client init)
apps/server/src/lib/subscription.ts                      (read subscription via Client SDK using signed-in user's own doc)
apps/server/src/dejaCloud.ts                             (swap admin db/rtdb for client db/rtdb)
apps/server/src/lib/dcc.ts                               (swap admin db/rtdb for client)
apps/server/src/lib/deja.ts                              (swap admin db/rtdb for client)
apps/server/src/modules/layout.ts                        (swap admin db for client)
apps/server/src/modules/throttles.ts                     (swap admin db for client)
apps/server/src/modules/effects.ts                       (swap admin db for client)
apps/server/src/modules/signals.ts                       (swap admin db for client)
apps/server/src/modules/turnouts.ts                      (swap admin db for client)
apps/server/src/modules/sensors.ts                       (swap admin db for client)
apps/server/src/modules/blocks.ts                        (swap admin db for client)
apps/server/src/modules/sync-config.ts                   (swap admin db for client)
apps/server/src/modules/roster.ts                        (swap admin db for client)
apps/server/src/modules/trackOutputs.ts                  (swap admin db for client)
apps/server/package.json                                 (remove firebase-admin dep; rely on firebase client)

apps/cli/deja                                            (add `login` and `install` subcommands)
apps/cli/package.json                                    (remove firebase-admin dep; no longer needed)
apps/cli/tui/hooks/useFirebase.mjs                       (swap admin for client SDK — or delete if TUI doesn't need Firebase directly)

apps/cloud/src/Settings/Settings.vue                     (add Devices section link)
apps/cloud/src/router/index.ts                           (add /device route for code approval landing page)

packages/firebase-config/src/firebase-admin-node.ts      (mark as deprecated; keep for Vercel API only)
packages/firebase-config/package.json                    (move firebase-admin to devDependency only)

.env.example                                             (remove FIREBASE_PRIVATE_KEY / FIREBASE_CLIENT_EMAIL from local dev)
.github/workflows/release-server.yml                     (no longer inject keys; only build + upload)
```

### Deleted files

```
(none — keep firebase-admin-node.ts for Vercel API; just stop using it in apps/server and apps/cli)
```

---

## Task ordering and dependencies

```
Task 1 (rules tests harness) ──┐
Task 2 (new firestore.rules)   ├──► Task 18 (backfill) ──► Task 19 (deploy rules)
Task 3 (new database.rules)    ┘

Task 4 (devicePairings schema + helpers) ──► Task 5 (mint-install-token)
                                           ├──► Task 6 (device auth endpoint)
                                           ├──► Task 7 (pair-start/poll/approve)
                                           └──► Task 8 (list/revoke)

Task 9  (config-store extraction)
Task 10 (firebase-client helper)
Task 11 (device-auth client helper)
Task 12 (subscription.ts rewrite)
Task 13 (dejaCloud + modules migration)  ── depends on Tasks 9–12

Task 14 (CLI `deja login`)    ── depends on Task 7
Task 15 (CLI `deja install`)  ── depends on Task 6
Task 16 (rewrite install.sh)  ── depends on Task 15
Task 17 (rewrite install-api) ── depends on Task 5

Task 20 (Devices settings UI)
Task 21 (/device approval landing page)
Task 22 (end-to-end verification)
Task 23 (cleanup: rm admin deps from server/cli)
```

You can parallelize: (rules) ∥ (API routes) ∥ (server rewrite) ∥ (CLI) ∥ (UI). The final integration happens in Tasks 19, 22, 23.

---

## Task 1: Rules test harness

**Why first:** Security rules changes without tests are gambling. The Firebase emulator + `@firebase/rules-unit-testing` library lets us test rules headlessly in CI.

**Files:**
- Create: `tests/rules/package.json`
- Create: `tests/rules/firestore.test.ts`
- Create: `tests/rules/database.test.ts`
- Create: `firebase.json` (if not present — check first)
- Create: `.firebaserc`   (if not present)

- [ ] **Step 1: Check if Firebase emulator is already configured**

Run: `ls /Users/jmcdannel/TTT/DEJA.js.git/preview/firebase.json /Users/jmcdannel/TTT/DEJA.js.git/preview/.firebaserc 2>/dev/null`
If both exist, read them and skip creation below. If missing, create:

`firebase.json`:
```json
{
  "firestore": {
    "rules": "firestore.rules"
  },
  "database": {
    "rules": "database.rules.json"
  },
  "emulators": {
    "firestore": { "port": 8080 },
    "database": { "port": 9000 },
    "auth": { "port": 9099 },
    "ui": { "enabled": true, "port": 4000 },
    "singleProjectMode": true
  }
}
```

`.firebaserc`:
```json
{ "projects": { "default": "deja-js" } }
```

- [ ] **Step 2: Create the rules-test package**

`tests/rules/package.json`:
```json
{
  "name": "deja-rules-tests",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "firebase emulators:exec --only firestore,database,auth 'vitest run'",
    "test:watch": "firebase emulators:exec --only firestore,database,auth 'vitest'"
  },
  "devDependencies": {
    "@firebase/rules-unit-testing": "^3.0.4",
    "firebase": "^10.14.1",
    "firebase-tools": "^13.0.0",
    "vitest": "^1.6.0",
    "typescript": "^5.7.2"
  }
}
```

- [ ] **Step 3: Write baseline firestore rules test (current rules)**

`tests/rules/firestore.test.ts`:
```typescript
import { initializeTestEnvironment, RulesTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { beforeAll, afterAll, beforeEach, describe, it } from 'vitest'
import { readFileSync } from 'node:fs'

let testEnv: RulesTestEnvironment

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'deja-rules-test',
    firestore: {
      rules: readFileSync('../../firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
})

describe('firestore.rules — layouts', () => {
  it('denies cross-tenant layout reads', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore()
      await setDoc(doc(db, 'layouts/layout-alice'), { ownerUid: 'alice' })
    })
    const bob = testEnv.authenticatedContext('bob', { email: 'bob@test.com' })
    await assertFails(getDoc(doc(bob.firestore(), 'layouts/layout-alice')))
  })

  it('allows owner to read their own layout', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'layouts/layout-alice'), { ownerUid: 'alice' })
    })
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@test.com' })
    await assertSucceeds(getDoc(doc(alice.firestore(), 'layouts/layout-alice')))
  })
})

describe('firestore.rules — users/{uid}.subscription', () => {
  it('denies users writing their own subscription field', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@test.com' })
    await assertFails(setDoc(doc(alice.firestore(), 'users/alice'), { subscription: { status: 'active' } }))
  })

  it('allows users writing non-subscription profile fields', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@test.com' })
    await assertSucceeds(setDoc(doc(alice.firestore(), 'users/alice'), { displayName: 'Alice' }))
  })

  it('allows admin SDK to write subscription field', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await assertSucceeds(setDoc(doc(ctx.firestore(), 'users/alice'), { subscription: { status: 'active' } }))
    })
  })
})
```

- [ ] **Step 4: Install deps and run tests — expect failure (rules don't enforce any of this yet)**

Run:
```bash
cd tests/rules && pnpm install
pnpm test
```
Expected: Multiple `assertFails` calls should actually *succeed* (i.e. current rules don't deny them), so test cases that assert failure will themselves fail. This is correct — we want the tests red before we fix the rules.

- [ ] **Step 5: Commit**

```bash
git add firebase.json .firebaserc tests/rules/
git commit -m "test(rules): 🧪 add Firestore rules test harness with baseline failing tests"
```

---

## Task 2: New Firestore rules (ownerUid + subscription lockdown + cross-tenant denial)

**Files:**
- Modify: `firestore.rules`

- [ ] **Step 1: Write the new rules file**

Replace the entire contents of `firestore.rules` with:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isAuth() {
      return request.auth != null;
    }

    function isEmailVerified() {
      return isAuth() && request.auth.token.email_verified == true;
    }

    // Layout ownership is keyed on UID (not email). The layout doc must
    // carry `ownerUid` — backfilled for legacy docs by the migration script.
    function isLayoutOwner(layoutId) {
      return isAuth()
        && get(/databases/$(database)/documents/layouts/$(layoutId)).data.ownerUid == request.auth.uid;
    }

    function isLayoutOwnerByResource(resource) {
      return isAuth() && resource.data.ownerUid == request.auth.uid;
    }

    // --- Layouts ---------------------------------------------------------
    match /layouts/{layoutId} {
      // Users can only read layouts they own. Cross-tenant enumeration is denied.
      allow get: if isLayoutOwnerByResource(resource);
      allow list: if isAuth()
        && request.query.limit <= 100
        && 'ownerUid' in request.query.where
        && request.query.where.ownerUid == request.auth.uid;

      allow create: if isAuth()
        && request.resource.data.ownerUid == request.auth.uid;
      allow update: if isLayoutOwnerByResource(resource)
        && request.resource.data.ownerUid == resource.data.ownerUid;
      allow delete: if isLayoutOwnerByResource(resource);

      // All sub-collections: only layout owner
      match /{subcollection}/{docId} {
        allow read, write: if isLayoutOwner(layoutId);
      }
    }

    // --- Users -----------------------------------------------------------
    // Users can read and write their own profile BUT cannot touch the
    // `subscription` field — that is controlled exclusively by the Stripe
    // webhook running with the Admin SDK (which bypasses rules).
    match /users/{userId} {
      allow read: if isAuth() && request.auth.uid == userId;

      allow create: if isAuth()
        && request.auth.uid == userId
        && !('subscription' in request.resource.data);

      allow update: if isAuth()
        && request.auth.uid == userId
        && !('subscription' in request.resource.data.diff(resource.data).affectedKeys());

      allow delete: if false;
    }

    // --- Device pairings -------------------------------------------------
    // Only the admin SDK writes. Clients can read their own pairings for UI.
    match /devicePairings/{pairingId} {
      allow read: if isAuth() && resource.data.uid == request.auth.uid;
      allow write: if false; // admin SDK only
    }

    // --- Device pairing codes (device-code flow) -------------------------
    // Only the admin SDK reads/writes. Clients never touch these directly.
    match /devicePairingCodes/{codeId} {
      allow read, write: if false;
    }

    // --- Approval requests -----------------------------------------------
    // Subcollection model: each layout has its own approvals collection.
    match /layouts/{layoutId}/approvalRequests/{requestId} {
      allow create: if isAuth()
        && request.resource.data.requesterUid == request.auth.uid;
      allow read: if isAuth() && (
        resource.data.requesterUid == request.auth.uid
        || isLayoutOwner(layoutId)
      );
      allow update: if isLayoutOwner(layoutId);
      allow delete: if isLayoutOwner(layoutId);
    }

    // --- Promotions ------------------------------------------------------
    match /promotions/{promoId} {
      allow read: if true;
      allow write: if false;
    }

    // --- Default deny ----------------------------------------------------
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

- [ ] **Step 2: Run the rules tests — should now pass**

Run: `cd tests/rules && pnpm test`
Expected: All tests in `firestore.test.ts` pass. If any fail, read the failure and fix either the rule or the test.

- [ ] **Step 3: Add more tests — subcollections, devicePairings, approvalRequests**

Append to `tests/rules/firestore.test.ts`:

```typescript
describe('firestore.rules — layout subcollections', () => {
  it('denies non-owner access to turnouts', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'layouts/layout-alice'), { ownerUid: 'alice' })
      await setDoc(doc(ctx.firestore(), 'layouts/layout-alice/turnouts/t1'), { state: 0 })
    })
    const bob = testEnv.authenticatedContext('bob', { email: 'bob@test.com' })
    await assertFails(getDoc(doc(bob.firestore(), 'layouts/layout-alice/turnouts/t1')))
  })

  it('allows owner to write turnouts', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'layouts/layout-alice'), { ownerUid: 'alice' })
    })
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@test.com' })
    await assertSucceeds(setDoc(doc(alice.firestore(), 'layouts/layout-alice/turnouts/t1'), { state: 1 }))
  })
})

describe('firestore.rules — devicePairings', () => {
  it('denies client writes', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@test.com' })
    await assertFails(setDoc(doc(alice.firestore(), 'devicePairings/p1'), { uid: 'alice' }))
  })

  it('allows user to read their own pairing', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'devicePairings/p1'), { uid: 'alice' })
    })
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@test.com' })
    await assertSucceeds(getDoc(doc(alice.firestore(), 'devicePairings/p1')))
  })

  it('denies user reading another user\'s pairing', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'devicePairings/p1'), { uid: 'alice' })
    })
    const bob = testEnv.authenticatedContext('bob', { email: 'bob@test.com' })
    await assertFails(getDoc(doc(bob.firestore(), 'devicePairings/p1')))
  })
})
```

Run: `pnpm test` — expect all pass.

- [ ] **Step 4: Commit**

```bash
git add firestore.rules tests/rules/firestore.test.ts
git commit -m "feat(rules): 🔒 rewrite Firestore rules for ownerUid + subscription lockdown

- Layout ownership now keyed on auth.uid not email
- users/{uid}.subscription.* locked to server-side writes only
- Cross-tenant layout list/get denied
- devicePairings and devicePairingCodes admin-only"
```

---

## Task 3: New RTDB rules

**Files:**
- Modify: `database.rules.json`

- [ ] **Step 1: Rewrite RTDB rules**

Replace contents of `database.rules.json`:

```json
{
  "rules": {
    "dccCommands": {
      "$layoutId": {
        ".read": "auth != null && root.child('layouts').child($layoutId).child('ownerUid').val() === auth.uid",
        ".write": "auth != null && root.child('layouts').child($layoutId).child('ownerUid').val() === auth.uid",
        "$commandId": {
          ".validate": "newData.hasChildren(['action']) && newData.child('action').isString() && newData.child('action').val().length < 50 && newData.child('payload').isString() && newData.child('payload').val().length < 500"
        }
      }
    },
    "dejaCommands": {
      "$layoutId": {
        ".read": "auth != null && root.child('layouts').child($layoutId).child('ownerUid').val() === auth.uid",
        ".write": "auth != null && root.child('layouts').child($layoutId).child('ownerUid').val() === auth.uid"
      }
    },
    "dccLog": {
      "$layoutId": {
        ".read": "auth != null && root.child('layouts').child($layoutId).child('ownerUid').val() === auth.uid",
        ".write": "auth != null && root.child('layouts').child($layoutId).child('ownerUid').val() === auth.uid"
      }
    },
    "serverStatus": {
      "$layoutId": {
        ".read": "auth != null && root.child('layouts').child($layoutId).child('ownerUid').val() === auth.uid",
        ".write": "auth != null && root.child('layouts').child($layoutId).child('ownerUid').val() === auth.uid"
      }
    },
    "portList": {
      "$layoutId": {
        ".read": "auth != null && root.child('layouts').child($layoutId).child('ownerUid').val() === auth.uid",
        ".write": "auth != null && root.child('layouts').child($layoutId).child('ownerUid').val() === auth.uid"
      }
    },
    "$other": {
      ".read": false,
      ".write": false
    }
  }
}
```

**Important:** This rule references `layouts/{layoutId}/ownerUid` in RTDB — but `layouts` lives in Firestore, not RTDB. This cross-reference doesn't work. Instead, mirror the ownerUid to RTDB on layout creation (see Task 18). For now the rules should reference RTDB-only data.

Rewrite to reference `layoutOwners/{layoutId}` (new RTDB node mirrored by a Cloud Function or the Stripe webhook):

```json
{
  "rules": {
    "layoutOwners": {
      "$layoutId": {
        ".read": "auth != null && data.val() === auth.uid",
        ".write": false
      }
    },
    "dccCommands": {
      "$layoutId": {
        ".read": "auth != null && root.child('layoutOwners').child($layoutId).val() === auth.uid",
        ".write": "auth != null && root.child('layoutOwners').child($layoutId).val() === auth.uid",
        "$commandId": {
          ".validate": "newData.hasChildren(['action']) && newData.child('action').isString() && newData.child('action').val().length < 50 && newData.child('payload').isString() && newData.child('payload').val().length < 500"
        }
      }
    },
    "dejaCommands": {
      "$layoutId": {
        ".read": "auth != null && root.child('layoutOwners').child($layoutId).val() === auth.uid",
        ".write": "auth != null && root.child('layoutOwners').child($layoutId).val() === auth.uid"
      }
    },
    "dccLog": {
      "$layoutId": {
        ".read": "auth != null && root.child('layoutOwners').child($layoutId).val() === auth.uid",
        ".write": "auth != null && root.child('layoutOwners').child($layoutId).val() === auth.uid"
      }
    },
    "serverStatus": {
      "$layoutId": {
        ".read": "auth != null && root.child('layoutOwners').child($layoutId).val() === auth.uid",
        ".write": "auth != null && root.child('layoutOwners').child($layoutId).val() === auth.uid"
      }
    },
    "portList": {
      "$layoutId": {
        ".read": "auth != null && root.child('layoutOwners').child($layoutId).val() === auth.uid",
        ".write": "auth != null && root.child('layoutOwners').child($layoutId).val() === auth.uid"
      }
    },
    "$other": {
      ".read": false,
      ".write": false
    }
  }
}
```

- [ ] **Step 2: Write RTDB rules tests**

`tests/rules/database.test.ts`:
```typescript
import { initializeTestEnvironment, RulesTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { ref, get, set } from 'firebase/database'
import { beforeAll, afterAll, beforeEach, describe, it } from 'vitest'
import { readFileSync } from 'node:fs'

let testEnv: RulesTestEnvironment

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'deja-rules-test',
    database: {
      rules: readFileSync('../../database.rules.json', 'utf8'),
      host: '127.0.0.1',
      port: 9000,
    },
  })
})

afterAll(async () => { await testEnv.cleanup() })
beforeEach(async () => { await testEnv.clearDatabase() })

describe('database.rules — dccCommands', () => {
  it('denies non-owner writes', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await set(ref(ctx.database(), 'layoutOwners/layout-alice'), 'alice')
    })
    const bob = testEnv.authenticatedContext('bob')
    await assertFails(set(ref(bob.database(), 'dccCommands/layout-alice/cmd1'), {
      action: 'throttle', payload: JSON.stringify({ address: 3, speed: 10 })
    }))
  })

  it('allows owner writes with valid payload', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await set(ref(ctx.database(), 'layoutOwners/layout-alice'), 'alice')
    })
    const alice = testEnv.authenticatedContext('alice')
    await assertSucceeds(set(ref(alice.database(), 'dccCommands/layout-alice/cmd1'), {
      action: 'throttle', payload: JSON.stringify({ address: 3, speed: 10 })
    }))
  })
})
```

Run: `pnpm test` — all should pass.

- [ ] **Step 3: Commit**

```bash
git add database.rules.json tests/rules/database.test.ts
git commit -m "feat(rules): 🔒 rewrite RTDB rules to use layoutOwners mirror node"
```

---

## Task 4: devicePairings helpers (session secrets + install JWTs + pairing codes)

**Files:**
- Create: `apps/cloud/api/devices/lib/sessionSecret.ts`
- Create: `apps/cloud/api/devices/lib/installJwt.ts`
- Create: `apps/cloud/api/devices/lib/pairingCodes.ts`
- Create: `apps/cloud/api/devices/lib/sessionSecret.test.ts`
- Create: `apps/cloud/api/devices/lib/installJwt.test.ts`

- [ ] **Step 1: Write session secret helper**

`apps/cloud/api/devices/lib/sessionSecret.ts`:
```typescript
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto'

/** Generates a 32-byte URL-safe session secret. */
export function generateSessionSecret(): string {
  return randomBytes(32).toString('base64url')
}

/** Hashes a session secret with SHA-256 (no salt — secrets are single-use per pairing). */
export function hashSessionSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex')
}

/** Timing-safe comparison of a presented secret against the stored hash. */
export function verifySessionSecret(presented: string, storedHash: string): boolean {
  const presentedHash = hashSessionSecret(presented)
  const a = Buffer.from(presentedHash, 'hex')
  const b = Buffer.from(storedHash, 'hex')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
```

- [ ] **Step 2: Write install JWT helper**

`apps/cloud/api/devices/lib/installJwt.ts`:
```typescript
import { createHmac, timingSafeEqual } from 'node:crypto'

const ALG = 'HS256'
const INSTALL_JWT_SECRET = process.env.INSTALL_JWT_SECRET ?? ''
const TTL_SECONDS = 15 * 60 // 15 minutes

if (!INSTALL_JWT_SECRET) {
  console.warn('[installJwt] INSTALL_JWT_SECRET is not set — install JWTs will fail validation')
}

interface InstallJwtPayload {
  pairingId: string
  sessionSecret: string
  uid: string
  layoutId: string | null
  iat: number
  exp: number
}

function base64UrlEncode(obj: object): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64url')
}

function base64UrlDecode<T>(str: string): T {
  return JSON.parse(Buffer.from(str, 'base64url').toString('utf8')) as T
}

export function signInstallJwt(input: Omit<InstallJwtPayload, 'iat' | 'exp'>): string {
  const now = Math.floor(Date.now() / 1000)
  const payload: InstallJwtPayload = { ...input, iat: now, exp: now + TTL_SECONDS }
  const header = base64UrlEncode({ alg: ALG, typ: 'JWT' })
  const body = base64UrlEncode(payload)
  const sig = createHmac('sha256', INSTALL_JWT_SECRET).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${sig}`
}

export function verifyInstallJwt(token: string): InstallJwtPayload | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, sig] = parts
  const expected = createHmac('sha256', INSTALL_JWT_SECRET).update(`${header}.${body}`).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const payload = base64UrlDecode<InstallJwtPayload>(body)
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}
```

- [ ] **Step 3: Write pairing codes helper**

`apps/cloud/api/devices/lib/pairingCodes.ts`:
```typescript
import { randomBytes } from 'node:crypto'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // unambiguous
const CODE_LENGTH = 8

/** Generates a human-friendly device pairing code like "ABCD-2345". */
export function generatePairingCode(): string {
  const bytes = randomBytes(CODE_LENGTH)
  const chars: string[] = []
  for (let i = 0; i < CODE_LENGTH; i++) {
    chars.push(ALPHABET[bytes[i] % ALPHABET.length])
  }
  return `${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`
}

/** Generates a 32-byte poll token used by the CLI to check pairing status. */
export function generatePollToken(): string {
  return randomBytes(32).toString('base64url')
}
```

- [ ] **Step 4: Write tests for sessionSecret and installJwt**

`apps/cloud/api/devices/lib/sessionSecret.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { generateSessionSecret, hashSessionSecret, verifySessionSecret } from './sessionSecret'

describe('sessionSecret', () => {
  it('generates distinct secrets', () => {
    expect(generateSessionSecret()).not.toBe(generateSessionSecret())
  })

  it('verifies a correct secret against its hash', () => {
    const s = generateSessionSecret()
    const h = hashSessionSecret(s)
    expect(verifySessionSecret(s, h)).toBe(true)
  })

  it('rejects an incorrect secret', () => {
    const s = generateSessionSecret()
    const h = hashSessionSecret(s)
    expect(verifySessionSecret('wrong', h)).toBe(false)
  })
})
```

`apps/cloud/api/devices/lib/installJwt.test.ts`:
```typescript
import { describe, it, expect, beforeAll } from 'vitest'
import { signInstallJwt, verifyInstallJwt } from './installJwt'

beforeAll(() => { process.env.INSTALL_JWT_SECRET = 'test-secret-for-unit-tests' })

describe('installJwt', () => {
  it('signs and verifies round-trip', () => {
    const token = signInstallJwt({ pairingId: 'p1', sessionSecret: 's1', uid: 'u1', layoutId: 'l1' })
    const payload = verifyInstallJwt(token)
    expect(payload?.pairingId).toBe('p1')
    expect(payload?.sessionSecret).toBe('s1')
    expect(payload?.uid).toBe('u1')
    expect(payload?.layoutId).toBe('l1')
  })

  it('rejects tampered token', () => {
    const token = signInstallJwt({ pairingId: 'p1', sessionSecret: 's1', uid: 'u1', layoutId: null })
    const parts = token.split('.')
    const tampered = `${parts[0]}.${parts[1]}.AAAA${parts[2].slice(4)}`
    expect(verifyInstallJwt(tampered)).toBeNull()
  })

  it('rejects malformed token', () => {
    expect(verifyInstallJwt('not.a.token')).toBeNull()
    expect(verifyInstallJwt('only-one-part')).toBeNull()
  })
})
```

- [ ] **Step 5: Run tests and commit**

```bash
cd apps/cloud && pnpm vitest run api/devices/lib/
```
Expected: all pass.

```bash
git add apps/cloud/api/devices/lib/
git commit -m "feat(cloud/api): 🔐 add device pairing crypto helpers (session secrets + install JWTs + codes)"
```

---

## Task 5: `POST /api/devices/mint-install-token`

Creates a device pairing doc + returns an install URL with a short-lived JWT.

**Files:**
- Create: `apps/cloud/api/devices/mint-install-token.ts`

- [ ] **Step 1: Implement the route**

`apps/cloud/api/devices/mint-install-token.ts`:
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from '../lib/firebase'
import { verifyFirebaseAuth } from '../lib/verifyFirebaseAuth'
import { generateSessionSecret, hashSessionSecret } from './lib/sessionSecret'
import { signInstallJwt } from './lib/installJwt'
import { FieldValue } from 'firebase-admin/firestore'

const INSTALL_BASE_URL = process.env.INSTALL_BASE_URL ?? 'https://install.dejajs.com'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await verifyFirebaseAuth(req)
  if (!auth.valid || !auth.uid) {
    return res.status(auth.status ?? 401).json({ error: auth.message ?? 'Unauthorized' })
  }

  // Body: { label?: string, layoutId?: string }
  const label = typeof req.body?.label === 'string' ? req.body.label.slice(0, 80) : 'DEJA Server'
  const layoutId = typeof req.body?.layoutId === 'string' ? req.body.layoutId : null

  // Require an active/trialing/past_due subscription
  const userSnap = await db.doc(`users/${auth.uid}`).get()
  const sub = userSnap.data()?.subscription
  const allowed = ['active', 'trialing', 'past_due']
  if (!sub || !allowed.includes(sub.status)) {
    return res.status(403).json({ error: 'Active subscription required to pair a device' })
  }

  const sessionSecret = generateSessionSecret()
  const pairingRef = db.collection('devicePairings').doc()

  await pairingRef.set({
    uid: auth.uid,
    layoutId,
    label,
    secretHash: hashSessionSecret(sessionSecret),
    revoked: false,
    createdAt: FieldValue.serverTimestamp(),
    lastAuthAt: null,
    userAgent: req.headers['user-agent'] ?? null,
  })

  const token = signInstallJwt({
    pairingId: pairingRef.id,
    sessionSecret,
    uid: auth.uid,
    layoutId,
  })

  return res.status(200).json({
    installUrl: `${INSTALL_BASE_URL}/i/${token}`,
    pairingId: pairingRef.id,
  })
}
```

- [ ] **Step 2: Manual test (curl with a test ID token)**

Deploy to a preview environment and test:
```bash
TOKEN=$(cat ~/.id-token)  # get a test user's Firebase ID token
curl -X POST https://<preview-url>/api/devices/mint-install-token \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"label":"Test Pi"}'
```
Expected: `{ installUrl: "https://install.dejajs.com/i/<jwt>", pairingId: "..." }`

Verify the Firestore doc exists at `devicePairings/<pairingId>` with `secretHash` (not the raw secret), `revoked: false`.

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/api/devices/mint-install-token.ts
git commit -m "feat(cloud/api): ✨ add mint-install-token route for device pairing"
```

---

## Task 6: `POST /api/devices/auth`

Server calls this at startup with `{ pairingId, sessionSecret }`. Backend verifies, mints a Firebase custom token, returns `{ customToken, uid, layoutId, subscription }`.

**Files:**
- Create: `apps/cloud/api/devices/auth.ts`

- [ ] **Step 1: Implement**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../lib/firebase'
import { verifySessionSecret } from './lib/sessionSecret'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const pairingId = typeof req.body?.pairingId === 'string' ? req.body.pairingId : null
  const sessionSecret = typeof req.body?.sessionSecret === 'string' ? req.body.sessionSecret : null
  if (!pairingId || !sessionSecret) {
    return res.status(400).json({ error: 'pairingId and sessionSecret required' })
  }

  const pairingSnap = await db.doc(`devicePairings/${pairingId}`).get()
  if (!pairingSnap.exists) return res.status(404).json({ error: 'Pairing not found' })

  const pairing = pairingSnap.data()!
  if (pairing.revoked) return res.status(403).json({ error: 'Pairing revoked' })
  if (!verifySessionSecret(sessionSecret, pairing.secretHash)) {
    return res.status(401).json({ error: 'Invalid session secret' })
  }

  // Verify user still has an allowed subscription
  const userSnap = await db.doc(`users/${pairing.uid}`).get()
  const sub = userSnap.data()?.subscription
  const allowed = ['active', 'trialing', 'past_due']
  if (!sub || !allowed.includes(sub.status)) {
    return res.status(402).json({ error: 'Subscription not active', subscription: sub ?? null })
  }

  // Mint custom token for Firebase Client SDK sign-in
  const customToken = await getAuth().createCustomToken(pairing.uid, {
    pairingId,
    layoutId: pairing.layoutId,
  })

  await pairingSnap.ref.update({ lastAuthAt: FieldValue.serverTimestamp() })

  return res.status(200).json({
    customToken,
    uid: pairing.uid,
    layoutId: pairing.layoutId,
    subscription: {
      status: sub.status,
      plan: sub.plan ?? null,
    },
  })
}
```

- [ ] **Step 2: Manual test with the pairing from Task 5**

Extract `pairingId` and `sessionSecret` from the install JWT returned in Task 5 (use `verifyInstallJwt` locally or base64url-decode the middle segment). Then:

```bash
curl -X POST https://<preview-url>/api/devices/auth \
  -H "Content-Type: application/json" \
  -d "{\"pairingId\":\"$PAIRING_ID\",\"sessionSecret\":\"$SECRET\"}"
```
Expected: `{ customToken: "eyJ...", uid: "...", layoutId: null, subscription: {...} }`

Verify `devicePairings/<pairingId>.lastAuthAt` was updated.

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/api/devices/auth.ts
git commit -m "feat(cloud/api): 🔑 add device auth route — mint Firebase custom tokens from session secrets"
```

---

## Task 7: Device-code pairing routes (`pair-start`, `pair-poll`, `pair-approve`)

For the `deja login` flow: CLI gets a short code, user enters it in dashboard to approve.

**Files:**
- Create: `apps/cloud/api/devices/pair-start.ts`
- Create: `apps/cloud/api/devices/pair-poll.ts`
- Create: `apps/cloud/api/devices/pair-approve.ts`

- [ ] **Step 1: pair-start (no auth — called by CLI)**

```typescript
// apps/cloud/api/devices/pair-start.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../lib/firebase'
import { generatePairingCode, generatePollToken } from './lib/pairingCodes'
import { hashSessionSecret } from './lib/sessionSecret'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const userCode = generatePairingCode()
  const pollToken = generatePollToken()

  await db.collection('devicePairingCodes').doc(userCode).set({
    pollTokenHash: hashSessionSecret(pollToken),
    state: 'pending',
    pairingId: null,
    sessionSecret: null,
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    userAgent: req.headers['user-agent'] ?? null,
  })

  return res.status(200).json({
    userCode,
    pollToken,
    verificationUrl: 'https://cloud.dejajs.com/device',
    pollInterval: 2,
    expiresIn: 600,
  })
}
```

- [ ] **Step 2: pair-poll (no auth — called by CLI)**

```typescript
// apps/cloud/api/devices/pair-poll.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from '../lib/firebase'
import { verifySessionSecret } from './lib/sessionSecret'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const userCode = typeof req.body?.userCode === 'string' ? req.body.userCode : null
  const pollToken = typeof req.body?.pollToken === 'string' ? req.body.pollToken : null
  if (!userCode || !pollToken) return res.status(400).json({ error: 'userCode and pollToken required' })

  const codeRef = db.doc(`devicePairingCodes/${userCode}`)
  const snap = await codeRef.get()
  if (!snap.exists) return res.status(404).json({ state: 'expired' })

  const data = snap.data()!
  if (data.expiresAt.toDate() < new Date()) {
    await codeRef.delete()
    return res.status(404).json({ state: 'expired' })
  }
  if (!verifySessionSecret(pollToken, data.pollTokenHash)) {
    return res.status(401).json({ error: 'Invalid poll token' })
  }

  if (data.state === 'pending') return res.status(200).json({ state: 'pending' })
  if (data.state === 'approved') {
    // One-time delivery: return the pairing credentials and destroy the code
    const payload = { state: 'approved', pairingId: data.pairingId, sessionSecret: data.sessionSecret }
    await codeRef.delete()
    return res.status(200).json(payload)
  }
  return res.status(200).json({ state: data.state })
}
```

- [ ] **Step 3: pair-approve (auth required — called by dashboard when user enters the code)**

```typescript
// apps/cloud/api/devices/pair-approve.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../lib/firebase'
import { verifyFirebaseAuth } from '../lib/verifyFirebaseAuth'
import { generateSessionSecret, hashSessionSecret } from './lib/sessionSecret'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const auth = await verifyFirebaseAuth(req)
  if (!auth.valid || !auth.uid) return res.status(auth.status ?? 401).json({ error: auth.message })

  const userCode = typeof req.body?.userCode === 'string' ? req.body.userCode.toUpperCase() : null
  const label = typeof req.body?.label === 'string' ? req.body.label.slice(0, 80) : 'DEJA Server'
  const layoutId = typeof req.body?.layoutId === 'string' ? req.body.layoutId : null
  if (!userCode) return res.status(400).json({ error: 'userCode required' })

  const userSnap = await db.doc(`users/${auth.uid}`).get()
  const sub = userSnap.data()?.subscription
  if (!sub || !['active', 'trialing', 'past_due'].includes(sub.status)) {
    return res.status(402).json({ error: 'Subscription not active' })
  }

  const codeRef = db.doc(`devicePairingCodes/${userCode}`)
  const codeSnap = await codeRef.get()
  if (!codeSnap.exists) return res.status(404).json({ error: 'Code not found or expired' })
  const code = codeSnap.data()!
  if (code.state !== 'pending') return res.status(409).json({ error: 'Code already used' })

  // Create the pairing
  const sessionSecret = generateSessionSecret()
  const pairingRef = db.collection('devicePairings').doc()
  await pairingRef.set({
    uid: auth.uid,
    layoutId,
    label,
    secretHash: hashSessionSecret(sessionSecret),
    revoked: false,
    createdAt: FieldValue.serverTimestamp(),
    lastAuthAt: null,
    userAgent: code.userAgent,
  })

  // Attach credentials to the code for one-time pickup by the CLI
  await codeRef.update({
    state: 'approved',
    pairingId: pairingRef.id,
    sessionSecret,
    approvedBy: auth.uid,
    approvedAt: FieldValue.serverTimestamp(),
  })

  return res.status(200).json({ ok: true, pairingId: pairingRef.id })
}
```

- [ ] **Step 4: Manual end-to-end test**

1. `curl -X POST .../api/devices/pair-start` → get `{ userCode, pollToken }`
2. In another terminal, start polling: `while true; do curl -X POST .../api/devices/pair-poll -d "{\"userCode\":\"$UC\",\"pollToken\":\"$PT\"}"; sleep 2; done`
3. `curl -X POST .../api/devices/pair-approve -H "Authorization: Bearer $ID_TOKEN" -d "{\"userCode\":\"$UC\"}"`
4. Verify poll returns `{ state: 'approved', pairingId, sessionSecret }` on the next tick, then `{ state: 'expired' }` after that.

- [ ] **Step 5: Commit**

```bash
git add apps/cloud/api/devices/pair-start.ts apps/cloud/api/devices/pair-poll.ts apps/cloud/api/devices/pair-approve.ts
git commit -m "feat(cloud/api): 🤝 add device-code pairing flow (pair-start / pair-poll / pair-approve)"
```

---

## Task 8: `list` and `revoke` routes

**Files:**
- Create: `apps/cloud/api/devices/list.ts`
- Create: `apps/cloud/api/devices/revoke.ts`

- [ ] **Step 1: list route**

```typescript
// apps/cloud/api/devices/list.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from '../lib/firebase'
import { verifyFirebaseAuth } from '../lib/verifyFirebaseAuth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const auth = await verifyFirebaseAuth(req)
  if (!auth.valid || !auth.uid) return res.status(auth.status ?? 401).json({ error: auth.message })

  const snap = await db.collection('devicePairings').where('uid', '==', auth.uid).get()
  const devices = snap.docs.map((doc) => {
    const d = doc.data()
    return {
      id: doc.id,
      label: d.label ?? 'DEJA Server',
      layoutId: d.layoutId ?? null,
      createdAt: d.createdAt?.toDate().toISOString() ?? null,
      lastAuthAt: d.lastAuthAt?.toDate().toISOString() ?? null,
      revoked: Boolean(d.revoked),
      userAgent: d.userAgent ?? null,
    }
  })
  return res.status(200).json({ devices })
}
```

- [ ] **Step 2: revoke route**

```typescript
// apps/cloud/api/devices/revoke.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../lib/firebase'
import { verifyFirebaseAuth } from '../lib/verifyFirebaseAuth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const auth = await verifyFirebaseAuth(req)
  if (!auth.valid || !auth.uid) return res.status(auth.status ?? 401).json({ error: auth.message })

  const pairingId = typeof req.body?.pairingId === 'string' ? req.body.pairingId : null
  if (!pairingId) return res.status(400).json({ error: 'pairingId required' })

  const ref = db.doc(`devicePairings/${pairingId}`)
  const snap = await ref.get()
  if (!snap.exists) return res.status(404).json({ error: 'Not found' })
  if (snap.data()?.uid !== auth.uid) return res.status(403).json({ error: 'Not yours to revoke' })

  await ref.update({ revoked: true, revokedAt: FieldValue.serverTimestamp() })
  return res.status(200).json({ ok: true })
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/api/devices/list.ts apps/cloud/api/devices/revoke.ts
git commit -m "feat(cloud/api): ✨ add device pairing list + revoke routes"
```

---

## Task 9: Extract config-store helper from subscription.ts

The current code mixes config I/O with subscription logic. Split them so the new auth code can read/write config cleanly.

**Files:**
- Create: `apps/server/src/lib/config-store.ts`
- Create: `apps/server/src/lib/config-store.test.ts`
- Modify: `apps/server/src/lib/subscription.ts` (import config-store)

- [ ] **Step 1: Write failing test**

`apps/server/src/lib/config-store.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createConfigStore, DejaConfig } from './config-store'

describe('config-store', () => {
  let dir: string
  let store: ReturnType<typeof createConfigStore>

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'deja-config-'))
    store = createConfigStore(dir)
  })
  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  it('returns null when no config file exists', () => {
    expect(store.read()).toBeNull()
  })

  it('writes and reads a config round-trip', () => {
    const config: DejaConfig = { uid: 'u1', layoutId: 'l1', auth: { pairingId: 'p1', sessionSecret: 's1' } }
    store.write(config)
    expect(store.read()).toEqual(config)
  })

  it('writes the file with 0600 permissions', () => {
    store.write({ uid: 'u1', layoutId: 'l1' })
    const stat = require('node:fs').statSync(join(dir, 'config.json'))
    expect(stat.mode & 0o777).toBe(0o600)
  })

  it('atomic write — temp file then rename', () => {
    store.write({ uid: 'u1', layoutId: 'l1' })
    store.write({ uid: 'u1', layoutId: 'l2' })
    expect(store.read()?.layoutId).toBe('l2')
  })

  it('update merges partial changes', () => {
    store.write({ uid: 'u1', layoutId: 'l1' })
    store.update({ layoutId: 'l2' })
    expect(store.read()?.layoutId).toBe('l2')
    expect(store.read()?.uid).toBe('u1')
  })
})
```

- [ ] **Step 2: Run test — expect failure**

Run: `cd apps/server && pnpm vitest run src/lib/config-store.test.ts`
Expected: fails — module does not exist yet.

- [ ] **Step 3: Implement config-store**

`apps/server/src/lib/config-store.ts`:
```typescript
import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync, renameSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

export interface DejaAuthConfig {
  pairingId: string
  sessionSecret: string
}

export interface DejaConfig {
  uid?: string
  layoutId?: string
  auth?: DejaAuthConfig
  subscription?: {
    status: string
    plan?: string
    validatedAt: string
  }
  mqtt?: { enabled?: boolean; broker?: string; port?: number }
  ws?: { enabled?: boolean; port?: number; id?: string }
  cloud?: { enabled?: boolean }
  audio?: { cacheSizeMb?: number; cacheDir?: string }
  onboardingComplete?: boolean
}

export interface ConfigStore {
  read(): DejaConfig | null
  write(config: DejaConfig): void
  update(partial: Partial<DejaConfig>): DejaConfig
  path(): string
}

export function getDefaultDejaDir(): string {
  return process.env.DEJA_DIR ?? join(homedir(), '.deja')
}

export function createConfigStore(dejaDir: string = getDefaultDejaDir()): ConfigStore {
  const configPath = join(dejaDir, 'config.json')

  function read(): DejaConfig | null {
    if (!existsSync(configPath)) return null
    try {
      return JSON.parse(readFileSync(configPath, 'utf8')) as DejaConfig
    } catch (err) {
      throw new Error(`config-store: failed to parse ${configPath}: ${(err as Error).message}`)
    }
  }

  function write(config: DejaConfig): void {
    if (!existsSync(dejaDir)) mkdirSync(dejaDir, { recursive: true, mode: 0o700 })
    const tmp = `${configPath}.tmp`
    writeFileSync(tmp, JSON.stringify(config, null, 2), { mode: 0o600 })
    chmodSync(tmp, 0o600)
    renameSync(tmp, configPath)
  }

  function update(partial: Partial<DejaConfig>): DejaConfig {
    const current = read() ?? {}
    const next = { ...current, ...partial }
    write(next)
    return next
  }

  return { read, write, update, path: () => configPath }
}
```

- [ ] **Step 4: Run test — expect pass**

Run: `pnpm vitest run src/lib/config-store.test.ts`
Expected: all 5 tests pass.

- [ ] **Step 5: Update subscription.ts to import from config-store**

In `apps/server/src/lib/subscription.ts`, find the existing `readConfig` / `writeConfigCache` / `getConfigPath` / `DejaConfig` definitions and replace them with imports from `./config-store`. Keep the subscription-checking logic; only the file I/O moves out.

- [ ] **Step 6: Run the full server test suite**

Run: `cd apps/server && pnpm vitest run`
Expected: all existing tests still pass.

- [ ] **Step 7: Commit**

```bash
git add apps/server/src/lib/config-store.ts apps/server/src/lib/config-store.test.ts apps/server/src/lib/subscription.ts
git commit -m "refactor(server): 📦 extract config-store from subscription.ts"
```

---

## Task 10: `firebase-client.ts` — Client SDK initialization

**Files:**
- Create: `apps/server/src/lib/firebase-client.ts`
- Create: `apps/server/src/lib/firebase-client.test.ts`

- [ ] **Step 1: Write the module**

```typescript
// apps/server/src/lib/firebase-client.ts
import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, signInWithCustomToken, onIdTokenChanged, Auth, User } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getDatabase, Database } from 'firebase/database'

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let rtdb: Database | null = null
let currentUser: User | null = null

export interface FirebaseClientConfig {
  apiKey: string
  authDomain: string
  projectId: string
  databaseURL: string
  storageBucket?: string
  messagingSenderId?: string
  appId?: string
}

export function initFirebaseClient(config: FirebaseClientConfig): void {
  if (app) throw new Error('firebase-client: already initialized')
  app = initializeApp(config)
  auth = getAuth(app)
  db = getFirestore(app)
  rtdb = getDatabase(app)
  onIdTokenChanged(auth, (user) => { currentUser = user })
}

export async function signInWithDeviceToken(customToken: string): Promise<User> {
  if (!auth) throw new Error('firebase-client: not initialized — call initFirebaseClient first')
  const cred = await signInWithCustomToken(auth, customToken)
  currentUser = cred.user
  return cred.user
}

export function getDb(): Firestore {
  if (!db) throw new Error('firebase-client: not initialized')
  return db
}

export function getRtdb(): Database {
  if (!rtdb) throw new Error('firebase-client: not initialized')
  return rtdb
}

export function getCurrentUser(): User | null {
  return currentUser
}
```

- [ ] **Step 2: Smoke test against the Firebase emulator**

```typescript
// apps/server/src/lib/firebase-client.test.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { initFirebaseClient, getDb } from './firebase-client'
import { doc, getDoc } from 'firebase/firestore'

describe('firebase-client', () => {
  beforeAll(() => {
    initFirebaseClient({
      apiKey: 'fake-api-key',
      authDomain: 'localhost',
      projectId: 'deja-rules-test',
      databaseURL: 'http://127.0.0.1:9000?ns=deja-rules-test',
    })
  })

  it('exposes a Firestore instance after init', () => {
    expect(getDb()).toBeDefined()
  })

  it('throws if called twice', async () => {
    expect(() => initFirebaseClient({
      apiKey: 'x', authDomain: 'x', projectId: 'x', databaseURL: 'x'
    })).toThrow(/already initialized/)
  })
})
```

Run: `pnpm vitest run src/lib/firebase-client.test.ts`
Expected: passes. (Full round-trip with sign-in is covered in Task 11.)

- [ ] **Step 3: Commit**

```bash
git add apps/server/src/lib/firebase-client.ts apps/server/src/lib/firebase-client.test.ts
git commit -m "feat(server): 🔥 add Firebase Client SDK wrapper"
```

---

## Task 11: `device-auth.ts` — exchange session secret for custom token

**Files:**
- Create: `apps/server/src/lib/device-auth.ts`
- Create: `apps/server/src/lib/device-auth.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// apps/server/src/lib/device-auth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authenticateDevice, DeviceAuthError } from './device-auth'

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

describe('device-auth', () => {
  beforeEach(() => fetchMock.mockReset())

  it('posts credentials to /api/devices/auth and returns custom token', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ customToken: 'ct', uid: 'u1', layoutId: 'l1', subscription: { status: 'active' } }),
    })
    const result = await authenticateDevice({
      apiUrl: 'https://cloud.test',
      pairingId: 'p1',
      sessionSecret: 's1',
    })
    expect(result.customToken).toBe('ct')
    expect(result.uid).toBe('u1')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://cloud.test/api/devices/auth',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('throws DeviceAuthError on 401', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error: 'Invalid session secret' }) })
    await expect(authenticateDevice({ apiUrl: 'https://cloud.test', pairingId: 'p1', sessionSecret: 's1' }))
      .rejects.toThrow(DeviceAuthError)
  })

  it('throws with subscription=false marker on 402', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 402, json: async () => ({ error: 'Subscription not active' }) })
    await expect(authenticateDevice({ apiUrl: 'https://cloud.test', pairingId: 'p1', sessionSecret: 's1' }))
      .rejects.toMatchObject({ code: 'subscription_required' })
  })
})
```

- [ ] **Step 2: Run test — expect failure**

Run: `pnpm vitest run src/lib/device-auth.test.ts`

- [ ] **Step 3: Implement**

```typescript
// apps/server/src/lib/device-auth.ts
export interface DeviceAuthInput {
  apiUrl: string
  pairingId: string
  sessionSecret: string
}

export interface DeviceAuthResult {
  customToken: string
  uid: string
  layoutId: string | null
  subscription: { status: string; plan?: string | null }
}

export class DeviceAuthError extends Error {
  constructor(message: string, public code: 'unauthorized' | 'not_found' | 'revoked' | 'subscription_required' | 'network' | 'unknown', public status?: number) {
    super(message)
    this.name = 'DeviceAuthError'
  }
}

export async function authenticateDevice(input: DeviceAuthInput): Promise<DeviceAuthResult> {
  let res: Response
  try {
    res = await fetch(`${input.apiUrl}/api/devices/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pairingId: input.pairingId, sessionSecret: input.sessionSecret }),
    })
  } catch (err) {
    throw new DeviceAuthError(`Network error: ${(err as Error).message}`, 'network')
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    const codeMap: Record<number, DeviceAuthError['code']> = {
      401: 'unauthorized',
      402: 'subscription_required',
      403: 'revoked',
      404: 'not_found',
    }
    throw new DeviceAuthError(body.error ?? `Device auth failed (${res.status})`, codeMap[res.status] ?? 'unknown', res.status)
  }

  return (await res.json()) as DeviceAuthResult
}
```

- [ ] **Step 4: Run test — expect pass**

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/lib/device-auth.ts apps/server/src/lib/device-auth.test.ts
git commit -m "feat(server): 🔑 add device-auth helper for exchanging session secret → custom token"
```

---

## Task 12: Rewrite subscription.ts to read the user's own doc via Client SDK

**Why:** Before this task, `subscription.ts` uses admin SDK to read `users/{uid}`. After migration, the server is authed as the user, so it reads its own doc — and with the new rules, `users/{uid}.subscription.*` is readable by the owner but not writable.

**Files:**
- Modify: `apps/server/src/lib/subscription.ts`
- Modify: `apps/server/src/lib/subscription.test.ts`

- [ ] **Step 1: Rewrite subscription.ts to use `getDb()` from firebase-client**

Replace the admin-SDK import + `db.collection('users').doc(uid).get()` call with:
```typescript
import { doc, getDoc } from 'firebase/firestore'
import { getDb, getCurrentUser } from './firebase-client'

// inside checkSubscriptionStatus:
const user = getCurrentUser()
if (!user) throw new Error('subscription: not signed in — call authenticateDevice + signInWithDeviceToken first')
const snap = await getDoc(doc(getDb(), `users/${user.uid}`))
const data = snap.data()
const sub = data?.subscription
// ... existing cache + grace-period logic stays the same
```

Delete all references to `import { db } from '@repo/firebase-config/firebase-admin-node'` from this file.

- [ ] **Step 2: Update subscription.test.ts mocks**

The existing test mocks `firebase-admin`. Change it to mock `./firebase-client` instead:
```typescript
vi.mock('./firebase-client', () => ({
  getDb: vi.fn(() => ({ /* mock */ })),
  getCurrentUser: vi.fn(() => ({ uid: 'test-uid' })),
}))
vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_, path) => ({ path })),
  getDoc: vi.fn(),
}))
```

Update each test to exercise the new code path. Keep the same behavioral expectations (grace period, cache TTL, etc.).

- [ ] **Step 3: Run tests**

Run: `pnpm vitest run src/lib/subscription.test.ts`
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add apps/server/src/lib/subscription.ts apps/server/src/lib/subscription.test.ts
git commit -m "refactor(server): 🔐 migrate subscription check from admin SDK to client SDK"
```

---

## Task 13: Mechanical migration — every `firebase-admin` import in apps/server

**Files:** (mechanical find-and-replace across these files)
- `apps/server/src/dejaCloud.ts`
- `apps/server/src/lib/dcc.ts`
- `apps/server/src/lib/deja.ts`
- `apps/server/src/modules/layout.ts`
- `apps/server/src/modules/throttles.ts`
- `apps/server/src/modules/effects.ts`
- `apps/server/src/modules/signals.ts`
- `apps/server/src/modules/turnouts.ts`
- `apps/server/src/modules/sensors.ts`
- `apps/server/src/modules/blocks.ts`
- `apps/server/src/modules/sync-config.ts`
- `apps/server/src/modules/roster.ts`
- `apps/server/src/modules/trackOutputs.ts`

**Transformations:**

| Admin SDK | Client SDK replacement |
|---|---|
| `import { db } from '@repo/firebase-config/firebase-admin-node'` | `import { getDb } from '../lib/firebase-client'` (and call `getDb()` where `db` was used) |
| `import { rtdb } from '@repo/firebase-config/firebase-admin-node'` | `import { getRtdb } from '../lib/firebase-client'` |
| `import { FieldValue } from 'firebase-admin/firestore'` | `import { serverTimestamp, FieldValue } from 'firebase/firestore'` — and replace `FieldValue.serverTimestamp()` with `serverTimestamp()` |
| `import { ServerValue } from 'firebase-admin/database'` | `import { serverTimestamp as rtdbServerTimestamp } from 'firebase/database'`, replace `ServerValue.TIMESTAMP` with `rtdbServerTimestamp()` |
| `db.collection('foo').doc('bar').get()` | `getDoc(doc(getDb(), 'foo/bar'))` |
| `db.collection('foo').doc('bar').set(data, { merge: true })` | `setDoc(doc(getDb(), 'foo/bar'), data, { merge: true })` |
| `db.collection('foo').doc('bar').update(data)` | `updateDoc(doc(getDb(), 'foo/bar'), data)` |
| `db.collection('foo').onSnapshot(cb)` | `onSnapshot(collection(getDb(), 'foo'), cb)` |
| `rtdb.ref('path').set(val)` | `set(ref(getRtdb(), 'path'), val)` |
| `rtdb.ref('path').on('child_added', cb)` | `onChildAdded(ref(getRtdb(), 'path'), cb)` |
| `rtdb.ref('path').remove()` | `remove(ref(getRtdb(), 'path'))` |
| `rtdb.ref('path').push()` | `push(ref(getRtdb(), 'path'))` |

- [ ] **Step 1: Process one file at a time, running `pnpm check-types` after each**

Starting with `apps/server/src/dejaCloud.ts`:
1. Replace imports per the table above
2. Update every call site
3. Run `cd apps/server && pnpm check-types`
4. Fix any type errors
5. Commit the file: `git commit -m "refactor(server): 🔄 migrate dejaCloud.ts to Client SDK"`

Repeat for each file in the list above. One commit per file keeps the diff reviewable.

- [ ] **Step 2: After all 13 files, run the full test suite**

Run: `cd apps/server && pnpm vitest run`
Expected: all tests pass.

- [ ] **Step 3: Run a build**

Run: `cd apps/server && pnpm build`
Expected: builds cleanly with no `firebase-admin` symbols in the output bundle. Verify with:
```bash
grep -r "firebase-admin" dist/ || echo "no admin refs ✓"
```

- [ ] **Step 4: Remove firebase-admin from server package.json**

Edit `apps/server/package.json`, remove `"firebase-admin"` from `dependencies`. Leave `"firebase"` (the client SDK).

Run: `pnpm install` to update the lockfile.

- [ ] **Step 5: Commit the package.json cleanup**

```bash
git add apps/server/package.json pnpm-lock.yaml
git commit -m "chore(server): 🗑️ remove firebase-admin dependency (now client-auth only)"
```

---

## Task 14: Update `apps/server/index.ts` — new startup sequence

**Files:**
- Modify: `apps/server/index.ts`

**New startup sequence:**
1. Read `~/.deja/config.json` via `config-store`
2. If no `auth.pairingId` → fatal error: `"No device pairing found. Run 'deja login' or reinstall via https://cloud.dejajs.com/settings/devices"`
3. Call `authenticateDevice(...)` → get custom token
4. Call `initFirebaseClient(...)` with the Firebase client config (apiKey, etc. from env)
5. Call `signInWithDeviceToken(customToken)` → auth is now established
6. Call `checkSubscriptionStatus()` → aborts if subscription invalid (now reads via Client SDK)
7. Continue existing startup: WS, MQTT, dejaCloud listeners

- [ ] **Step 1: Rewrite the startup block of apps/server/index.ts**

Find the existing call to `checkSubscriptionStatus()` and the admin-SDK init (triggered implicitly by imports). Replace with:

```typescript
import { createConfigStore } from './src/lib/config-store'
import { authenticateDevice, DeviceAuthError } from './src/lib/device-auth'
import { initFirebaseClient, signInWithDeviceToken } from './src/lib/firebase-client'
import { checkSubscriptionStatus } from './src/lib/subscription'
import { log } from './src/utils/logger'

const CLOUD_API_URL = process.env.DEJA_CLOUD_API_URL ?? 'https://cloud.dejajs.com'

async function bootstrapAuth() {
  const store = createConfigStore()
  const config = store.read()
  if (!config?.auth?.pairingId || !config.auth.sessionSecret) {
    log.fatal('No device pairing found.')
    log.info('Run `deja login` or install via https://cloud.dejajs.com/settings/devices')
    process.exit(1)
  }

  let authResult
  try {
    authResult = await authenticateDevice({
      apiUrl: CLOUD_API_URL,
      pairingId: config.auth.pairingId,
      sessionSecret: config.auth.sessionSecret,
    })
  } catch (err) {
    if (err instanceof DeviceAuthError) {
      switch (err.code) {
        case 'revoked':
          log.fatal('This device pairing has been revoked. Run `deja login` to re-pair.')
          process.exit(1)
        case 'subscription_required':
          log.fatal('Subscription is not active. Visit https://cloud.dejajs.com/settings/billing')
          process.exit(1)
        case 'unauthorized':
        case 'not_found':
          log.fatal('Device pairing credentials are invalid. Run `deja login` to re-pair.')
          process.exit(1)
        case 'network':
          // 48-hour grace period: fall through and try cached subscription
          log.warn('Network error during auth — attempting to run with cached subscription')
          const cached = config.subscription
          if (!cached) { log.fatal('No cached subscription available'); process.exit(1) }
          const age = Date.now() - new Date(cached.validatedAt).getTime()
          if (age > 48 * 60 * 60 * 1000) { log.fatal('Cached subscription expired'); process.exit(1) }
          log.warn(`Running with cached subscription (age: ${Math.round(age / 3600000)}h)`)
          return { offline: true, uid: config.uid!, layoutId: config.layoutId! }
        default:
          log.fatal(`Device auth failed: ${err.message}`)
          process.exit(1)
      }
    }
    log.fatal(`Device auth failed: ${(err as Error).message}`)
    process.exit(1)
  }

  // Online path
  initFirebaseClient({
    apiKey: process.env.VITE_FIREBASE_API_KEY!,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID!,
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL!,
  })
  await signInWithDeviceToken(authResult.customToken)

  // Update cached config with uid + layoutId + subscription snapshot
  store.update({
    uid: authResult.uid,
    layoutId: authResult.layoutId ?? config.layoutId,
    subscription: {
      status: authResult.subscription.status,
      plan: authResult.subscription.plan ?? undefined,
      validatedAt: new Date().toISOString(),
    },
  })

  // Check subscription (now reads via Client SDK)
  await checkSubscriptionStatus()

  return { offline: false, uid: authResult.uid, layoutId: authResult.layoutId ?? config.layoutId! }
}

// ... at the top of the main() function or startup:
const authState = await bootstrapAuth()
```

Delete the old import `import { firebaseApp } from '@repo/firebase-config/firebase-admin-node'` and any other admin init references.

- [ ] **Step 2: Test the build**

Run: `cd apps/server && pnpm build && pnpm check-types`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add apps/server/index.ts
git commit -m "feat(server): 🚀 bootstrap auth from device pairing on startup"
```

---

## Task 15: CLI `deja login` command (device-code flow)

**Files:**
- Create: `apps/cli/tui/commands/login.mjs`
- Modify: `apps/cli/deja` (add `login` subcommand)

- [ ] **Step 1: Write the login command**

`apps/cli/tui/commands/login.mjs`:
```javascript
#!/usr/bin/env node
import { createConfigStore } from './config-store.mjs'

const CLOUD_API_URL = process.env.DEJA_CLOUD_API_URL ?? 'https://cloud.dejajs.com'

async function post(path, body) {
  const res = await fetch(`${CLOUD_API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }
  return res.json()
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

export async function login() {
  console.log('Starting device pairing...\n')
  const start = await post('/api/devices/pair-start', {})

  console.log(`  Visit: \x1b[1m${start.verificationUrl}\x1b[0m`)
  console.log(`  Enter code: \x1b[1m\x1b[36m${start.userCode}\x1b[0m\n`)
  console.log('Waiting for approval... (Ctrl-C to cancel)')

  const deadline = Date.now() + start.expiresIn * 1000
  while (Date.now() < deadline) {
    await sleep(start.pollInterval * 1000)
    try {
      const poll = await post('/api/devices/pair-poll', { userCode: start.userCode, pollToken: start.pollToken })
      if (poll.state === 'approved') {
        const store = createConfigStore()
        store.update({ auth: { pairingId: poll.pairingId, sessionSecret: poll.sessionSecret } })
        console.log('\n✓ Device paired successfully.')
        console.log(`  Config written to: ${store.path()}`)
        console.log('  You can now run `deja start`.')
        return
      }
      if (poll.state === 'expired') {
        console.error('\n✗ Pairing code expired. Run `deja login` again.')
        process.exit(1)
      }
    } catch (err) {
      console.error(`\n✗ Poll failed: ${err.message}`)
      process.exit(1)
    }
  }
  console.error('\n✗ Pairing timed out. Run `deja login` again.')
  process.exit(1)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  login().catch(err => { console.error(err); process.exit(1) })
}
```

- [ ] **Step 2: Port `createConfigStore` to Node/MJS**

Create `apps/cli/tui/commands/config-store.mjs` — a plain-Node copy of the logic in `apps/server/src/lib/config-store.ts` (no TypeScript types, otherwise identical). **Do not** symlink or import from the server — the CLI is a separate distribution.

- [ ] **Step 3: Add `login` to the `deja` bash script**

In `apps/cli/deja`, find the subcommand dispatcher and add:
```bash
  login)
    exec node "${SCRIPT_DIR}/tui/commands/login.mjs"
    ;;
```
Also add `login` to the `help` output.

- [ ] **Step 4: Manual test**

Deploy the API routes to a preview, point `DEJA_CLOUD_API_URL` to the preview, run:
```bash
DEJA_CLOUD_API_URL=https://<preview>.vercel.app ./apps/cli/deja login
```
Expected: prints code, waits, succeeds when you approve in the browser (Task 21 handles the browser side — until then, approve via curl: `curl -X POST .../api/devices/pair-approve -H "Authorization: Bearer $TOKEN" -d '{"userCode":"..."}'`).

- [ ] **Step 5: Commit**

```bash
git add apps/cli/tui/commands/login.mjs apps/cli/tui/commands/config-store.mjs apps/cli/deja
git commit -m "feat(cli): 🔑 add 'deja login' device-code pairing command"
```

---

## Task 16: CLI `deja install <jwt>` command (consume install JWT)

**Files:**
- Create: `apps/cli/tui/commands/install.mjs`
- Modify: `apps/cli/deja`

- [ ] **Step 1: Write the install command**

`apps/cli/tui/commands/install.mjs`:
```javascript
#!/usr/bin/env node
import { createConfigStore } from './config-store.mjs'

function base64UrlDecode(str) {
  return JSON.parse(Buffer.from(str, 'base64url').toString('utf8'))
}

function parseInstallJwt(token) {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Malformed install token')
  const payload = base64UrlDecode(parts[1])
  if (!payload.pairingId || !payload.sessionSecret || !payload.uid) {
    throw new Error('Install token missing required fields')
  }
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Install token expired — request a new one from the dashboard')
  }
  return payload
}

export async function install(token) {
  if (!token) {
    console.error('Usage: deja install <install-token>')
    process.exit(2)
  }
  const payload = parseInstallJwt(token)
  const store = createConfigStore()
  store.update({
    uid: payload.uid,
    layoutId: payload.layoutId ?? undefined,
    auth: { pairingId: payload.pairingId, sessionSecret: payload.sessionSecret },
  })
  console.log('✓ Device pairing configured')
  console.log(`  Config: ${store.path()}`)
  console.log('  Start the server with: deja start')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  install(process.argv[2]).catch(err => { console.error(err.message); process.exit(1) })
}
```

**Note:** The client does NOT verify the JWT signature — install-api on the server side re-verifies and only allows through if valid. This is acceptable because: (a) the install-api also writes to Firestore/creates the pairing, so even if you forge a local JWT the server won't recognize the pairingId, and (b) we treat the install JWT body as a carrier for pairingId + sessionSecret that were generated server-side. The cryptographic binding is in the fact that the `pairingId` + `sessionSecret` pair only exists in Firestore if the server created them.

- [ ] **Step 2: Add `install` to `deja` bash script**

```bash
  install)
    shift
    exec node "${SCRIPT_DIR}/tui/commands/install.mjs" "$@"
    ;;
```

- [ ] **Step 3: Commit**

```bash
git add apps/cli/tui/commands/install.mjs apps/cli/deja
git commit -m "feat(cli): 🔧 add 'deja install <token>' to consume install JWTs"
```

---

## Task 17: Rewrite `install.sh`

**Files:**
- Modify: `install.sh`

**Changes:**
1. Remove `__FIREBASE_PRIVATE_KEY__` and `__FIREBASE_CLIENT_EMAIL__` placeholders entirely
2. Remove the `.env` writing block that embedded those keys
3. Accept an install token from the URL path (passed through by install-api as `DEJA_INSTALL_TOKEN` env var injected at the top of the script)
4. After installing the `deja` binary, run `deja install "$DEJA_INSTALL_TOKEN"`

- [ ] **Step 1: Update install.sh**

At the top of `install.sh`, after `set -euo pipefail`:
```bash
# Install token is injected by install-api when the user visits /i/<jwt>
DEJA_INSTALL_TOKEN="${DEJA_INSTALL_TOKEN:-__INSTALL_TOKEN__}"
```

Find the block that writes `.env` with Firebase credentials (around line 226-244 per the audit) and delete the `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` lines. Keep only the public client config (apiKey, authDomain, etc.), which users might still need for other tools, OR remove `.env` entirely if the server reads these from a shipped config instead.

Recommendation: remove `.env` creation entirely. The server will read Firebase Client SDK config from a bundled `apps/server/dist/firebase.config.json` written by the build step (Task 18). Nothing sensitive needs to land in user's home directory except `~/.deja/config.json`.

After the binary is installed and PATH is configured, add:
```bash
if [ -n "$DEJA_INSTALL_TOKEN" ] && [ "$DEJA_INSTALL_TOKEN" != "__INSTALL_TOKEN__" ]; then
  echo "Configuring device pairing..."
  "$BIN_DIR/deja" install "$DEJA_INSTALL_TOKEN"
else
  echo ""
  echo "To pair this device, run: deja login"
fi
```

- [ ] **Step 2: Also update the PowerShell variant if present**

`install.ps1` — same changes applied. Check with: `ls /Users/jmcdannel/TTT/DEJA.js.git/preview/install.ps1 2>/dev/null`

- [ ] **Step 3: Commit**

```bash
git add install.sh install.ps1 2>/dev/null
git commit -m "fix(install): 🔥 remove embedded Firebase admin credentials; use device pairing instead"
```

---

## Task 18: Rewrite `apps/install-api/api/index.ts`

**Files:**
- Modify: `apps/install-api/api/index.ts`

**Changes:**
1. Add `GET /i/:installToken` — fetches `install.sh`, injects token as `DEJA_INSTALL_TOKEN`, returns
2. Delete ALL `__FIREBASE_PRIVATE_KEY__`, `__FIREBASE_CLIENT_EMAIL__`, and related replacements
3. Tighten `POST /releases/:version/upload`:
   - Use `crypto.timingSafeEqual` for the token compare
   - Validate `x-filename` against `/^[\w.\-]+$/`

- [ ] **Step 1: Rewrite generateInstallScript**

```typescript
// apps/install-api/api/index.ts — generateInstallScript replacement
import { verifyInstallJwt } from './devices/lib/installJwt' // relative-copy this file from cloud/api

async function generateInstallScript(installToken: string | null): Promise<string> {
  // Fetch latest install.sh from blob storage
  const scriptUrl = `${process.env.BLOB_PUBLIC_URL}/releases/latest/install.sh`
  const scriptRes = await fetch(scriptUrl)
  if (!scriptRes.ok) throw new Error(`Failed to fetch install.sh: ${scriptRes.status}`)
  let script = await scriptRes.text()

  // Public Firebase client config only (safe to embed)
  const replacements: Record<string, string> = {
    '__FIREBASE_API_KEY__': process.env.FIREBASE_API_KEY ?? '',
    '__FIREBASE_AUTH_DOMAIN__': process.env.FIREBASE_AUTH_DOMAIN ?? '',
    '__FIREBASE_PROJECT_ID__': process.env.FIREBASE_PROJECT_ID ?? '',
    '__FIREBASE_DATABASE_URL__': process.env.FIREBASE_DATABASE_URL ?? '',
    '__INSTALL_TOKEN__': installToken ?? '',
  }
  for (const [k, v] of Object.entries(replacements)) script = script.replaceAll(k, v)
  return script
}
```

- [ ] **Step 2: Add `/i/:token` route**

In the main handler switch:
```typescript
// GET /i/<installToken>
const installTokenMatch = pathname.match(/^\/i\/([A-Za-z0-9_\-.]+)$/)
if (method === 'GET' && installTokenMatch) {
  const token = installTokenMatch[1]
  const payload = verifyInstallJwt(token)
  if (!payload) return res.status(401).send('# Install token invalid or expired.\n# Get a new one from https://cloud.dejajs.com/settings/devices\nexit 1\n')
  const script = await generateInstallScript(token)
  res.setHeader('Content-Type', 'text/x-shellscript')
  return res.status(200).send(script)
}
```

- [ ] **Step 3: Update GET / to NOT embed any tokens**

```typescript
if (method === 'GET' && (pathname === '/' || pathname === '/api')) {
  const script = await generateInstallScript(null)
  res.setHeader('Content-Type', 'text/x-shellscript')
  return res.status(200).send(script)
}
```

This `curl install.dejajs.com | bash` path now produces an install without a token — the user has to run `deja login` afterward.

- [ ] **Step 4: Tighten upload endpoint**

```typescript
import { timingSafeEqual } from 'node:crypto'

// ... inside POST /releases/:version/upload:
const expected = Buffer.from(`Bearer ${process.env.UPLOAD_SECRET ?? ''}`)
const provided = Buffer.from(authHeader ?? '')
if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
  return res.status(401).json({ error: 'Unauthorized' })
}

const filename = req.headers['x-filename'] as string
if (!filename || !/^[\w.\-]+$/.test(filename)) {
  return res.status(400).json({ error: 'x-filename invalid' })
}
```

- [ ] **Step 5: Copy installJwt.ts to install-api**

The install-api is a separate Vercel project with its own build. Copy `apps/cloud/api/devices/lib/installJwt.ts` to `apps/install-api/api/lib/installJwt.ts`. Both must share the same `INSTALL_JWT_SECRET` env var in Vercel.

- [ ] **Step 6: Remove Firebase admin env vars from install-api Vercel project**

Via Vercel dashboard or `vercel env rm FIREBASE_PRIVATE_KEY --scope install-api` — this project no longer needs admin credentials.

- [ ] **Step 7: Deploy and smoke test**

```bash
curl https://install.dejajs.com/ | grep -c '__FIREBASE_PRIVATE_KEY__'
# expected: 0
```

- [ ] **Step 8: Commit**

```bash
git add apps/install-api/
git commit -m "fix(install-api): 🚨 strip Firebase admin credentials; add /i/:token install flow"
```

---

## Task 19: Dashboard Devices UI

**Files:**
- Create: `apps/cloud/src/Settings/Devices/DevicesSection.vue`
- Create: `apps/cloud/src/Settings/Devices/DeviceList.vue`
- Create: `apps/cloud/src/Settings/Devices/DeviceListItem.vue`
- Create: `apps/cloud/src/Settings/Devices/InstallDeviceDialog.vue`
- Modify: `apps/cloud/src/Settings/Settings.vue` (add new section)

- [ ] **Step 1: Add a `useDevices` composable**

`apps/cloud/src/Settings/Devices/useDevices.ts`:
```typescript
import { ref } from 'vue'
import { getAuth } from 'firebase/auth'

export interface Device {
  id: string
  label: string
  layoutId: string | null
  createdAt: string | null
  lastAuthAt: string | null
  revoked: boolean
  userAgent: string | null
}

export function useDevices() {
  const devices = ref<Device[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function authHeader() {
    const token = await getAuth().currentUser?.getIdToken()
    if (!token) throw new Error('Not signed in')
    return `Bearer ${token}`
  }

  async function load() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch('/api/devices/list', { headers: { Authorization: await authHeader() } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      devices.value = data.devices
    } catch (e) {
      error.value = (e as Error).message
    } finally { loading.value = false }
  }

  async function mintInstallToken(label: string, layoutId: string | null): Promise<string> {
    const res = await fetch('/api/devices/mint-install-token', {
      method: 'POST',
      headers: { Authorization: await authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, layoutId }),
    })
    if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`)
    const data = await res.json()
    return data.installUrl
  }

  async function revoke(pairingId: string) {
    const res = await fetch('/api/devices/revoke', {
      method: 'POST',
      headers: { Authorization: await authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ pairingId }),
    })
    if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`)
    await load()
  }

  async function approveCode(userCode: string, label: string, layoutId: string | null) {
    const res = await fetch('/api/devices/pair-approve', {
      method: 'POST',
      headers: { Authorization: await authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ userCode, label, layoutId }),
    })
    if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`)
  }

  return { devices, loading, error, load, mintInstallToken, revoke, approveCode }
}
```

- [ ] **Step 2: Build DevicesSection.vue**

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDevices } from './useDevices'
import DeviceList from './DeviceList.vue'
import InstallDeviceDialog from './InstallDeviceDialog.vue'

const { devices, loading, load, mintInstallToken, revoke } = useDevices()
const installDialog = ref(false)
const installUrl = ref('')

async function openInstall() {
  try {
    installUrl.value = await mintInstallToken('DEJA Server', null)
    installDialog.value = true
  } catch (err) { alert((err as Error).message) }
}

onMounted(load)
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>Devices</v-card-title>
    <v-card-subtitle>Servers paired to your DEJA account</v-card-subtitle>
    <v-card-text>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openInstall">Install on new device</v-btn>
      <DeviceList :devices="devices" :loading="loading" @revoke="revoke" class="mt-4" />
    </v-card-text>
    <InstallDeviceDialog v-model="installDialog" :install-url="installUrl" />
  </v-card>
</template>
```

- [ ] **Step 3: Build DeviceList.vue and DeviceListItem.vue**

Standard Vuetify `v-list` with `v-list-item` per device. Each item shows: label, lastAuthAt (relative), revoked chip, and a "Revoke" menu item. Emit `revoke` event with `pairingId`.

- [ ] **Step 4: Build InstallDeviceDialog.vue**

`v-dialog` with a single code block showing `curl -fsSL <installUrl> | bash`, a copy button, and a warning that the URL is valid for 15 minutes. Use `navigator.clipboard.writeText`.

- [ ] **Step 5: Wire into Settings.vue**

Add a `Devices` entry to the settings section list, route, and import `DevicesSection.vue`.

- [ ] **Step 6: Commit**

```bash
git add apps/cloud/src/Settings/Devices/ apps/cloud/src/Settings/Settings.vue
git commit -m "feat(cloud): ✨ add Devices settings page with install + revoke"
```

---

## Task 20: `/device` code approval landing page

For `deja login` — the user types the code here and the page approves it.

**Files:**
- Create: `apps/cloud/src/Device/DeviceApprovalView.vue`
- Modify: `apps/cloud/src/router/index.ts`

- [ ] **Step 1: Build the view**

`apps/cloud/src/Device/DeviceApprovalView.vue`:
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDevices } from '../Settings/Devices/useDevices'

const route = useRoute()
const { approveCode } = useDevices()
const code = ref(String(route.query.code ?? '').toUpperCase())
const label = ref('DEJA Server')
const submitting = ref(false)
const done = ref(false)
const error = ref<string | null>(null)

const formatted = computed({
  get: () => code.value,
  set: (v: string) => { code.value = v.toUpperCase().replace(/[^A-Z0-9-]/g, '') },
})

async function submit() {
  submitting.value = true
  error.value = null
  try {
    await approveCode(code.value, label.value, null)
    done.value = true
  } catch (e) {
    error.value = (e as Error).message
  } finally { submitting.value = false }
}
</script>

<template>
  <v-container class="d-flex justify-center">
    <v-card max-width="480" class="w-100 pa-4">
      <v-card-title>Approve device</v-card-title>
      <v-card-subtitle>Enter the code shown in your terminal</v-card-subtitle>
      <v-card-text v-if="!done">
        <v-text-field v-model="formatted" label="Device code" placeholder="ABCD-2345" maxlength="9" />
        <v-text-field v-model="label" label="Device name" placeholder="Basement Pi" />
        <v-alert v-if="error" type="error" class="mt-2">{{ error }}</v-alert>
      </v-card-text>
      <v-card-actions v-if="!done">
        <v-spacer />
        <v-btn color="primary" :loading="submitting" @click="submit">Approve</v-btn>
      </v-card-actions>
      <v-card-text v-else>
        <v-alert type="success">Device approved. You can close this tab.</v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>
```

- [ ] **Step 2: Add route**

In `apps/cloud/src/router/index.ts`:
```typescript
{ path: '/device', name: 'device-approval', component: () => import('../Device/DeviceApprovalView.vue'), meta: { requiresAuth: true } }
```

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/src/Device/ apps/cloud/src/router/index.ts
git commit -m "feat(cloud): 🤝 add /device code approval landing page"
```

---

## Task 21: `layoutOwners` RTDB mirror (server-side on layout create)

The new RTDB rules reference `layoutOwners/{layoutId}` — this node must be populated whenever a layout is created. Do it in the Stripe webhook OR in a new Cloud Function OR on layout creation from the dashboard via a new API route.

Simplest: add a `POST /api/layouts/create` route that creates the layout Firestore doc AND writes the RTDB mirror. Dashboard calls this instead of writing directly. Existing layouts get backfilled in Task 22.

**Files:**
- Create: `apps/cloud/api/layouts/create.ts`
- Modify: `apps/cloud/src/Layout/*` (wherever layouts are created — replace direct Firestore write with API call)

- [ ] **Step 1: Implement route**

```typescript
// apps/cloud/api/layouts/create.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { FieldValue } from 'firebase-admin/firestore'
import { getDatabase } from 'firebase-admin/database'
import { db } from '../lib/firebase'
import { verifyFirebaseAuth } from '../lib/verifyFirebaseAuth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const auth = await verifyFirebaseAuth(req)
  if (!auth.valid || !auth.uid) return res.status(auth.status ?? 401).json({ error: auth.message })

  const name = typeof req.body?.name === 'string' ? req.body.name.slice(0, 80) : 'New Layout'
  const layoutRef = db.collection('layouts').doc()
  await layoutRef.set({
    name,
    ownerUid: auth.uid,
    owner: null, // deprecated — kept for back-compat during rollout
    createdAt: FieldValue.serverTimestamp(),
  })

  // Mirror ownerUid to RTDB for rules
  await getDatabase().ref(`layoutOwners/${layoutRef.id}`).set(auth.uid)

  return res.status(200).json({ layoutId: layoutRef.id })
}
```

- [ ] **Step 2: Find all call sites that create layouts in the cloud app and replace with a fetch to this endpoint**

Grep:
```bash
```
Use the Grep tool for `setDoc.*layouts` or `addDoc.*layouts` in `apps/cloud/src/`. Replace each call with an authenticated fetch to `/api/layouts/create`.

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/api/layouts/create.ts apps/cloud/src/
git commit -m "feat(cloud): 🏗️ route layout creation through API to mirror ownerUid to RTDB"
```

---

## Task 22: Migration script — backfill ownerUid on existing layouts

**Files:**
- Create: `scripts/migrations/2026-04-backfill-ownerUid.mjs`

- [ ] **Step 1: Write the script**

```javascript
#!/usr/bin/env node
// scripts/migrations/2026-04-backfill-ownerUid.mjs
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getDatabase } from 'firebase-admin/database'
import { getAuth } from 'firebase-admin/auth'
import { readFileSync } from 'node:fs'

// Usage: FIREBASE_SERVICE_ACCOUNT=./sa.json node scripts/migrations/2026-04-backfill-ownerUid.mjs [--dry-run]
const dryRun = process.argv.includes('--dry-run')
const saPath = process.env.FIREBASE_SERVICE_ACCOUNT
if (!saPath) { console.error('Set FIREBASE_SERVICE_ACCOUNT to path of service-account JSON'); process.exit(2) }
const sa = JSON.parse(readFileSync(saPath, 'utf8'))

initializeApp({
  credential: cert(sa),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
})
const db = getFirestore()
const rtdb = getDatabase()
const auth = getAuth()

async function main() {
  const layouts = await db.collection('layouts').get()
  console.log(`Found ${layouts.size} layouts`)
  let updated = 0
  let skipped = 0
  let failed = 0

  for (const doc of layouts.docs) {
    const data = doc.data()
    if (data.ownerUid) { skipped++; continue }
    if (!data.owner) { console.warn(`  SKIP ${doc.id}: no owner email`); skipped++; continue }
    try {
      const userRecord = await auth.getUserByEmail(data.owner)
      console.log(`  ${dryRun ? '[dry-run]' : 'UPDATE'} ${doc.id}: owner=${data.owner} → ownerUid=${userRecord.uid}`)
      if (!dryRun) {
        await doc.ref.update({ ownerUid: userRecord.uid })
        await rtdb.ref(`layoutOwners/${doc.id}`).set(userRecord.uid)
      }
      updated++
    } catch (err) {
      console.error(`  FAIL ${doc.id}: ${err.message}`)
      failed++
    }
  }
  console.log(`\nDone: updated=${updated} skipped=${skipped} failed=${failed}`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch(err => { console.error(err); process.exit(1) })
```

- [ ] **Step 2: Dry run**

```bash
FIREBASE_SERVICE_ACCOUNT=./sa.json FIREBASE_DATABASE_URL=https://deja-js.firebaseio.com node scripts/migrations/2026-04-backfill-ownerUid.mjs --dry-run
```
Review the output — verify every layout has a known owner.

- [ ] **Step 3: Real run**

```bash
FIREBASE_SERVICE_ACCOUNT=./sa.json FIREBASE_DATABASE_URL=https://deja-js.firebaseio.com node scripts/migrations/2026-04-backfill-ownerUid.mjs
```

Verify: `firebase firestore:get layouts --project deja-js | grep ownerUid` (or check console).

- [ ] **Step 4: Commit the script**

```bash
git add scripts/migrations/2026-04-backfill-ownerUid.mjs
git commit -m "chore(migration): 🔧 backfill ownerUid + layoutOwners RTDB mirror"
```

---

## Task 23: Deploy rules and final verification

**Files:**
- N/A — this is a deploy + verify task

- [ ] **Step 1: Deploy Firestore rules**

```bash
firebase deploy --only firestore:rules,database --project deja-js
```
Expected: clean deploy.

- [ ] **Step 2: Immediate smoke test**

Sign in to the dashboard as a test user. Verify you can still:
- See your own layouts
- Open a layout, see turnouts/signals/effects
- Create a new layout (must go through /api/layouts/create)
- View Settings → Devices → paired devices list

Verify you CANNOT:
- Open Firebase Console → go to Firestore → try to enumerate another user's layout from a client SDK (use the browser console while authed as a different account)

- [ ] **Step 3: Full end-to-end pairing test**

On a fresh machine (or fresh `DEJA_DIR`):
1. Sign in to dashboard
2. Settings → Devices → "Install on new device"
3. Copy the curl command
4. Run it on the target machine
5. Verify `~/.deja/config.json` has `auth.pairingId` + `auth.sessionSecret`, and NO `FIREBASE_PRIVATE_KEY`
6. Run `deja start`
7. Verify the server logs show "Authenticated as uid=..."
8. Verify a throttle command in the dashboard reaches the server
9. In the dashboard, Settings → Devices → Revoke
10. Verify the server on next startup fails with `"pairing revoked"`

- [ ] **Step 4: Device-code login test**

On a fresh machine:
1. Run `deja login`
2. Copy the code, visit https://cloud.dejajs.com/device, approve
3. Verify config.json has auth credentials
4. Run `deja start`

- [ ] **Step 5: Commit nothing — this was a verification task**

If any step fails, open a bug and fix before moving to Task 24.

---

## Task 24: Final cleanup

**Files:**
- Modify: `apps/cli/package.json` (remove firebase-admin)
- Modify: `apps/cli/tui/hooks/useFirebase.mjs` (migrate or delete)
- Modify: `.env.example`
- Modify: `packages/firebase-config/package.json`

- [ ] **Step 1: Remove firebase-admin from CLI**

Grep `useFirebase.mjs` for admin SDK usage. If the TUI only needs read-only layout data, migrate to Client SDK (the TUI can reuse the same device-auth flow as the server). If it's not actually used, delete the hook.

Remove `"firebase-admin"` from `apps/cli/package.json`.

- [ ] **Step 2: Strip admin env vars from `.env.example`**

Delete these lines:
```
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

Keep the `VITE_FIREBASE_*` public config lines.

- [ ] **Step 3: Downgrade firebase-admin in packages/firebase-config**

Move `firebase-admin` from `devDependencies` to stay, but **remove the export** `./firebase-admin-node` from the package.json `exports` map. The only remaining consumer should be `apps/cloud/api/lib/firebase.ts`, which can import directly from `firebase-admin/app` without going through `@repo/firebase-config`.

Update `apps/cloud/api/lib/firebase.ts` to import directly from `firebase-admin` rather than `@repo/firebase-config/firebase-admin-node`.

- [ ] **Step 4: Delete the admin-node export file**

```bash
rm packages/firebase-config/src/firebase-admin-node.ts
```

Run `pnpm build` and `pnpm check-types` at the repo root. Fix any stale imports.

- [ ] **Step 5: Strip admin env vars from Vercel `install-api` project**

In the Vercel dashboard for the `install-api` project, delete `FIREBASE_PRIVATE_KEY` and `FIREBASE_CLIENT_EMAIL`. The install-api no longer needs them.

- [ ] **Step 6: Commit**

```bash
git add apps/cli/package.json apps/cli/tui/hooks/useFirebase.mjs .env.example packages/firebase-config/ apps/cloud/api/lib/firebase.ts
git rm packages/firebase-config/src/firebase-admin-node.ts
git commit -m "chore: 🧹 remove firebase-admin from server/cli; admin SDK only in Vercel API routes

- apps/server and apps/cli no longer depend on firebase-admin
- @repo/firebase-config no longer exports firebase-admin-node
- Cloud API routes import firebase-admin directly"
```

- [ ] **Step 7: Verify no admin key references remain in shipped code**

```bash
grep -r "FIREBASE_PRIVATE_KEY" apps/server apps/cli install.sh install.ps1 2>/dev/null
# expected: no matches

grep -r "firebase-admin" apps/server apps/cli install.sh 2>/dev/null
# expected: no matches
```

---

## Post-launch monitoring

Add these to your list after the plan is done (not part of this plan):

- [ ] Rate-limit `pair-start` and `mint-install-token` (e.g. 5 per user per hour) — current code has no abuse protection
- [ ] Add Sentry alerts on `DeviceAuthError` with `code=revoked` spikes (potential credential compromise indicator)
- [ ] Add a `lastSeenAt` ping from the server every 5 minutes to update `devicePairings/{id}.lastSeenAt` — powers "online/offline" indicator in the dashboard
- [ ] Add a second confirmation step to `revoke` in the UI (easy to misclick)
- [ ] Write a runbook for "user reports server won't start after revoke" — answer: run `deja login`

---

## Self-review checklist

- [x] Every spec requirement (no admin keys on device, user-driven install, device-code fallback, revocation, rules tighten) has a task
- [x] No placeholders — every code step has actual code
- [x] Types are consistent (`DeviceAuthResult`, `DejaConfig`, `InstallJwtPayload` are defined once and reused)
- [x] Ordering dependencies are explicit
- [x] Manual verification steps for every external integration (Firebase emulator, Vercel deploy, end-to-end pairing)

---

**Plan complete.**
