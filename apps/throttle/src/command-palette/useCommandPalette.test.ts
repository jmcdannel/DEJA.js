import { describe, it, expect, beforeEach } from 'vitest'
import { useCommandPalette } from './useCommandPalette'

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

  it('push() adds an id to the stack and resets query + activeIndex', () => {
    const { open, push, query, activeIndex, stack } = useCommandPalette()
    open('signal block west')
    push('browse.signals')
    expect(stack.value).toEqual(['browse.signals'])
    expect(query.value).toBe('')
    expect(activeIndex.value).toBe(0)
  })

  it('pop() removes the top id and resets query/activeIndex', () => {
    const { open, push, pop, query, activeIndex, stack } = useCommandPalette()
    open()
    push('browse.turnouts')
    push('browse.turnouts.all')
    expect(stack.value).toEqual(['browse.turnouts', 'browse.turnouts.all'])
    pop()
    expect(stack.value).toEqual(['browse.turnouts'])
    expect(query.value).toBe('')
    expect(activeIndex.value).toBe(0)
  })

  it('stack reflects the drill-down path in order', () => {
    const { open, push, pop, stack } = useCommandPalette()
    open()
    expect(stack.value).toEqual([])
    push('one')
    expect(stack.value).toEqual(['one'])
    push('two')
    expect(stack.value).toEqual(['one', 'two'])
    pop()
    expect(stack.value).toEqual(['one'])
    pop()
    expect(stack.value).toEqual([])
  })

  it('state is shared across calls (module-scoped)', () => {
    const a = useCommandPalette()
    const b = useCommandPalette()
    a.open('shared')
    expect(b.isOpen.value).toBe(true)
    expect(b.query.value).toBe('shared')
  })
})
