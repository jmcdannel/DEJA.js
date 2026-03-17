// packages/modules/feedback/config.ts

// useSentryUser defaults to { email: 'email', name: 'username' }.
// FeedbackUser maps Firebase displayName → User.username, so the name field pre-fills automatically.
// No useSentryUser override needed.
export const feedbackConfig = {
  colorScheme: 'dark' as const,
  showBranding: false,
  triggerLabel: 'Feedback',
  submitButtonLabel: 'Submit',
  formTitle: 'Share Feedback',
  messagePlaceholder: 'Describe what you were doing and what went wrong...',
}
