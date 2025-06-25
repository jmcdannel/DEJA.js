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
  turnoutIdx?: number
  type: string
}
