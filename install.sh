#!/usr/bin/env bash
# DEJA.js one-command installer
# Usage: curl -fsSL https://install.dejajs.com | bash
# Or with a custom install directory:
#   curl -fsSL https://install.dejajs.com | bash -s -- ~/my-deja

set -e

# ── Colors ─────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

step()  { echo -e "\n${BLUE}${BOLD}▸ $1${NC}"; }
ok()    { echo -e "  ${GREEN}✓ $1${NC}"; }
warn()  { echo -e "  ${YELLOW}⚠ $1${NC}"; }
err()   { echo -e "  ${RED}✗ $1${NC}"; }
info()  { echo -e "  $1"; }

# ── Header ──────────────────────────────────────────────────────────────────
echo ""
echo -e "  ${BOLD}${BLUE}DEJA.js${NC} — DCC-EX JavaScript API"
echo -e "  ${BOLD}One-command setup${NC}"
echo ""
echo "  This script will:"
echo "    1. Check prerequisites (Node.js v22+, Git)"
echo "    2. Install pnpm if needed"
echo "    3. Download DEJA.js"
echo "    4. Install dependencies"
echo "    5. Install the deja CLI"
echo ""

# ── 0. Account check ──────────────────────────────────────────────────────
echo -e "  ${BOLD}${YELLOW}Before you begin:${NC} Sign up for a free DEJA Cloud account"
echo -e "  🚀 ${BLUE}https://cloud.dejajs.com/signup${NC}"
echo ""
read -rp "  Press Enter to continue, or Ctrl+C to sign up first... "

# ── 1. Check Node.js ────────────────────────────────────────────────────────
step "Checking Node.js..."
if ! command -v node &>/dev/null; then
    err "Node.js not found."
    info "Install Node.js v22 via nvm: https://github.com/nvm-sh/nvm"
    info "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash"
    info "  nvm install 22 && nvm use 22"
    exit 1
fi
NODE_MAJOR=$(node --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 22 ]; then
    err "Node.js v22+ required (found $(node --version))."
    info "Upgrade via nvm: nvm install 22 && nvm use 22"
    exit 1
fi
ok "Node.js $(node --version) found"

# ── 2. Check Git ─────────────────────────────────────────────────────────────
step "Checking Git..."
if ! command -v git &>/dev/null; then
    err "Git not found. Install from https://git-scm.com/install/"
    exit 1
fi
ok "$(git --version)"

# ── 3. Install pnpm ──────────────────────────────────────────────────────────
step "Checking pnpm..."
if command -v pnpm &>/dev/null; then
    ok "pnpm $(pnpm --version) found"
else
    warn "pnpm not found — installing..."
    npm install -g pnpm
    ok "pnpm $(pnpm --version) installed"
fi

# ── 4. Clone repository ──────────────────────────────────────────────────────
step "Setting up DEJA.js..."
INSTALL_DIR="${1:-$HOME/deja}"

if [ -d "$INSTALL_DIR/.git" ]; then
    warn "Directory $INSTALL_DIR already exists — pulling latest changes"
    git -C "$INSTALL_DIR" pull --ff-only
    ok "Updated to latest"
else
    info "Cloning into $INSTALL_DIR ..."
    git clone https://github.com/jmcdannel/DEJA.js.git "$INSTALL_DIR"
    ok "Cloned to $INSTALL_DIR"
fi

cd "$INSTALL_DIR"

# ── 5. Install dependencies ──────────────────────────────────────────────────
step "Installing dependencies..."
pnpm install
ok "Dependencies installed"

# ── 6. Write version & install CLI ────────────────────────────────────────────
step "Installing DEJA CLI..."
DEJA_HOME="${DEJA_HOME:-$HOME/.deja}"
mkdir -p "$DEJA_HOME/server"
SERVER_VERSION=$(node -e "console.log(require('./apps/server/package.json').version)")
echo "$SERVER_VERSION" > "$DEJA_HOME/server/version.txt"
ok "Server version $SERVER_VERSION recorded"

# Install CLI script + TUI
cp scripts/deja "$DEJA_HOME/deja"
cp scripts/deja-ui-ink.mjs "$DEJA_HOME/deja-ui-ink.mjs"
cp -r scripts/tui "$DEJA_HOME/tui"
chmod +x "$DEJA_HOME/deja"

# Add to PATH if not already there
SHELL_RC=""
if [ -f "$HOME/.zshrc" ]; then
  SHELL_RC="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
  SHELL_RC="$HOME/.bashrc"
fi

if [ -n "$SHELL_RC" ] && ! grep -q "DEJA_HOME" "$SHELL_RC"; then
  echo "" >> "$SHELL_RC"
  echo "# DEJA.js CLI" >> "$SHELL_RC"
  echo "export DEJA_HOME=\"$DEJA_HOME\"" >> "$SHELL_RC"
  echo 'export PATH="$DEJA_HOME:$PATH"' >> "$SHELL_RC"
  ok "Added deja CLI to PATH in $(basename "$SHELL_RC")"
  warn "Run 'source $SHELL_RC' or open a new terminal to use 'deja' command"
else
  ok "deja CLI available at $DEJA_HOME/deja"
fi

# ── 7. Create .env.local ─────────────────────────────────────────────────────
step "Configuring environment..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    ok "Created .env.local from template"
else
    warn ".env.local already exists — skipping copy"
fi

# ── 8. Done ──────────────────────────────────────────────────────────────────
echo ""
echo -e "  ${GREEN}${BOLD}Setup complete!${NC}"
echo ""
echo "  Next steps:"
echo ""
echo "  1. Start the DEJA Server:"
echo "     deja start"
echo ""
echo "  2. Connect your CommandStation:"
echo "     Use the CLI:  deja devices"
echo "     Or connect from the Throttle app: https://throttle.dejajs.com"
echo ""
echo "  Full documentation: https://www.dejajs.com"
echo ""
