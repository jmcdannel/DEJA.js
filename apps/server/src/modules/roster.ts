import { ServerValue } from 'firebase-admin/database'
import { FieldValue } from 'firebase-admin/firestore'
import { rtdb, db } from '@repo/firebase-config/firebase-admin-node'
import { log } from '../utils/logger.js'

const layoutId = process.env.LAYOUT_ID

// Minimal function interface — avoids Vue-specific module imports in server context
interface LocoFunction {
  id: number
  label: string
}

interface RosterEntry {
  address: number
  functions?: LocoFunction[]
  name: string
}

interface ParsedEntry {
  address: number
  functionMap: string
  name: string
}

type ImportState = 'idle' | 'waiting_list' | 'waiting_entries' | 'done'

// --- Status RTDB writes ---

async function writeRosterSyncStatus(
  status: 'syncing' | 'success' | 'error' | 'importing',
  message: string,
  importedCount = 0,
): Promise<void> {
  try {
    if (!layoutId) return
    await rtdb.ref(`rosterSync/${layoutId}`).set({
      importedCount,
      message,
      status,
      timestamp: ServerValue.TIMESTAMP,
    })
  } catch (err) {
    log.error('[ROSTER] Failed to write sync status:', err)
  }
}

// --- Response parsing ---

function stripAngleBrackets(data: string): string {
  const trimmed = data.trim()
  return trimmed.startsWith('<') && trimmed.endsWith('>') ? trimmed.slice(1, -1) : trimmed
}

/** Matches DCC-EX list response: jR [addr1 addr2 ...] (digits only, no quotes) */
const ROSTER_LIST_PATTERN = /^jR(?:\s+\d+)*\s*$/

