#!/usr/bin/env bash
# scripts/deja-cli.sh
# DEJA.js CLI — manages the Docker-based DEJA Server
# Installed to ~/.deja/bin/deja by the install script

set -euo pipefail

DEJA_DIR="${HOME}/.deja"
COMPOSE_FILE="${DEJA_DIR}/docker-compose.yml"

usage() {
  echo "Usage: deja <command>"
  echo ""
  echo "Commands:"
  echo "  status    Show server status, subscription, and serial connection"
  echo "  logs      View server logs (pass -f to follow)"
  echo "  update    Pull latest server image and restart"
  echo "  restart   Restart the server"
  echo "  stop      Stop the server"
  echo "  start     Start the server"
  echo ""
}

require_compose() {
  if [ ! -f "${COMPOSE_FILE}" ]; then
    echo "Error: ${COMPOSE_FILE} not found."
    echo "Run the install script first: curl -fsSL https://install.dejajs.com | bash"
    exit 1
  fi
}

cmd_status() {
  require_compose
  echo "=== DEJA.js Server Status ==="
  echo ""

  # Container state (filter by service name to handle multi-service compose files)
  local state
  state=$(docker compose -f "${COMPOSE_FILE}" ps deja-server --format '{{.State}}' 2>/dev/null | head -1 || echo "not running")
  echo "Container:    ${state}"

  # Image version
  local image
  image=$(docker compose -f "${COMPOSE_FILE}" images deja-server --format '{{.Tag}}' 2>/dev/null | head -1 || echo "unknown")
  echo "Image:        ghcr.io/jmcdannel/deja-server:${image}"

  # Subscription info from config.json (using grep/sed — no python3 or jq dependency)
  if [ -f "${DEJA_DIR}/config.json" ]; then
    local sub_status sub_plan
    sub_status=$(grep -o '"status"[[:space:]]*:[[:space:]]*"[^"]*"' "${DEJA_DIR}/config.json" | head -1 | sed 's/.*"status"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' 2>/dev/null || echo "unknown")
    sub_plan=$(grep -o '"plan"[[:space:]]*:[[:space:]]*"[^"]*"' "${DEJA_DIR}/config.json" | head -1 | sed 's/.*"plan"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' 2>/dev/null || echo "unknown")
    echo "Subscription: ${sub_status} (${sub_plan})"
  fi

  # Serial devices (check compose file for mapped devices + host existence)
  local serial_device
  serial_device=$(grep -o '/dev/tty[^:]*' "${COMPOSE_FILE}" 2>/dev/null | head -1 || echo "none")
  if [ "${serial_device}" != "none" ] && [ -e "${serial_device}" ]; then
    echo "Serial:       ${serial_device} (connected)"
  elif [ "${serial_device}" != "none" ]; then
    echo "Serial:       ${serial_device} (not found on host)"
  else
    echo "Serial:       none configured"
  fi

  # WebSocket port
  echo "WebSocket:    ws://localhost:8082"
  echo ""
}

cmd_logs() {
  require_compose
  docker compose -f "${COMPOSE_FILE}" logs "$@"
}

cmd_update() {
  require_compose
  echo "Pulling latest DEJA Server image..."
  docker compose -f "${COMPOSE_FILE}" pull
  echo "Restarting server..."
  docker compose -f "${COMPOSE_FILE}" up -d
  echo "Update complete."
}

cmd_restart() {
  require_compose
  docker compose -f "${COMPOSE_FILE}" restart
}

cmd_stop() {
  require_compose
  docker compose -f "${COMPOSE_FILE}" stop
}

cmd_start() {
  require_compose
  docker compose -f "${COMPOSE_FILE}" up -d
}

# --- Main ---

if [ $# -eq 0 ]; then
  usage
  exit 0
fi

case "$1" in
  status)  cmd_status ;;
  logs)    shift; cmd_logs "$@" ;;
  update)  cmd_update ;;
  restart) cmd_restart ;;
  stop)    cmd_stop ;;
  start)   cmd_start ;;
  help|-h|--help) usage ;;
  *)
    echo "Unknown command: $1"
    usage
    exit 1
    ;;
esac
