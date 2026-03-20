import { ref, computed, watch, onUnmounted } from 'vue'
import { useWebSocket, useStorage } from '@vueuse/core'
import type {
  CvProgrammingMode,
  CvResponse,
  CvLogEntry,
  CvOperationStatus,
  CvOperation,
} from '@repo/modules'
import {
  CV_RESPONSE_TIMEOUT_MS,
  CV_WS_ACTIONS,
  CV_LOG_MAX_ENTRIES,
  CV_BATCH_READ_DELAY_MS,
  COMMON_CVS,
} from '@repo/modules'
import { createLogger } from '@repo/utils'
import { decodeCv29, encodeCv29, longAddressToCv17Cv18, cv17Cv18ToLongAddress } from './cvHelpers'

const log = createLogger('CvProgrammer')

function getDefaultWsHost(): string {
  if (typeof window === 'undefined') return 'localhost:8082'
  return window.location.host || 'localhost:8082'
}

function resolveWsUrl(host: string | undefined): string | undefined {
  if (!host) return undefined
  const trimmed = host.trim()
  if (!trimmed) return undefined
  if (trimmed.startsWith('ws://') || trimmed.startsWith('wss://')) return trimmed
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
    return `${protocol}${trimmed}`
  }
  return `ws://${trimmed}`
}

interface PendingPromise {
  resolve: (response: CvResponse) => void
  reject: (error: Error) => void
  timer: ReturnType<typeof setTimeout>
}

