---
{}
---

added: **[cli]** `deja start` now launches an interactive terminal UI — scrolling log pane, live status bar (pid + uptime), and a command input line supporting `restart`, `stop`, and `help`. Two implementations available: `blessed` (default, ncurses-style with real scrolling) and `ink` (React-based, set `DEJA_UI=ink` to use).
