#!/usr/bin/env bash
# scripts/install.sh
# DEJA.js Install Script
# Usage: curl -fsSL https://install.dejajs.com | bash

set -euo pipefail

DEJA_DIR="${HOME}/.deja"
DEJA_BIN="${DEJA_DIR}/bin"
SERVER_DIR="${DEJA_DIR}/server"
CONFIG_FILE="${DEJA_DIR}/config.json"
ENV_FILE="${DEJA_DIR}/.env"
MIN_NODE_VERSION=20
INSTALL_BASE_URL="https://install.dejajs.com"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

info()  { echo -e "  💬 ${BLUE}$*${NC}"; }
ok()    { echo -e "  ✅ ${GREEN}$*${NC}"; }
warn()  { echo -e "  ⚠️  ${YELLOW}$*${NC}"; }
err()   { echo -e "  ❌ ${RED}$*${NC}"; }

# ======================================================================
# Step 1: Platform detection
# ======================================================================
detect_platform() {
  info "Detecting platform..."
  OS="$(uname -s)"
  ARCH="$(uname -m)"

  case "${OS}" in
    Linux*)  PLATFORM="linux" ;;
    Darwin*) PLATFORM="macos" ;;
    *)       err "Unsupported OS: ${OS}. Windows users: install via WSL."; exit 1 ;;
  esac

  case "${ARCH}" in
    x86_64|amd64) ;; # supported
    aarch64|arm64) ;; # supported (Raspberry Pi, Apple Silicon)
    *)             err "Unsupported architecture: ${ARCH}"; exit 1 ;;
  esac

  ok "Platform: ${PLATFORM} (${ARCH})"
}

# ======================================================================
# Step 2: Check Node.js
# ======================================================================
check_node() {
  if ! command -v node &>/dev/null; then
    err "Node.js is not installed."
    echo ""
    info "Install Node.js ${MIN_NODE_VERSION}+ from: https://nodejs.org/"
    if [ "${PLATFORM}" = "linux" ]; then
      info "Or use nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash"
      info "Then: nvm install ${MIN_NODE_VERSION}"
    elif [ "${PLATFORM}" = "macos" ]; then
      info "Or with Homebrew: brew install node@${MIN_NODE_VERSION}"
    fi
    exit 1
  fi

  local node_version
  node_version=$(node --version | sed 's/v//' | cut -d. -f1)

  if [ "${node_version}" -lt "${MIN_NODE_VERSION}" ]; then
    err "Node.js ${MIN_NODE_VERSION}+ required. Found: $(node --version)"
    info "Update Node.js: https://nodejs.org/"
    exit 1
  fi

  ok "Node.js found: $(node --version)"
}

# ======================================================================
# Step 3: Account linking
# ======================================================================
link_account() {
  mkdir -p "${DEJA_DIR}"

  # Skip if valid config already exists
  if [ -f "${CONFIG_FILE}" ]; then
    local existing_uid
    existing_uid=$(grep -o '"uid"[[:space:]]*:[[:space:]]*"[^"]*"' "${CONFIG_FILE}" | sed 's/.*"uid"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' 2>/dev/null || echo "")
    if [ -n "${existing_uid}" ]; then
      ok "Existing account found (UID: ${existing_uid})"
      return
    fi
  fi

  local uid="${DEJA_UID:-}"
  local layout_id="${DEJA_LAYOUT_ID:-}"

  if [ -z "${uid}" ]; then
    echo ""
    info "Link your DEJA.js account."
    info "Find your UID and Layout ID at: https://cloud.dejajs.com → Settings → Install"
    echo ""
    read -rp "Your UID: " uid < /dev/tty
  fi

  if [ -z "${layout_id}" ]; then
    read -rp "Your Layout ID: " layout_id < /dev/tty
  fi

  if [ -z "${uid}" ] || [ -z "${layout_id}" ]; then
    err "UID and Layout ID are both required."
    exit 1
  fi

  cat > "${CONFIG_FILE}" <<JSONEOF
{
  "uid": "${uid}",
  "layoutId": "${layout_id}"
}
JSONEOF

  chmod 600 "${CONFIG_FILE}"
  ok "Account linked (UID: ${uid}, Layout: ${layout_id})"
}

