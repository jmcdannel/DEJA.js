import { FieldValue } from 'firebase-admin/firestore'
import { db } from '@repo/firebase-config/firebase-user-node'
import {
  buildTrackConfigCommand,
  buildQueryTracksCommand,
  isValidCabAddress,
  requiresCabAddress,
  type TrackOutput,
} from '@repo/dccex'
import { log } from '../utils/logger.js'
import { dcc } from '../lib/dcc.js'

const layoutId = process.env.LAYOUT_ID

/**
 * Configure track outputs for a device on connect.
 * Reads device.trackOutputs from Firestore, sends DCC-EX track config
 * commands, then queries tracks for best-effort verification.
 */
export async function configureDevice(deviceId: string): Promise<void> {
  if (!layoutId) {
    log.error('[TrackOutputs] No LAYOUT_ID configured')
    return
  }

  try {
    const deviceDoc = await db
      .collection(`layouts/${layoutId}/devices`)
      .doc(deviceId)
      .get()

    if (!deviceDoc.exists) {
      log.warn(`[TrackOutputs] Device ${deviceId} not found in Firestore`)
      return
    }

    const deviceData = deviceDoc.data()
    const trackOutputs = deviceData?.trackOutputs as Record<string, TrackOutput> | undefined

    if (!trackOutputs || Object.keys(trackOutputs).length === 0) {
      log.note(`[TrackOutputs] No track outputs configured for device ${deviceId}, using defaults`)
      return
    }

    // Determine if this is Device 1 (first by document ID)
    const allDevices = await db
      .collection(`layouts/${layoutId}/devices`)
      .where('type', '==', 'dcc-ex')
      .orderBy('__name__')
      .limit(1)
      .get()
    const isDevice1 = !allDevices.empty && allDevices.docs[0].id === deviceId

    for (const [output, config] of Object.entries(trackOutputs)) {
      // PROG restriction: only Device 1 Output B
      if (config.mode === 'PROG' && !(isDevice1 && output === 'B')) {
        log.warn(
          `[TrackOutputs] Skipping PROG on device ${deviceId} output ${output} — only allowed on Device 1 output B`,
        )
        continue
      }

      // DC/DCX requires valid cabAddress
      if (requiresCabAddress(config.mode)) {
        if (!config.cabAddress || !isValidCabAddress(config.cabAddress)) {
          log.warn(
            `[TrackOutputs] Skipping ${config.mode} on device ${deviceId} output ${output} — invalid cabAddress: ${config.cabAddress}`,
          )
          continue
        }
      }

      const cmd = buildTrackConfigCommand(
        output as import('@repo/dccex').TrackOutputLetter,
        config.mode,
        config.cabAddress,
      )
      await dcc.sendToDevice(deviceId, cmd)
      log.note(`[TrackOutputs] Configured device ${deviceId} output ${output}: ${config.mode}`)
    }

    // Query track config for best-effort verification
    await dcc.sendToDevice(deviceId, buildQueryTracksCommand())

    // Create auto-locos for DC/DCX outputs
    await createDcLocos(deviceId, trackOutputs)

    log.success(`[TrackOutputs] Device ${deviceId} track configuration complete`)
  } catch (err) {
    log.error(`[TrackOutputs] Error configuring device ${deviceId}:`, err)
  }
}

/**
 * Create loco roster entries for DC/DCX track outputs.
 * Only creates if a loco with that address doesn't already exist.
 */
async function createDcLocos(
  deviceId: string,
  trackOutputs: Record<string, TrackOutput>,
): Promise<void> {
  if (!layoutId) return

  for (const [output, config] of Object.entries(trackOutputs)) {
    if (!requiresCabAddress(config.mode) || !config.cabAddress) continue
    if (!isValidCabAddress(config.cabAddress)) continue

    try {
      const locoRef = db
        .collection(`layouts/${layoutId}/locos`)
        .doc(config.cabAddress.toString())
      const existing = await locoRef.get()

      if (!existing.exists) {
        await locoRef.set({
          address: config.cabAddress,
          name: `DC Track ${output}`,
          isDcTrack: true,
          timestamp: FieldValue.serverTimestamp(),
        })
        log.success(
          `[TrackOutputs] Created DC loco for device ${deviceId} output ${output}: address ${config.cabAddress}`,
        )
      }
    } catch (err) {
      log.error(
        `[TrackOutputs] Error creating DC loco for output ${output}:`,
        err,
      )
    }
  }
}

/**
 * Set all trackOutputs power states to null (unknown) when a device disconnects.
 */
export async function clearDevicePowerState(deviceId: string): Promise<void> {
  if (!layoutId) return

  try {
    const deviceDoc = await db
      .collection(`layouts/${layoutId}/devices`)
      .doc(deviceId)
      .get()

    if (!deviceDoc.exists) return

    const trackOutputs = deviceDoc.data()?.trackOutputs as Record<string, TrackOutput> | undefined
    if (!trackOutputs) return

    const updates: Record<string, unknown> = {}
    for (const output of Object.keys(trackOutputs)) {
      updates[`trackOutputs.${output}.power`] = null
    }

    await db
      .collection(`layouts/${layoutId}/devices`)
      .doc(deviceId)
      .update(updates)

    log.note(`[TrackOutputs] Cleared power states for disconnected device ${deviceId}`)
  } catch (err) {
    log.error(`[TrackOutputs] Error clearing power state for device ${deviceId}:`, err)
  }
}

/**
 * Write per-output power state to Firestore for a specific device.
 */
export async function writeOutputPowerState(
  deviceId: string,
  output: string,
  power: boolean,
): Promise<void> {
  if (!layoutId) return

  try {
    await db
      .collection(`layouts/${layoutId}/devices`)
      .doc(deviceId)
      .update({
        [`trackOutputs.${output}.power`]: power,
      })
  } catch (err) {
    log.error(
      `[TrackOutputs] Error writing power state for device ${deviceId} output ${output}:`,
      err,
    )
  }
}

/**
 * Set all outputs on a device to the given power state.
 * Used when a global power response (<p1> / <p0>) is received from a device.
 */
export async function writeAllOutputsPowerState(
  deviceId: string,
  power: boolean,
): Promise<void> {
  if (!layoutId) return

  try {
    const deviceDoc = await db
      .collection(`layouts/${layoutId}/devices`)
      .doc(deviceId)
      .get()

    if (!deviceDoc.exists) return

    const trackOutputs = deviceDoc.data()?.trackOutputs as Record<string, TrackOutput> | undefined
    if (!trackOutputs) return

    const updates: Record<string, unknown> = {}
    for (const output of Object.keys(trackOutputs)) {
      updates[`trackOutputs.${output}.power`] = power
    }

    await db
      .collection(`layouts/${layoutId}/devices`)
      .doc(deviceId)
      .update(updates)
  } catch (err) {
    log.error(
      `[TrackOutputs] Error writing all outputs power for device ${deviceId}:`,
      err,
    )
  }
}

export default {
  clearDevicePowerState,
  configureDevice,
  writeAllOutputsPowerState,
  writeOutputPowerState,
}
