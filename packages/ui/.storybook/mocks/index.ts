/**
 * Barrel export for all shared Storybook mocks.
 */

// Factory functions for mock data
export * from './data'

// Module mocks (composables)
export * as modulesMocks from './modules'

// DCC-EX mocks
export * as dccexMocks from './dccex'

// DEJA mocks
export * as dejaMocks from './deja'

// Firebase / Vuefire mocks
export * as firebaseMocks from './firebase'

// Utils mocks
export * as utilsMocks from './utils'

// Router
export { createMockRouter, mockRouter } from './router'
