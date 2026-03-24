# Public Release Hosting Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Host server release assets (tarball, CLI, install script) on public URLs so paying customers can install without GitHub authentication.

**Architecture:** A lightweight Hono API app on Vercel (`install.dejajs.com`) serves the install script and proxies release downloads from Vercel Blob storage. CI uploads built artifacts to Vercel Blob on tag push. The install script is simplified to download from `install.dejajs.com` with zero auth. DNS is configured via Squarespace.

**Tech Stack:** Hono (Vercel serverless), Vercel Blob, GitHub Actions, Squarespace DNS

---

## DNS Setup (Squarespace — Manual Step)

Before deployment, add these DNS records in Squarespace:

1. Go to **Squarespace → Domains → dejajs.com → DNS Settings → Custom Records**
2. Add a **CNAME** record:
   - **Host:** `install`
   - **Type:** CNAME
   - **Data:** `cname.vercel-dns.com`
3. After the Vercel app is deployed, go to **Vercel → Project Settings → Domains** and add `install.dejajs.com`. Vercel will verify the CNAME automatically.

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `apps/install-api/package.json` | Create | Hono app package definition |
| `apps/install-api/tsconfig.json` | Create | TypeScript config extending shared base |
| `apps/install-api/vercel.json` | Create | Vercel rewrites config |
| `apps/install-api/src/index.ts` | Create | Hono routes: `GET /` (install.sh), `GET /releases/:version/:file` (blob proxy), `GET /releases/latest/:file` (latest redirect) |
| `apps/install-api/src/lib/blob.ts` | Create | Vercel Blob helpers for upload/download/list |
| `scripts/install.sh` | Modify | Replace GitHub API/download URLs with `install.dejajs.com` URLs, remove GitHub token auth |
| `scripts/deja` | Modify | Update `deja update` to download from `install.dejajs.com` |
| `.github/workflows/release-server.yml` | Modify | Replace GitHub Release asset upload with Vercel Blob upload, keep GitHub Release for changelog only |
| `pnpm-workspace.yaml` | Modify | Add `apps/install-api` |

---

## Chunk 1: Install API App

### Task 1: Create the install-api Hono app

