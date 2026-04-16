import { describe, it, expect } from 'vitest'
import { soundLocoDefaultFunctions, silentLocoDefaultFunctions } from './constants'

describe('soundLocoDefaultFunctions', () => {
  it('has exactly 32 entries', () => {
    expect(soundLocoDefaultFunctions).toHaveLength(32)
  })

  it('each entry has a sequential id', () => {
    soundLocoDefaultFunctions.forEach((f, i) => expect(f.id).toBe(i))
  })

  it('has exactly 9 favorites (F0–F6, F8, F9)', () => {
    const favorites = soundLocoDefaultFunctions.filter(f => f.isFavorite)
    expect(favorites).toHaveLength(9)
    expect(favorites.map(f => f.id)).toEqual([0, 1, 2, 3, 4, 5, 6, 8, 9])
  })

  it('F0 is Light, not momentary', () => {
    const f0 = soundLocoDefaultFunctions[0]
    expect(f0.label).toBe('Light')
    expect(f0.icon).toBe('light')
    expect(f0.isMomentary).toBe(false)
  })

  it('F1 Bell and F2 Horn are momentary', () => {
    expect(soundLocoDefaultFunctions[1].isMomentary).toBe(true)
    expect(soundLocoDefaultFunctions[2].isMomentary).toBe(true)
  })

  it('F3 Coupler is momentary', () => {
    expect(soundLocoDefaultFunctions[3].isMomentary).toBe(true)
  })

  it('F8 Mute is not momentary', () => {
    expect(soundLocoDefaultFunctions[8].isMomentary).toBe(false)
  })

  it('F4 Dyn Brake, F5 Dim Lights, F6 Cab Light are not momentary', () => {
    expect(soundLocoDefaultFunctions[4].isMomentary).toBe(false)
    expect(soundLocoDefaultFunctions[5].isMomentary).toBe(false)
    expect(soundLocoDefaultFunctions[6].isMomentary).toBe(false)
  })

  it('F7 is bare (not a favorite)', () => {
    const f7 = soundLocoDefaultFunctions[7]
    expect(f7.label).toBe('F7')
    expect(f7.isFavorite).toBe(false)
    expect(f7.icon).toBeNull()
  })

  it('non-preset functions have F{n} labels and null icons', () => {
    const bareFunctions = soundLocoDefaultFunctions.filter(f => !f.isFavorite)
    for (const f of bareFunctions) {
      expect(f.label).toBe(`F${f.id}`)
      expect(f.icon).toBeNull()
    }
  })
})

describe('silentLocoDefaultFunctions', () => {
  it('has exactly 32 entries', () => {
    expect(silentLocoDefaultFunctions).toHaveLength(32)
  })

  it('each entry has a sequential id', () => {
    silentLocoDefaultFunctions.forEach((f, i) => expect(f.id).toBe(i))
  })

  it('only F0 is a favorite', () => {
    const favorites = silentLocoDefaultFunctions.filter(f => f.isFavorite)
    expect(favorites).toHaveLength(1)
    expect(favorites[0].id).toBe(0)
  })

  it('F0 is Light', () => {
    const f0 = silentLocoDefaultFunctions[0]
    expect(f0.label).toBe('Light')
    expect(f0.icon).toBe('light')
    expect(f0.isMomentary).toBe(false)
  })

  it('all other functions are bare F{n} with no icon', () => {
    const rest = silentLocoDefaultFunctions.slice(1)
    for (const f of rest) {
      expect(f.label).toBe(`F${f.id}`)
      expect(f.icon).toBeNull()
      expect(f.isFavorite).toBe(false)
    }
  })
})
