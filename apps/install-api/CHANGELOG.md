# install-api

## 0.1.0

### Minor Changes

- fdaede3: feat: add install-api for public release hosting via Vercel Blob

  - Added `install-api` Hono app to serve install scripts and proxy release downloads from Vercel Blob storage
  - Updated `scripts/install.sh` and `scripts/deja` CLI to download from `install.dejajs.com` instead of GitHub Releases, removing GitHub token requirement
  - Updated CI workflow to upload release assets to Vercel Blob and embed install script in install-api
