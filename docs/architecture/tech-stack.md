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
- Client gallery access: a signed, path-scoped cookie per project link and public rate limits on the Neon counters ([ADR-023](decisions/ADR-023-client-gallery-sessions-and-public-limits.md), Accepted)
- Storage: none owned; photos stay in Google Drive and load from Google's image host by file ID ([ADR-019](decisions/ADR-019-gallery-media-and-sync-on-free-tier.md))
- Transactional email (auth only): Resend ([ADR-011](decisions/ADR-011-resend-transactional-email.md))
- Landing waitlist: Resend Contacts, one segment per environment in the account's audience, no database table ([ADR-022](decisions/ADR-022-waitlist-in-resend-contacts.md))
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
- **Staging (Owner 2026-10-06, [ADR-020](decisions/ADR-020-staging-on-netlify.md)):** moved to Netlify Free after the Worker hit Cloudflare error 1102. Site `shutrly`, deployed by hand from the `staging` branch with `netlify deploy --build --alias staging` to `https://staging--shutrly.netlify.app` (`netlify.toml`; variables are Netlify site env vars, visitor access public). Database: Neon project `shutrly-staging-us` (`aws-us-east-2`, created empty, migrations `0000`–`0014` applied with drizzle-kit over its direct connection; `0015`–`0017` applied on 2026-10-07 and `0018` on 2026-10-09 before merging, at the Owner's request, see the ADR-020 amendment). Functions run in `us-east-2` on the Free plan (region not configurable), so latency is ~0.5 s per request above the edge.
- **Production (Owner 2026-10-07, [ADR-021](decisions/ADR-021-production-on-netlify-landing-only.md)):** the main URL of the Netlify site `shutrly`, deployed with `pnpm deploy:prod`, with no Neon project while the gate is up (the waitlist lives in Resend Contacts, [ADR-022](decisions/ADR-022-waitlist-in-resend-contacts.md)). During the development phase production serves only the F-19 landing page and its waitlist submission; every other route is not found (gate keyed on `APP_STAGE=production`).
- **Deploy scripts:** `pnpm deploy:staging` (draft deploy with the `staging` alias) and `pnpm deploy:prod` (main URL; only from a clean, up-to-date `main`, asks first; `--yes` skips the prompt, `--dry-run` prints the command). Both are `scripts/deploy/netlify-deploy.sh`, need `netlify login` and `netlify init` once, and refuse a dirty working tree. Never deploy from a checkout under a hidden folder such as `.claude/worktrees/`: the Next.js runtime then looks for `/run-config.json` and every request returns 502 (2026-10-07). Use a checkout whose path has no dot folder, with `NETLIFY_SITE_ID` set when it is not linked. The script passes `--functions .netlify/functions-internal`: without it the CLI looks for the missing `netlify/functions` (since `netlify/edge-functions` exists) and deploys without the Next.js server handler, so every route returns Netlify's 404 (2026-10-09). Production also needs its own Netlify variables for the production context (database, `BETTER_AUTH_URL`, `APP_STAGE=production`) before first use.
- **Staging, previous setup (Owner 2026-10-05, kept, not in use):** Worker `shutrly-staging` at `https://shutrly-staging.shutrly.workers.dev` (`wrangler.jsonc` env `staging`), deployed by hand with `opennextjs-cloudflare build` and `opennextjs-cloudflare deploy --env staging` (the `pnpm preview` and old `pnpm deploy:staging` scripts were removed on 2026-10-06). Its database is the Neon branch `staging` of project `shutrly-v0`. Secrets are Worker secrets; `BETTER_AUTH_URL`, `APP_STAGE` and `AUTH_EMAIL_FROM` are vars in `wrangler.jsonc`. Staging gets only migrations already merged to `main`.
- Migrations run from `main` via CI only; preview deploys never migrate the shared database
  - **Interim (Owner 2026-09-26, until CI exists):** the Owner runs `pnpm db:migrate` by hand from a clean, up-to-date `main` checkout.
  - **During development (Owner 2026-10-02):** an agent may run `pnpm db:migrate` against the shared **non-production** database (`DATABASE_URL_UNPOOLED` in `.dev.vars`), including from a feature branch, when:
    - the migration was generated by drizzle-kit, reviewed and committed first;
    - it is additive or otherwise safe for code on other branches that shares the same database (no drops or renames of columns other branches still use);
    - the run and its result are reported in the task report.

    Never against production, never with a hand-edited applied migration, never with credentials other than `.dev.vars`.

## Seed data
- **Command:** `pnpm db:seed` runs [`scripts/dev/seed.ts`](../../scripts/dev/seed.ts) with `tsx --conditions=react-server` (Owner 2026-10-07). It creates one demo studio on a **non-production** database through the app's own adapters and use cases, never with hand-written SQL, so every business rule, encryption and audit field applies:
  - an Owner registered through Better Auth (`signUpEmail` via the identity adapter's `createPasswordUser`), then verified with the link Better Auth issues (`verifyEmail`), as a real sign-up would; Better Auth's docs create users through its API, not by inserting `user`/`account` rows;
  - a workspace with its defaults (message templates, photo source, item definitions, team roles, as `createOwnerWorkspace`), category *Wisuda*, service *Wisuda Basic* (*Foto edit* 10, *Foto cetak* 5) and two clients;
  - project *Wisuda Rina* (BOOKED, one session) whose gallery is created with a password, linked to a public Drive folder, synced with the real Drive provider and published, which opens its selection groups; and draft project *Wisuda Sari*;
  - final delivery, only when the folder has `edited` or `print` subfolders (BR-GAL-007); a flat folder gives proofs only.
- **Safety:** it refuses `APP_STAGE=production`, never deletes or updates existing rows, and stops before writing anything when the Owner's email already exists (seed again with another `SEED_OWNER_EMAIL`). `drizzle-seed` is not used: it inserts random rows outside the business rules, and its reset truncates tables with `CASCADE`.
- **Target:** `DATABASE_URL`, `GALLERY_PASSWORD_KEY`, `GOOGLE_DRIVE_API_KEY`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `APP_STAGE` come from the environment, else from `SEED_ENV_FILE` (default `.dev.vars`). Each database must be seeded with **its own** environment's keys: a gallery password encrypted with another `GALLERY_PASSWORD_KEY` cannot be shown on that host. For Netlify staging, export the values from the site's variables (`netlify env:get … --context branch-deploy`) without printing them.
- **Options:** `SEED_OWNER_EMAIL` (default `owner@shutrly.test`), `SEED_OWNER_PASSWORD` and `SEED_GALLERY_PASSWORD` (generated when unset), `SEED_DRIVE_FOLDER` (default: the Owner's example folder `1yyis5MpfzQHuJs1DZAE_StzDXC8HEvhC`, 113 JPGs of 13–24 MB, no subfolders), `SEED_CREDENTIALS_FILE` (default `.env.seed`).
- **Credentials:** the Owner and gallery passwords, the project path and the client link (`/g/<token>`) are written to the credentials file with mode `600`. It matches `.env*` in `.gitignore`; never commit it or paste its values. Use one file per target (e.g. `.env.seed.dev`, `.env.seed.staging`).
- **Seeded so far (2026-10-07):** the shared non-production database (`owner@shutrly.test`; a second test studio `owner-ba@shutrly.test`), Netlify staging `shutrly-staging-us` and the old staging branch, each with `owner@shutrly.test`. The two staging Owners were created by the first version of the script, which inserted the `user`/`account` rows with Better Auth's `hashPassword` (the same scrypt hash; such an Owner was shown to sign in on the non-production database). Later runs register through Better Auth as above.
- **Neon:** Neon's recommended way to get realistic data on a dev or staging database is a branch of the parent; staging is a separate project in another region (ADR-020), so it is seeded instead. Migrations still use the direct connection; the seed writes like the app, over `DATABASE_URL`.

## Architecture Principles
- Domain logic is framework-free and unit-testable.
- Server is the only authority for integrity/security rules.
- Workspace isolation is enforced in both queries and schema ([ADR-003](decisions/ADR-003-workspace-isolation.md)).
- Provider integrations sit behind interfaces.
