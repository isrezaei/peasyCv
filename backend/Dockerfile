# Backend image (NestJS API + Prisma + server-side PDF rendering).
#
# Build from the REPO ROOT (this is an npm-workspaces monorepo, so the build
# needs the root lockfile and the shared @resume/types package):
#
#   docker build -f backend/Dockerfile -t peasycv-backend .
#
# The API renders PDFs by driving headless Chromium over the frontend's /print
# route, so Chromium is installed in the runtime stage (puppeteer-core does NOT
# bundle a browser). Persian glyphs come from the frontend's web fonts; the
# system fonts here are only a Latin/fallback safety net.

# ---------------------------------------------------------------------------
# Stage 1 — builder: install every workspace dep, build shared types, generate
# the Prisma client, and compile the Nest app.
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Manifests first so `npm ci` is cached until a package.json actually changes.
# Every workspace listed in the root package.json must be present for `npm ci`.
COPY package.json package-lock.json ./
COPY packages/types/package.json packages/types/
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY apps/web/package.json apps/web/

RUN npm ci

# Sources needed to build the backend + the shared contract package.
COPY packages/types packages/types
COPY backend backend

# Build order mirrors the root `build` script: types -> prisma client -> nest.
RUN npm run build --workspace @resume/types \
 && npm run prisma:generate --workspace @resume/backend \
 && npm run build --workspace @resume/backend

# ---------------------------------------------------------------------------
# Stage 2 — runner: slim runtime with Chromium + only what the API needs.
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production
WORKDIR /app

# Chromium for Puppeteer + fonts + openssl (Prisma query engine needs libssl).
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      chromium \
      fonts-liberation \
      fonts-noto-core \
      ca-certificates \
      openssl \
 && rm -rf /var/lib/apt/lists/*

# Matches the chromium installed above; resolveChromeExecutable() also probes
# this path, so PDF rendering works even if the env var is left blank.
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Hoisted deps (incl. generated Prisma client + the prisma CLI for migrations),
# the built shared types, and the compiled Nest app.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY backend/docker-entrypoint.sh ./backend/docker-entrypoint.sh
RUN chmod +x ./backend/docker-entrypoint.sh

WORKDIR /app/backend

# Local-storage uploads land here (mount a volume to persist them). Harmless
# when STORAGE_PROVIDER is s3/cloudinary.
RUN mkdir -p uploads

EXPOSE 4000
ENTRYPOINT ["./docker-entrypoint.sh"]
