export type TurnoutType = 'kato' | 'servo' | 'tortise' | 'dcc'

export interface Turnout {
  color?: string
  desc?: string
  device: string
  divergent?: number
  effectId?: string
  id: string
  lastUpdated?: string
  name: string
  order?: number
  state: boolean
  straight?: number
  tags?: Array<string>
  timestamp?: number
  turnoutIdx?: number
  type: TurnoutType
}

export interface KatoCommand {
  action: string
  device: string
  payload: {
    state?: boolean
    turnout?: number
  }
}

export interface ServoCommand {
  action: string
  device: string
  payload: {
    current?: number
    servo: number
    value?: number
  }
}
