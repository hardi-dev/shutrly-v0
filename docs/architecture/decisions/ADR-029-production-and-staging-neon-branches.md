# ADR-029: Production and staging are two branches of one Neon project

Status: Accepted (Owner, 2026-10-19)
Date: 2026-10-19
Supersedes: [ADR-027](ADR-027-non-production-database-in-ap-southeast-1.md) (the non-production database is `shutrly-v0` `main`)
Amends: [ADR-021](ADR-021-production-on-netlify-landing-only.md) (production had no database), [ADR-020](ADR-020-staging-on-netlify.md) (the staging database)

## Context
The non-production database `shutrly-v0` `main` held about 7,900 e2e test users and their workspaces (84 MB), and three older Shutrly Neon projects were still around. Production had no database while it served only the landing page. The Owner will move production to a new server and wants a clean production database plus one shared branch for staging and development.

## Decision
1. **One Neon project, `shutrly-app`** (`damp-mud-07829433`, `aws-ap-southeast-1`, Postgres 18, database `neondb`).
2. **Branch `main` is production.** It starts empty; the Owner applies the migrations to it. Agents never run migrations against it (AGENTS.md hard stop, enforced by `.claude/hooks/guard.py`).
3. **Branch `staging` is the only non-production database.** Local dev (`.dev.vars`), integration tests (`.env.test`), Playwright, `pnpm db:seed` and the Netlify staging deploys (context `branch:staging`) all use it. It was created from the empty `main`, migrated `0000`–`0023` and seeded with the demo studio `owner@shutrly.test` on 2026-10-19. The AGENTS.md rule for `pnpm db:migrate` now names this branch.
4. **The old projects are retired:** `shutrly-v0` (both branches), `shutrly-staging-us`, `shutrly-f00-foundation` and `shutrly`. The Owner deletes them in the Neon console once nothing points at them; agents don't delete them.

## Consequences
- Staging and local dev start clean; e2e runs add test users to `staging` again over time. Re-branching `staging` from `main` (after `main` is migrated) resets it to an empty schema; seed again afterwards.
- Both branches share the project's free-plan compute allowance.
- Production needs its own variables on the new server (database URL from `main`, `APP_STAGE=production`, a valid `CLIENT_SESSION_KEY` and `GALLERY_PASSWORD_KEY`).
- Local backups of the previous `.dev.vars` and `.env.test` are kept as git-ignored `*.shutrly-v0.bak` files until the old projects are deleted.

## Related
ADR-009, ADR-018, ADR-020, ADR-021, ADR-024, ADR-027
