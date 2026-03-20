# 🛠️ @repo/utils -- Common Utilities

Shared utility functions used across multiple packages in the DEJA.js monorepo. Lightweight helpers that don't belong to any specific domain.

> 📐 See [ARCHITECTURE.md](../../ARCHITECTURE.md) for the full package dependency graph.

## 📦 Usage

```typescript
import { createLogger, slugify } from '@repo/utils'
```

## 🔧 Exports

| Function | Description |
|----------|-------------|
| `createLogger(namespace)` | 📋 Creates a namespaced logger instance for consistent debug output |
| `slugify(text)` | 🔗 Converts text to a URL-friendly slug |
