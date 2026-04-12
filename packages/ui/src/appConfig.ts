import { appIcons, appColors } from './assets/icons'

/** Single source of truth for cross-app navigation — URLs and branding. */
export const DEJA_APPS = {
  cloud:    { label: 'Cloud',    href: 'https://cloud.dejajs.com/',    icon: appIcons.cloud,    color: appColors.cloud },
  throttle: { label: 'Throttle', href: 'https://throttle.dejajs.com/', icon: appIcons.throttle, color: appColors.throttle },
  monitor:  { label: 'Monitor',  href: 'https://monitor.dejajs.com/',  icon: appIcons.monitor,  color: appColors.monitor },
  tour:     { label: 'Tour',     href: 'https://www.dejajs.com/',      icon: appIcons.tour,     color: appColors.tour },
} as const

export type DejaAppKey = keyof typeof DEJA_APPS
