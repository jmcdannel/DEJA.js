# `deja deploy` CLI Command Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `deja deploy` command to the deja CLI that lets end users flash firmware to Arduino and Pico W devices with one command: select device → auto-detect USB → deploy.

**Architecture:** The bash CLI's `cmd_deploy()` spawns a Node.js deploy script (`~/.deja/server/deploy.js` in distribution, `scripts/deploy-device.mjs` in monorepo). This script reuses the shared config generators from `@repo/modules` and the existing deploy utilities from `io/scripts/lib/`. For distribution, the deploy script is bundled via tsup alongside the server, and firmware source templates are included in the tarball. The TUI also gets a `/deploy` slash command.

**Tech Stack:** Bash, Node.js ESM, @inquirer/prompts, arduino-cli, Firebase Admin SDK, @repo/modules device-config generators

---

## File Map

### New Files
| File | Responsibility |
|------|---------------|
| `io/scripts/deploy-standalone.ts` | Standalone deploy orchestrator — self-contained script that bundles config generation, Firebase fetching, device detection, and deployment for both monorepo and distribution use |
| `scripts/tui/commands/deploy.mjs` | TUI `/deploy` slash command registration |

### Modified Files
| File | Change |
|------|--------|
| `scripts/deja` | Add `cmd_deploy()` function and `deploy)` case in main switch |
| `scripts/tui/commands/index.mjs` | Import and register deploy commands |
| `scripts/tui/lib/brand.mjs` | Add "Deploy Firmware" to MENU_ITEMS |
| `io/package.json` | Add `"deploy:standalone"` script |
| `io/scripts/lib/detect.ts` | Add `installArduinoCli()` auto-install function |

### Distribution Changes (future commit)
| File | Change |
|------|--------|
| `.github/workflows/release-server.yml` | Include firmware templates and deploy script in tarball |

---

### Task 1: Add auto-install for arduino-cli

**Files:**
- Modify: `io/scripts/lib/detect.ts`

- [ ] **Step 1: Add installArduinoCli function**

Add this function to `io/scripts/lib/detect.ts` after the existing `isArduinoCliInstalled()` function:

```typescript
/**
 * Auto-install arduino-cli if not present.
 * Returns true if arduino-cli is available after this call.
 */
export async function ensureArduinoCli(): Promise<boolean> {
  if (isArduinoCliInstalled()) return true

  console.log('📦 arduino-cli not found. Installing...')

  try {
    if (process.platform === 'darwin') {
      // macOS: try Homebrew first
      try {
        execSync('which brew', { stdio: 'pipe' })
        console.log('   Using Homebrew...')
        execSync('brew install arduino-cli', { stdio: 'inherit' })
      } catch {
        // Homebrew not available, use install script
        console.log('   Using install script...')
        execSync('curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh', {
          stdio: 'inherit',
          cwd: '/usr/local/bin',
        })
      }
    } else {
      // Linux: use install script
      console.log('   Using install script...')
      execSync('curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=/usr/local/bin sh', {
        stdio: 'inherit',
      })
    }

    // Install Arduino AVR core (needed for most boards)
    if (isArduinoCliInstalled()) {
      console.log('📦 Installing Arduino AVR core...')
      execSync('arduino-cli core install arduino:avr', { stdio: 'inherit' })
      console.log('✅ arduino-cli installed successfully!')
      return true
    }
  } catch (err) {
    console.error('❌ Failed to install arduino-cli automatically.')
    console.error('')
    console.error('📦 Install manually:')
    console.error('   macOS:  brew install arduino-cli')
    console.error('   Linux:  curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh')
    console.error('   Docs:   https://arduino.github.io/arduino-cli/latest/installation/')
  }

  return false
}
```

- [ ] **Step 2: Update deploy-arduino.ts to use ensureArduinoCli**

Replace the manual check in `io/scripts/lib/deploy-arduino.ts` `compileAndUpload()` function. Change lines 20-31 from:

```typescript
  if (!isArduinoCliInstalled()) {
    console.error('❌ arduino-cli is not installed.')
    // ... manual instructions ...
    process.exit(1)
  }
```

To:

```typescript
  const { ensureArduinoCli } = await import('./detect.js')
  const available = await ensureArduinoCli()
  if (!available) {
    process.exit(1)
  }
```

And change the function signature from `function compileAndUpload(options)` to `async function compileAndUpload(options)` since it now awaits.

Also update the import at the top — remove the `isArduinoCliInstalled` import since it's no longer used directly:

```typescript
// Before:
import { isArduinoCliInstalled } from './detect.js'

// After: (remove this import entirely — ensureArduinoCli is dynamically imported)
```

- [ ] **Step 3: Verify no other files import from detect.ts in a way that breaks**

Run: `grep -r "isArduinoCliInstalled" io/scripts/`
Expected: Should only appear in `detect.ts` (definition) and nowhere else (the deploy-arduino.ts import was removed).

- [ ] **Step 4: Commit**

```bash
git add io/scripts/lib/detect.ts io/scripts/lib/deploy-arduino.ts
git commit -m "feat(io): 🔧 add arduino-cli auto-install with ensureArduinoCli()"
```

---

### Task 2: Add `deja deploy` bash command

**Files:**
- Modify: `scripts/deja`

- [ ] **Step 1: Add cmd_deploy function**

Add this function before the `cmd_help()` function (around line 716) in `scripts/deja`:

