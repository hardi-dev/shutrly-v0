# F-00 Foundation — Spec

> Localization amendment (Owner 2026-10-06): [product policy](../../product/localization.md), BR-L10N-* and [ADR-025](../../architecture/decisions/ADR-025-next-intl-bilingual-localization.md) supersede language-only instructions in this document. English is the default; EN/ID switching and complete localized copy are required. Earlier Indonesian labels/defaults remain reference examples, not an approved single-language implementation. Feature business behavior is unchanged. Update reviewed copy and approved Pencil exports before implementation; legacy data and recipient-language policies remain pending.

Status: DONE (verified 2026-09-27, [verification-report.md](verification-report.md)) · Slug: `foundation` · Rules: BR-WS-002, BR-WS-003 · Journeys: none (technical enabler)

## Goal
Give the repository a runnable, testable Next.js scaffold on the approved architecture. It must provide **exactly** the contracts F-01 Auth consumes ([auth/plan.md › F-00 contracts](../auth/plan.md)) plus the tenant-isolation building blocks every later feature relies on. After F-00, a feature starts from a green local quality gate.

## User story
As the **developer (Owner + AI agent)**, I want a scaffold with enforced boundaries, database access, test harnesses and design tokens, so that feature work starts with TDD straight away and can't drift from the architecture.

## Preconditions
- Node 22 LTS and pnpm 10 are installed locally.
- The shared **non-production** Neon database exists. Its pooled and direct connection strings are available to the Owner (ADR-009).
- A Cloudflare account exists. F-00 uses it only for local Workers emulation and does not deploy.
- Approved design tokens are in `docs/design-system/tokens.json` (479 tokens, `mode: light | dark`).

## Inputs
- Environment: `DATABASE_URL` (pooled), `DATABASE_URL_UNPOOLED` (direct, for migrations only), and `APP_STAGE` (`development | test | production`). Values live in git-ignored `.env.local` / `.env.test`. `.env.example` lists the keys with no values.
- `docs/design-system/tokens.json` is the only source for `src/ui/theme/tokens.css`.

## What F-00 delivers

| # | Capability | Contract / location |
|---|---|---|
| 1 | Next.js App Router, TypeScript `strict`, pnpm, `@/*` → `src/*` | `tsconfig.json`, `package.json` |
| 2 | OpenNext Cloudflare adapter config for a **local** Workers preview (ADR-008) | `open-next.config.ts`, `wrangler.jsonc`, `pnpm preview` |
| 3 | Environment schema, validated when first read, failing fast with the key name and never the value | `src/shared/env/app-env.ts` → `AppEnv`, `appEnvSchema` |
| 4 | Request context from the Cloudflare context | `src/composition/request-context.ts` → `getRequestContext()` |
| 5 | Per-request Neon `Pool` + Drizzle; the pool closes via `waitUntil` (ADR-009) | `src/adapters/db/client.ts` → `createDb`, `Db`; `src/adapters/db/schema/index.ts` barrel |
| 6 | Drizzle migrations: generate, review, commit; migrate uses the direct URL | `drizzle.config.ts`, `pnpm db:generate`, `pnpm db:migrate` |
| 7 | Tenant schema conventions: `workspace_id` column, unique `(workspace_id, id)`, composite FK helper, uuid ids, `timestamptz` audit columns (BR-WS-002, ADR-003) | `src/adapters/db/schema/_conventions/` |
| 8 | Branded `WorkspaceId` and the `WorkspaceContext` type (`AuthUserId` stays in F-01) that owner-scoped repository functions must take (BR-WS-003, contract only) | `src/shared/ids/`, `src/shared/workspace-context/` |
| 9 | Typed domain errors + generic unexpected-error page | `src/shared/errors/domain-error.ts` → `DomainError`; `src/app/error.tsx` |
| 10 | Structured logger with key redaction (C-103) | `src/shared/logging/logger.ts` → `logger` |
| 11 | Generated `tokens.css` (light + dark), wired into the Tailwind v4 theme, with a drift check | `src/ui/theme/tokens.css`, `pnpm tokens:css`, `pnpm tokens:check` |
| 12 | `Button` and `TextField` primitives (React Aria + Tailwind) with the exact props in the auth contract; `I18nProvider` `id-ID` at the root | `src/ui/primitives/button/`, `src/ui/primitives/text-field/` |
| 13 | Lint for the folder architecture's import boundaries and the coding rules v2.0 **(lint)** rules | `eslint.config.mjs`, `eslint/local-rules.mjs`, pre-commit hook |
| 14 | Test harnesses: Vitest unit (node + jsdom for `.tsx`), integration against the non-prod Neon, Playwright with `webServer` | `vitest.config.ts`, `tests/integration/helpers/test-db.ts` → `openTestDb`, `playwright.config.ts` |
| 15 | Local quality gate | scripts `typecheck`, `lint`, `test`, `test:integration`, `e2e`, `build`, `preview`, `db:generate`, `db:migrate`, `tokens:css`, `tokens:check` |

