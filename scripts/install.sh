#!/usr/bin/env bash
# scripts/install.sh
# DEJA.js Install Script
# Usage: curl -fsSL https://install.dejajs.com | bash

set -euo pipefail

DEJA_DIR="${HOME}/.deja"
DEJA_BIN="${DEJA_DIR}/bin"
COMPOSE_FILE="${DEJA_DIR}/docker-compose.yml"
CONFIG_FILE="${DEJA_DIR}/config.json"
ENV_FILE="${DEJA_DIR}/.env"
IMAGE="ghcr.io/jmcdannel/deja-server:latest"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()   { echo -e "${RED}[ERROR]${NC} $*"; }

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
    x86_64|amd64) DOCKER_ARCH="amd64" ;;
    aarch64|arm64) DOCKER_ARCH="arm64" ;;
    *)             err "Unsupported architecture: ${ARCH}"; exit 1 ;;
  esac

  ok "Platform: ${PLATFORM} (${DOCKER_ARCH})"
}

# ======================================================================
# Step 2: Check/install Docker
# ======================================================================
check_docker() {
  if command -v docker &>/dev/null; then
    ok "Docker found: $(docker --version)"
    return
  fi

  if [ "${PLATFORM}" = "linux" ]; then
    info "Docker not found. Installing..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker "${USER}"
    ok "Docker installed. You may need to log out and back in for group changes."
  else
    err "Docker not found. Install Docker Desktop: https://docs.docker.com/get-docker/"
    exit 1
  fi
}

check_docker_compose() {
  if docker compose version &>/dev/null; then
    ok "Docker Compose found"
    return
  fi
  err "Docker Compose not found. Install Docker Desktop or docker-compose-plugin."
  exit 1
}

# ======================================================================
# Step 3: Docker login to GHCR
# ======================================================================
docker_login() {
  # Accept token as argument or prompt
  local token="${GHCR_TOKEN:-}"

  if [ -z "${token}" ]; then
    echo ""
    info "You need a GitHub Container Registry token to pull the DEJA Server image."
    info "Find your token at: https://cloud.dejajs.com → Settings → Install"
    echo ""
    read -rp "GHCR Token: " token
  fi

  if [ -z "${token}" ]; then
    err "No token provided."
    exit 1
  fi

  echo "${token}" | docker login ghcr.io -u deja-user --password-stdin
  ok "Logged in to GHCR"
}

# ======================================================================
# Step 4: Account linking
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
    read -rp "Your UID: " uid
  fi

  if [ -z "${layout_id}" ]; then
    read -rp "Your Layout ID: " layout_id
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
# Step 5: Environment setup
# ======================================================================
setup_environment() {
  if [ -f "${ENV_FILE}" ]; then
    ok "Environment file exists (${ENV_FILE})"
    return
  fi

  local layout_id
  layout_id=$(grep -o '"layoutId"[[:space:]]*:[[:space:]]*"[^"]*"' "${CONFIG_FILE}" | sed 's/.*"layoutId"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' 2>/dev/null)

  echo ""
  info "Enter your Firebase configuration (from https://cloud.dejajs.com → Settings → Install)"
  echo ""

  read -rp "VITE_FIREBASE_API_KEY: " fb_api_key
  read -rp "VITE_FIREBASE_AUTH_DOMAIN: " fb_auth_domain
  read -rp "VITE_FIREBASE_PROJECT_ID: " fb_project_id
  read -rp "VITE_FIREBASE_DATABASE_URL: " fb_database_url
  read -rp "VITE_FIREBASE_STORAGE_BUCKET: " fb_storage_bucket
  read -rp "VITE_FIREBASE_MESSAGING_SENDER_ID: " fb_messaging_id
  read -rp "VITE_FIREBASE_APP_ID: " fb_app_id
  read -rp "FIREBASE_CLIENT_EMAIL (service account): " fb_client_email
  read -rp "FIREBASE_PRIVATE_KEY (service account, paste full key): " fb_private_key

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
# Step 6: Serial port detection & Docker Compose generation
# ======================================================================
detect_serial_and_generate_compose() {
  local device_line=""

  if [ "${PLATFORM}" = "linux" ]; then
    # Check dialout group
    if ! groups "${USER}" | grep -q dialout; then
      warn "User '${USER}' is not in the 'dialout' group. Serial access may fail."
      warn "Fix: sudo usermod -aG dialout ${USER} && logout"
    fi
  fi

  # Detect serial ports
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
    echo "  0. Skip (configure later)"
    echo ""
    read -rp "Select port for DCC-EX CommandStation [1]: " choice
    choice="${choice:-1}"

    if [ "${choice}" != "0" ] && [ "${choice}" -le "${#ports[@]}" ] 2>/dev/null; then
      local selected="${ports[$((choice - 1))]}"
      device_line="    devices:
      - ${selected}:${selected}"
      ok "Using serial port: ${selected}"
    else
      warn "No serial port selected. Edit ${COMPOSE_FILE} later to add one."
    fi
  else
    warn "No serial ports detected. Edit ${COMPOSE_FILE} later to add your device."
  fi

  # Generate docker-compose.yml
  cat > "${COMPOSE_FILE}" <<COMPOSEEOF
services:
  deja-server:
    image: ${IMAGE}
${device_line}
    volumes:
      - ${DEJA_DIR}:/home/node/.deja
    ports:
      - "8082:8082"
    env_file: .env
    restart: unless-stopped
COMPOSEEOF

  ok "Docker Compose file generated"
}

# ======================================================================
# Step 7: Install CLI & pull image
# ======================================================================
install_cli() {
  mkdir -p "${DEJA_BIN}"

  # Download the CLI script from the release assets
  # The CI workflow uploads deja-cli.sh alongside the Docker image
  curl -fsSL "https://raw.githubusercontent.com/jmcdannel/DEJA.js/main/scripts/deja-cli.sh" \
    -o "${DEJA_BIN}/deja" 2>/dev/null || {
    err "Failed to download DEJA CLI. Check your internet connection."
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

pull_and_start() {
  info "Pulling DEJA Server image..."
  docker compose -f "${COMPOSE_FILE}" pull
  ok "Image pulled"

  info "Starting DEJA Server..."
  docker compose -f "${COMPOSE_FILE}" up -d
  ok "Server started"
}

# ======================================================================
# Step 8: Verification
# ======================================================================
verify() {
  echo ""
  info "Waiting for server to start..."
  local attempts=0
  while [ ${attempts} -lt 15 ]; do
    # Check container health via docker compose (server is WebSocket-only, not HTTP)
    local state
    state=$(docker compose -f "${COMPOSE_FILE}" ps --format '{{.State}}' 2>/dev/null || echo "")
    if [ "${state}" = "running" ]; then
      ok "Server container is running"
      break
    fi
    sleep 2
    attempts=$((attempts + 1))
  done

  if [ ${attempts} -ge 15 ]; then
    warn "Server did not start in time. Check logs: deja logs -f"
  fi

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
  echo "========================================"
  echo "  DEJA.js Server Installer"
  echo "========================================"
  echo ""

  detect_platform
  check_docker
  check_docker_compose
  docker_login
  link_account
  setup_environment
  detect_serial_and_generate_compose
  install_cli
  pull_and_start
  verify
}

# Parse arguments
while [ $# -gt 0 ]; do
  case "$1" in
    --token=*) GHCR_TOKEN="${1#*=}" ;;
    --uid=*)   DEJA_UID="${1#*=}" ;;
    --layout=*) DEJA_LAYOUT_ID="${1#*=}" ;;
    *) ;;
  esac
  shift
done

main
