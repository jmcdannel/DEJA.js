# 🔥 @repo/deja -- DEJA Core

The core composable for writing DEJA system commands to Firebase. This package handles system-level operations that are separate from DCC serial commands -- things like device management, port discovery, and server status.

> 📐 See [ARCHITECTURE.md](../../ARCHITECTURE.md) for how DEJA commands flow through the system.

## 📦 Installation

```typescript
import { useDejaJS } from '@repo/deja'
```

## 🔧 `useDejaJS()` Composable

Writes commands to the `dejaCommands/{layoutId}` queue in Firebase RTDB. These commands handle system-level operations that do not go to the DCC serial port:

- 🔌 Device connection and disconnection.
- 📋 Serial port listing.
- ❓ Server status queries.

The server picks up these commands from the RTDB queue via `apps/server/src/lib/deja.ts` and processes them accordingly. Unlike DCC commands (which ultimately reach the CommandStation over serial), DEJA commands stay within the server and handle infrastructure concerns.
