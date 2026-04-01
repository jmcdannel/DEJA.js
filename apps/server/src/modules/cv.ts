import type WebSocket from 'ws'
import type { CvRequest, CvResponse, CvOperation } from '@repo/modules'
import { CV_RESPONSE_TIMEOUT_MS, CV_WS_ACTIONS } from '@repo/modules'
import { dcc } from '../lib/dcc.js'
import { serial } from '../lib/serial.js'
import { log } from '../utils/logger.js'

// --- Response parsing regex patterns ---

/** Matches: v cv value (from <R cv> read or <V cv value> verify) */
const CV_READ_RESPONSE = /^v\s+(\d+)\s+(-?\d+)$/

/** Matches: r cv value (from <W cv value> write) */
const CV_WRITE_RESPONSE = /^r\s+(\d+)\s+(-?\d+)$/

/** Matches: w address (from <W address> write address) */
const CV_WRITE_ADDRESS_RESPONSE = /^w\s+(-?\d+)$/

/** Matches: r cab (from <R> read address — same format as write but single value) */
const CV_READ_ADDRESS_RESPONSE = /^r\s+(-?\d+)$/

/** Matches: r0|0|cv bit value (from <B cv bit value> write bit) */
const CV_BIT_WRITE_RESPONSE = /^r(\d+)\|(\d+)\|(\d+)\s+(\d+)\s+(-?\d+)$/

// --- Pending request tracking ---

interface PendingCvRequest {
  requestId: string
  operation: CvOperation
  ws: WebSocket
  timer: ReturnType<typeof setTimeout>
}

/** Only one service track CV operation at a time (DCC-EX limitation) */
let pendingRequest: PendingCvRequest | null = null

/** Whether the CV data listener has been registered */
let listenerRegistered = false

// --- Response parsing ---

function stripAngleBrackets(data: string): string {
  const trimmed = data.trim()
  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function parseCvResponse(raw: string, operation: CvOperation): CvResponse | null {
  const data = stripAngleBrackets(raw)

  // Read CV response: <v cv value>
  const readMatch = data.match(CV_READ_RESPONSE)
  if (readMatch && (operation === 'read' || operation === 'verify')) {
    const cv = parseInt(readMatch[1], 10)
    const value = parseInt(readMatch[2], 10)
    return {
      requestId: '',
      success: value !== -1,
      cv,
      value: value === -1 ? undefined : value,
      error: value === -1 ? 'No ACK from decoder' : undefined,
    }
  }

  // Write address response: <w address>
  const writeAddrMatch = data.match(CV_WRITE_ADDRESS_RESPONSE)
  if (writeAddrMatch && operation === 'write-address') {
    const address = parseInt(writeAddrMatch[1], 10)
    return {
      requestId: '',
      success: address !== -1,
      address: address === -1 ? undefined : address,
      error: address === -1 ? 'No ACK from decoder' : undefined,
    }
  }

  // Bit write response: <r0|0|cv bit value>
  const bitMatch = data.match(CV_BIT_WRITE_RESPONSE)
  if (bitMatch && operation === 'write-bit') {
    const cv = parseInt(bitMatch[3], 10)
    const bit = parseInt(bitMatch[4], 10)
    const value = parseInt(bitMatch[5], 10)
    return {
      requestId: '',
      success: value !== -1,
      cv,
      bit,
      value: value === -1 ? undefined : value,
      error: value === -1 ? 'No ACK from decoder' : undefined,
    }
  }

  // Write CV response: <r cv value>
  const writeMatch = data.match(CV_WRITE_RESPONSE)
  if (writeMatch && operation === 'write') {
    const cv = parseInt(writeMatch[1], 10)
    const value = parseInt(writeMatch[2], 10)
    return {
      requestId: '',
      success: value !== -1,
      cv,
      value: value === -1 ? undefined : value,
      error: value === -1 ? 'No ACK from decoder' : undefined,
    }
  }

  // Read address response: <r cab>
  const readAddrMatch = data.match(CV_READ_ADDRESS_RESPONSE)
  if (readAddrMatch && operation === 'read-address') {
    const address = parseInt(readAddrMatch[1], 10)
    return {
      requestId: '',
      success: address !== -1,
      address: address === -1 ? undefined : address,
      error: address === -1 ? 'No ACK from decoder' : undefined,
    }
  }

  return null
}

// --- Command building ---

function buildDccCommand(request: CvRequest): string | null {
  const { mode, operation, cv, value, bit, address } = request

  if (mode === 'service') {
    switch (operation) {
      case 'read':
        if (cv === undefined) return null
        return `R ${cv}`
      case 'write':
        if (cv === undefined || value === undefined) return null
        return `W ${cv} ${value}`
      case 'write-bit':
        if (cv === undefined || bit === undefined || value === undefined) return null
        return `B ${cv} ${bit} ${value}`
      case 'verify':
        if (cv === undefined || value === undefined) return null
        return `V ${cv} ${value}`
      case 'read-address':
        return 'R'
      case 'write-address':
        if (address === undefined) return null
        return `W ${address}`
      default:
        return null
    }
  }

  if (mode === 'pom') {
    if (address === undefined) return null
    switch (operation) {
      case 'write':
        if (cv === undefined || value === undefined) return null
        return `w ${address} ${cv} ${value}`
      case 'write-bit':
        if (cv === undefined || bit === undefined || value === undefined) return null
        return `b ${address} ${cv} ${bit} ${value}`
      default:
        return null
    }
  }

  return null
}

// --- Serial data listener ---

function onSerialData(data: string): void {
  if (!pendingRequest) return

  const response = parseCvResponse(data, pendingRequest.operation)
  if (!response) return

  response.requestId = pendingRequest.requestId
  resolvePendingRequest(response)
}

function ensureListenerRegistered(): void {
  if (!listenerRegistered) {
    serial.addDataListener(onSerialData)
    listenerRegistered = true
  }
}

// --- Request lifecycle ---

function resolvePendingRequest(response: CvResponse): void {
  if (!pendingRequest) return

  const { ws, timer } = pendingRequest
  clearTimeout(timer)
  pendingRequest = null

  try {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({
        action: CV_WS_ACTIONS.RESPONSE,
        payload: response,
      }))
    }
  } catch (err) {
    log.error('[CV] Error sending response to client:', err)
  }
}

