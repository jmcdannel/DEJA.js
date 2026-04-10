import { initializeTestEnvironment, type RulesTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing'
import { ref, set, get } from 'firebase/database'
import { beforeAll, afterAll, beforeEach, describe, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

let testEnv: RulesTestEnvironment

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'deja-rules-test',
    database: {
      rules: readFileSync(resolve(__dirname, '../../database.rules.json'), 'utf8'),
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
      action: 'throttle',
      payload: JSON.stringify({ address: 3, speed: 10 }),
    }))
  })

  it('allows owner to write valid commands', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await set(ref(ctx.database(), 'layoutOwners/layout-alice'), 'alice')
    })
    const alice = testEnv.authenticatedContext('alice')
    await assertSucceeds(set(ref(alice.database(), 'dccCommands/layout-alice/cmd1'), {
      action: 'throttle',
      payload: JSON.stringify({ address: 3, speed: 10 }),
    }))
  })

  it('rejects oversized payload (>500 chars)', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await set(ref(ctx.database(), 'layoutOwners/layout-alice'), 'alice')
    })
    const alice = testEnv.authenticatedContext('alice')
    await assertFails(set(ref(alice.database(), 'dccCommands/layout-alice/cmd1'), {
      action: 'throttle',
      payload: 'x'.repeat(501),
    }))
  })
})

describe('database.rules — layoutOwners', () => {
  it('denies all client writes (admin-only)', async () => {
    const alice = testEnv.authenticatedContext('alice')
    await assertFails(set(ref(alice.database(), 'layoutOwners/layout-alice'), 'alice'))
  })

  it('allows owner to read their own mirror entry', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await set(ref(ctx.database(), 'layoutOwners/layout-alice'), 'alice')
    })
    const alice = testEnv.authenticatedContext('alice')
    await assertSucceeds(get(ref(alice.database(), 'layoutOwners/layout-alice')))
  })
})

describe('database.rules — $other path denial', () => {
  it('denies reads to unknown top-level paths', async () => {
    const alice = testEnv.authenticatedContext('alice')
    await assertFails(get(ref(alice.database(), 'someRandomPath')))
  })
})
