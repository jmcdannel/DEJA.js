---
"deja-cloud": patch
"deja-serverts": patch
---

added: **[cloud]** Vercel serverless `/api/cleanup-logs` endpoint — deletes RTDB log entries older than 24 hours, runs daily at 3 AM UTC via Vercel Cron

added: **[cloud]** Vercel serverless `/api/diagnostics` endpoint — returns RTDB queue sizes and timestamp ranges per layout

added: **[server]** Clear stale RTDB log/command queues (`dccLog`, `dccCommands`, `dejaCommands`) on server startup to prevent replaying old commands
