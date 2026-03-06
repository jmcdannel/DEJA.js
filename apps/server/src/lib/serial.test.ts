import { describe, it, expect } from 'vitest'
import { isSensorData } from './serial'

describe('isSensorData', () => {
  it('returns true for valid sensor JSON prefix', () => {
    expect(isSensorData('{ "sensor": { "id": 1 } }')).toBe(true)
  })

  it('returns true for any string starting with \'{ "sensor\'', () => {
    expect(isSensorData('{ "sensorData": [] }')).toBe(true)
  })

  it('returns false for a DCC-EX response', () => {
    expect(isSensorData('<p2>')).toBe(false)
  })

  it('returns false for an empty string', () => {
    expect(isSensorData('')).toBe(false)
  })

  it('returns false for sensor data with a leading space (strict prefix match)', () => {
    expect(isSensorData(' { "sensor": {} }')).toBe(false)
  })

  it('returns false for plain text', () => {
    expect(isSensorData('hello world')).toBe(false)
  })

  it('returns false for JSON that is not sensor data', () => {
    expect(isSensorData('{ "action": "connect" }')).toBe(false)
  })
})
