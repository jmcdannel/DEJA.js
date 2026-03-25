// packages/modules/feedback/types.ts

// Mirrors Sentry's User type fields so Sentry.setUser(feedbackUser) works without mapping.
// 'username' (not 'name') is what the feedback widget reads by default
// (useSentryUser default: { email: 'email', name: 'username' }).
// id is optional string | number to match Sentry's User.id — Firebase uid is always string at runtime.
export interface FeedbackUser {
  email?: string
  username?: string
  id?: string | number
}
