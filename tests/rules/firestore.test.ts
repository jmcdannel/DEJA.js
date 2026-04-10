import { initializeTestEnvironment, RulesTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { beforeAll, afterAll, beforeEach, describe, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

let testEnv: RulesTestEnvironment

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'deja-rules-test',
    firestore: {
      rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8'),
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

  it('denies non-owner access to effects', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'layouts/layout-alice'), { ownerUid: 'alice' })
      await setDoc(doc(ctx.firestore(), 'layouts/layout-alice/effects/e1'), { state: 'on' })
    })
    const bob = testEnv.authenticatedContext('bob', { email: 'bob@test.com' })
    await assertFails(getDoc(doc(bob.firestore(), 'layouts/layout-alice/effects/e1')))
  })
})

describe('firestore.rules — devicePairings', () => {
  it('denies all client writes', async () => {
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

  it("denies user reading another user's pairing", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'devicePairings/p1'), { uid: 'alice' })
    })
    const bob = testEnv.authenticatedContext('bob', { email: 'bob@test.com' })
    await assertFails(getDoc(doc(bob.firestore(), 'devicePairings/p1')))
  })
})

describe('firestore.rules — layouts/{layoutId} create denial', () => {
  it('denies all client creates of layouts (must go through /api/layouts/create)', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@test.com' })
    await assertFails(setDoc(doc(alice.firestore(), 'layouts/new-layout'), { ownerUid: 'alice', name: 'Test' }))
  })
})

describe('firestore.rules — layouts list (cross-tenant enumeration)', () => {
  it('denies an unfiltered list across tenants', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'layouts/a'), { ownerUid: 'alice' })
      await setDoc(doc(ctx.firestore(), 'layouts/b'), { ownerUid: 'bob' })
    })
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@test.com' })
    await assertFails(getDocs(collection(alice.firestore(), 'layouts')))
  })

  it('denies a list filtered on someone else\u2019s ownerUid', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'layouts/a'), { ownerUid: 'alice' })
    })
    const bob = testEnv.authenticatedContext('bob', { email: 'bob@test.com' })
    await assertFails(getDocs(query(
      collection(bob.firestore(), 'layouts'),
      where('ownerUid', '==', 'alice'),
    )))
  })

  it('allows a list filtered on the caller\u2019s own ownerUid', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'layouts/a'), { ownerUid: 'alice' })
      await setDoc(doc(ctx.firestore(), 'layouts/b'), { ownerUid: 'bob' })
    })
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@test.com' })
    await assertSucceeds(getDocs(query(
      collection(alice.firestore(), 'layouts'),
      where('ownerUid', '==', 'alice'),
    )))
  })
})
