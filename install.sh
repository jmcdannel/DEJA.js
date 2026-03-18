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
echo -e " \033[38;2;0;232;252m██████╗ ███████╗ ██╗ █████╗ ██╗███████╗\033[0m"
echo -e " \033[38;2;0;210;250m██╔══██╗██╔════╝ ██║██╔══██╗ ██║██╔════╝\033[0m"
echo -e " \033[38;2;0;193;243m██║ ██║█████╗ ██║███████║ ██║███████╗\033[0m"
echo -e " \033[38;2;5;170;231m██║ ██║██╔══╝ ██ ██║██╔══██║ ██ ██║╚════██║\033[0m"
echo -e " \033[38;2;3;157;224m██████╔╝███████╗╚█████╔╝██║ ██║\033[38;5;201m██╗\033[38;2;3;157;224m╚█████╔╝███████║\033[0m"
echo -e " \033[38;2;25;134;188m╚═════╝ ╚══════╝ ╚════╝ ╚═╝ ╚═╝\033[38;5;201m╚═╝\033[38;2;25;134;188m ╚════╝ ╚══════╝\033[0m"
echo ""
echo -e " \033[1mDCC-EX JavaScript API\033[0m — Installer"
echo ""
echo "  This script will:"
echo "    1. Check prerequisites (Node.js v22+, Git)"
echo "    2. Install pnpm if needed"
echo "    3. Download DEJA.js"
echo "    4. Install dependencies"
echo "    5. Create your .env.local configuration file"
echo ""

# ── 0. Account check ──────────────────────────────────────────────────────
echo -e "  ${BOLD}${YELLOW}Before you begin:${NC}"
echo "  You need a DEJA.js account to get your configuration credentials."
echo ""
echo "  If you haven't already:"
echo "    1. Sign up at https://cloud.dejajs.com/signup"
echo "    2. Wait for your account to be approved"
echo "    3. Complete the onboarding wizard to create your layout"
echo "    4. Copy your LAYOUT_ID and VITE_FIREBASE_* values from the"
echo '       "Environment Setup" step (you can also find them later under'
echo '       "View Local Environment Configuration" in your layout)'
echo ""
read -rp "  Press Enter if you have your credentials ready, or Ctrl+C to sign up first... "

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

# ── 6. Create .env.local ─────────────────────────────────────────────────────
step "Configuring environment..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    ok "Created .env.local from template"
else
    warn ".env.local already exists — skipping copy"
fi

# ── 7. Set LAYOUT_ID ─────────────────────────────────────────────────────────
echo ""
echo -e "  ${BOLD}Layout ID${NC}"
info "A unique name for your layout. Used to identify your data in DEJA Cloud."
info "Rules: lowercase letters, numbers, and hyphens only."
info "Examples: basement-empire  |  club-layout-2024  |  riverside-yard"
echo ""

LAYOUT_PATTERN='^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'
while true; do
    read -rp "  Enter your Layout ID: " LAYOUT_ID
    if [[ "$LAYOUT_ID" =~ $LAYOUT_PATTERN ]]; then
        break
    else
        warn "Invalid ID — use lowercase letters, numbers, and hyphens only."
    fi
done

if grep -q "^LAYOUT_ID=" .env.local; then
    sed -i.bak "s/^LAYOUT_ID=.*/LAYOUT_ID=$LAYOUT_ID/" .env.local && rm -f .env.local.bak
else
    echo "LAYOUT_ID=$LAYOUT_ID" >> .env.local
fi
ok "Layout ID set to: $LAYOUT_ID"

# ── 8. Firebase credentials ──────────────────────────────────────────────────
echo ""
echo -e "  ${BOLD}Firebase Credentials${NC}"
echo ""
info "Paste the VITE_FIREBASE_* values from your onboarding setup."
info "If you need to find them again:"
echo ""
info "  1. Log in to https://cloud.dejajs.com"
info "  2. Select your layout"
info '  3. Click "View Local Environment Configuration"'
info "  4. Copy all the VITE_FIREBASE_* values shown"
echo ""
info "Your .env.local file is at:"
info "  $INSTALL_DIR/.env.local"
echo ""
read -rp "  Press Enter to open .env.local in your editor..."

# Open in the best available editor
if command -v code &>/dev/null; then
    code "$INSTALL_DIR/.env.local"
elif command -v nano &>/dev/null; then
    nano "$INSTALL_DIR/.env.local"
elif command -v vim &>/dev/null; then
    vim "$INSTALL_DIR/.env.local"
elif command -v open &>/dev/null; then
    open "$INSTALL_DIR/.env.local"
elif command -v xdg-open &>/dev/null; then
    xdg-open "$INSTALL_DIR/.env.local"
else
    info "Could not find a text editor. Open the file manually:"
    info "  $INSTALL_DIR/.env.local"
fi

# ── 9. Done ──────────────────────────────────────────────────────────────────
echo ""
echo -e "  ${GREEN}${BOLD}Setup complete!${NC}"
echo ""
echo "  Next steps:"
echo ""
echo "  1. Register your DCC-EX CommandStation in DEJA Cloud:"
echo "     https://cloud.dejajs.com → Layout → Devices → Add"
echo "     (Select DCC-EX CommandStation → USB)"
echo ""
echo "  2. Start the DEJA Server (run from $INSTALL_DIR):"
echo "     pnpm deja"
echo ""
echo "  3. Connect your CommandStation:"
echo "     https://monitor.dejajs.com → select USB port → Connect"
echo ""
echo "  4. Drive trains:"
echo "     https://throttle.dejajs.com"
echo ""
echo "  Full documentation: https://www.dejajs.com"
echo ""
