# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev          # Angular + API dev servers (no SSR)
npm run dev:ssr      # Angular + API + SSR dev servers
npm run lib:build    # Build shared bie-models library (required after changes to libs/)
```

### Testing
```bash
npm run test:front                           # Run all frontend tests (Karma/Jasmine)
npm -w apps/bie-frontend run test -- --include="**/canvas*"  # Run a single test file
```

### Building & Production
```bash
npm run build:prod   # Build types lib + backend + frontend bundles
npm run prod:ssr     # Start compiled API, SSR server, and CSR static server
```

### Database
```bash
npm run db:all       # Bootstrap DB + run migrations + seed admin (first install)
npm run db:rebase    # Drop + bootstrap + migrate + seed (full reset)
npm run db:migrate   # Run pending migration scripts only
```

## Architecture

### Monorepo layout
This is an npm workspaces monorepo with three packages:
- `apps/bie-frontend` — Angular 21 SSR app (authoring UI + public site)
- `apps/bie-backend` — Express API server (auth, pages, recipes, media, DB gateway)
- `libs/bie-models` — Shared Zod schemas and TypeScript types used by both apps

**`bie-models` must be rebuilt (`npm run lib:build`) whenever its source changes.** Both the frontend and backend import from this library.

### Server topology
In production three processes run behind nginx:
- **Port 4000** — Express API (`apps/bie-backend`). Handles `/api/*` routes and proxies all other requests to the SSR server.
- **Port 4100** — Angular SSR server (Node/Express, built by `@angular/ssr`).
- **Port 4200** — Static CSR file server (dev only in production use nginx).

Health checks: `GET /healthz` on ports 4000 and 4100.

### Data model and persistence
Pages are stored in PostgreSQL with a `pages` table (id, slug) and a `page_versions` table (content, blocks, grid, meta, status). The backend always reads the latest version. `bie-models` defines the canonical Zod schemas for all page/block types — both the API and frontend validate against the same schemas.

### Block system
Content blocks live in `libs/bie-models/src/lib/content-block.model.ts`. Each block type:
1. Is listed in `BlockTypeSchema` (z.enum)
2. Has its own Zod schema (e.g. `TextBlockSchema`) extending `BlockBaseSchema`
3. Is added to the `BlockSchemas` array (which auto-generates `AnyBlockSchema`, `BlockUpdateSchema`, and the `BlockUpdate` type)
4. Has an Angular component in `apps/bie-frontend/src/app/components/blocks/`

`BlockBase` includes `id`, `type`, `layout` (grid placement), `hAlign`, `vAlign`, `fontSize`, and `color`. The canvas editor uses a configurable CSS grid (default 12 columns, 48px row height).

### Canvas editor (`/author`)
The canvas editor (`pages/canvas/`) is the core authoring experience. It manages:
- An array of `AnyBlock` signals representing the current page state
- Grid placement (colStart/colSpan/row/rowSpan) for each block
- Layout reflow via `canvas-utils.ts` utilities (`reflowRows`, `clampLayout`, etc.)
- Save/load via `PagesService`

Block components extend the abstract `BlockShell<TBlock>` directive and can call `autoSize()` to request the canvas to resize their row span based on content height.

### Routing and authentication
Two route groups share the root path in `app.routes.ts`:
- **Public** (`PublicShellComponent`): homepage and `/blog/:slug` published pages
- **CMS** (`CmsShellComponent` + `authGuard`): `/author`, `/upload`, `/recipegenerator`, `/recipemanager`, `/drafts`, `/login`

Auth uses JWT stored in HttpOnly cookies. `AuthSessionService` wraps all API calls with a retry-on-401 mechanism.

### SSR-safe API calls
`PagesService` and other services use a `buildApiUrl()` helper that switches between relative paths (browser) and an absolute URL (SSR, derived from `PUBLIC_API_BASE_URL`, `API_TARGET` env var, or forwarded request headers). Server-side requests forward cookies via `withServerCookies()`.

### Media
Media uploads go through Filestack (configured in `apps/bie-backend/src/filestack.ts`). The `imagekit` package is also a dependency. `mediaHandle` fields on image/video blocks store the Filestack handle for transformations.
