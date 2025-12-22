# BIE-CMS

Headless CMS built on:
- Angular 20 (signals + SSR) for the authoring and public experiences.
- Node with Express API for auth, content, and Filestack media uploads
- PostgreSQL for persistence.
- A shared `bie-models` library (zod) to keep contracts aligned.

## Project structure
```
apps/
  bie-frontend/   # Angular SSR app
  bie-backend/    # Express API + DB tooling
libs/
  bie-models/     # Shared schemas/types
tools/            # build/run helpers
```

## Prerequisites
- Node 18+
- npm 10+
- PostgreSQL 14+ with the `citext` extension available.
- Filestack API key + app secret (Filestack implementation can be swapped for any CDN).

## Environment variables
Create `.env` files in the repo root, `apps/bie-backend`, and `apps/bie-frontend` as needed.


## Quick start
```bash
git clone <repo> && cd BIE-CMS
cp .env.example .env         # adjust per environment
npm ci
npm run lib:build
npm run db:bootstrap         # first install only
npm run db:migrate
npm run db:seed:admin        # seeds initial admin user
npm run dev                  # starts Angular + API (with SSR when --ssr)
```

## Common scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Runs backend + Angular dev servers (no SSR unless `--ssr`). |
| `npm run dev -- --ssr` | Same as above but serves SSR + API. |
| `npm run build:prod` | Builds shared lib, backend, and frontend bundles. |
| `npm run prod:ssr` | Runs the compiled API (`PORT=4000`) and SSR server (`PORT=4100`). |
| `npm run db:all` | Bootstrap + migrate + seed admin. |
| `npm run db:rebase` | Drop DB then re-run bootstrap/migrations/seeds (dangerous). |

Each workspace also exposes its own scripts (`npm -w apps/bie-frontend run build`, etc.).

## Deployment notes
1. Run `npm run build:prod`.
2. Start servers via `npm run prod:ssr` (wrap with PM2/systemd on Linux).
3. Terminate TLS and route traffic with nginx or Caddy; keep ports 4000/4100 firewalled to localhost.
4. Ensure background workers (cron/queue) are pointed at the same env + database if applicable.

## Health checks
- Backend: `GET http://127.0.0.1:4000/healthz` checks API + DB.
- SSR: `GET http://127.0.0.1:4100/healthz` verifies the Angular server bundle responds.

Keep `.env` files out of version control and rotate secrets when shipping to production.
