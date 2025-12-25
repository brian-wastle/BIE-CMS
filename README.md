# BIE-CMS

Headless CMS built on:
- Angular v21 for the authoring and public experiences.
- Node with Express API for auth, content, and Filestack media uploads
- PostgreSQL database.
- A shared `bie-models` library to keep contracts aligned.

## Project structure
```
apps/
  bie-frontend/   # Angular SSR app
  bie-backend/    # Express API and DB migration
  
libs/
  bie-models/     # Shared types library
tools/            # Run command helpers
```

## Prerequisites
- Node 18+
- npm 10+
- PostgreSQL 14+ with the `citext` extension available.
- Filestack API key and app secret (Filestack implementation can be swapped for any CDN).

## Environment variables
Create `.env` files in the repo root, `apps/bie-backend`, and `apps/bie-frontend` as needed.

Example .envs are available in each repo

## Quick migration steps
- Clone repo
- Set environment variables
```bash
npm i
npm run lib:build
npm run db:bootstrap         # first install only
npm run db:migrate
npm run db:seed:admin        # seeds initial admin user, see .env.example
npm run prod:ssr              # starts Angular, SSR and API servers
```
- Configure nginx

## Common scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Runs Angular and API dev servers (no SSR). |
| `npm run dev:ssr` | Runs Angular, API, and SSR dev servers. |
| `npm run build:prod` | Builds types lib, backend, and frontend bundles. |
| `npm run prod:ssr` | Runs the compiled API and SSR server. |
| `npm run db:all` | Bootstrap postgres db, run migration scripts in order, seed admin to database. |

## Deployment notes
1. Run `npm run build:prod`.
2. Start servers via `npm run prod:ssr`.
3. Route traffic with nginx.

## Health checks
- Backend: `GET http://127.0.0.1:4000/healthz` checks API and database.
- SSR: `GET http://127.0.0.1:4100/healthz` verifies the Angular server bundle responds.

Keep `.env` files out of version control and rotate secrets when shipping to production.
