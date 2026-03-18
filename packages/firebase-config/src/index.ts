// Re-export browser-compatible firebase configuration
export { firebaseApp, db, rtdb } from './firebase'
export { getFirebaseStorage } from './storage'

// Note: For Node.js/server usage, import directly from:
// - './firebase-node' for client-side Node.js
// - './firebase-admin-node' for server-side admin operations
