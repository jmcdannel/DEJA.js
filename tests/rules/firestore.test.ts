import { initializeTestEnvironment, RulesTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc } from 'firebase/firestore'
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
