import { describe, it, expect } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('trims leading whitespace', () => {
    expect(slugify('  hello')).toBe('hello')
  })

  it('trims trailing whitespace', () => {
    expect(slugify('hello  ')).toBe('hello')
  })

  it('trims both leading and trailing whitespace', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world')
  })

  it('replaces spaces with hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world')
  })

  it('collapses multiple spaces into a single hyphen', () => {
    expect(slugify('hello   world')).toBe('hello-world')
  })

  it('removes consecutive hyphens', () => {
    expect(slugify('hello--world')).toBe('hello-world')
  })

  it('removes non-alphanumeric characters', () => {
    expect(slugify('hello@world!')).toBe('helloworld')
  })

  it('removes accented/unicode characters', () => {
    expect(slugify('café')).toBe('caf')
  })

  it('handles an empty string', () => {
    expect(slugify('')).toBe('')
  })

  it('is idempotent on already-slugified strings', () => {
    const slug = 'hello-world-123'
    expect(slugify(slug)).toBe(slug)
  })

  it('handles numbers in the string', () => {
    expect(slugify('Track 1')).toBe('track-1')
  })

  it('handles strings that are only special characters', () => {
    expect(slugify('!!!@@@')).toBe('')
  })

  it('handles mixed case with symbols and spaces', () => {
    expect(slugify('  My Layout #3 (Main) ')).toBe('my-layout-3-main')
  })
})