/** Matches DCC-EX entry detail response: jR addr "name" "fnmap" */
const ROSTER_ENTRY_PATTERN = /^jR\s+(?<addr>\d+)\s+"(?<name>[^"]*)"\s+"(?<fnMap>[^"]*)"\s*$/

function parseRosterListResponse(raw: string): number[] | null {
  const data = stripAngleBrackets(raw)
  if (!ROSTER_LIST_PATTERN.test(data)) return null
  const parts = data.replace(/^jR/, '').trim().split(/\s+/).filter(Boolean)
  return parts.map(n => parseInt(n, 10)).filter(n => !Number.isNaN(n))
}

function parseRosterEntryResponse(raw: string): ParsedEntry | null {
  const data = stripAngleBrackets(raw)
  const match = ROSTER_ENTRY_PATTERN.exec(data)
  if (!match?.groups) return null
  return {
    address: parseInt(match.groups.addr, 10),
    functionMap: match.groups.fnMap,
    name: match.groups.name,
  }
}

// --- Command building ---

/**
 * Build slash-delimited function map string for DCC-EX roster entry.
 * Returns null if any function slot 0..maxId has an empty label — skip entirely.
 */
export function buildFunctionMap(functions?: LocoFunction[]): string | null {
  if (!functions || functions.length === 0) return null
  const sorted = [...functions].sort((a, b) => a.id - b.id)
  const maxId = sorted[sorted.length - 1].id
  const map = new Array<string>(maxId + 1).fill('')
  for (const fn of sorted) {
    map[fn.id] = fn.label ?? ''
  }
  if (map.some(label => !label)) return null
  return map.join('/')
}

/**
 * Build the inner DCC-EX JR write command string (no angle brackets).
 * Truncates function map if resulting command would exceed 195 chars.
 */
export function buildRosterWriteCommand(
  address: number,
  name: string,
  functions?: LocoFunction[],
): string {
  const safeName = name.replace(/"/g, '').slice(0, 40)
  const fnMap = buildFunctionMap(functions)
  if (fnMap !== null) {
    const cmd = `JR ${address} "${safeName}" "${fnMap}"`
    if (cmd.length <= 195) return cmd
    log.warn(`[ROSTER] Function map too long for loco ${address}, omitting function labels`)
  }
  return `JR ${address} "${safeName}" ""`
}

// --- Module factory ---

export function createRosterModule(
  sendCommand: (cmd: string) => Promise<void>,
  getIsConnected: () => boolean,
  addDataListener: (listener: (data: string) => void) => void,
): { sendRosterSync: (locos: RosterEntry[]) => Promise<void>; startRosterImport: () => Promise<void> } {
  let importState: ImportState = 'idle'
  let pendingAddresses: number[] = []
  let collectedEntries: ParsedEntry[] = []
  let importTimer: ReturnType<typeof setTimeout> | null = null
  let listenerRegistered = false

  async function finalizeImport(): Promise<void> {
    if (importTimer) {
      clearTimeout(importTimer)
      importTimer = null
    }
    importState = 'done'

    if (!layoutId) {
      log.error('[ROSTER] Cannot write to Firestore: no LAYOUT_ID')
      importState = 'idle'
      return
    }

    if (collectedEntries.length === 0) {
      await writeRosterSyncStatus('success', 'CommandStation roster is empty', 0)
      importState = 'idle'
      return
    }

    const results = await Promise.all(
      collectedEntries.map(async (entry) => {
        try {
          const docRef = db
            .collection('layouts')
            .doc(layoutId!)
            .collection('locos')
            .doc(entry.address.toString())
          const existing = await docRef.get()
          if (!existing.exists) {
            await docRef.set({
              address: entry.address,
              hasSound: true,
              meta: {},
              name: entry.name,
              timestamp: FieldValue.serverTimestamp(),
            })
            log.success(`[ROSTER] Imported loco ${entry.address} "${entry.name}"`)
            return 1
          }
          log.note(`[ROSTER] Skipped existing loco ${entry.address}`)
          return 0
        } catch (err) {
          log.error(`[ROSTER] Failed to write loco ${entry.address}:`, err)
          return 0
        }
      })
    )
    const importedCount = results.reduce<number>((sum, n) => sum + n, 0)

    await writeRosterSyncStatus(
      'success',
      `Imported ${importedCount} new loco(s) from CommandStation`,
      importedCount,
    )
    log.success(`[ROSTER] Import complete: ${importedCount} new loco(s)`)
    importState = 'idle'
  }

  function onSerialData(data: string): void {
    if (importState === 'idle' || importState === 'done') return

    if (importState === 'waiting_list') {
      const addresses = parseRosterListResponse(data)
      if (addresses === null) return

      if (addresses.length === 0) {
        if (importTimer) clearTimeout(importTimer)
        importTimer = null
        importState = 'idle'
        void writeRosterSyncStatus('success', 'CommandStation roster is empty', 0)
        return
      }

      pendingAddresses = [...addresses]
      collectedEntries = []
      importState = 'waiting_entries'

      for (const addr of pendingAddresses) {
        void sendCommand(`JR ${addr}`)
      }
      return
    }

    if (importState === 'waiting_entries') {
      const entry = parseRosterEntryResponse(data)
      if (!entry) return

      collectedEntries.push(entry)

      if (collectedEntries.length >= pendingAddresses.length) {
        void finalizeImport()
      }
    }
  }

  function ensureListenerRegistered(): void {
    if (!listenerRegistered) {
      addDataListener(onSerialData)
      listenerRegistered = true
    }
  }

  async function sendRosterSync(locos: RosterEntry[]): Promise<void> {
    if (!getIsConnected()) {
      await writeRosterSyncStatus('error', 'Not connected to CommandStation')
      log.warn('[ROSTER] Sync skipped: not connected to CommandStation')
      return
    }

    await writeRosterSyncStatus('syncing', `Syncing ${locos.length} loco(s) to CommandStation...`)

    await Promise.all(
      locos.map(async (loco) => {
        const cmd = buildRosterWriteCommand(loco.address, loco.name, loco.functions)
        await sendCommand(cmd)
        log.note(`[ROSTER] Sent roster entry: ${loco.address} "${loco.name}"`)
      })
    )

    // Save to EEPROM
    await sendCommand('E')
    await writeRosterSyncStatus('success', `Synced ${locos.length} loco(s) to CommandStation`)
    log.success(`[ROSTER] Sync complete: ${locos.length} locos`)
  }

  async function startRosterImport(): Promise<void> {
    if (!layoutId) {
      log.error('[ROSTER] Cannot import: no LAYOUT_ID configured')
      return
    }

    if (!getIsConnected()) {
      await writeRosterSyncStatus('error', 'Not connected to CommandStation')
      log.warn('[ROSTER] Import skipped: not connected to CommandStation')
      return
    }

    if (importState !== 'idle') {
      log.warn('[ROSTER] Import already in progress')
      return
    }

    ensureListenerRegistered()
    importState = 'waiting_list'
    pendingAddresses = []
    collectedEntries = []

    await writeRosterSyncStatus('importing', 'Importing roster from CommandStation...')

    importTimer = setTimeout(async () => {
      log.warn('[ROSTER] Import timed out')
      importState = 'idle'
      await writeRosterSyncStatus('error', 'Import timed out: no response from CommandStation')
    }, 5000)

    await sendCommand('JR')
    log.await('[ROSTER] Sent <JR> query, waiting for response...')
  }

  return { sendRosterSync, startRosterImport }
}