function timeoutPendingRequest(): void {
  if (!pendingRequest) return

  const response: CvResponse = {
    requestId: pendingRequest.requestId,
    success: false,
    error: 'Timeout: no response from command station',
  }
  resolvePendingRequest(response)
}

// --- Public API ---

export function handleCvRequest(ws: WebSocket, request: CvRequest): void {
  ensureListenerRegistered()

  log.note('[CV] Request received:', request.operation, request.cv, request.value)

  // Validate request
  if (!request.requestId) {
    ws.send(JSON.stringify({
      action: CV_WS_ACTIONS.RESPONSE,
      payload: { requestId: '', success: false, error: 'Missing requestId' },
    }))
    return
  }

  // Check for unsupported operations
  if (request.mode === 'pom' && (request.operation === 'read' || request.operation === 'verify' || request.operation === 'read-address')) {
    ws.send(JSON.stringify({
      action: CV_WS_ACTIONS.RESPONSE,
      payload: { requestId: request.requestId, success: false, error: 'Read operations not supported on main track (POM)' },
    }))
    return
  }

  // Reject if a service track operation is already in progress
  if (pendingRequest && request.mode === 'service') {
    ws.send(JSON.stringify({
      action: CV_WS_ACTIONS.RESPONSE,
      payload: { requestId: request.requestId, success: false, error: 'Another CV operation is in progress' },
    }))
    return
  }

  // Build the DCC-EX command
  const command = buildDccCommand(request)
  if (!command) {
    ws.send(JSON.stringify({
      action: CV_WS_ACTIONS.RESPONSE,
      payload: { requestId: request.requestId, success: false, error: 'Invalid CV command parameters' },
    }))
    return
  }

  // For POM writes, send command and respond immediately (no ACK expected)
  if (request.mode === 'pom') {
    dcc.broadcastToAll(command)
    ws.send(JSON.stringify({
      action: CV_WS_ACTIONS.RESPONSE,
      payload: {
        requestId: request.requestId,
        success: true,
        cv: request.cv,
        value: request.value,
      },
    }))
    log.success('[CV] POM command sent:', command)
    return
  }

  // For service track operations, track the pending request
  const timer = setTimeout(timeoutPendingRequest, CV_RESPONSE_TIMEOUT_MS)
  pendingRequest = {
    requestId: request.requestId,
    operation: request.operation,
    ws,
    timer,
  }

  // Send the command
  dcc.broadcastToAll(command)
  log.await('[CV] Service track command sent, awaiting response:', command)
}
