# Frontend image (Next.js 16 studio).
#
# Build from the REPO ROOT (npm-workspaces monorepo — Turbopack's root is the
# repo root, and deps are hoisted there):
#
#   docker build -f frontend/Dockerfile \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.peasycv.ir \
#     -t peasycv-frontend .
#
# NEXT_PUBLIC_API_URL is a NEXT_PUBLIC_* value: it is inlined into the client
# bundle at BUILD time, so it MUST be passed as a build arg. Changing it later
# requires rebuilding this image.

# ---------------------------------------------------------------------------
# Stage 1 — builder: install workspace deps and produce the production build.
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Manifests first for a cached `npm ci`. Every workspace in the root
# package.json must exist for the install to resolve.
COPY package.json package-lock.json ./
COPY packages/types/package.json packages/types/
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY apps/web/package.json apps/web/

RUN npm ci

# Shared types + the frontend sources.
COPY packages/types packages/types
COPY frontend frontend

# Baked into the client bundle — see header note.
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build --workspace @resume/types \
 && npm run build --workspace @resume/frontend

# ---------------------------------------------------------------------------
# Stage 2 — runner: serve the built app with `next start`.
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
WORKDIR /app

# Re-declare so the value is present at runtime too (server components read it
# from process.env); the client bundle already has it inlined from build.
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Hoisted deps + the built app. next.config.ts resolves ".." to /app at runtime,
# so the monorepo root layout must be preserved.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/fonts ./frontend/fonts
COPY --from=builder /app/frontend/package.json ./frontend/package.json
COPY --from=builder /app/frontend/next.config.ts ./frontend/next.config.ts

WORKDIR /app/frontend
EXPOSE 3000
CMD ["npm", "run", "start"]
