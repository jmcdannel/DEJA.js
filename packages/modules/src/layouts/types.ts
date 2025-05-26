export interface ITag {
  id: string
  name: string
  color?: string
  icon?: string
}
export interface ILayout {
  id: string
  name: string
  description?: string
  tags?: ITag[]
  devices?: string[]
  locos?: string[]
  turnouts?: string[]
  effects?: string[]
  sensors?: string[]
  routes?: string[]
  scripts?: string[]
  meta?: Record<string, any>
  // Additional properties
  // These can be used for UI or metadata purposes
  createdAt?: Date
  updatedAt?: Date
  author?: string
  version?: string
  image?: string
  thumbnail?: string
  isPublic?: boolean
  isDefault?: boolean
  isFavorite?: boolean
  isArchived?: boolean
}