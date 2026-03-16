---
'deja-cloud': minor
---

feat: **[cloud]** Migrate sound API from standalone `sound-api` app into cloud app

- Added Vercel Serverless API endpoints (`api/sounds.ts`, `api/sounds/upload.ts`, `api/sounds/[pathname].ts`) with Firebase Auth verification for protected operations
- Created full CRUD UI for sound management (`/sounds` route) with list, upload, and delete functionality
- Added Sounds menu entry with `mdi-volume-high` icon
- Updated `SoundFileService` to use relative `/api` URLs instead of cross-origin `localhost:3001`
- Removed `apps/sound-api/` (Next.js app) entirely
- Removed `http://localhost:3001` CORS origins from all Vite configs
