# apps/server/Dockerfile
# ============================================================
# Stage 1: Build — bundle the server into a standalone artifact
# ============================================================
FROM node:20-slim AS build

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace root files needed for install
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./

# Copy all packages and apps (pnpm needs full workspace for resolution)
COPY packages/ ./packages/
COPY apps/server/ ./apps/server/

# Install all dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# Bundle server + workspace deps into standalone ESM output
RUN cd apps/server && pnpm build:docker

# Deploy production dependencies to an isolated directory
# pnpm deploy resolves workspace deps correctly (unlike pnpm prune in workspaces)
RUN pnpm --filter=deja-serverts deploy --prod /app/deploy

# ============================================================
# Stage 2: Runtime — minimal image with bundled output
# ============================================================
FROM node:20-slim AS runtime

# System deps for serialport native bindings
RUN apt-get update && \
    apt-get install -y --no-install-recommends libudev-dev && \
    rm -rf /var/lib/apt/lists/*

# Run as non-root user
USER node
WORKDIR /home/node/app

# Copy bundled output
COPY --from=build --chown=node:node /app/apps/server/dist ./dist/

# Copy production node_modules from pnpm deploy output (native/external deps only)
COPY --from=build --chown=node:node /app/deploy/node_modules ./node_modules/

# Config directory mount point
VOLUME ["/home/node/.deja"]

# WebSocket port
EXPOSE 8082

# Disable sound playback in Docker (no host audio)
ENV ENABLE_SOUND=false

ENTRYPOINT ["node", "dist/index.js"]
