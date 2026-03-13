---
"deja-serverts": patch
"billing-api": patch
---

added: **[server]** Clear stale RTDB log/command queues (`dccLog`, `dccCommands`, `dejaCommands`) on server startup to prevent replaying old commands

added: **[billing-api]** Cron-triggered `/api/cleanup-logs` endpoint that deletes RTDB log entries older than 24 hours, protected by `CRON_SECRET` bearer auth

changed: **[billing-api]** Add RTDB support to Firebase initialization for log cleanup access
