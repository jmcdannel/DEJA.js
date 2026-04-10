import { describe, it, expect, beforeEach } from 'vitest'
import { useCommandPalette } from './useCommandPalette'
import type { Command, CommandStack } from './types'

const makeCommand = (id: string): Command => ({
  id,
  title: id,
  category: 'navigation',
  icon: 'mdi-star',
  run: () => {},
})

describe('useCommandPalette', () => {
  beforeEach(() => {
    const { close } = useCommandPalette()
    close()
  })

  it('starts closed with empty query and empty stack', () => {
    const { isOpen, query, activeIndex, stack } = useCommandPalette()
    expect(isOpen.value).toBe(false)
    expect(query.value).toBe('')
    expect(activeIndex.value).toBe(0)
    expect(stack.value).toEqual([])
  })

  it('open() flips isOpen and seeds the query', () => {
    const { open, isOpen, query, activeIndex, stack } = useCommandPalette()
    open('throw main')
    expect(isOpen.value).toBe(true)
    expect(query.value).toBe('throw main')
    expect(activeIndex.value).toBe(0)
    expect(stack.value).toEqual([])
  })

  it('open() without argument seeds empty query', () => {
    const { open, query } = useCommandPalette()
    open()
    expect(query.value).toBe('')
  })

  it('close() resets everything', () => {
    const { open, close, isOpen, query, activeIndex, stack } = useCommandPalette()
    open('something')
    close()
    expect(isOpen.value).toBe(false)
    expect(query.value).toBe('')
    expect(activeIndex.value).toBe(0)
    expect(stack.value).toEqual([])
  })

  it('push() adds a level, clears query and activeIndex', () => {
    const { open, push, query, activeIndex, stack } = useCommandPalette()
    open('signal block west')
    const level: CommandStack = {
      title: 'Set Block West ▸ aspect',
      commands: [makeCommand('red'), makeCommand('yellow')],
    }
    push(level)
    expect(stack.value).toHaveLength(1)
    expect(stack.value[0].title).toBe('Set Block West ▸ aspect')
    expect(query.value).toBe('')
    expect(activeIndex.value).toBe(0)
  })

  it('pop() removes the top level and resets query/activeIndex', () => {
    const { open, push, pop, query, activeIndex, stack } = useCommandPalette()
    open()
    push({ title: 'level 1', commands: [] })
    push({ title: 'level 2', commands: [] })
    expect(stack.value).toHaveLength(2)
    pop()
    expect(stack.value).toHaveLength(1)
    expect(stack.value[0].title).toBe('level 1')
    expect(query.value).toBe('')
    expect(activeIndex.value).toBe(0)
  })

  it('currentLevelTitle reflects the top of stack or null', () => {
    const { open, push, pop, currentLevelTitle } = useCommandPalette()
    open()
    expect(currentLevelTitle.value).toBeNull()
    push({ title: 'one', commands: [] })
    expect(currentLevelTitle.value).toBe('one')
    push({ title: 'two', commands: [] })
    expect(currentLevelTitle.value).toBe('two')
    pop()
    expect(currentLevelTitle.value).toBe('one')
    pop()
    expect(currentLevelTitle.value).toBeNull()
  })

  it('state is shared across calls (module-scoped)', () => {
    const a = useCommandPalette()
    const b = useCommandPalette()
    a.open('shared')
    expect(b.isOpen.value).toBe(true)
    expect(b.query.value).toBe('shared')
  })
})
