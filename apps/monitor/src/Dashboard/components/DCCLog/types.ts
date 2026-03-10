

export interface DccMessage {
  key?: string
  action?: string
  color?: string
  icon?: string
}

export interface LogEntry extends DccMessage {
  id: number
  action: string
  payload: string
}

export interface DccLogState {
  log: LogEntry[]
  append: (entry: string) => void
}