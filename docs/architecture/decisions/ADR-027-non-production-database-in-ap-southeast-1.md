# ADR-027: The non-production database is shutrly-v0 in ap-southeast-1

Status: Superseded by [ADR-029](ADR-029-production-and-staging-neon-branches.md) (2026-10-19); was Accepted (Owner, 2026-10-18)
Date: 2026-10-18
Supersedes: [ADR-024](ADR-024-single-non-production-database.md) points 1 and 2 (the database and its region). Points 3 and 4 of ADR-024 still apply.
Amends: [ADR-020](ADR-020-staging-on-netlify.md) (point 4 and Consequences), [ADR-009](ADR-009-neon-serverless-driver.md) (the non-production amendment)

## Context
ADR-024 chose `shutrly-staging-us` (Neon, `aws-us-east-2`) as the only non-production database, because the Netlify staging functions run in us-east-2 only. The Owner now wants every environment on the Singapore database instead and will remove the us-east-2 project. The Singapore project `shutrly-v0` still holds the non-production `main` branch, which has all 22 migrations applied and matches the local `drizzle/` files.

## Decision
1. **The Neon project `shutrly-v0` (`aws-ap-southeast-1`), branch `main`, is the only non-production database.** Local dev (`.dev.vars`), integration tests (`.env.test`, `APP_STAGE=test`), Playwright, `pnpm db:seed` and the Netlify staging site all use it.
2. **The Neon project `shutrly-staging-us` (`aws-us-east-2`) is removed by the Owner** in the Neon console, once the Netlify staging site points at `shutrly-v0`. Agents never delete it or any other Neon project.
3. **Netlify staging** (the `shutrly` site, staging context) has `DATABASE_URL` and `DATABASE_URL_UNPOOLED` set to `shutrly-v0` `main`. The Owner changes them or confirms the change.
4. **Migrations:** unchanged from ADR-024 point 4, now targeting `shutrly-v0` `main`.
5. **Staging keys:** `GALLERY_PASSWORD_KEY` and `CLIENT_SESSION_KEY` on the Netlify staging site and in local files must match the data already in `shutrly-v0` `main`. A gallery password encrypted with another key can't be shown, and a client session signed with another key is refused. The Owner verifies this before the switch.

## Alternatives considered
- **Keep `shutrly-staging-us` (ADR-024):** the Netlify functions stay next to the database, but the Owner has chosen to remove the us-east-2 project.
- **Keep `shutrly-v0` for dev and a separate staging database in another region:** two migrations and two seeds per change, the problem ADR-024 solved.

## Consequences
- Staging requests now cross from us-east-2 functions to the ap-southeast-1 database on every query, as ADR-024 estimated (~0.4 s more per request). The Owner accepts this.
- Data that exists only in `shutrly-staging-us` (seeded staging Owners, test galleries) is not copied and is gone when that project is removed. Nothing there is production data.
- The `staging` branch of `shutrly-v0` (ADR-024 retired it) is not used by this decision; the Owner decides whether to delete it.
- Local dev and tests are fast again: no cross-region trip from Indonesia.

## Related
- ADR-009, ADR-020, ADR-021, ADR-024; `docs/architecture/tech-stack.md` › Deployment, Seed data; `AGENTS.md` › Hard stops
