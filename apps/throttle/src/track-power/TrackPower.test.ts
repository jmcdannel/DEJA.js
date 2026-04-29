import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import TrackPower from '@repo/ui/src/TrackPower.vue'

const vuetify = createVuetify({ components, directives })

function makeWrapper(props: Record<string, unknown> = {}) {
  return mount(TrackPower, {
    props,
    global: { plugins: [vuetify] },
  })
}

// ---------------------------------------------------------------------------
// Dot indicator color: unknown=warning (yellow), on=primary (blue), off=error
// ---------------------------------------------------------------------------
describe('TrackPower dot indicator color', () => {
  it('shows warning (yellow) when powerState is undefined', () => {
    const w = makeWrapper({ powerState: undefined })
    const badge = w.findComponent({ name: 'VBadge' })
    expect(badge.props('color')).toBe('warning')
  })

  it('shows warning (yellow) when powerState is not provided', () => {
    const w = makeWrapper({})
    const badge = w.findComponent({ name: 'VBadge' })
    expect(badge.props('color')).toBe('warning')
  })

  it('shows primary (blue) when powerState is true (online/on)', () => {
    const w = makeWrapper({ powerState: true })
    const badge = w.findComponent({ name: 'VBadge' })
    expect(badge.props('color')).toBe('primary')
  })

  it('shows error (red) when powerState is false (offline/off)', () => {
    const w = makeWrapper({ powerState: false })
    const badge = w.findComponent({ name: 'VBadge' })
    expect(badge.props('color')).toBe('error')
  })
})

// ---------------------------------------------------------------------------
// Button disabled state
// ---------------------------------------------------------------------------
describe('TrackPower disabled state', () => {
  it('button is enabled when connected and not disabled', () => {
    const w = makeWrapper({ disabled: false, isConnected: true, powerState: false })
    const btn = w.findComponent({ name: 'VBtn' })
    expect(btn.props('disabled')).toBe(false)
  })

  it('button is disabled when isConnected is false', () => {
    const w = makeWrapper({ isConnected: false, powerState: true })
    const btn = w.findComponent({ name: 'VBtn' })
    expect(btn.props('disabled')).toBe(true)
  })

  it('button is disabled when disabled prop is true', () => {
    const w = makeWrapper({ disabled: true, isConnected: true, powerState: true })
    const btn = w.findComponent({ name: 'VBtn' })
    expect(btn.props('disabled')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Toggle emits
// ---------------------------------------------------------------------------
describe('TrackPower toggle', () => {
  it('emits toggle with true when current state is off', async () => {
    const w = makeWrapper({ isConnected: true, powerState: false })
    await w.findComponent({ name: 'VBtn' }).trigger('click')
    expect(w.emitted('toggle')).toBeTruthy()
    expect(w.emitted('toggle')![0]).toEqual([true])
  })

  it('emits toggle with false when current state is on', async () => {
    const w = makeWrapper({ isConnected: true, powerState: true })
    await w.findComponent({ name: 'VBtn' }).trigger('click')
    expect(w.emitted('toggle')![0]).toEqual([false])
  })

  it('calls onToggle callback when provided', async () => {
    const onToggle = vi.fn().mockResolvedValue(undefined)
    const w = makeWrapper({ isConnected: true, onToggle, powerState: false })
    await w.findComponent({ name: 'VBtn' }).trigger('click')
    expect(onToggle).toHaveBeenCalledWith(true)
  })
})
