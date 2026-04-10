export interface DeviceAuthInput {
  apiUrl: string
  pairingId: string
  sessionSecret: string
}

export interface DeviceAuthSubscription {
  status: string
  plan?: string | null
}

export interface DeviceAuthResult {
  customToken: string
  uid: string
  layoutId: string | null
  subscription: DeviceAuthSubscription
}

export type DeviceAuthErrorCode =
  | 'unauthorized'
  | 'not_found'
  | 'revoked'
  | 'subscription_required'
  | 'network'
  | 'unknown'

export class DeviceAuthError extends Error {
  code: DeviceAuthErrorCode
  status?: number

  constructor(message: string, code: DeviceAuthErrorCode, status?: number) {
    super(message)
    this.name = 'DeviceAuthError'
    this.code = code
    this.status = status
  }
}

const STATUS_CODE_MAP: Record<number, DeviceAuthErrorCode> = {
  401: 'unauthorized',
  402: 'subscription_required',
  403: 'revoked',
  404: 'not_found',
}

export async function authenticateDevice(
  input: DeviceAuthInput,
): Promise<DeviceAuthResult> {
  let res: Response
  try {
    res = await fetch(`${input.apiUrl}/api/devices/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pairingId: input.pairingId,
        sessionSecret: input.sessionSecret,
      }),
    })
  } catch (err) {
    throw new DeviceAuthError(
      `Network error: ${(err as Error).message}`,
      'network',
    )
  }

  if (!res.ok) {
    let body: { error?: string } = {}
    try {
      body = (await res.json()) as { error?: string }
    } catch {
      /* ignore */
    }
    const code = STATUS_CODE_MAP[res.status] ?? 'unknown'
    throw new DeviceAuthError(
      body.error ?? `Device auth failed (${res.status})`,
      code,
      res.status,
    )
  }

  return (await res.json()) as DeviceAuthResult
}
