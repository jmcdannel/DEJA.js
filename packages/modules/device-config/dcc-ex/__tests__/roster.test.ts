import { describe, it, expect } from 'vitest'
import { rosterSection } from '../roster'
import type { DccExConfigInput } from '../types'
import type { Device } from '../../../layouts/types'
import type { Loco, LocoFunction } from '../../../locos/types'

function makeDevice(overrides: Partial<Device> = {}): Device {
  return {
    id: 'test-dccex',
    name: 'Test DCC-EX',
    type: 'dcc-ex',
    ...overrides,
  }
}

function makeFn(overrides: Partial<LocoFunction> & { id: number }): LocoFunction {
  return {
    id: overrides.id,
    label: overrides.label ?? `F${overrides.id}`,
    icon: overrides.icon ?? null,
    isFavorite: overrides.isFavorite ?? false,
    isMomentary: overrides.isMomentary ?? false,
  }
}

function makeLoco(overrides: Partial<Loco> = {}): Loco {
  return {
    id: overrides.id ?? `loco-${overrides.address ?? 3}`,
    address: overrides.address ?? 3,
    name: overrides.name ?? `Eng ${overrides.address ?? 3}`,
    functions: overrides.functions,
    ...overrides,
  }
}

function makeInput(locos: Loco[]): DccExConfigInput {
  return {
    device: makeDevice(),
    layoutId: 'test-layout',
    locos,
  }
}

