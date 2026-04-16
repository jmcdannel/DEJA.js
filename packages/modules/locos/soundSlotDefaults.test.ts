// packages/modules/locos/soundSlotDefaults.test.ts
import { describe, it, expect } from 'vitest'
import { soundSlotDefaults, type SoundSlot } from './soundSlotDefaults'

describe('soundSlotDefaults', () => {
  it('exports exactly 8 slots', () => {
    expect(soundSlotDefaults).toHaveLength(8)
  })

  it('every slot has required fields', () => {
    for (const slot of soundSlotDefaults) {
      expect(typeof slot.label).toBe('string')
      expect(slot.label.length).toBeGreaterThan(0)
      expect(typeof slot.icon).toBe('string')
      expect(slot.icon.length).toBeGreaterThan(0)
      expect(typeof slot.soundKey).toBe('string')
      expect(slot.soundKey.length).toBeGreaterThan(0)
      expect(typeof slot.isMomentary).toBe('boolean')
    }
  })

  it('first 5 slots are momentary (Horn, Bell, Coupler, Brake, Air)', () => {
    const momentary = soundSlotDefaults.slice(0, 5)
    expect(momentary.every(s => s.isMomentary)).toBe(true)
  })

  it('last 3 slots are not momentary (Dyn Brake, Announce, Ambient)', () => {
    const latching = soundSlotDefaults.slice(5)
    expect(latching.every(s => !s.isMomentary)).toBe(true)
  })

  it('icons are valid FUNCTION_ICONS keys', () => {
    const validIcons = ['light', 'bell', 'horn', 'wifi', 'coupler', 'fan', 'brake',
      'station', 'mute', 'quiet', 'sound', 'track', 'air', 'announce', 'dim']
    for (const slot of soundSlotDefaults) {
      expect(validIcons).toContain(slot.icon)
    }
  })
})
