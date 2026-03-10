---
"deja-cloud": patch
"@repo/auth": patch
---

Fix cloud app blank page on initial load

- Add router.beforeEach guard to await Firebase Auth initialization before route guards execute
- Add nextTick delay in requireLayout guard to allow useStorage to hydrate from localStorage
- Resolves race condition where getCurrentUser() returned null before Firebase Auth was ready