describe('rosterSection.generate', () => {
  it('returns empty string for empty locos array', () => {
    expect(rosterSection.generate(makeInput([]))).toBe('')
  })

  it('emits a single loco with no functions', () => {
    const result = rosterSection.generate(
      makeInput([makeLoco({ address: 3, name: 'Eng 3' })]),
    )
    expect(result).toBe('ROSTER(3,"Eng 3","")')
  })

  it('emits ordered functions joined with /', () => {
    const result = rosterSection.generate(
      makeInput([
        makeLoco({
          address: 3,
          name: 'Eng 3',
          functions: [
            makeFn({ id: 0, label: 'Light' }),
            makeFn({ id: 1, label: 'Bell' }),
            makeFn({ id: 2, label: 'Whistle' }),
          ],
        }),
      ]),
    )
    expect(result).toBe('ROSTER(3,"Eng 3","Light/Bell/Whistle")')
  })

  it('sorts functions by id when input is out of order', () => {
    const result = rosterSection.generate(
      makeInput([
        makeLoco({
          address: 3,
          name: 'Eng 3',
          functions: [
            makeFn({ id: 2, label: 'Whistle' }),
            makeFn({ id: 0, label: 'Light' }),
            makeFn({ id: 1, label: 'Bell' }),
          ],
        }),
      ]),
    )
    expect(result).toBe('ROSTER(3,"Eng 3","Light/Bell/Whistle")')
  })

  it('pads gaps in function ids with empty slots', () => {
    // F0, F1, F5 → slots 0,1,2,3,4,5 → Light, Bell, '', '', '', Whistle
    // Joined with `/` that's 4 slashes between Bell and Whistle (3 empty slots
    // at positions 2/3/4). This keeps F5 at the correct positional slot for
    // DCC-EX, which reads functions positionally from F0.
    const result = rosterSection.generate(
      makeInput([
        makeLoco({
          address: 3,
          name: 'Eng 3',
          functions: [
            makeFn({ id: 0, label: 'Light' }),
            makeFn({ id: 1, label: 'Bell' }),
            makeFn({ id: 5, label: 'Whistle' }),
          ],
        }),
      ]),
    )
    expect(result).toBe('ROSTER(3,"Eng 3","Light/Bell////Whistle")')
  })

  it('prefixes momentary functions with *', () => {
    const result = rosterSection.generate(
      makeInput([
        makeLoco({
          address: 3,
          name: 'Eng 3',
          functions: [
            makeFn({ id: 0, label: 'Light' }),
            makeFn({ id: 1, label: 'Whistle', isMomentary: true }),
          ],
        }),
      ]),
    )
    expect(result).toBe('ROSTER(3,"Eng 3","Light/*Whistle")')
  })

  it('falls back to F${id} when label is missing or empty', () => {
    const result = rosterSection.generate(
      makeInput([
        makeLoco({
          address: 3,
          name: 'Eng 3',
          functions: [
            makeFn({ id: 0, label: '' }),
            makeFn({ id: 1, label: '   ' }),
            makeFn({ id: 2, label: 'Whistle' }),
          ],
        }),
      ]),
    )
    expect(result).toBe('ROSTER(3,"Eng 3","F0/F1/Whistle")')
  })

  it('escapes double quotes in loco name as \\"', () => {
    const result = rosterSection.generate(
      makeInput([makeLoco({ address: 3, name: 'The "Big" One' })]),
    )
    expect(result).toBe('ROSTER(3,"The \\"Big\\" One","")')
  })

  it('escapes backslashes in loco name as \\\\ before quoting', () => {
    const result = rosterSection.generate(
      makeInput([makeLoco({ address: 3, name: 'A\\B' })]),
    )
    // Backslash escaped first → A\\B; no quotes to escape afterward.
    expect(result).toBe('ROSTER(3,"A\\\\B","")')
  })

  it('replaces newlines/CR in loco name with spaces', () => {
    const result = rosterSection.generate(
      makeInput([makeLoco({ address: 3, name: 'Eng\n3\rExtra' })]),
    )
    expect(result).toBe('ROSTER(3,"Eng 3 Extra","")')
  })

  it('replaces / in function label with space', () => {
    const result = rosterSection.generate(
      makeInput([
        makeLoco({
          address: 3,
          name: 'Eng 3',
          functions: [makeFn({ id: 0, label: 'Light/Bell' })],
        }),
      ]),
    )
    expect(result).toBe('ROSTER(3,"Eng 3","Light Bell")')
  })

  it('replaces " in function label with space', () => {
    const result = rosterSection.generate(
      makeInput([
        makeLoco({
          address: 3,
          name: 'Eng 3',
          functions: [makeFn({ id: 0, label: 'Big "Horn"' })],
        }),
      ]),
    )
    expect(result).toBe('ROSTER(3,"Eng 3","Big  Horn")')
  })

  it('replaces newline/CR in function label with space', () => {
    const result = rosterSection.generate(
      makeInput([
        makeLoco({
          address: 3,
          name: 'Eng 3',
          functions: [makeFn({ id: 0, label: 'Bell\nLoud' })],
        }),
      ]),
    )
    expect(result).toBe('ROSTER(3,"Eng 3","Bell Loud")')
  })

  it('sorts multiple locos by address ascending', () => {
    const result = rosterSection.generate(
      makeInput([
        makeLoco({ address: 42, name: 'Eng 42' }),
        makeLoco({ address: 3, name: 'Eng 3' }),
        makeLoco({ address: 17, name: 'Eng 17' }),
      ]),
    )
    expect(result).toBe(
      'ROSTER(3,"Eng 3","")\nROSTER(17,"Eng 17","")\nROSTER(42,"Eng 42","")',
    )
  })

  it('produces byte-identical output across calls (stability)', () => {
    const input = makeInput([
      makeLoco({
        address: 17,
        name: 'Eng 17',
        functions: [
          makeFn({ id: 2, label: 'Whistle', isMomentary: true }),
          makeFn({ id: 0, label: 'Light' }),
        ],
      }),
      makeLoco({
        address: 3,
        name: 'Eng 3',
        functions: [makeFn({ id: 0, label: 'Light' })],
      }),
    ])
    const a = rosterSection.generate(input)
    const b = rosterSection.generate(input)
    expect(a).toBe(b)
  })
})
