# ADR-024: One non-production database, the staging project in us-east-2

Status: Accepted (Owner, 2026-10-09)
Date: 2026-10-09
Amends: [ADR-009](ADR-009-neon-serverless-driver.md) (three databases become two), [ADR-020](ADR-020-staging-on-netlify.md) (point 4 and Consequences)

## Context
Since ADR-020 there were three non-production databases in two regions: the shared non-production branch of `shutrly-v0` (ap-southeast-1) for local dev, integration tests and the agents' migrations; the old staging branch of the same project; and `shutrly-staging-us` (us-east-2) for the Netlify staging site. Each migration had to be applied by hand to each one, and each needed its own seed with its own keys. On 2026-10-09 the demo seed ran on the ap-southeast-1 database while the Owner tested on staging, so the seeded Owner could not sign in there. The Owner chose one database.

## Decision
1. **`shutrly-staging-us` (Neon, `aws-us-east-2`) is the only non-production database.** Local dev (`.dev.vars`), integration tests (`.env.test`, `APP_STAGE=test`), Playwright, `pnpm db:seed` and the Netlify staging site all use it.
2. **The Neon project `shutrly-v0` in ap-southeast-1 is retired**, its non-production branch and its old `staging` branch with it. The Owner deletes it in the Neon console after the local files point at us-east-2; agents never delete it.
3. **Local files carry the staging values** that the database's data depends on: `DATABASE_URL` and `DATABASE_URL_UNPOOLED` of `shutrly-staging-us`, and the staging `GALLERY_PASSWORD_KEY` and `CLIENT_SESSION_KEY` (a gallery password encrypted with another key can't be shown, and a client session signed with another key is refused). The Owner copies them; agents don't materialise staging secrets into files. `BETTER_AUTH_URL` stays per host (`http://localhost:3000` locally, the alias URL on Netlify).
4. **Migrations:** the rule of 2026-10-02 (tech-stack › Deployment) now targets this database. An agent may run `pnpm db:migrate` with `DATABASE_URL_UNPOOLED` from `.dev.vars` for a migration it generated, reviewed and committed, and reports each run. Because the staging site reads the same database, a migration from a feature branch reaches staging before its code does, so it must keep the deployed `staging` code working (additive, no drops or renames of columns it uses). "Staging gets only migrations merged to `main`" (ADR-020 point 4) no longer applies.

## Alternatives considered
- **Keep ap-southeast-1 for dev and seed staging separately** (the state before): lower latency from Indonesia for local dev and tests, but two migrations and two seeds per change, and data seeded in one place is missing in the other.
- **One database in ap-southeast-1, staging pointed at it:** Netlify Free functions run in us-east-2 only (ADR-020 › Measurements), so every staging query would cross the Pacific again (+~0.4 s).

## Consequences
- One migration run and one seed per change; data seeded or created locally is visible on `staging--shutrly.netlify.app`.
- Local dev, integration tests and E2E talk to Ohio from Indonesia, so each query is slower than with the Singapore database.
- Integration tests and E2E leave their unique rows in the staging database (they never truncate, `tests/integration/helpers/test-db.ts`); those rows can show up to anyone browsing staging with the same Owner account, which tests don't use.
- A broken migration or a test bug now affects the staging site directly. There is no separate database to try a risky migration first; use a Neon branch of `shutrly-staging-us` for that.
- Rows only in the ap-southeast-1 database (earlier seeds, Owners registered locally, test data) are lost when it is deleted; nothing there is production data.
- Production keeps its own database once it has one (ADR-021); nothing here touches it.

## Related
- ADR-009, ADR-020, ADR-021; `docs/architecture/tech-stack.md` › Testing, Deployment, Seed data; `AGENTS.md` › Hard stops
