/**
 * scripts/tui/commands/deploy.mjs
 * Deploy firmware to Arduino or Pico W devices from the TUI.
 */

import { register } from './registry.mjs'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export function registerDeployCommands() {
  register({
    name: 'deploy',
    aliases: ['dep', 'flash', 'upload'],
    description: 'Deploy firmware to a connected device',
    usage: '/deploy',
    execute(_args, ctx) {
      ctx.addLog('🚀 Starting device deploy...')
      ctx.addLog('')

      // Find monorepo io/ directory relative to this script
      const __dirname = dirname(fileURLToPath(import.meta.url))
      const ioDir = join(__dirname, '..', '..', '..', 'io')

      if (!existsSync(join(ioDir, 'package.json'))) {
        ctx.addLog('❌ Deploy requires the DEJA.js monorepo.')
        ctx.addLog('   Run "deja deploy" from the terminal instead.')
        ctx.showHint('Use: deja deploy')
        return
      }

      ctx.addLog('📟 Launching deploy wizard in terminal...')
      ctx.addLog('   The TUI will resume when deployment completes.')
      ctx.showHint('Deploy wizard running — check your terminal')

      const child = spawn('npx', ['tsx', './scripts/deploy.ts'], {
        cwd: ioDir,
        stdio: 'inherit',
        shell: true,
      })

      child.on('close', (code) => {
        if (code === 0) {
          ctx.addLog('✅ Deploy completed successfully! 🎉')
          ctx.showHint('Device deployed successfully')
        } else {
          ctx.addLog(`❌ Deploy exited with code ${code}`)
          ctx.showHint('Deploy failed — check logs above')
        }
      })

      child.on('error', (err) => {
        ctx.addLog(`❌ Failed to start deploy: ${err.message}`)
      })
    },
  })
}
