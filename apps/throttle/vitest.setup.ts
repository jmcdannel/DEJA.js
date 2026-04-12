// 🧪 Vitest setup — polyfills required by Vuetify in jsdom

// Vuetify uses ResizeObserver internally (e.g. VInput, VProgressCircular)
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// Vuetify uses IntersectionObserver internally (e.g. VInfiniteScroll)
if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver
}
