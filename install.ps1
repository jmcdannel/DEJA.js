# DEJA.js one-command installer for Windows
# Usage (PowerShell):
#   irm https://raw.githubusercontent.com/jmcdannel/DEJA.js/main/install.ps1 | iex
# Or with a custom install directory:
#   & ([scriptblock]::Create((irm https://raw.githubusercontent.com/jmcdannel/DEJA.js/main/install.ps1))) "C:\deja"

#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

function Write-Step { param($msg) Write-Host "`n  $msg" -ForegroundColor Cyan }
function Write-Ok   { param($msg) Write-Host "  OK  $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "  !   $msg" -ForegroundColor Yellow }
function Write-Err  { param($msg) Write-Host "  ERR $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "  $msg" }

# ── Header ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  DEJA.js - DCC-EX JavaScript API" -ForegroundColor Cyan
Write-Host "  One-command setup" -ForegroundColor White
Write-Host ""
Write-Host "  This script will:"
Write-Host "    1. Check prerequisites (Node.js v22+, Git)"
Write-Host "    2. Install pnpm if needed"
Write-Host "    3. Clone the DEJA.js repository"
Write-Host "    4. Install dependencies"
Write-Host "    5. Create your .env.local configuration file"
Write-Host ""

# ── 0. Account check ─────────────────────────────────────────────────────────
Write-Host "  Before you begin:" -ForegroundColor Yellow
Write-Host "  You need a DEJA.js account to get your configuration credentials."
Write-Host ""
Write-Host "  If you haven't already:"
Write-Host "    1. Sign up at https://cloud.dejajs.com/signup"
Write-Host "    2. Wait for your account to be approved"
Write-Host "    3. Complete the onboarding wizard to create your layout"
Write-Host "    4. Copy your LAYOUT_ID and VITE_FIREBASE_* values from the"
Write-Host '       "Environment Setup" step (you can also find them later under'
Write-Host '       "View Local Environment Configuration" in your layout)'
Write-Host ""
Read-Host "  Press Enter if you have your credentials ready, or Ctrl+C to sign up first"

# ── 1. Check Node.js ─────────────────────────────────────────────────────────
Write-Step "Checking Node.js..."
try {
    $nodeVer = (node --version 2>&1).ToString().TrimStart('v')
    $nodeMajor = [int]($nodeVer.Split('.')[0])
    if ($nodeMajor -lt 22) {
        Write-Err "Node.js v22+ required (found v$nodeVer)."
        Write-Info "Download Node.js v22 LTS from: https://nodejs.org"
        exit 1
    }
    Write-Ok "Node.js v$nodeVer found"
} catch {
    Write-Err "Node.js not found."
    Write-Info "Download Node.js v22 LTS from: https://nodejs.org"
    exit 1
}

# ── 2. Check Git ─────────────────────────────────────────────────────────────
Write-Step "Checking Git..."
try {
    $gitVer = (git --version 2>&1).ToString()
    Write-Ok $gitVer
} catch {
    Write-Err "Git not found. Download from: https://git-scm.com/install/"
    exit 1
}

# ── 3. Install pnpm ──────────────────────────────────────────────────────────
Write-Step "Checking pnpm..."
$pnpmVer = $null
try { $pnpmVer = (pnpm --version 2>&1).ToString() } catch {}
if ($pnpmVer) {
    Write-Ok "pnpm v$pnpmVer found"
} else {
    Write-Warn "pnpm not found - installing..."
    npm install -g pnpm
    Write-Ok "pnpm installed"
}

# ── 4. Clone repository ──────────────────────────────────────────────────────
Write-Step "Setting up DEJA.js..."
$installDir = if ($args[0]) { $args[0] } else { "$HOME\deja" }

if (Test-Path "$installDir\.git") {
    Write-Warn "Directory $installDir already exists - pulling latest changes"
    git -C $installDir pull --ff-only
    Write-Ok "Updated to latest"
} else {
    Write-Info "Cloning into $installDir ..."
    git clone https://github.com/jmcdannel/deja.git $installDir
    Write-Ok "Cloned to $installDir"
}

Set-Location $installDir

# ── 5. Install dependencies ──────────────────────────────────────────────────
Write-Step "Installing dependencies..."
pnpm install
Write-Ok "Dependencies installed"

# ── 6. Create .env.local ─────────────────────────────────────────────────────
Write-Step "Configuring environment..."
if (-not (Test-Path .env.local)) {
    Copy-Item .env.example .env.local
    Write-Ok "Created .env.local from template"
} else {
    Write-Warn ".env.local already exists - skipping copy"
}

# ── 7. Set LAYOUT_ID ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  Layout ID" -ForegroundColor White
Write-Info "A unique name for your layout. Used to identify your data in DEJA Cloud."
Write-Info "Rules: lowercase letters, numbers, and hyphens only."
Write-Info "Examples: basement-empire  |  club-layout-2024  |  riverside-yard"
Write-Host ""

$layoutPattern = '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'
do {
    $layoutId = Read-Host "  Enter your Layout ID"
    if ($layoutId -notmatch $layoutPattern) {
        Write-Warn "Invalid ID - use lowercase letters, numbers, and hyphens only."
    }
} while ($layoutId -notmatch $layoutPattern)

$envContent = Get-Content .env.local -Raw
if ($envContent -match '(?m)^LAYOUT_ID=') {
    $envContent = $envContent -replace '(?m)^LAYOUT_ID=.*', "LAYOUT_ID=$layoutId"
} else {
    $envContent += "`nLAYOUT_ID=$layoutId"
}
[System.IO.File]::WriteAllText("$installDir\.env.local", $envContent)
Write-Ok "Layout ID set to: $layoutId"

# ── 8. Firebase credentials ──────────────────────────────────────────────────
Write-Host ""
Write-Host "  Firebase Credentials" -ForegroundColor White
Write-Host ""
Write-Info "Paste the VITE_FIREBASE_* values from your onboarding setup."
Write-Info "If you need to find them again:"
Write-Host ""
Write-Info "  1. Log in to https://cloud.dejajs.com"
Write-Info "  2. Select your layout"
Write-Info '  3. Click "View Local Environment Configuration"'
Write-Info "  4. Copy all the VITE_FIREBASE_* values shown"
Write-Host ""
Write-Info "Your .env.local file is at:"
Write-Info "  $installDir\.env.local"
Write-Host ""
Read-Host "  Press Enter to open .env.local in Notepad"

Start-Process notepad "$installDir\.env.local" -Wait

# ── 9. Done ──────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "  Next steps:"
Write-Host ""
Write-Host "  1. Register your DCC-EX CommandStation in DEJA Cloud:"
Write-Host "     https://cloud.dejajs.com -> Layout -> Devices -> Add"
Write-Host "     (Select DCC-EX CommandStation -> USB)"
Write-Host ""
Write-Host "  2. Start the DEJA Server (run from $installDir):"
Write-Host "     pnpm deja"
Write-Host ""
Write-Host "  3. Connect your CommandStation:"
Write-Host "     https://monitor.dejajs.com -> select USB port -> Connect"
Write-Host ""
Write-Host "  4. Drive trains:"
Write-Host "     https://throttle.dejajs.com"
Write-Host ""
Write-Host "  Full documentation: https://www.dejajs.com"
Write-Host ""
