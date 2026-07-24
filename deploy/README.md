# Deploying the PeasyCV studio with Docker

Runs the whole studio — Postgres, the NestJS API, and the Next.js app — as three
containers on a single Docker host. TLS termination for `studio.peasycv.ir` (and
your API domain) is expected to be handled by a reverse proxy in front of these
containers (Nginx / Caddy / Traefik).

## 1. Prepare the env files

Two files hold everything you fill in:

```bash
# compose-level: DB credentials, published ports, public API URL (build arg)
cp .env.docker.example .env

# backend app config: CORS origins, JWT secrets, OAuth, storage, PDF
cp deploy/backend.env.example deploy/backend.env
```

Edit both. The **required** values:

| File                 | Variable                          | Set to                                                        |
|----------------------|-----------------------------------|---------------------------------------------------------------|
| `.env`               | `POSTGRES_PASSWORD`               | a strong password                                             |
| `.env`               | `NEXT_PUBLIC_API_URL`             | public URL of the API as the **browser** reaches it           |
| `deploy/backend.env` | `FRONTEND_ORIGIN`                 | `https://studio.peasycv.ir,http://studio.peasycv.ir`          |
| `deploy/backend.env` | `FRONTEND_URL`                    | `https://studio.peasycv.ir` (used for public share links)     |
| `deploy/backend.env` | `API_URL`                         | public URL of the API                                         |
| `deploy/backend.env` | `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | long random strings (`openssl rand -hex 48`)         |

`DATABASE_URL` is assembled automatically by compose from the `POSTGRES_*` values
in `.env` — don't set it in `backend.env`.

## 2. Build & start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

The backend runs `prisma migrate deploy` on startup, so the schema is created on
first boot. Watch logs with:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

## How CORS is enforced

In production the API accepts requests only from:

- `localhost` / `127.0.0.1` (any port, http or https) — always allowed,
- the origins listed in `FRONTEND_ORIGIN` (the `studio.peasycv.ir` domain, both
  schemes).

Everything else is rejected. (Private-LAN origins are allowed only when
`NODE_ENV` is not `production`.)

## Notes

- **`NEXT_PUBLIC_API_URL` is baked into the frontend at build time.** After
  changing it, rebuild the frontend image:
  `docker compose -f docker-compose.prod.yml up -d --build frontend`.
- **PDF rendering** drives headless Chromium (installed in the backend image)
  against the frontend's `/print` route over the internal network
  (`PDF_FRONTEND_URL=http://frontend:3000`) — it never leaves the Docker host.
- **Profile-image storage** defaults to `local` (persisted in the
  `backend_uploads` volume). For production, `s3` or `cloudinary` is recommended —
  fill the matching block in `deploy/backend.env` and set `STORAGE_PROVIDER`.
- **Google OAuth** is optional; leave `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
  blank to disable it.
