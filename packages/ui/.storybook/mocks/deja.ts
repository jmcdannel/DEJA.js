/**
 * Mock for @repo/deja — stubs useDejaJS() with fn()-wrapped methods.
 *
 * Wired in via Vite resolve alias in .storybook/main.ts.
 * Do NOT import from @repo/deja here — that would be circular.
 */

import { fn } from '@storybook/test'

// ---------------------------------------------------------------------------
// useDejaJS
// ---------------------------------------------------------------------------
export const useDejaJS = fn(() => ({
  sendDejaCommand: fn().mockName('sendDejaCommand').mockResolvedValue(undefined),
})).mockName('useDejaJS')

export default useDejaJS
