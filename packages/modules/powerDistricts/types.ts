export interface PowerDistrict {
  id: string
  name: string
  deviceId: string
  output: string
  color?: string
}

export type PowerDistrictInput = Omit<PowerDistrict, 'id'>
