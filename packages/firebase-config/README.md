# 🗄️ @repo/firebase-config -- Firebase Initialization

Exports configured Firebase instances for both browser and server use. This package centralizes Firebase SDK initialization so that all apps and packages share the same configured instances.

> 📐 See [ARCHITECTURE.md](../../ARCHITECTURE.md) for how Firebase fits into the communication layers.

## 📦 Usage

### 🌐 Browser Client

```typescript
import { db, rtdb } from '@repo/firebase-config'
```

### ⚙️ Server (Node.js with Admin SDK)

```typescript
import { db, rtdb } from '@repo/firebase-config/firebase-admin-node'
```

## 📤 Exports

| Export | Description |
|--------|-------------|
| `db` | 🗃️ Firestore database instance |
| `rtdb` | ⚡ Realtime Database instance |
