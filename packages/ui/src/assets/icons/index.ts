export const appIcons = {
  deja: new URL('./deja.png', import.meta.url).href,
  cloud: new URL('./cloud.png', import.meta.url).href,
  throttle: new URL('./throttle.png', import.meta.url).href,
  monitor: new URL('./monitor.png', import.meta.url).href,
  tour: new URL('./tour.png', import.meta.url).href,
} as const

export type AppIconName = keyof typeof appIcons
