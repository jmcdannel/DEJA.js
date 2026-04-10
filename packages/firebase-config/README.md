# 🗄️ @repo/firebase-config -- Firebase Initialization

Exports configured Firebase instances for both browser and server use. This package centralizes Firebase SDK initialization so that all apps and packages share the same configured instances.

> 📐 See [ARCHITECTURE.md](../../ARCHITECTURE.md) for how Firebase fits into the communication layers.

## 📦 Usage

### 🌐 Browser Client

```typescript
import { db, rtdb } from '@repo/firebase-config'
```

### ⚙️ Server (Node.js Admin SDK)

For privileged server-side access (Vercel Functions, operator scripts),
import directly from `firebase-admin/*`:

```typescript
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
```

See `apps/cloud/api/lib/firebase.ts` for a reference implementation.

## 📤 Exports

| Export | Description |
|--------|-------------|
| `db` | 🗃️ Firestore database instance |
| `rtdb` | ⚡ Realtime Database instance |
