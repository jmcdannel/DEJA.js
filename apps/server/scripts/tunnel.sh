#!/usr/bin/env bash
# =============================================================================
# DEJA.js Cloudflare Tunnel Script
# =============================================================================
#
# Usage:
#   bash scripts/tunnel.sh quick    # Ad-hoc tunnel (no Cloudflare account needed)
#   bash scripts/tunnel.sh named    # Persistent tunnel (requires Cloudflare account)
#
# Environment:
#   Reads VITE_WS_PORT from .env or .env.local (default: 8082)
#   Named tunnels optionally use CLOUDFLARE_TUNNEL_TOKEN
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(dirname "$SCRIPT_DIR")"

# ---------------------------------------------------------------------------
# Load environment variables from .env / .env.local
# ---------------------------------------------------------------------------
load_env() {
  local env_file="$1"
  if [[ -f "$env_file" ]]; then
    # Source only lines that look like VAR=VALUE (skip comments and blanks)
    while IFS='=' read -r key value; do
      # Trim whitespace and skip comments / empty lines
      key="$(echo "$key" | xargs)"
      [[ -z "$key" || "$key" == \#* ]] && continue
      value="$(echo "$value" | xargs)"
      export "$key=$value" 2>/dev/null || true
    done < "$env_file"
  fi
}

# Load root .env first, then .env.local overrides, then server-local overrides
for env_path in \
  "$SERVER_DIR/../../.env" \
  "$SERVER_DIR/../../.env.local" \
  "$SERVER_DIR/.env" \
  "$SERVER_DIR/.env.local"; do
  load_env "$env_path"
done

WS_PORT="${VITE_WS_PORT:-8082}"

# ---------------------------------------------------------------------------
# Check if cloudflared is installed
# ---------------------------------------------------------------------------
check_cloudflared() {
  if command -v cloudflared &>/dev/null; then
    echo "[tunnel] cloudflared found: $(cloudflared --version 2>&1 | head -1)"
    return 0
  fi

  echo ""
  echo "=============================================="
  echo "  cloudflared is not installed"
  echo "=============================================="
  echo ""
  echo "Install it for your platform:"
  echo ""

  case "$(uname -s)" in
    Darwin)
      echo "  macOS (Homebrew):"
      echo "    brew install cloudflare/cloudflare/cloudflared"
      echo ""
      ;;
    Linux)
      echo "  Debian / Ubuntu:"
      echo "    curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb"
      echo "    sudo dpkg -i cloudflared.deb"
      echo ""
      echo "  Other Linux:"
      echo "    See https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
      echo ""
      ;;
    *)
      echo "  Windows:"
      echo "    Download from https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
      echo "    Or use: winget install --id Cloudflare.cloudflared"
      echo ""
      ;;
  esac

  echo "After installing, re-run this script."
  echo ""
  exit 1
}

# ---------------------------------------------------------------------------
# Quick tunnel (ad-hoc, no account required)
# ---------------------------------------------------------------------------
run_quick() {
  echo ""
  echo "=============================================="
  echo "  DEJA.js Quick Tunnel"
  echo "=============================================="
  echo ""
  echo "  Starting ad-hoc tunnel to localhost:${WS_PORT}"
  echo "  No Cloudflare account required."
  echo ""
  echo "  A public URL will be printed below."
  echo "  Share it with your throttle/cloud/monitor apps."
  echo ""
  echo "  Press Ctrl+C to stop the tunnel."
  echo ""
  echo "=============================================="
  echo ""

  cloudflared tunnel --url "http://localhost:${WS_PORT}"
}

# ---------------------------------------------------------------------------
# Named tunnel (persistent, requires Cloudflare account + config)
# ---------------------------------------------------------------------------
run_named() {
  local config_file="$SERVER_DIR/cloudflared.yml"

  echo ""
  echo "=============================================="
  echo "  DEJA.js Named Tunnel"
  echo "=============================================="
  echo ""

  if [[ -n "${CLOUDFLARE_TUNNEL_TOKEN:-}" ]]; then
    echo "  Using CLOUDFLARE_TUNNEL_TOKEN from environment."
    echo "  Press Ctrl+C to stop the tunnel."
    echo ""
    cloudflared tunnel run --token "$CLOUDFLARE_TUNNEL_TOKEN"
  elif [[ -f "$config_file" ]]; then
    # Check if the config still has the placeholder
    if grep -q "YOUR_TUNNEL_UUID_HERE" "$config_file"; then
      echo "  ERROR: cloudflared.yml still has placeholder values."
      echo ""
      echo "  Follow these steps to set up a named tunnel:"
      echo ""
      echo "  1. cloudflared tunnel login"
      echo "  2. cloudflared tunnel create deja-js"
      echo "  3. Edit apps/server/cloudflared.yml:"
      echo "     - Replace YOUR_TUNNEL_UUID_HERE with your tunnel UUID"
      echo "     - Update the credentials-file path"
      echo "  4. cloudflared tunnel route dns deja-js your-sub.yourdomain.com"
      echo "  5. Re-run: pnpm tunnel:named"
      echo ""
      exit 1
    fi

    echo "  Using config: $config_file"
    echo "  Press Ctrl+C to stop the tunnel."
    echo ""
    cloudflared tunnel --config "$config_file" run
  else
    echo "  ERROR: No CLOUDFLARE_TUNNEL_TOKEN and no cloudflared.yml found."
    echo ""
    echo "  Either:"
    echo "    - Set CLOUDFLARE_TUNNEL_TOKEN in your .env file"
    echo "    - Or configure apps/server/cloudflared.yml"
    echo ""
    echo "  For a quick tunnel without setup, run: pnpm tunnel"
    echo ""
    exit 1
  fi
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
check_cloudflared

MODE="${1:-quick}"

case "$MODE" in
  quick)
    run_quick
    ;;
  named)
    run_named
    ;;
  *)
    echo "Usage: $0 [quick|named]"
    echo ""
    echo "  quick   Ad-hoc tunnel, no Cloudflare account needed (default)"
    echo "  named   Persistent tunnel with custom domain (requires setup)"
    echo ""
    exit 1
    ;;
esac