# ======================================================================
# Step 4: Environment setup
# ======================================================================
setup_environment() {
  if [ -f "${ENV_FILE}" ]; then
    ok "Environment file exists (${ENV_FILE})"
    return
  fi

  local layout_id
  layout_id=$(grep -o '"layoutId"[[:space:]]*:[[:space:]]*"[^"]*"' "${CONFIG_FILE}" | sed 's/.*"layoutId"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' 2>/dev/null)

  # Firebase client config — these are public client-side keys, safe to embed.
  # Injected by CI at release time; placeholders here for development.
  local fb_api_key="__FIREBASE_API_KEY__"
  local fb_auth_domain="__FIREBASE_AUTH_DOMAIN__"
  local fb_project_id="__FIREBASE_PROJECT_ID__"
  local fb_database_url="__FIREBASE_DATABASE_URL__"
  local fb_storage_bucket="__FIREBASE_STORAGE_BUCKET__"
  local fb_messaging_id="__FIREBASE_MESSAGING_SENDER_ID__"
  local fb_app_id="__FIREBASE_APP_ID__"

  # If placeholders are still present (dev/unreleased build), prompt for them
  if [[ "${fb_api_key}" == __* ]]; then
    warn "Firebase config not embedded (development build). Prompting..."
    echo ""
    info "Enter your Firebase configuration (from https://cloud.dejajs.com → Settings → Install)"
    echo ""
    read -rp "VITE_FIREBASE_API_KEY: " fb_api_key < /dev/tty
    read -rp "VITE_FIREBASE_AUTH_DOMAIN: " fb_auth_domain < /dev/tty
    read -rp "VITE_FIREBASE_PROJECT_ID: " fb_project_id < /dev/tty
    read -rp "VITE_FIREBASE_DATABASE_URL: " fb_database_url < /dev/tty
    read -rp "VITE_FIREBASE_STORAGE_BUCKET: " fb_storage_bucket < /dev/tty
    read -rp "VITE_FIREBASE_MESSAGING_SENDER_ID: " fb_messaging_id < /dev/tty
    read -rp "VITE_FIREBASE_APP_ID: " fb_app_id < /dev/tty
  else
    ok "Firebase client config embedded"
  fi

  # Service account credentials — injected by CI at release time
  local fb_client_email="__FIREBASE_CLIENT_EMAIL__"
  local fb_private_key="__FIREBASE_PRIVATE_KEY__"

  if [[ "${fb_client_email}" == __* ]]; then
    warn "Service account not embedded (development build)."
    info "Download your service account JSON from: https://cloud.dejajs.com → Settings → Install"
    echo ""
    read -rp "Path to service account JSON file (or press Enter to skip): " sa_json_path < /dev/tty

    fb_client_email=""
    fb_private_key=""

    if [ -n "${sa_json_path}" ] && [ -f "${sa_json_path}" ]; then
      fb_client_email=$(grep -o '"client_email"[[:space:]]*:[[:space:]]*"[^"]*"' "${sa_json_path}" | sed 's/.*"client_email"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
      fb_private_key=$(grep -o '"private_key"[[:space:]]*:[[:space:]]*"[^"]*"' "${sa_json_path}" | sed 's/.*"private_key"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/')
      ok "Service account loaded from ${sa_json_path}"
    elif [ -n "${sa_json_path}" ]; then
      err "File not found: ${sa_json_path}"
      exit 1
    else
      warn "Skipping service account setup. Server features requiring admin access will not work."
      warn "You can add these later to ${ENV_FILE}"
    fi
  else
    ok "Service account config embedded"
  fi

  cat > "${ENV_FILE}" <<ENVEOF
LAYOUT_ID=${layout_id}
ENABLE_DEJACLOUD=true
ENABLE_WS=true
ENABLE_MQTT=false
ENABLE_SOUND=false
VITE_WS_PORT=8082
VITE_WS_ID=DEJA.js

VITE_FIREBASE_API_KEY=${fb_api_key}
VITE_FIREBASE_AUTH_DOMAIN=${fb_auth_domain}
VITE_FIREBASE_PROJECT_ID=${fb_project_id}
VITE_FIREBASE_DATABASE_URL=${fb_database_url}
VITE_FIREBASE_STORAGE_BUCKET=${fb_storage_bucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${fb_messaging_id}
VITE_FIREBASE_APP_ID=${fb_app_id}
FIREBASE_CLIENT_EMAIL=${fb_client_email}
FIREBASE_PRIVATE_KEY=${fb_private_key}
ENVEOF

  chmod 600 "${ENV_FILE}"
  ok "Environment file created"
}

# ======================================================================
# Step 5: Serial port detection
# ======================================================================
detect_serial() {
  if [ "${PLATFORM}" = "linux" ]; then
    if ! groups "${USER}" | grep -q dialout; then
      warn "User '${USER}' is not in the 'dialout' group. Serial access may fail."
      warn "Fix: sudo usermod -aG dialout ${USER} && logout"
    fi
  fi

  local ports=()
  for p in /dev/ttyUSB* /dev/ttyACM* /dev/ttyAMA* /dev/tty.usbmodem* /dev/tty.usbserial*; do
    [ -e "${p}" ] && ports+=("${p}")
  done

  if [ ${#ports[@]} -gt 0 ]; then
    echo ""
    info "Detected serial ports:"
    for i in "${!ports[@]}"; do
      echo "  $((i + 1)). ${ports[$i]}"
    done
    echo ""
    ok "Serial ports will be auto-detected by the server at runtime."
  else
    warn "No serial ports detected. Connect your DCC-EX CommandStation and restart the server."
  fi
}

# ======================================================================
# Step 6: Download and install server
# ======================================================================
install_server() {
  info "Fetching latest release..."

  local tarball_url="${INSTALL_BASE_URL}/releases/latest/deja-server.tar.gz"
  local tmp_dir
  tmp_dir=$(mktemp -d)

  curl -fsSL "${tarball_url}" -o "${tmp_dir}/deja-server.tar.gz" || {
    err "Failed to download server. Check your internet connection."
    rm -rf "${tmp_dir}"
    exit 1
  }

  mkdir -p "${SERVER_DIR}"
  tar -xzf "${tmp_dir}/deja-server.tar.gz" -C "${SERVER_DIR}"
  rm -rf "${tmp_dir}"

  ok "Server files extracted"

  # Read version from extracted version.txt
  local version="unknown"
  if [ -f "${SERVER_DIR}/version.txt" ]; then
    version=$(cat "${SERVER_DIR}/version.txt")
  fi

  info "Installing dependencies (this may take a minute)..."
  cd "${SERVER_DIR}" && npm install --production 2>&1 | tail -1

  INSTALLED_VERSION="${version}"
  ok "Server ${version} installed"
}

# ======================================================================
# Step 7: Install CLI
# ======================================================================
install_cli() {
  mkdir -p "${DEJA_BIN}"

  # Download the CLI from the install API
  curl -fsSL "${INSTALL_BASE_URL}/releases/latest/deja" \
    -o "${DEJA_BIN}/deja" || {
    err "Failed to download DEJA CLI."
    exit 1
  }

  chmod +x "${DEJA_BIN}/deja"

  # Add to PATH if not already present
  if ! echo "${PATH}" | grep -q "${DEJA_BIN}"; then
    local shell_rc=""
    if [ -f "${HOME}/.zshrc" ]; then
      shell_rc="${HOME}/.zshrc"
    elif [ -f "${HOME}/.bashrc" ]; then
      shell_rc="${HOME}/.bashrc"
    fi

    if [ -n "${shell_rc}" ]; then
      echo 'export PATH="${HOME}/.deja/bin:${PATH}"' >> "${shell_rc}"
      info "Added ${DEJA_BIN} to PATH in ${shell_rc}"
      info "Run: source ${shell_rc} (or open a new terminal)"
    else
      warn "Add ${DEJA_BIN} to your PATH manually."
    fi
  fi

  ok "DEJA CLI installed at ${DEJA_BIN}/deja"
}

# ======================================================================
# Step 8: Start and verify
# ======================================================================
start_and_verify() {
  export PATH="${DEJA_BIN}:${PATH}"

  info "Starting DEJA.js server..."
  "${DEJA_BIN}/deja" start

  echo ""
  echo "========================================"
  echo -e "${GREEN}  DEJA.js Server installed!${NC}"
  echo "========================================"
  echo ""
  echo "  Server:   ws://localhost:8082"
  echo "  Config:   ${DEJA_DIR}/"
  echo "  Logs:     deja logs -f"
  echo "  Status:   deja status"
  echo ""
  echo "  Next steps:"
  echo "    1. Open https://monitor.dejajs.com to verify connection"
  echo "    2. Open https://throttle.dejajs.com to drive trains"
  echo ""
}

# ======================================================================
# Main
# ======================================================================
main() {
  echo ""
  echo -e "${CYAN}"
  cat << 'LOGO'
      ____  ______     _____     _
     / __ \| ____/    / /   |   (_)____
    / / / /|  _|  _  / / /| |  / / ___/
   / /_/ / | |___| |/ / ___ | / (__  )
  /_____/  |_____|___/_/  |_|/_/____/

    ▄█████████████████████▄
    █▀▀▀█▀▀▀█▀▀▀█▀▀▀█▀▀▀██
    █▄▄▄█▄▄▄█▄▄▄█▄▄▄█▄▄▄██
    ██▀▀▀█▀▀▀█▀▀▀█▀▀▀█▀▀██
    ██▄▄▄█▄▄▄█▄▄▄█▄▄▄█▄▄██
    █▀▀▀█▀▀▀█   █▀▀▀█▀▀▀██
    █▄▄▄█▄▄▄█   █▄▄▄█▄▄▄██
    ██▀▀▀█▀▀▀   ▀▀▀█▀▀▀███
    ██▄▄▄█         █▄▄▄███
    ▀▀▀▀▀▀▄▄▄▄▄▄▄▄▀▀▀▀▀▀▀
         ▄█ ▄█ ▄█ ▄█
LOGO
  echo -e "${NC}"
  echo "  🚂 DEJA.js Installer"
  echo ""

  detect_platform
  check_node
  link_account
  setup_environment
  detect_serial
  install_server
  install_cli
  start_and_verify
}

# Parse arguments
while [ $# -gt 0 ]; do
  case "$1" in
    --uid=*)    DEJA_UID="${1#*=}" ;;
    --layout=*) DEJA_LAYOUT_ID="${1#*=}" ;;
    *) ;;
  esac
  shift
done

main
