import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const setDocMock = vi.fn(async () => undefined)

vi.mock('firebase/firestore', () => ({
  doc: (_db: unknown, path: string, id: string) => ({ path: `${path}/${id}` }),
  setDoc: (...args: unknown[]) => setDocMock(...(args as [])),
  serverTimestamp: () => 'SERVER_TIMESTAMP',
}))

vi.mock('@repo/firebase-config', () => ({ db: { __type: 'db' } }))

vi.mock('@repo/modules/locos', () => ({
  ROADNAMES: [
    { label: 'BNSF',   value: 'bnsf',   color: 'orange' },
    { label: 'Cuyama', value: 'cuyama', color: 'blue' },
  ],
}))

vi.mock('@vueuse/core', () => ({
  useStorage: (key: string, initial: unknown) =>
    key === '@DEJA/layoutId' ? { value: 'layout-1' } : { value: initial },
}))

vi.mock('@repo/utils', () => ({
  createLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}))

import RosterQuickAdd from './RosterQuickAdd.vue'

const vuetify = createVuetify({ components, directives })

function makeWrapper() {
  return mount(RosterQuickAdd, {
    global: { plugins: [vuetify] },
  })
}

describe('RosterQuickAdd', () => {
  beforeEach(() => {
    setDocMock.mockClear()
  })

  it('save button disabled when address is empty', () => {
    const w = makeWrapper()
    const btn = w.get('button[aria-label="Add to roster"]')
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('save button disabled for non-integer address', async () => {
    const w = makeWrapper()
    const cmp = w.vm as unknown as { address: string }
    cmp.address = '3.5'
    await w.vm.$nextTick()
    const btn = w.get('button[aria-label="Add to roster"]')
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('save button disabled for out-of-range address', async () => {
    const w = makeWrapper()
    const cmp = w.vm as unknown as { address: string }
    cmp.address = '10000'
    await w.vm.$nextTick()
    const btn = w.get('button[aria-label="Add to roster"]')
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('submit calls setDoc with the expected payload', async () => {
    const w = makeWrapper()
    const cmp = w.vm as unknown as {
      address: string
      name: string
      roadname: string | null
      save: () => Promise<void>
    }
    cmp.address = '42'
    cmp.name = 'GP38'
    cmp.roadname = 'cuyama'
    await cmp.save()
    await flushPromises()
    expect(setDocMock).toHaveBeenCalledTimes(1)
    const [, payload, options] = setDocMock.mock.calls[0] as unknown as [unknown, Record<string, unknown>, unknown]
    expect(payload).toMatchObject({
      address: 42,
      name: 'GP38',
      meta: { roadname: 'cuyama' },
      timestamp: 'SERVER_TIMESTAMP',
    })
    expect(options).toEqual({ merge: true })
  })

  it('clears fields on successful save', async () => {
    const w = makeWrapper()
    const cmp = w.vm as unknown as {
      address: string
      name: string
      roadname: string | null
      save: () => Promise<void>
    }
    cmp.address = '42'
    cmp.name = 'GP38'
    cmp.roadname = 'cuyama'
    await cmp.save()
    await flushPromises()
    expect(cmp.address).toBe('')
    expect(cmp.name).toBe('')
    expect(cmp.roadname).toBeNull()
  })

  it('falls back to "Loco <address>" when name is empty', async () => {
    const w = makeWrapper()
    const cmp = w.vm as unknown as {
      address: string
      save: () => Promise<void>
    }
    cmp.address = '99'
    await cmp.save()
    await flushPromises()
    const payload = (setDocMock.mock.calls[0] as unknown as [unknown, Record<string, unknown>])[1]
    expect(payload.name).toBe('Loco 99')
  })

  it('keeps fields and sets error on write failure', async () => {
    setDocMock.mockRejectedValueOnce(new Error('firestore down'))
    const w = makeWrapper()
    const cmp = w.vm as unknown as {
      address: string
      name: string
      error: string | null
      save: () => Promise<void>
    }
    cmp.address = '42'
    cmp.name = 'GP38'
    await cmp.save()
    await flushPromises()
    expect(cmp.address).toBe('42')
    expect(cmp.name).toBe('GP38')
    expect(cmp.error).toBe('firestore down')
  })

  it('rejects scientific notation', async () => {
    const w = makeWrapper()
    const cmp = w.vm as unknown as { address: string; save: () => Promise<void> }
    cmp.address = '1e3'
    await cmp.save()
    await flushPromises()
    expect(setDocMock).not.toHaveBeenCalled()
  })
})
