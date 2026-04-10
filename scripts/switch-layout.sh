#!/usr/bin/env bash
# scripts/switch-layout.sh — Switch the active LAYOUT_ID across all .env files
# Usage:
#   pnpm layout <id>        Set layout ID
#   pnpm layout              Show current layout ID
#   pnpm layout --list       List known layout IDs from Firebase
#
# Future: integrate into `deja layout` CLI command

set -euo pipefail

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

ICON_TRAIN="🚂"
ICON_CHECK="✔"
ICON_ARROW="→"
ICON_WARN="▲"

info()  { echo -e "  ${CYAN}${ICON_ARROW}${NC} $*"; }
ok()    { echo -e "  ${GREEN}${ICON_CHECK}${NC} $*"; }
warn()  { echo -e "  ${YELLOW}${ICON_WARN}${NC} $*"; }

# --- Resolve repo root ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ROOT_ENV="${REPO_ROOT}/.env"

# --- Read current LAYOUT_ID ---
get_current() {
  if [ -f "${ROOT_ENV}" ]; then
    grep '^LAYOUT_ID=' "${ROOT_ENV}" 2>/dev/null | cut -d'=' -f2
  else
    echo ""
  fi
}

# --- Update LAYOUT_ID in a single .env file ---
update_env_file() {
  local file="$1"
  local new_id="$2"

  if [ ! -f "${file}" ]; then
    return
  fi

  if grep -q '^LAYOUT_ID=' "${file}" 2>/dev/null; then
    # Replace existing LAYOUT_ID line (macOS + Linux compatible sed)
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s/^LAYOUT_ID=.*/LAYOUT_ID=${new_id}/" "${file}"
    else
      sed -i "s/^LAYOUT_ID=.*/LAYOUT_ID=${new_id}/" "${file}"
    fi
    local rel="${file#"${REPO_ROOT}/"}"
    ok "${rel}"
  fi
}

# --- List known layouts from Firebase ---
cmd_list() {
  echo ""
  echo -e "  ${BOLD}${ICON_TRAIN} Known Layouts${NC}"
  echo -e "  ${DIM}──────────────────────────────${NC}"

  local current
  current=$(get_current)

  # Query Firebase for layout IDs using the admin SDK + service account from .env
  node --input-type=module -e "
    import { initializeApp, cert } from 'firebase-admin/app';
    import { getFirestore } from 'firebase-admin/firestore';
    import { config } from 'dotenv';
    config({ path: '${ROOT_ENV}' });

    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\\n/g, '\n');

    if (!projectId) { console.error('  ✖ VITE_FIREBASE_PROJECT_ID not set in .env'); process.exit(1); }
    if (!clientEmail || !privateKey) { console.error('  ✖ FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY not set in .env'); process.exit(1); }

    try {
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        projectId,
      });
    } catch { /* already initialized */ }

    const db = getFirestore();
    const snap = await db.collection('layouts').get();
    const ids = snap.docs.map(d => d.id).sort();

    if (ids.length === 0) {
      console.log('  (no layouts found)');
    } else {
      for (const id of ids) {
        const marker = id === '${current}' ? '\x1b[32m● \x1b[0m' : '  ';
        console.log(marker + id);
      }
    }
  " 2>&1 || warn "Could not fetch layouts from Firebase. Check your credentials."

  echo ""
}

# --- Show current ---
cmd_show() {
  local current
  current=$(get_current)

  # Also check ~/.deja/config.json
  local deja_config="${HOME}/.deja/config.json"
  local config_id=""
  if [ -f "${deja_config}" ]; then
    config_id=$(node -e "try { console.log(JSON.parse(require('fs').readFileSync('${deja_config}','utf8')).layoutId || '') } catch { console.log('') }")
  fi

  echo ""
  if [ -n "${current}" ]; then
    echo -e "  ${BOLD}${ICON_TRAIN} Current layout:${NC} ${GREEN}${current}${NC}"
    if [ -n "${config_id}" ] && [ "${config_id}" != "${current}" ]; then
      warn "~/.deja/config.json has ${BOLD}${config_id}${NC} ${DIM}(takes priority over .env for server)${NC}"
    fi
  else
    warn "No LAYOUT_ID set in ${ROOT_ENV}"
  fi
  echo ""
  echo -e "  ${DIM}Usage: pnpm layout <id>      Switch layout${NC}"
  echo -e "  ${DIM}       pnpm layout --list    List known layouts${NC}"
  echo ""
}

# --- Switch layout ---
cmd_switch() {
  local new_id="$1"
  local current
  current=$(get_current)

  if [ "${current}" = "${new_id}" ]; then
    echo ""
    ok "Already on layout ${BOLD}${new_id}${NC}"
    echo ""
    return 0
  fi

  echo ""
  if [ -n "${current}" ]; then
    echo -e "  ${ICON_TRAIN} Switching layout: ${DIM}${current}${NC} ${ICON_ARROW} ${GREEN}${BOLD}${new_id}${NC}"
  else
    echo -e "  ${ICON_TRAIN} Setting layout: ${GREEN}${BOLD}${new_id}${NC}"
  fi
  echo ""

  # Update root .env
  update_env_file "${ROOT_ENV}" "${new_id}"

  # Update all app .env files that contain LAYOUT_ID
  for app_dir in "${REPO_ROOT}"/apps/*/; do
    update_env_file "${app_dir}.env" "${new_id}"
    update_env_file "${app_dir}.env.local" "${new_id}"
  done

  # Update package .env files (e.g., firebase-config, dccex)
  for pkg_dir in "${REPO_ROOT}"/packages/*/; do
    update_env_file "${pkg_dir}.env" "${new_id}"
  done

  # Update ~/.deja/config.json (server reads this first, before .env)
  local deja_config="${HOME}/.deja/config.json"
  if [ -f "${deja_config}" ]; then
    node -e "
      const fs = require('fs');
      const cfg = JSON.parse(fs.readFileSync('${deja_config}', 'utf8'));
      cfg.layoutId = '${new_id}';
      fs.writeFileSync('${deja_config}', JSON.stringify(cfg, null, 2) + '\n');
    "
    ok "~/.deja/config.json"
  fi

  echo ""
  warn "Restart dev servers for the change to take effect ${DIM}(Vite doesn't hot-reload env vars)${NC}"
  echo ""
}

# --- Main ---
case "${1:-}" in
  --list|-l|list)
    cmd_list
    ;;
  --help|-h|help)
    echo ""
    echo -e "  ${BOLD}${ICON_TRAIN} DEJA.js Layout Switcher${NC}"
    echo ""
    echo -e "  ${DIM}Usage:${NC} pnpm layout ${CYAN}<layout-id>${NC}"
    echo ""
    echo -e "  ${BOLD}Commands${NC}"
    echo -e "    ${CYAN}<layout-id>${NC}    Switch to the specified layout"
    echo -e "    ${DIM}--list, -l${NC}     List known layouts from Firebase"
    echo -e "    ${DIM}--help, -h${NC}     Show this help"
    echo ""
    echo -e "  ${BOLD}Examples${NC}"
    echo -e "    pnpm layout qs-passing"
    echo -e "    pnpm layout demo"
    echo -e "    pnpm layout betatrack"
    echo -e "    pnpm layout --list"
    echo ""
    ;;
  "")
    cmd_show
    ;;
  *)
    cmd_switch "$1"
    ;;
esac
