/**
 * Mock for @repo/dccex — stubs useDcc() with fn()-wrapped methods.
 *
 * Wired in via Vite resolve alias in .storybook/main.ts.
 * Do NOT import from @repo/dccex here — that would be circular.
 */

import { fn } from '@storybook/test'

// ---------------------------------------------------------------------------
// Constants re-export
// ---------------------------------------------------------------------------

export const defaultCommands = {
  powerOn: { action: 'dcc', payload: { command: '1' } },
  powerOff: { action: 'dcc', payload: { command: '0' } },
  powerOnMain: { action: 'dcc', payload: { command: '1 MAIN' } },
  powerOffMain: { action: 'dcc', payload: { command: '0 MAIN' } },
  powerOnProg: { action: 'dcc', payload: { command: '1 PROG' } },
  powerOffProg: { action: 'dcc', payload: { command: '0 PROG' } },
  getStatus: { action: 'dcc', payload: { command: '=' } },
  reset: { action: 'dcc', payload: { command: 'D RESET' } },
  save: { action: 'dcc', payload: { command: 'E' } },
  listOutputs: { action: 'dcc', payload: { command: 'Z' } },
}

// ---------------------------------------------------------------------------
// useDcc
// ---------------------------------------------------------------------------
export const useDcc = fn(() => ({
  sendDccCommand: fn().mockName('sendDccCommand').mockResolvedValue(undefined),
  send: fn().mockName('send').mockResolvedValue(undefined),
  setPower: fn().mockName('setPower').mockResolvedValue(undefined),
  setFunction: fn().mockName('setFunction').mockResolvedValue(undefined),
  sendOutput: fn().mockName('sendOutput').mockResolvedValue(undefined),
})).mockName('useDcc')

export default useDcc
