/** Entry shape as read from dccLog/{layoutId} in RTDB */
export interface DccLogEntry {
  type: 'cmd-out' | 'cmd-in' | 'info' | 'error' | 'system'
  message: string
  timestamp: number
}

/** A predefined command button configuration */
export interface CommandButtonConfig {
  id: string
  label: string
  icon: string
  /** The DCC-EX inner command string (no angle brackets) */
  payload: string
  /** Secondary payload for toggle buttons (off state) */
  payloadOff?: string
  accentColor: string
  /** 'one-shot' sends immediately, 'toggle' reads state, 'prompt' asks for input, 'confirm' shows dialog */
  mode: 'one-shot' | 'toggle' | 'prompt' | 'confirm'
  /** For prompt mode: label for the input field */
  promptLabel?: string
  /** For prompt mode: template with {value} placeholder, e.g. "t {value} 0 1" */
  promptTemplate?: string
}
