import { describe, it, expect, vi } from 'vitest'
import { getSignedSpeed } from './utils'

describe('getSignedSpeed', () => {
  it('returns positive speed when direction is true (forward)', () => {
    expect(getSignedSpeed({ speed: 50, direction: true })).toBe(50)
  })

  it('returns negative speed when direction is false (reverse)', () => {
    expect(getSignedSpeed({ speed: 50, direction: false })).toBe(-50)
  })

  it('returns 0 when speed is 0 regardless of direction', () => {
    expect(getSignedSpeed({ speed: 0, direction: true })).toBe(0)
    expect(getSignedSpeed({ speed: 0, direction: false })).toBe(0)
  })

  it('returns 0 and warns when speed is NaN', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(getSignedSpeed({ speed: NaN, direction: true })).toBe(0)
    expect(warnSpy).toHaveBeenCalledWith('Invalid speed value:', NaN)
    warnSpy.mockRestore()
  })

  it('returns raw speed and warns when direction is undefined', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(getSignedSpeed({ speed: 30, direction: undefined as any })).toBe(30)
    expect(warnSpy).toHaveBeenCalledWith('Invalid direction value:', undefined)
    warnSpy.mockRestore()
  })

  it('returns raw speed and warns when direction is a non-boolean', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(getSignedSpeed({ speed: 30, direction: 1 as any })).toBe(30)
    expect(warnSpy).toHaveBeenCalledWith('Invalid direction value:', 1)
    warnSpy.mockRestore()
  })

  it('handles full speed forward (127)', () => {
    expect(getSignedSpeed({ speed: 127, direction: true })).toBe(127)
  })

  it('handles full speed reverse (127)', () => {
    expect(getSignedSpeed({ speed: 127, direction: false })).toBe(-127)
  })
})