```bash
# ======================================================================
# Deploy — flash firmware to Arduino or Pico W device
# ======================================================================

cmd_deploy() {
  info "🚀 DEJA.js Device Deploy"
  echo ""

  # Check if running from monorepo (development) or distribution
  local SCRIPT_DIR
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  local MONOREPO_IO="${SCRIPT_DIR}/../io"

  if [[ -d "$MONOREPO_IO" && -f "$MONOREPO_IO/package.json" ]]; then
    # Monorepo mode: run deploy script via tsx
    info "Running from monorepo..."
    cd "$MONOREPO_IO"

    # Ensure dependencies are installed
    if [[ ! -d "node_modules" ]]; then
      info "Installing io/ dependencies..."
      pnpm install 2>/dev/null || npm install 2>/dev/null
    fi

    exec npx tsx ./scripts/deploy.ts "$@"
  elif [[ -f "${SERVER_DIR}/deploy.js" ]]; then
    # Distribution mode: run bundled deploy script
    exec node "${SERVER_DIR}/deploy.js" "$@"
  else
    err "Deploy not available."
    echo ""
    echo -e "  ${DIM}The deploy command requires either:${NC}"
    echo -e "  • Running from the DEJA.js monorepo, or"
    echo -e "  • A server version that includes deploy support"
    echo ""
    echo -e "  Run ${CYAN}deja update${NC} to get the latest version."
    exit 1
  fi
}
```

- [ ] **Step 2: Add deploy to the case statement**

In the main case statement (line 755+), add the deploy case:

```bash
  deploy)   shift; cmd_deploy "$@" ;;
```

Add it after the `tunnel)` line.

- [ ] **Step 3: Add deploy to cmd_help()**

Add a new section in `cmd_help()` after the tunnel section:

```bash
  echo -e "  ${BOLD}📟 Device Deployment${NC}"
  echo -e "    ${CYAN}deploy${NC}         Deploy firmware to Arduino or Pico W device"
  echo ""
```

- [ ] **Step 4: Test the command**

Run: `cd /Users/jmcdannel/TTT/worktrees/io-wifi && bash scripts/deja deploy --help 2>&1 | head -5`
Expected: Should show the deploy script starting (or its help output).

Run: `bash scripts/deja --help`
Expected: Should include "deploy" in the help output.

- [ ] **Step 5: Commit**

```bash
git add scripts/deja
git commit -m "feat(cli): 🚀 add deja deploy command for Arduino and Pico W firmware deployment"
```

---

### Task 3: Add `/deploy` TUI slash command

**Files:**
- Create: `scripts/tui/commands/deploy.mjs`
- Modify: `scripts/tui/commands/index.mjs`
- Modify: `scripts/tui/lib/brand.mjs`

- [ ] **Step 1: Create deploy.mjs command module**

```javascript
/**
 * scripts/tui/commands/deploy.mjs
 * Deploy firmware to Arduino or Pico W devices from the TUI.
 */

import { register } from './registry.mjs'
import { execSync, spawn } from 'node:child_process'
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

      // Spawn the deploy script as a child process with inherited stdio
      // This gives the user the interactive prompts from @inquirer/prompts
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
```

- [ ] **Step 2: Register deploy commands in index.mjs**

Add import and registration call to `scripts/tui/commands/index.mjs`:

```javascript
import { registerDeployCommands } from './deploy.mjs'
```

And in `registerAllCommands()`:

```javascript
  registerDeployCommands()
```

- [ ] **Step 3: Add Deploy to TUI menu**

Add to `MENU_ITEMS` in `scripts/tui/lib/brand.mjs`:

```javascript
  { label: 'Deploy Firmware',    action: 'deploy' },
```

Add it after the "Devices" entry.

- [ ] **Step 4: Handle the 'deploy' menu action in App.mjs**

The menu action needs to trigger the deploy command. Check how existing menu actions are handled in App.mjs and add:

In the menu action handler (look for where `action === 'start'` etc. are handled), add:

```javascript
case 'deploy': {
  const { lookup } = await import('./commands/registry.mjs')
  const result = lookup('/deploy')
  if (result?.command) result.command.execute('', commandContext)
  transitionMode('logs')
  break
}
```

- [ ] **Step 5: Commit**

```bash
git add scripts/tui/commands/deploy.mjs scripts/tui/commands/index.mjs scripts/tui/lib/brand.mjs scripts/tui/App.mjs
git commit -m "feat(tui): 📟 add /deploy slash command and menu item"
```

---

### Task 4: Verify everything works end-to-end

**Files:** None (verification only)

- [ ] **Step 1: Verify deja deploy bash command exists**

Run: `bash scripts/deja --help | grep -i deploy`
Expected: Shows deploy command in help output.

- [ ] **Step 2: Verify TUI deploy command is registered**

Run: `node -e "import('./scripts/tui/commands/index.mjs').then(m => m.registerAllCommands()); import('./scripts/tui/commands/registry.mjs').then(m => console.log(m.list().map(c => c.name)))"`
Expected: Array includes 'deploy'.

- [ ] **Step 3: Verify auto-install function exists**

Run: `grep "ensureArduinoCli" io/scripts/lib/detect.ts`
Expected: Shows the function definition.

- [ ] **Step 4: Verify io build still works**

Run: `cd io && pnpm build`
Expected: `✅ Build completed!`

- [ ] **Step 5: Run device-config tests**

Run: `cd packages/modules && pnpm vitest run device-config/`
Expected: All 17 tests pass.

- [ ] **Step 6: Commit plan file**

```bash
git add docs/superpowers/plans/2026-04-03-deja-deploy-cli.md docs/superpowers/plans/2026-04-03-io-workspace-refactor.md
git commit -m "docs: 📋 add Phase 1 and Phase 2 implementation plans"
```
