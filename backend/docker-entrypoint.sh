#!/bin/sh
# Container entrypoint for the backend: apply any pending database migrations,
# then start the compiled API. Run from /app/backend so Prisma finds
# ./prisma/schema.prisma and the hoisted prisma CLI at ../node_modules/.bin.
set -e

echo "[entrypoint] Applying database migrations (prisma migrate deploy)…"
npx prisma migrate deploy

echo "[entrypoint] Starting API…"
exec node dist/main.js
