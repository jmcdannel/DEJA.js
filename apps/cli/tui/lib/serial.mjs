import { readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { readConfig } from './config.mjs'

export function detectSerialPorts() {
  try {
    const entries = readdirSync('/dev')
    return entries
      .filter(name =>
        /^tty\.(usb|USB|ACM|SLAB|wch)/i.test(name) ||
        /^ttyUSB\d/.test(name) ||
        /^ttyACM\d/.test(name) ||
        /^ttyAMA\d/.test(name)
      )
      .map(name => `/dev/${name}`)
      .sort()
  } catch { return [] }
}

export function getPlan() {
  try { return readConfig().subscription?.plan || '' }
  catch { return '' }
}

export function isPaidPlan() {
  const plan = getPlan()
  return plan === 'engineer' || plan === 'conductor'
}

export function hasCloudflared() {
  try {
    execFileSync('which', ['cloudflared'], { stdio: 'ignore' })
    return true
  } catch { return false }
}
