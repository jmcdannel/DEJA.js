export interface ITurnout {
  id: string
  name: string
  device: string
  desc?: string
  turnoutIdx: number
  effectId?: string
  type: string
  state: boolean
  color?: string
  tags?: Array<string>
  straight?: number
  divergent?: number
  lastUpdated?: string
}
