/**
 * scripts/tui/commands/devices.mjs
 * Slash commands for device management: list, connect, disconnect.
 */

import { register } from './registry.mjs'

export function registerDeviceCommands() {
  register({
    name: 'devices',
    aliases: ['d', 'io', 'iodevices'],
    description: 'Show device list',
    usage: '/devices',
    execute(_args, ctx) {
      ctx.transitionMode('devices')
    },
  })

  register({
    name: 'connect',
    aliases: ['c'],
    description: 'Connect a device',
    usage: '/connect <device-name>',
    execute(args, ctx) {
      if (!args) {
        ctx.transitionMode('devices')
        return
      }
      const name = args.trim().toLowerCase()
      const deviceList = typeof ctx.devices === 'function' ? ctx.devices() : ctx.devices
      const device = (deviceList || []).find(d =>
        (d.id || '').toLowerCase().includes(name) ||
        (d.name || '').toLowerCase().includes(name)
      )
      if (!device) {
        ctx.showHint(`Device "${args.trim()}" not found.`)
        return
      }
      if (device.isConnected || device.connected) {
        ctx.showHint(`${device.id} is already connected.`)
        return
      }
      ctx.connectDevice(device)
      ctx.showHint(`Connecting ${device.id}...`)
    },
  })

  register({
    name: 'disconnect',
    aliases: ['dc'],
    description: 'Disconnect a device',
    usage: '/disconnect <device-name>',
    execute(args, ctx) {
      if (!args) {
        ctx.showHint('Usage: /disconnect <device-name>')
        return
      }
      const name = args.trim().toLowerCase()
      const deviceList = typeof ctx.devices === 'function' ? ctx.devices() : ctx.devices
      const device = (deviceList || []).find(d =>
        (d.id || '').toLowerCase().includes(name) ||
        (d.name || '').toLowerCase().includes(name)
      )
      if (!device) {
        ctx.showHint(`Device "${args.trim()}" not found.`)
        return
      }
      if (!device.isConnected && !device.connected) {
        ctx.showHint(`${device.id} is not connected.`)
        return
      }
      ctx.disconnectDevice(device)
      ctx.showHint(`Disconnecting ${device.id}...`)
    },
  })
}