**Files:**
- Create: `apps/install-api/package.json`
- Create: `apps/install-api/tsconfig.json`
- Create: `apps/install-api/vercel.json`
- Modify: `pnpm-workspace.yaml`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "install-api",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@hono/node-server": "^1.13.0",
    "@vercel/blob": "^0.27.1",
    "hono": "^4.7.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "tsx": "^4.19.0",
    "typescript": "^5.7.2"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "extends": "@repo/typescript-config/node.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create vercel.json**

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/api/$1" }]
}
```

- [ ] **Step 4: Verify `pnpm-workspace.yaml` includes `apps/*`**

Check that the existing glob `apps/*` already covers `apps/install-api`. If not, no change needed — it should already be included by the wildcard.

- [ ] **Step 5: Run `pnpm install` to link the new workspace**

Run: `pnpm install`

- [ ] **Step 6: Commit**

```bash
git add apps/install-api/package.json apps/install-api/tsconfig.json apps/install-api/vercel.json
git commit -m "feat(install-api): scaffold Hono app for public release hosting"
```

---

### Task 2: Create Vercel Blob helpers

**Files:**
- Create: `apps/install-api/src/lib/blob.ts`

- [ ] **Step 1: Create blob helper module**

This module wraps Vercel Blob SDK for uploading, downloading, and listing release artifacts. Blob paths follow the convention `releases/{version}/{filename}`.

```typescript
import { put, list, head } from '@vercel/blob'

const RELEASES_PREFIX = 'releases'

export async function uploadRelease(
  version: string,
  filename: string,
  data: Buffer | ReadableStream,
  contentType: string
): Promise<string> {
  const path = `${RELEASES_PREFIX}/${version}/${filename}`
  const blob = await put(path, data, {
    access: 'public',
    contentType,
    addRandomSuffix: false,
  })
  return blob.url
}

export async function getLatestVersion(): Promise<string | null> {
  const { blobs } = await list({ prefix: `${RELEASES_PREFIX}/`, limit: 1000 })

  const versions = new Set<string>()
  for (const blob of blobs) {
    // Path: releases/v1.2.3/deja-server.tar.gz
    const parts = blob.pathname.split('/')
    if (parts.length >= 3) {
      versions.add(parts[1])
    }
  }

  if (versions.size === 0) return null

  // Sort semver-ish (good enough for v-prefixed tags)
  const sorted = [...versions].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
  return sorted[0]
}

export async function getReleaseUrl(
  version: string,
  filename: string
): Promise<string | null> {
  const path = `${RELEASES_PREFIX}/${version}/${filename}`
  try {
    const blob = await head(path)
    return blob.url
  } catch {
    return null
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/install-api/src/lib/blob.ts
git commit -m "feat(install-api): add Vercel Blob helpers for release storage"
```

---

### Task 3: Create API routes

**Files:**
- Create: `apps/install-api/src/index.ts`

- [ ] **Step 1: Create the Hono app with routes**

Three routes:
- `GET /` — serves the install script (with Firebase config from env vars, not placeholders)
- `GET /releases/latest/:filename` — redirects to the latest version's blob URL
- `GET /releases/:version/:filename` — redirects to a specific version's blob URL
- `POST /releases/:version/upload` — CI uploads artifacts here (protected by secret)

```typescript
import { Hono } from 'hono'
import { getLatestVersion, getReleaseUrl, uploadRelease } from './lib/blob'

const app = new Hono()

// Serve the install script with Firebase config baked in from env vars
app.get('/', async (c) => {
  const installScript = generateInstallScript()
  return c.text(installScript, 200, {
    'Content-Type': 'text/plain',
    'Cache-Control': 'no-cache',
  })
})

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }))

// Redirect to latest release asset
app.get('/releases/latest/:filename', async (c) => {
  const filename = c.req.param('filename')
  const version = await getLatestVersion()
  if (!version) return c.json({ error: 'No releases found' }, 404)

  const url = await getReleaseUrl(version, filename)
  if (!url) return c.json({ error: 'File not found' }, 404)

  return c.redirect(url)
})

// Redirect to specific version asset
app.get('/releases/:version/:filename', async (c) => {
  const { version, filename } = c.req.param()
  const url = await getReleaseUrl(version, filename)
  if (!url) return c.json({ error: 'File not found' }, 404)

  return c.redirect(url)
})

// CI upload endpoint (protected by secret)
app.post('/releases/:version/upload', async (c) => {
  const authHeader = c.req.header('authorization')
  if (authHeader !== `Bearer ${process.env.UPLOAD_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const version = c.req.param('version')
  const formData = await c.req.formData()
  const file = formData.get('file') as File
  if (!file) return c.json({ error: 'No file provided' }, 400)

  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await uploadRelease(version, file.name, buffer, file.type || 'application/octet-stream')

  return c.json({ ok: true, url })
})

function generateInstallScript(): string {
  // Read the template and replace placeholders with env vars
  // In production, env vars are set in Vercel project settings
  const replacements: Record<string, string> = {
    '__FIREBASE_API_KEY__': process.env.FIREBASE_API_KEY ?? '',
    '__FIREBASE_AUTH_DOMAIN__': process.env.FIREBASE_AUTH_DOMAIN ?? '',
    '__FIREBASE_PROJECT_ID__': process.env.FIREBASE_PROJECT_ID ?? '',
    '__FIREBASE_DATABASE_URL__': process.env.FIREBASE_DATABASE_URL ?? '',
    '__FIREBASE_STORAGE_BUCKET__': process.env.FIREBASE_STORAGE_BUCKET ?? '',
    '__FIREBASE_MESSAGING_SENDER_ID__': process.env.FIREBASE_MESSAGING_SENDER_ID ?? '',
    '__FIREBASE_APP_ID__': process.env.FIREBASE_APP_ID ?? '',
    '__FIREBASE_CLIENT_EMAIL__': process.env.FIREBASE_CLIENT_EMAIL ?? '',
    '__FIREBASE_PRIVATE_KEY__': process.env.FIREBASE_PRIVATE_KEY ?? '',
  }

  let script = INSTALL_SCRIPT_TEMPLATE
  for (const [placeholder, value] of Object.entries(replacements)) {
    script = script.replaceAll(placeholder, value)
  }
  return script
}

// The install script template is embedded at build time by the CI workflow.
// For local dev, it reads from the placeholder version.
const INSTALL_SCRIPT_TEMPLATE = `__INSTALL_SCRIPT_TEMPLATE__`

export default app
```

**Note:** The `INSTALL_SCRIPT_TEMPLATE` placeholder gets replaced during CI build with the actual contents of `scripts/install.sh`. In local dev, it returns the placeholder version. See Task 5 for the CI step.

- [ ] **Step 2: Commit**

```bash
git add apps/install-api/src/index.ts
git commit -m "feat(install-api): add routes for install script, release downloads, and CI upload"
```

---

## Chunk 2: Update Install Script and CI

### Task 4: Simplify install script for public downloads

**Files:**
- Modify: `scripts/install.sh`
- Modify: `scripts/deja`

- [ ] **Step 1: Update install.sh**

Replace all GitHub API calls and auth with simple public URLs:

In `scripts/install.sh`, make these changes:

1. **Remove** `GITHUB_TOKEN`, `gh_curl()`, and `check_github_token()` entirely
2. **Replace** the `install_server()` function's download logic:

```bash
# Old: gh_curl "https://api.github.com/repos/${GITHUB_REPO}/releases/latest"
# New:
install_server() {
  info "Fetching latest release..."

  local tarball_url="https://install.dejajs.com/releases/latest/deja-server.tar.gz"
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
```

3. **Replace** the `install_cli()` function's download:

```bash
install_cli() {
  mkdir -p "${DEJA_BIN}"

  curl -fsSL "https://install.dejajs.com/releases/latest/deja" \
    -o "${DEJA_BIN}/deja" || {
    err "Failed to download DEJA CLI."
    exit 1
  }

  chmod +x "${DEJA_BIN}/deja"
  # ... rest of PATH setup unchanged
}
```

4. **Remove** `check_github_token` from the `main()` function call list

- [ ] **Step 2: Update `scripts/deja` update command**

In the `deja` CLI, find the `cmd_update()` function and replace its download URL:

```bash
# Old: curl from github releases
# New:
local tarball_url="https://install.dejajs.com/releases/latest/deja-server.tar.gz"
curl -fsSL "${tarball_url}" -o "${tmp_dir}/deja-server.tar.gz" || { ... }
```

Also update the CLI self-update to download from the same URL:
```bash
local cli_url="https://install.dejajs.com/releases/latest/deja"
curl -fsSL "${cli_url}" -o "${DEJA_BIN}/deja" || { ... }
```

- [ ] **Step 3: Commit**

```bash
git add scripts/install.sh scripts/deja
git commit -m "feat(scripts): download from install.dejajs.com instead of GitHub"
```

---

### Task 5: Update CI workflow to upload to Vercel Blob

**Files:**
- Modify: `.github/workflows/release-server.yml`

- [ ] **Step 1: Replace the GitHub Release asset upload with Vercel Blob upload**

After the tarball creation step, replace the "Inject Firebase config" and "Create GitHub Release" steps with:

```yaml
      - name: Embed install script in install-api
        run: |
          # Escape the script for embedding as a JS template literal
          node -e "
            const fs = require('fs');
            const script = fs.readFileSync('scripts/install.sh', 'utf8');
            const escaped = script.replace(/\`/g, '\\\`').replace(/\\\$/g, '\\\\\$');
            const apiIndex = fs.readFileSync('apps/install-api/src/index.ts', 'utf8');
            const result = apiIndex.replace('__INSTALL_SCRIPT_TEMPLATE__', escaped);
            fs.writeFileSync('apps/install-api/src/index.ts', result);
          "

      - name: Upload release assets to Vercel Blob
        env:
          UPLOAD_SECRET: ${{ secrets.INSTALL_API_UPLOAD_SECRET }}
          INSTALL_API_URL: https://install.dejajs.com
        run: |
          VERSION="${{ steps.version.outputs.version }}"

          # Upload tarball
          curl -fsSL -X POST \
            -H "Authorization: Bearer ${UPLOAD_SECRET}" \
            -F "file=@deja-server.tar.gz;type=application/gzip" \
            "${INSTALL_API_URL}/releases/${VERSION}/upload"

          # Upload CLI
          curl -fsSL -X POST \
            -H "Authorization: Bearer ${UPLOAD_SECRET}" \
            -F "file=@scripts/deja;type=application/octet-stream" \
            "${INSTALL_API_URL}/releases/${VERSION}/upload"

      - name: Create GitHub Release (changelog only)
        uses: softprops/action-gh-release@v2
        with:
          generate_release_notes: true
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/release-server.yml
git commit -m "feat(ci): upload release assets to Vercel Blob via install API"
```

---

## Chunk 3: Deploy and Configure

### Task 6: Deploy install-api to Vercel

This is a manual step sequence.

- [ ] **Step 1: Deploy to Vercel**

```bash
cd apps/install-api
npx vercel --yes
```

- [ ] **Step 2: Add custom domain**

```bash
npx vercel domains add install.dejajs.com
```

Or in the Vercel dashboard: **Project → Settings → Domains → Add `install.dejajs.com`**

- [ ] **Step 3: Configure Squarespace DNS**

In Squarespace → Domains → dejajs.com → DNS Settings → Custom Records:

| Type | Host | Data |
|------|------|------|
| CNAME | `install` | `cname.vercel-dns.com` |

Wait 5–10 minutes for DNS propagation.

- [ ] **Step 4: Set environment variables in Vercel**

In the Vercel dashboard for the `install-api` project, add these env vars (Settings → Environment Variables):

| Variable | Value | Notes |
|----------|-------|-------|
| `BLOB_READ_WRITE_TOKEN` | *(your Vercel Blob token)* | Same token used by sound-api |
| `FIREBASE_API_KEY` | `AIzaSyBETN...` | Client-side, safe |
| `FIREBASE_AUTH_DOMAIN` | `dejacloud-563d6.firebaseapp.com` | Client-side, safe |
| `FIREBASE_PROJECT_ID` | `dejacloud-563d6` | Client-side, safe |
| `FIREBASE_DATABASE_URL` | `https://dejacloud-563d6-default-rtdb...` | Client-side, safe |
| `FIREBASE_STORAGE_BUCKET` | `dejacloud-563d6.appspot.com` | Client-side, safe |
| `FIREBASE_MESSAGING_SENDER_ID` | `763850552175` | Client-side, safe |
| `FIREBASE_APP_ID` | `1:763850552175:web:...` | Client-side, safe |
| `FIREBASE_CLIENT_EMAIL` | *(service account email)* | Secret |
| `FIREBASE_PRIVATE_KEY` | *(service account private key)* | Secret |
| `UPLOAD_SECRET` | *(generate a random 32+ char string)* | Protects upload endpoint |

- [ ] **Step 5: Add `INSTALL_API_UPLOAD_SECRET` to GitHub Actions secrets**

Same value as `UPLOAD_SECRET` above. Go to: https://github.com/jmcdannel/DEJA.js/settings/secrets/actions

- [ ] **Step 6: Verify**

```bash
# Should return the install script with Firebase config baked in
curl -fsSL https://install.dejajs.com

# Health check
curl https://install.dejajs.com/health
```

- [ ] **Step 7: Test full install flow**

```bash
rm -rf ~/.deja
curl -fsSL https://install.dejajs.com | bash
```

---

## Summary of User Install Experience (After Implementation)

```bash
curl -fsSL https://install.dejajs.com | bash
```

1. Detects platform and Node.js
2. Prompts for UID and Layout ID (from cloud.dejajs.com → Settings)
3. Writes `.env` with all Firebase config pre-filled (no prompts)
4. Detects serial ports
5. Downloads server tarball from `install.dejajs.com/releases/latest/deja-server.tar.gz`
6. Installs npm dependencies
7. Downloads CLI from `install.dejajs.com/releases/latest/deja`
8. Starts server

Zero GitHub tokens. Zero Firebase config entry. Two prompts total (UID + Layout ID).
