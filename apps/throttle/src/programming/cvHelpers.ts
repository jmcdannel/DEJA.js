import type { Cv29Flags } from '@repo/modules'

/** Decode a CV29 byte value into individual flags */
export function decodeCv29(value: number): Cv29Flags {
  return {
    direction: (value & 0x01) !== 0,
    speedSteps28: (value & 0x02) !== 0,
    analogConversion: (value & 0x04) !== 0,
    railcomEnabled: (value & 0x08) !== 0,
    speedTable: (value & 0x10) !== 0,
    longAddress: (value & 0x20) !== 0,
  }
}

/** Encode CV29 flags back into a byte value */
export function encodeCv29(flags: Cv29Flags): number {
  let value = 0
  if (flags.direction) value |= 0x01
  if (flags.speedSteps28) value |= 0x02
  if (flags.analogConversion) value |= 0x04
  if (flags.railcomEnabled) value |= 0x08
  if (flags.speedTable) value |= 0x10
  if (flags.longAddress) value |= 0x20
  return value
}

/** Convert a long DCC address (128-9999) to CV17 and CV18 values */
export function longAddressToCv17Cv18(address: number): { cv17: number; cv18: number } {
  const cv17 = Math.floor(address / 256) + 192
  const cv18 = address % 256
  return { cv17, cv18 }
}

/** Convert CV17 and CV18 values back to a long DCC address */
export function cv17Cv18ToLongAddress(cv17: number, cv18: number): number {
  return (cv17 - 192) * 256 + cv18
}

/** Validate that a CV number is in range (1-1024) */
export function validateCvNumber(cv: number): boolean {
  return Number.isInteger(cv) && cv >= 1 && cv <= 1024
}

/** Validate that a CV value is in range (0-255) */
export function validateCvValue(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 255
}

/** Convert a byte value to an 8-bit binary string */
export function valueToBinary(value: number): string {
  return value.toString(2).padStart(8, '0')
}

/** Get the state of a specific bit (0-7) in a byte value */
export function getBit(value: number, bit: number): boolean {
  return ((value >> bit) & 1) === 1
}

/** Set a specific bit (0-7) in a byte value */
export function setBit(value: number, bit: number, state: boolean): number {
  if (state) {
    return value | (1 << bit)
  }
  return value & ~(1 << bit)
}
