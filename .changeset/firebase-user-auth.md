---
"deja-serverts": minor
"install-api": minor
"deja-cloud": minor
"@repo/firebase-config": minor
---

added: **[auth]** Per-device user authentication replaces service-account keys 🔐

Servers now authenticate with their owner's Firebase account via `deja login` instead of requiring shared service-account credentials. New `/api/cli-auth/mint` and `/api/cli-auth/refresh` endpoints handle token lifecycle. Connected Servers card in Cloud Settings lets users manage and revoke server credentials. Firestore security rules enforce soft-revoke via `isServerRevoked()` helper.
