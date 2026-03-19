# 🔐 @repo/auth -- Authentication

Firebase Auth integration with Vue Router guards and authentication UI components. This package provides the security layer for all DEJA.js frontend apps, handling user authentication, route protection, and onboarding flows.

> 📐 See [ARCHITECTURE.md](../../ARCHITECTURE.md) for how auth fits into the frontend stack.

## 📦 Installation

```typescript
import { requireAuth, requireLayout, Login } from '@repo/auth'
```

## 🛡️ Route Guards

| Guard | Description |
|-------|-------------|
| `requireAuth` | 🔒 Redirects to login if the user is not authenticated |
| `requireDccEx` | ⚡ Ensures a DCC-EX connection is available |
| `requireLayout` | 🗺️ Requires a layout to be selected |
| `requireApproval` | ✅ Checks that the user's account is approved |
| `requireOnboarding` | 📋 Redirects to onboarding if not completed |
| `redirectIfAuthenticated` | ↩️ Redirects away from login if already authenticated |

## 🧩 Components

| Component | Description |
|-----------|-------------|
| `Login` | 🔑 Firebase authentication login form |
| `Signup` | 📝 Account registration form |
| `ForgotPassword` | 🔓 Password reset form |
| `Signout` | 🚪 Sign out button |
