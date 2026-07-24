---
name: verify
description: How to build, launch, and drive this resume-builder app to verify a change end-to-end (editor UI, templates, PDF path).
---

# Verifying changes in this repo

## Prerequisites / launch
- DB: `npm run db:up` (Postgres on 127.0.0.1:5544). After any `schema.prisma` change: `cd backend && npx prisma migrate dev --name <name>` (the root `npm run prisma:migrate -- --name x` mangles the flag through the workspace passthrough and hangs on an interactive prompt — run it in `backend/` directly).
- Backend: `npm run dev:backend` → NestJS on http://localhost:4000 (watch the log for "API listening"). If it's down, the editor spews `ERR_CONNECTION_REFUSED` console errors on every save.
- Frontend: `npm run dev:frontend` → Next.js on http://localhost:3000. Often already running — probe with a HEAD request first.

## Driving the app
Model scripts live in `frontend/scripts/verify-*.mjs` (playwright-core + system Chrome at `C:\Program Files\Google\Chrome\Application\chrome.exe`). Key mechanics:
- Scripts must run from `frontend/` (or be copied into `frontend/scripts/`) so `playwright-core` resolves.
- Seed a full resume via `localStorage.setItem("ai-res:resume", JSON.stringify(data))` then reload; wait for `.a4-page`. Omitting newer theme fields is fine in the editor (normalizeResume backfills) but NOT for the backend `/pdf` endpoint, which validates the full DTO strictly — copy a complete fixture from `verify-new-templates.mjs` and keep section-level display settings (skillDisplayMode etc.) and personalInfo.militaryService present.
- Panels: open via sidebar text buttons «طراحی و فونت» (design) / «قالب‌ها» (templates). Template cards are `button`s with `aria-label` = the Persian template name — but only `templateOrder` templates are offered (5 as of July 2026); the removed skins (aside-dark, aside-photo, compact-duo, ruled-single, classic-centered) are reachable only by seeding a resume with that `templateId`.
- Chakra SwitchField rows sit in nested scroll containers that defeat Playwright's viewport check ("element is outside of the viewport" forever). Toggle via DOM instead: find `[data-scope="switch"][data-part="label"]` by text, `label.closest("label").querySelector("input").click()` — same event path.
- The tinted sidebar of `sidebar-column` carries ONLY the achievements section (see the template's `sideTypes`); dark-column probes need an achievements section + item seeded, plus `columnIntensity` > 1.05 to flip it dark.
- PDF path: `frontend/scripts/backend-api.mjs` `createPdfClient()` → `renderPdf(resume)`; assert `%PDF-` magic + size. A libuv assertion crash on process exit (`src\win\async.c`) after your PASS line is Node-on-Windows teardown noise, not a failure.

## Gotchas
- Console errors fail a verify run — collect them from the start and expect zero once backend is up.
- Zero-layout-shift claims: compare `.a4-page` height and a heading's `getBoundingClientRect().top` before/after.