## Main flow (developer)
1. Clone the repo, run `pnpm install`, and copy `.env.example` to `.env.local` and `.env.test` with non-prod values.
2. `pnpm dev` serves a placeholder home page styled with tokens.
3. `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all pass.
4. `pnpm test:integration` connects to the non-prod Neon, and each test seeds its own uniquely identified data.
5. `pnpm e2e` starts the app and passes the smoke journey.
6. `pnpm preview` runs the OpenNext build locally under Wrangler and serves the same page. This proves the app runs on Workers.

## Alternative flows
- **Tokens change:** the Owner regenerates `tokens.json` (design-system workflow), then runs `pnpm tokens:css`. `pnpm tokens:check` (part of `pnpm lint`) fails while `tokens.css` is stale.
- **Schema change:** a feature adds a table file, exports it from the barrel, runs `pnpm db:generate`, reviews the SQL, and commits it. The Owner applies it with `pnpm db:migrate` (see CONFLICT-F00-1).

## Error flows
- **Missing or invalid env key:** fails with `Invalid environment: <KEY>`, and the value is never printed.
- **Integration tests without `APP_STAGE=test`:** `openTestDb` refuses to connect. This guards against pointing tests at production (coding rules › Testing).
- **Boundary violation** (for example domain importing `drizzle-orm`, a feature importing `react-aria-components`, `app/` importing `adapters/`): `pnpm lint` fails.
- **Unexpected server error:** logged with `requestId` (redacted fields); the user sees a generic error page.

## Business-rule references
- **BR-WS-002 — Tenant isolation:** F-00 supplies the schema conventions (capability 7) that make cross-workspace references impossible at DB level. There are no tenant tables yet.
- **BR-WS-003 — Workspace context verified:** F-00 supplies only the `WorkspaceContext` type contract (capability 8). The resolver that verifies ownership needs the `workspace` table and is **F-02**.
- Constitution C-004, C-006, C-008, C-101, C-103. ADR-001, 003, 008, 009, 010.

## Dependencies
- Upstream: none.
- Downstream: F-01 Auth (Task 0 checks the contracts), then F-02 and every later feature.

## Assumptions (low-risk, reversible)
- **A-1:** pnpm is the package manager (auth plan uses it).
- **A-2:** Lint and format tooling follows [coding rules v2.0](../../coding-rules.md) › Tooling.
- **A-3:** `tokens.css` is generated by a TypeScript script from `tokens.json`. The generated file is committed, which keeps `gen_tokens.py` the only token authority. Dark mode is **opt-in** via `[data-theme="dark"]`, with no `prefers-color-scheme` rule, because the approved auth screens are light and no feature specifies a theme switch.
- **A-4:** `Button` ships only the variants in the auth contract (`primary | secondary`; C01 has no ghost). Danger and sizes beyond MD are added when a feature needs them (C-010).
- **A-5:** `APP_STAGE` is the production guard for tests. It is an F-00 convention, not a product rule.
- **A-6:** Only folders that contain code are created. Empty feature folders are not scaffolded.
- **Scope note (2026-09-27, verification):** after the plan, design-system work extended the primitives:
  - `Button` gained `danger`, `lg` and icons;
  - an `Input` primitive and the semantic `Icon` registry were added;
  - two icon-size tokens were added (481 tokens in total);
  - Storybook was added (ADR-014).

  These are accepted as design-system work (see verification-report.md). The runtime env file for `next dev` is `.dev.vars`, not `.env.local`.

## Out of scope
- **CI (GitHub Actions) and Cloudflare deployment/previews.** Owner decision 2026-09-26: F-00 is local only. They're scheduled before the first `/sdv:ship`.
- Production Neon, secrets in Cloudflare.
- **App Shell, Sidebar, App Panel code:** owned by **F-02 Workspace** (Owner decision 2026-09-26, resolves auth R-6).
- The `workspace` table, the workspace resolver, and any tenant table.
- Better Auth, Resend, rate limiting, and the `Alert` pattern: all belong to F-01.
- UI-language decision (auth CONFLICT-1).
- Primitives beyond `Button` and `TextField`.

## Open questions / conflicts
- **CONFLICT-F00-1 — Who applies migrations.** RESOLVED (Owner 2026-09-26): the interim below is accepted and recorded in tech-stack.md. [tech-stack.md](../../architecture/tech-stack.md) and ADR-009 say migrations are applied "only from `main` via CI". The Owner chose no CI for F-00. **Proposed interim:** the Owner runs `pnpm db:migrate` by hand from a clean, up-to-date `main` checkout, so the intent ("only from `main`, never from a preview") holds. The Owner needs to accept this interim; the permanent CI step comes with the CI work.
- **Note:** this checkout has no git remote configured, although the Owner says a GitHub repo exists. That doesn't matter for F-00.
