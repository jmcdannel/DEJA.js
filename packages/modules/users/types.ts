export interface UserProfile {
  uid: string
  displayName: string
  email: string
  photoURL: string | null
  layoutIds: string[]
  createdAt: Date
  updatedAt: Date
  onboardingComplete: boolean
  approved: boolean
}
