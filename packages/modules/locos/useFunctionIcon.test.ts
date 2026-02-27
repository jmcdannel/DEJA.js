import { describe, it, expect } from 'vitest'
import { useFunctionIcon } from './useFunctionIcon'

describe('useFunctionIcon', () => {
  const { getIconComponent, getAllIcons, DEFAULT_ICON } = useFunctionIcon()

  describe('DEFAULT_ICON', () => {
    it('is "mdi-train"', () => {
      expect(DEFAULT_ICON).toBe('mdi-train')
    })
  })

  describe('getAllIcons', () => {
    it('returns an array of icons', () => {
      const icons = getAllIcons()
      expect(Array.isArray(icons)).toBe(true)
    })

    it('returns 15 icons', () => {
      expect(getAllIcons()).toHaveLength(15)
    })

    it('each icon has a name and icon property', () => {
      getAllIcons().forEach((icon) => {
        expect(icon).toHaveProperty('name')
        expect(icon).toHaveProperty('icon')
        expect(typeof icon.name).toBe('string')
        expect(typeof icon.icon).toBe('string')
      })
    })
  })

  describe('getIconComponent', () => {
    it('returns the correct icon for "light"', () => {
      expect(getIconComponent('light')).toBe('mdi-lightbulb')
    })

    it('returns the correct icon for "horn"', () => {
      expect(getIconComponent('horn')).toBe('mdi-bullhorn')
    })

    it('returns the correct icon for "bell"', () => {
      expect(getIconComponent('bell')).toBe('mdi-bell')
    })

    it('returns the correct icon for "sound"', () => {
      expect(getIconComponent('sound')).toBe('mdi-volume-high')
    })

    it('returns the correct icon for "mute"', () => {
      expect(getIconComponent('mute')).toBe('mdi-volume-off')
    })

    it('returns the default icon for an unknown name', () => {
      expect(getIconComponent('unknown-function')).toBe('mdi-train')
    })

    it('returns the default icon for an empty string (bug was: missing return)', () => {
      // This test previously failed because line 25 was `DEFAULT_ICON` without `return`
      expect(getIconComponent('')).toBe('mdi-train')
    })

    it('all icon names in getAllIcons() resolve correctly', () => {
      getAllIcons().forEach(({ name, icon }) => {
        expect(getIconComponent(name)).toBe(icon)
      })
    })
  })
})
