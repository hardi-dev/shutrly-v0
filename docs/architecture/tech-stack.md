# Technology Stack

Status: ACCEPTED (confirmed by Owner 2026-09-25).

## Fixed Constraints (supplied by Owner — do not reopen)
- **Next.js** — application framework (pages, server actions, route handlers).
- **Better Auth** — authentication authority ([ADR-002](decisions/ADR-002-better-auth-owns-identity.md)).
- **Drizzle ORM** — schema, queries, transactions, migrations ([ADR-001](decisions/ADR-001-drizzle-orm.md)).
- **Neon PostgreSQL** — system of record.
- **Cloudflare** — DNS, TLS, CDN, WAF/rate limiting, deployment/runtime.
- **Google Drive** (public folder links, API key) — first photo source ([ADR-005](decisions/ADR-005-google-drive-public-links.md)).
- **WhatsApp deep links** — client communication ([ADR-006](decisions/ADR-006-whatsapp-deep-links.md)).
- **Pencil** — visual design source of truth.

## Application
- Framework: Next.js (App Router)
- Language: TypeScript, `strict`

## UI
- Styling: Tailwind CSS v4, tokens as CSS variables mirrored from Pencil ([ADR-010](decisions/ADR-010-tailwind-react-aria.md))
- Components: React Aria Components, wrapped in `src/ui/primitives/*` and `src/ui/patterns/*` ([ADR-010](decisions/ADR-010-tailwind-react-aria.md))
- Design source: Pencil
- Dates and times: `@internationalized/date` (React Aria's date library, pinned) for `DateField` / `TimeField` (F-07 D-12)
- Local explorer: Storybook 10.6.0 with `@storybook/nextjs-vite`, Controls, Docs, and a11y; local-only via `pnpm storybook` ([ADR-014](decisions/ADR-014-local-storybook-component-explorer.md))

## Backend
- Runtime / application layer: Next.js server actions + route handlers → composition root → application services in `src/features/*/application`
- Database: Neon PostgreSQL via Drizzle
- DB driver: `@neondatabase/serverless` WebSocket `Pool`, per request ([ADR-009](decisions/ADR-009-neon-serverless-driver.md))
- Authentication: Better Auth with Drizzle adapter; email + password and Google sign-in ([ADR-012](decisions/ADR-012-google-sign-in.md))
- Client gallery access: a signed, path-scoped cookie per project link and public rate limits on the Neon counters ([ADR-020](decisions/ADR-020-client-gallery-sessions-and-public-limits.md), Accepted)
- Storage: none owned; photos stay in Google Drive and load from Google's image host by file ID ([ADR-019](decisions/ADR-019-gallery-media-and-sync-on-free-tier.md))
- Transactional email (auth only): Resend ([ADR-011](decisions/ADR-011-resend-transactional-email.md))
- Hosting runtime: Cloudflare Workers via OpenNext adapter (`@opennextjs/cloudflare`) ([ADR-008](decisions/ADR-008-cloudflare-runtime.md)); **staging runs the same build on Netlify (Node)** ([ADR-020](decisions/ADR-020-staging-on-netlify.md)), with the bindings source chosen in `src/composition/request-context`

## Validation
- Zod schemas at every trust boundary (forms, server actions, route handlers, provider responses, JSONB values)
- Forms: React Hook Form + `@hookform/resolvers/zod`, sharing the same Zod schema the server action re-validates with

## Testing
- Unit: Vitest
- Integration: Vitest against the single shared non-production Neon database ([ADR-009](decisions/ADR-009-neon-serverless-driver.md))
- E2E: Playwright
- Component exploration and isolated UI documentation: Storybook stories colocated with `src/ui` units

## Code quality
- Lint: ESLint 9 flat config with `eslint-config-next`, `typescript-eslint` `strictTypeChecked`, `eslint-plugin-boundaries`, SonarJS, `simple-import-sort`, `eslint-comments`, plus the local rules in `eslint/local-rules.mjs`
- Format: Prettier (100 columns). A pre-commit hook (`simple-git-hooks` + `lint-staged`) formats and lint-fixes staged files
- Class names: `clsx` + `tailwind-merge` via `cn()`
- Server/client guard: `server-only`
- The rules themselves live in [coding-rules.md](../coding-rules.md)

## Deployment
- Cloudflare; preview deployment per git branch, all previews share the non-production Neon database
- **Plan (Owner 2026-10-05):** free plans of Workers, Neon and Resend, with a CPU check before ship and upgrade triggers ([ADR-018](decisions/ADR-018-free-tier-runtime-budget.md), Accepted)
- Three Neon databases only: **production**, one shared **non-production** (dev, CI, previews) and **staging** ([ADR-009](decisions/ADR-009-neon-serverless-driver.md), amended Owner 2026-10-05)
- **Staging (Owner 2026-10-06, [ADR-020](decisions/ADR-020-staging-on-netlify.md)):** moved to Netlify Free after the Worker hit Cloudflare error 1102. Site `shutrly`, deployed by hand from the `staging` branch with `netlify deploy --build --alias staging` to `https://staging--shutrly.netlify.app` (`netlify.toml`; variables are Netlify site env vars, visitor access public). Database: Neon project `shutrly-staging-us` (`aws-us-east-2`, created empty, migrations `0000`–`0014` applied with drizzle-kit over its direct connection). Functions run in `us-east-2` on the Free plan (region not configurable), so latency is ~0.5 s per request above the edge.
- **Deploy scripts:** `pnpm deploy:staging` (draft deploy with the `staging` alias) and `pnpm deploy:prod` (main URL; only from a clean, up-to-date `main`, asks first; `--yes` skips the prompt, `--dry-run` prints the command). Both are `scripts/deploy/netlify-deploy.sh`, need `netlify login` and `netlify init` once, and refuse a dirty working tree. Production also needs its own Netlify variables for the production context (database, `BETTER_AUTH_URL`, `APP_STAGE=production`) before first use.
- **Staging, previous setup (Owner 2026-10-05, kept, not in use):** Worker `shutrly-staging` at `https://shutrly-staging.shutrly.workers.dev` (`wrangler.jsonc` env `staging`), deployed by hand with `opennextjs-cloudflare build` and `opennextjs-cloudflare deploy --env staging` (the `pnpm preview` and old `pnpm deploy:staging` scripts were removed on 2026-10-06). Its database is the Neon branch `staging` of project `shutrly-v0`. Secrets are Worker secrets; `BETTER_AUTH_URL`, `APP_STAGE` and `AUTH_EMAIL_FROM` are vars in `wrangler.jsonc`. Staging gets only migrations already merged to `main`.
- Migrations run from `main` via CI only; preview deploys never migrate the shared database
  - **Interim (Owner 2026-09-26, until CI exists):** the Owner runs `pnpm db:migrate` by hand from a clean, up-to-date `main` checkout.
  - **During development (Owner 2026-10-02):** an agent may run `pnpm db:migrate` against the shared **non-production** database (`DATABASE_URL_UNPOOLED` in `.dev.vars`), including from a feature branch, when:
    - the migration was generated by drizzle-kit, reviewed and committed first;
    - it is additive or otherwise safe for code on other branches that shares the same database (no drops or renames of columns other branches still use);
    - the run and its result are reported in the task report.

    Never against production, never with a hand-edited applied migration, never with credentials other than `.dev.vars`.

## Architecture Principles
- Domain logic is framework-free and unit-testable.
- Server is the only authority for integrity/security rules.
- Workspace isolation is enforced in both queries and schema ([ADR-003](decisions/ADR-003-workspace-isolation.md)).
- Provider integrations sit behind interfaces.
