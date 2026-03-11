/** CV programming track mode */
export type CvProgrammingMode = 'service' | 'pom'

/** CV operation types */
export type CvOperation =
  | 'read'
  | 'write'
  | 'write-bit'
  | 'verify'
  | 'read-address'
  | 'write-address'

/** A CV command sent from client to server via WebSocket */
export interface CvRequest {
  requestId: string
  mode: CvProgrammingMode
  operation: CvOperation
  cv?: number
  value?: number
  bit?: number
  address?: number // loco DCC address (required for POM)
}

/** A CV response sent from server to client via WebSocket */
export interface CvResponse {
  requestId: string
  success: boolean
  cv?: number
  value?: number
  bit?: number
  address?: number
  error?: string
}

/** WebSocket message envelope for CV operations */
export interface CvWebSocketMessage {
  action: 'cv-request' | 'cv-response'
  payload: CvRequest | CvResponse
}

/** Standard NMRA CV definition for UI reference table */
export interface CvDefinition {
  cv: number
  name: string
  description: string
  min: number
  max: number
  defaultValue?: number
  readOnly?: boolean
}

/** CV29 configuration bit breakdown */
export interface Cv29Flags {
  direction: boolean // bit 0: normal(0) / reverse(1)
  speedSteps28: boolean // bit 1: 14-step(0) / 28-step(1)
  analogConversion: boolean // bit 2: analog conversion enable
  railcomEnabled: boolean // bit 3: RailCom enable
  speedTable: boolean // bit 4: use speed table (CV67-94)
  longAddress: boolean // bit 5: short(0) / long(1) address
}

/** State of a CV read/write operation in the UI */
export type CvOperationStatus = 'idle' | 'pending' | 'success' | 'error' | 'timeout'

/** A single entry in the CV programming history/log */
export interface CvLogEntry {
  id: string
  timestamp: string
  operation: CvOperation
  mode: CvProgrammingMode
  cv?: number
  value?: number
  bit?: number
  address?: number
  status: CvOperationStatus
  error?: string
}