export function useCvProgrammer() {
  // --- State ---
  const mode = ref<CvProgrammingMode>('service')
  const pomAddress = ref(3)
  const isBusy = ref(false)
  const operationStatus = ref<CvOperationStatus>('idle')
  const lastResponse = ref<CvResponse | null>(null)
  const cvLog = ref<CvLogEntry[]>([])
  const batchProgress = ref(0)
  const batchTotal = ref(0)

  // --- Pending promises for request-response correlation ---
  const pendingRequests = new Map<string, PendingPromise>()

  // --- WebSocket connection ---
  const wshost = useStorage('@DEJA/pref/ws-host', getDefaultWsHost())
  const wsUrl = computed(() => resolveWsUrl(wshost.value))

  const { data, status, send: wsSend, close } = useWebSocket(wsUrl, {
    autoReconnect: { delay: 1000, retries: 10 },
  })

  const isConnected = computed(() => status.value === 'OPEN')

  // --- Watch for incoming CV responses ---
  watch(data, (newData) => {
    if (!newData) return
    try {
      const message = JSON.parse(newData)
      if (message.action === CV_WS_ACTIONS.RESPONSE && message.payload) {
        handleCvResponse(message.payload as CvResponse)
      }
    } catch {
      // Not a JSON message or not a CV response — ignore
    }
  })

  function handleCvResponse(response: CvResponse): void {
    const pending = pendingRequests.get(response.requestId)
    if (!pending) return

    clearTimeout(pending.timer)
    pendingRequests.delete(response.requestId)

    isBusy.value = pendingRequests.size > 0
    operationStatus.value = response.success ? 'success' : 'error'
    lastResponse.value = response

    log.debug('[CV] Response received:', response)
    pending.resolve(response)
  }

  // --- Send a CV request and await response ---
  function sendCvRequest(
    operation: CvOperation,
    options: { cv?: number; value?: number; bit?: number; address?: number } = {},
  ): Promise<CvResponse> {
    return new Promise((resolve, reject) => {
      if (status.value !== 'OPEN') {
        const error = 'WebSocket not connected'
        operationStatus.value = 'error'
        reject(new Error(error))
        return
      }

      const requestId = crypto.randomUUID()
      isBusy.value = true
      operationStatus.value = 'pending'

      const timer = setTimeout(() => {
        pendingRequests.delete(requestId)
        isBusy.value = pendingRequests.size > 0
        operationStatus.value = 'timeout'
        const response: CvResponse = {
          requestId,
          success: false,
          error: 'Timeout: no response from command station',
        }
        lastResponse.value = response
        addLogEntry(operation, options, 'timeout', response.error)
        resolve(response)
      }, CV_RESPONSE_TIMEOUT_MS)

      pendingRequests.set(requestId, { resolve: (resp) => {
        addLogEntry(operation, options, resp.success ? 'success' : 'error', resp.error)
        resolve(resp)
      }, reject, timer })

      const request = {
        requestId,
        mode: mode.value,
        operation,
        ...options,
        ...(mode.value === 'pom' ? { address: pomAddress.value } : {}),
      }

      wsSend(JSON.stringify({
        action: CV_WS_ACTIONS.REQUEST,
        payload: request,
      }))

      log.debug('[CV] Request sent:', request)
    })
  }

  // --- Log management ---
  function addLogEntry(
    operation: CvOperation,
    options: { cv?: number; value?: number; bit?: number; address?: number },
    logStatus: CvOperationStatus,
    error?: string,
  ): void {
    const entry: CvLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      operation,
      mode: mode.value,
      cv: options.cv,
      value: options.value,
      bit: options.bit,
      address: mode.value === 'pom' ? pomAddress.value : options.address,
      status: logStatus,
      error,
    }
    cvLog.value.unshift(entry)
    if (cvLog.value.length > CV_LOG_MAX_ENTRIES) {
      cvLog.value = cvLog.value.slice(0, CV_LOG_MAX_ENTRIES)
    }
  }

  function clearLog(): void {
    cvLog.value = []
  }

  // --- Public CV operations ---

  async function readCv(cv: number): Promise<CvResponse> {
    return sendCvRequest('read', { cv })
  }

  async function writeCv(cv: number, value: number): Promise<CvResponse> {
    return sendCvRequest('write', { cv, value })
  }

  async function writeCvBit(cv: number, bit: number, value: 0 | 1): Promise<CvResponse> {
    return sendCvRequest('write-bit', { cv, bit, value })
  }

  async function readAddress(): Promise<CvResponse> {
    return sendCvRequest('read-address')
  }

  async function writeAddress(address: number): Promise<CvResponse> {
    return sendCvRequest('write-address', { address })
  }

  async function verifyCv(cv: number, expectedValue: number): Promise<CvResponse> {
    return sendCvRequest('verify', { cv, value: expectedValue })
  }

  async function factoryReset(): Promise<CvResponse> {
    return writeCv(8, 8)
  }

  async function batchReadCommonCvs(): Promise<Map<number, CvResponse>> {
    const results = new Map<number, CvResponse>()
    batchProgress.value = 0
    batchTotal.value = COMMON_CVS.length

    for (const cvDef of COMMON_CVS) {
      const response = await readCv(cvDef.cv)
      results.set(cvDef.cv, response)
      batchProgress.value++
      // Small delay between reads to give DCC-EX time to reset
      await new Promise<void>((r) => { setTimeout(r, CV_BATCH_READ_DELAY_MS) })
    }

    batchProgress.value = 0
    batchTotal.value = 0
    return results
  }

  // --- Cleanup ---
  onUnmounted(() => {
    for (const [, pending] of pendingRequests) {
      clearTimeout(pending.timer)
    }
    pendingRequests.clear()
    if (status.value === 'OPEN') {
      close()
    }
  })

  return {
    // State
    mode,
    pomAddress,
    isConnected,
    isBusy,
    operationStatus,
    lastResponse,
    cvLog,
    batchProgress,
    batchTotal,

    // Operations
    readCv,
    writeCv,
    writeCvBit,
    readAddress,
    writeAddress,
    verifyCv,
    factoryReset,
    batchReadCommonCvs,
    clearLog,

    // Helpers (re-exported for convenience)
    decodeCv29,
    encodeCv29,
    longAddressToCv17Cv18,
    cv17Cv18ToLongAddress,
  }
}

export default useCvProgrammer
