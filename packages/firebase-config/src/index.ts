// Re-export browser-compatible firebase configuration
export { firebaseApp, db, rtdb } from './firebase'
export { getFirebaseStorage } from './storage'

// Note: For Node.js/server usage, import directly from:
// - './firebase-node' for client-side Node.js
// Server-side admin operations should import `firebase-admin/*` directly
// (see apps/cloud/api/lib/firebase.ts for an example).
