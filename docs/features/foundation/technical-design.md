# Technical Design — F-00 Foundation

Status: PLANNED (2026-09-26; revised 2026-09-27 for coding rules v2.0) · Detailed TDD plan: [plan.md](plan.md)

## Context

This design implements [spec.md](spec.md) and [acceptance-criteria.md](acceptance-criteria.md). F-00 has no screens, so there is no Pencil reference. The one visible page is a placeholder home page that F-01/F-02 replace. It also has no UML, because it has no product flow or lifecycle.

There is no `src/` yet. Everything below is new.

## Relevant authority

- Constitution: C-004, C-006, C-008, C-009, C-010, C-101, C-103
- Business rules: BR-WS-002 (schema conventions), BR-WS-003 (type contract only)
- ADRs: ADR-001 Drizzle, ADR-003 workspace isolation, ADR-008 Cloudflare Workers, ADR-009 Neon per-request Pool, ADR-010 Tailwind + React Aria
- Tech stack: [tech-stack.md](../../architecture/tech-stack.md), including the interim migration rule (Owner runs `pnpm db:migrate` from a clean `main`)
- Folder architecture: [2026-09-26-project-folder-architecture-design.md](../../superpowers/specs/2026-09-26-project-folder-architecture-design.md)
- Coding rules: [coding-rules.md](../../coding-rules.md) v2.0 (tooling, file composition, `server-only`, copy files, JSDoc)
- Consumer contract: [auth/plan.md › F-00 contracts](../auth/plan.md)

## Verified versions (npm registry, 2026-09-26)

Every dependency is pinned **exactly** (`pnpm add -E`).

| Package | Version | Why this version |
|---|---|---|
| `next`, `eslint-config-next` | 16.3.6 | latest. OpenNext 1.20.6 requires `next >=16.3.3` on the 16 line. |
| `react`, `react-dom`, `@types/react`, `@types/react-dom` | 19.3.0 | latest |
| `@opennextjs/cloudflare` | 1.20.6 | latest; needs `wrangler ^4.125.0` |
| `wrangler` | 4.141.0 | latest |
| `typescript` | **6.0.3** (not 7.0.2) | `typescript-eslint` 8.70 (pulled in by `eslint-config-next`) requires `typescript <6.1.0`. TS 7 is the native compiler and breaks lint. |
| `eslint` | **9.39.5** (not 10) | `eslint-plugin-react` and `eslint-plugin-import` (in `eslint-config-next`) peer on `eslint ^9` at most |
| `drizzle-orm` / `drizzle-kit` | 0.45.3 / 0.31.11 | latest; `drizzle-kit/api` exports `generateDrizzleJson` / `generateMigration` |
| `@neondatabase/serverless` | 1.1.0 | latest; Node ≥ 19. It uses the global `WebSocket` (Node 22 has it). |
| `zod` | 4.6.5 | contract requires `zod@4` |
| `react-aria-components` | 1.21.1 | latest |
| `tailwindcss`, `@tailwindcss/postcss` | 4.3.3 | latest |
| `vitest` / `vite` / `@vitejs/plugin-react` | 5.0.2 / 8.3.1 / 6.1.1 | `vite` is a peer of vitest 5; the plugin needs `vite ^8` |
| `jsdom` | 30.1.1 | |
| `@testing-library/react` / `user-event` / `jest-dom` | 16.3.3 / 14.6.7 / 7.0.1 | |
| `@playwright/test` | 1.63.0 | |
| `react-hook-form` / `@hookform/resolvers` | 7.89.0 / 5.9.1 | in the F-01 contract; unused by F-00 itself |
| `tsx`, `dotenv`, `prettier`, `@types/node` | 4.23.15, 18.0.4, 3.9.9, 22.20.4 | |
| `typescript-eslint` | 8.70.1 | `strictTypeChecked`; the same version `eslint-config-next` resolves (`^8.46.0`), so one plugin instance |
| `eslint-plugin-boundaries` | 7.2.0 | v7 `boundaries/dependencies` policies with `captured` templates; ESLint ≥ 6 |
| `eslint-plugin-sonarjs` | 4.2.1 | ESLint ^8–^10; `recommended` = errors, cognitive complexity 15 |
| `eslint-plugin-simple-import-sort`, `@eslint-community/eslint-plugin-eslint-comments`, `eslint-config-prettier` | 14.0.0, 4.8.1, 10.1.8 | |
| `simple-git-hooks`, `lint-staged` | 2.14.0, 17.6.0 | pre-commit format + lint fix |
| `server-only`, `clsx`, `tailwind-merge` | 0.0.1, 2.1.1, 3.7.0 | tailwind-merge 3 understands v4 `text-(length:--x)` vs `text-(--x)` (verified) |

pnpm 10 blocks dependency install scripts by default, so `package.json › pnpm.onlyBuiltDependencies` allows `esbuild`, `sharp`, `workerd` and `@tailwindcss/oxide`.

## Architecture (files F-00 creates)

```text
package.json  tsconfig.json  next.config.ts  postcss.config.mjs  eslint.config.mjs  eslint/local-rules.mjs
.prettierrc.json  .prettierignore  .gitignore  .env.example
vitest.config.ts  vitest.integration.config.ts  playwright.config.ts
drizzle.config.ts  open-next.config.ts  wrangler.jsonc
scripts/tokens/
  build-tokens-css/build-tokens-css.ts (+test)   pure tokens.json → CSS
  tokens-css.ts                                   CLI: write, or --check
src/
  instrumentation.ts (+test)                      onRequestError → logger
  app/layout.tsx  app/page.tsx (+page.copy.ts)  app/globals.css
  app/error.tsx (+error.copy.ts, error.types.ts, test)
  app/api/health/route.ts                         calls composition/health/health.ts
  composition/request-context/request-context.ts (+.types, test)  getRequestContext(), RequestContext
  composition/request-db/request-db.ts (+test)        withRequestDb(work): pool per request
  composition/health/health.ts                        checkDatabase() = withRequestDb(pingDatabase)
  adapters/db/client/client.ts (+.types, test)        createDb; Db, DbHandle in client.types.ts
  adapters/db/ping-database/ping-database.ts          pingDatabase(db): select 1
  adapters/db/schema/index.ts                     schema barrel (the one allowed barrel)
  adapters/db/schema/_conventions/tenant.ts (+.types, test)
  shared/env/app-env.ts (+.schema, .types, test)  parseAppEnv; appEnvSchema; AppEnv
  shared/errors/domain-error.ts (+test)
  shared/logging/logger.ts (+test)
  shared/workspace-context/workspace-context.ts (+.schema, .types, test)
  ui/theme/tokens.css (generated)
  ui/cn/cn.ts (+test)                             clsx + tailwind-merge
  ui/providers/app-providers.tsx                  I18nProvider id-ID
  ui/primitives/button/button.tsx (+.types, test)
  ui/primitives/text-field/text-field.tsx (+.types, test)
tests/
  config/drizzle-config.test.ts                   migrations use the unpooled URL
  setup/jsdom.ts  setup/server-only.ts            jest-dom matchers; server-only stub for Vitest
  lint/helpers/lint-source.ts                     ESLint API, type-aware rules off
  lint/boundaries.test.ts  lint/coding-rules.test.ts  lint/fixtures/src/**
  integration/setup-env.ts  integration/helpers/test-db.ts  integration/foundation/db-smoke.test.ts
  e2e/smoke.spec.ts
drizzle/                                          migrations output (first file arrives with F-01)
```

## Database

- **No tables.** F-00 adds only conventions, in `src/adapters/db/schema/_conventions/tenant.ts`:
  - `idColumn()`: `uuid("id").primaryKey().defaultRandom()`
  - `workspaceIdColumn()`: `uuid("workspace_id").notNull()`
  - `auditColumns()`: `created_at` / `updated_at`, `timestamptz NOT NULL DEFAULT now()`
  - `tenantKey(t)`: `unique().on(t.workspaceId, t.id)`, for tenant parents
  - `tenantRef({ workspaceId, column }, parent)`: composite `foreignKey` `(workspace_id, <x>_id) → parent(workspace_id, id)` (ADR-003)
- F-02 adds the `workspace` table and the `workspace_id → workspace(id)` FK on every tenant parent. The conventions don't reference a table that doesn't exist yet.
- `drizzle.config.ts` reads `.dev.vars` (dotenv) and uses **`DATABASE_URL_UNPOOLED`**. The output folder is `drizzle/`, with `strict: true`.
- `db:generate` on the empty barrel prints "No schema changes". `db:migrate` gets its first real run with F-01's first migration (interim rule: the Owner runs it from `main`).

## Server interface

| Entry | Contract |
|---|---|
| `getRequestContext()` | `Promise<{ env: AppEnv; waitUntil(p): void; ip: string; requestId: string; headers: Headers }>`. `env` = `parseAppEnv(getCloudflareContext({ async: true }).env)`. `ip` = `cf-connecting-ip`, then the first `x-forwarded-for` hop, then `"unknown"`. `requestId` = `cf-ray`, else `crypto.randomUUID()`. |
| `createDb(url)` | `DbHandle = { db: Db; pool: Pool }`, with a new `Pool` on every call. `Db = NeonDatabase<typeof schema>`, in `client.types.ts`. |
| `withRequestDb(work)` | Opens a request context and a db, awaits `work(db, rc)`, and calls `rc.waitUntil(pool.end())` in `finally`. This is the same shape as auth's `withAuthScope`. The pool is ended after the work, **never** before (calling `pool.end()` eagerly would break the queries). |
| `checkDatabase()` | `withRequestDb(pingDatabase)`. The `select 1` lives in the adapter `pingDatabase`, because `composition/` may not import `drizzle-orm`. |
| `GET /api/health` | `{ ok: true }`, `Cache-Control: private, no-store`, `dynamic = "force-dynamic"`. It exists to prove Neon over WebSocket works under `next dev` **and** under workerd (`pnpm preview`), which is the ADR-008/009 risk. It returns no data. |

**Env files:**
- `.dev.vars` is read by Wrangler, both via `initOpenNextCloudflareForDev()` in `next dev` and in `pnpm preview`, and by `drizzle.config.ts`. It holds `DATABASE_URL`, `DATABASE_URL_UNPOOLED` and `APP_STAGE=development`.
- `.env.test` is read by the integration setup. It holds `DATABASE_URL` and `APP_STAGE=test`.
- Both files are git-ignored. `.env.example` documents the keys.

## Domain / application logic

- **`AppEnv`:** `z.object({ DATABASE_URL: z.url(), APP_STAGE: z.enum(["development","test","production"]) })`. `parseAppEnv(raw)` throws `Invalid environment: <KEY>[, <KEY>]`, built from issue paths only, so values can't leak (AC-FND-004). F-01 extends the object (auth Task 4).
- **`DomainError`:** `abstract class … extends Error { abstract readonly code: string }`. `name` = the subclass name, and `cause` is passed through.
- **`WorkspaceId`:** `z.infer` of `z.uuid().brand<"WorkspaceId">()`. The Zod brand makes it nominal with no `as` assertion (coding rules › TypeScript), and `asWorkspaceId(raw)` parses it. `WorkspaceContext = { readonly workspaceId: WorkspaceId }`. F-02 widens it with the owner ID once F-01's `AuthUserId` exists. `AuthUserId` stays owned by F-01 (`features/auth/domain`), so `shared/` never duplicates it.
- **`logger`:** an object with `info`/`warn`/`error` methods that writes one JSON line per event: `{ level, event, time, ...fields }` to `console.log/warn/error`.
  - **Redaction:** a key is redacted when its normalised form (lower-case, no `_`/`-`) contains `password`, `token`, `secret`, `cookie`, `apikey`, `authorization`, `email` or `phone`, or ends with `url`. Redaction is recursive, including arrays, and circular references become `[Circular]`.
  - **Errors** are serialised as `{ name, message, stack }` with every `scheme://…` substring replaced by `[REDACTED_URL]`. Driver errors can echo connection strings.
- **`onRequestError`** (`src/instrumentation.ts`) logs `request.unhandled_error` with `requestId` (`cf-ray`), `method`, `routePath` (the route **pattern**, never the raw path, because later public routes carry tokens — C-103), `routeType` and `error`.

## UI

- **`tokens.css`:** generated from `docs/design-system/tokens.json` by `pnpm tokens:css`. `pnpm tokens:check`, which is part of `pnpm lint`, fails when the file is stale.
  - **Naming:** the path joined with `-` (`color.semantic.surface.canvas` → `--color-semantic-surface-canvas`, `space.0-5` → `--space-0-5`).
  - **Values:**
    - An alias `{a.b}` becomes `var(--a-b)`. The target must exist, otherwise the build throws.
    - A number becomes `<n>px`, except under `opacity.*`, `font.line-height.*` and `font.weight.*`, which stay unitless.
    - `font.family.*` is quoted, and colours are emitted as-is.
  - **Themes:** light values sit on `:root`. The 58 tokens with `$extensions["dev.pen.modes"].dark` get dark values under `[data-theme="dark"]`. Component tokens alias semantic tokens, so they follow the theme without any extra rules.
  - **Dark mode is opt-in** (`data-theme="dark"`). There's no `prefers-color-scheme` rule, because the approved auth screens are light and no feature specifies a theme switch.
  - **Output:** 479 variables, and the build fails on a name collision.
- **Tailwind v4:** `globals.css` imports `tailwindcss` and `tokens.css`. Components use arbitrary-variable utilities (`bg-(--component-button-primary-background)`, `text-(length:--font-size-body)`), the same syntax as the auth plan. There's no `@theme` mapping, since nothing needs one yet (C-010).
- **Root layout:**
  - `<html lang="id">` (coding rules: Indonesian UI with English fallback).
  - Plus Jakarta Sans through `next/font/google`, exposed as `--font-sans-loaded`. The body font stack is `var(--font-sans-loaded), var(--font-family-base), sans-serif`.
  - The body gets `surface.canvas` and `text.primary`.
  - `AppProviders` is a small `"use client"` wrapper holding React Aria's `I18nProvider locale="id-ID"` (ADR-010).
- **`Button`** (design-system C01):
  - Props exactly as in the auth contract, **but `variant` is `"primary" | "secondary"`**. C01 has no ghost button; see *Contract changes*.
  - MD size only (padding 12/36, line height 18 px, so it's 42 px high).
  - Hover and pressed states use `background-hover`.
  - Focus-visible: 2 px `focus.ring` outline, offset 2, plus a `focus.glow` halo.
  - Disabled uses `opacity.disabled`.
  - Danger and LG are deferred until a feature needs them (A-4).
- **`TextField`** (C18 over C03):
  - Built from RAC `TextField` + `Label` + `Input` + `Text slot="description"` + `FieldError`.
  - `isInvalid = Boolean(errorMessage)` with **`validationBehavior="aria"`**. With the default native behaviour, an invalid field would block the browser's `submit` event that React Hook Form relies on.
  - The error **replaces** the description (C18 content rule) and has a leading circle-alert icon (inline SVG, `aria-hidden`).
  - Focus and error show as a visual 2 px border (1 px border + a 1 px inset shadow, so there's no layout shift), plus `focus.glow` on focus.
- **`error.tsx`:** a client error boundary that shows "Terjadi kesalahan" and a secondary "Coba lagi" button (`reset`). It never renders `error.message`. The copy is `// not in Pencil`, pending the UI-language decision.
- **`page.tsx`:** a placeholder with the "shutrly." wordmark and one line. It's token-styled and replaced by F-01/F-02.

## Validation

- Zod checks the env at the request boundary.
- `asWorkspaceId` validates UUIDs.
- F-00 has no user input.

## Error handling

- Expected failures extend `DomainError`.
- Unexpected server errors go through `onRequestError` → `logger.error`, and the user sees `error.tsx`.
- Env errors throw `Invalid environment: KEY`.

## Consistency

- There are no transactions in F-00.
- The pool lifecycle is centralised in `createDb` + `withRequestDb` (ADR-009 consequence).
- A test asserts that `new Pool(` appears only in `src/adapters/db/client/client.ts`, inside a function.

## Security

- Secrets are only in git-ignored `.dev.vars` / `.env.test`.
- The env error names the key, never the value.
- The logger redacts by key and scrubs URLs from errors.
- `onRequestError` logs the route pattern, not the path.
- The health route has `no-store` and returns no data.
- `openTestDb` refuses to run unless `APP_STAGE=test`.

## Lint enforcement (coding rules v2.0)

`eslint.config.mjs` (Task 2) is the whole coding-rules config.

**Base rule sets:**
- `eslint-config-next/core-web-vitals`
- `typescript-eslint` `strictTypeChecked`, with `projectService`
- SonarJS `recommended`
- `eslint-comments` `recommended`, plus `require-description` and no disabling of `sonarjs/*`
- `simple-import-sort`
- `max-lines-per-function` 50 and `max-len` 100
- `eslint-config-prettier`

**Architecture rules:**

| Mechanism | Enforces |
|---|---|
| `eslint-plugin-boundaries` `boundaries/dependencies` (`default: disallow`) | the layer table in coding rules › Import boundaries. The elements are `feature-domain` / `feature-application` / `feature-ui` (captured `feature`), `adapter` (captured `adapter`), `composition`, `app`, `ui` and `shared`. The same-feature and same-adapter rules use `captured` templates. |
| `no-restricted-imports`, in disjoint file sets | package bans: framework, React Aria, vendor backend SDKs, `@opennextjs/*` per layer. `boundaries` v7's `module` policies didn't block externals in the spike, so package bans stay pattern-based. |
| `no-restricted-properties` on `src/**` | `process.env` |
| `local/require-server-only` | `adapters/**`, `composition/**`, `features/*/application/**`, except `*.types.ts`, `*.schema.ts`, `adapters/db/schema/**` (drizzle-kit loads those outside Next) |
| `local/ui-copy` | no JSX text or literal copy props in `src/**/*.tsx` (tests excepted) |
| `no-restricted-syntax` | no TS `enum`, no inline JSX function props; no `type`/`interface`/`*Schema` in `*.tsx` and use cases; `.types.ts` holds only types; `.schema.ts` holds only `*Schema` constants |

**Overrides:**
- Tests turn off `consistent-type-assertions`, `unbound-method` and `max-lines-per-function`.
- `*.mjs` config files use `disableTypeChecked`.

**Spike findings (2026-09-27)**, from a scratch project with the pinned versions:
- **Virtual files:** type-aware rules must be off for `lintText` virtual files, because the project service rejects files that aren't on disk.
- **Unresolved imports:** `boundaries` silently allows an import whose target doesn't exist on disk, so `tests/lint/fixtures/src/**` provides real targets. Element patterns match the end of the path, so those fixtures classify like `src/`.
- **Workers types:** `getCloudflareContext()`'s default `ExecutionContext` type is unresolved without generated Workers types, which makes typed lint fail. Passing an explicit `{ waitUntil }` generic avoids codegen.
- **React types:** `FormEvent` is deprecated in `@types/react` 19.3; use `SubmitEvent`.

`app/` → `features/*/application` is allowed, because the auth plan's server actions call use cases directly and pass a composed scope. `server-only` stops server code from reaching a client bundle, so the layer table doesn't need file-level exceptions for `*.schema.ts`.

## Testing strategy

| AC | Test |
|---|---|
| AC-FND-001 | Manual `pnpm dev` check (Task 1), plus the e2e smoke (AC-015) |
| AC-FND-002 | Final gate run (iteration 6) |
| AC-FND-003 | Manual `pnpm preview` + `curl /` and `/api/health` on workerd (Task 17) |
| AC-FND-004 | `src/shared/env/app-env.test.ts` |
| AC-FND-005 | `src/adapters/db/client/client.test.ts` (new pool per call; no `new Pool(` elsewhere) + `src/composition/request-db/request-db.test.ts` (end in `finally`, including on throw) + e2e `/api/health` |
| AC-FND-006 | `tests/integration/foundation/db-smoke.test.ts` |
| AC-FND-007 | `src/adapters/db/schema/_conventions/tenant.test.ts` (SQL from `drizzle-kit/api`) |
| AC-FND-008 | `src/shared/workspace-context/workspace-context.test.ts` (`@ts-expect-error`, run by `pnpm typecheck`) |
| AC-FND-009 | `tests/lint/boundaries.test.ts` (33 layer/feature/package cases, forbidden and allowed; includes `app` → feature `domain` forbidden) + `tests/lint/coding-rules.test.ts` (19 cases: server-only, `process.env`, copy, file composition, enum, assertions, sonarjs disable) |
| AC-FND-010 | `domain-error.test.ts`, `instrumentation.test.ts`, `error.test.tsx` |
| AC-FND-011 | `logger.test.ts` |
| AC-FND-012 | `build-tokens-css.test.ts` (fixture + real `tokens.json`: 479 vars, known names/values, dark block) + `tokens:check` in lint |
| AC-FND-013 | `button.test.tsx` |
| AC-FND-014 | `text-field.test.tsx` |
| AC-FND-015 | `tests/e2e/smoke.spec.ts` |
| AC-FND-016 | `tests/config/drizzle-config.test.ts` (unpooled URL, throws when missing) + `pnpm db:generate` → "No schema changes" |

Unit tests are named with their `AC-FND-*` ID.

## Iterations

Each iteration follows plan → implement → test → verify → commit. The step-level tasks are in [plan.md](plan.md).

### Iteration 1 — Scaffold and local gate (Tasks 1–2)

- [ ] Pinned dependencies, `tsconfig` (`@/*`, `types: ["node"]` because TS 6 defaults `types` to `[]`), Next config, Tailwind/PostCSS, placeholder layout and page
- [ ] The full coding-rules ESLint config + local rules, Prettier (100 columns), pre-commit hook; Vitest with `unit` (node) and `dom` (jsdom) projects and the `server-only` alias
- **Done:** `pnpm dev` renders the page; `pnpm typecheck && pnpm lint && pnpm build` pass; Vitest loads (AC-FND-001, 002).

### Iteration 2 — Runtime basics (Tasks 3–6)

- [ ] `AppEnv`; `DomainError` + `logger`
- [ ] OpenNext + Wrangler config, `.dev.vars`, `getRequestContext`
- [ ] `onRequestError`
- **Done:** AC-FND-004, 011 and the logging half of 010 pass; the gate is green.

### Iteration 3 — Database (Tasks 7–10)

- [ ] `createDb` + schema barrel; `withRequestDb` + `/api/health`
- [ ] Tenant conventions + `WorkspaceId` / `WorkspaceContext`
- [ ] `drizzle.config.ts`, `openTestDb`, integration config and smoke test
- **Done:** AC-FND-005 (unit), 006, 007, 008, 016 pass; `pnpm test:integration` is green against non-prod Neon; `curl /api/health` returns `{"ok":true}` under `next dev`.

### Iteration 4 — Boundaries (Task 11)

- [ ] Lint helper, boundary fixtures, `boundaries.test.ts` and `coding-rules.test.ts`
- **Done:** AC-FND-009 passes (52 cases); `pnpm lint` is clean on the real tree.

### Iteration 5 — Design-system base (Tasks 12–16)

- [ ] Token CSS builder + CLI + `tokens:check` in lint
- [ ] `globals.css` wiring, Plus Jakarta Sans, `AppProviders`
- [ ] `cn()`, `Button`, `TextField`, then `error.tsx` (it uses `Button`)
- **Done:** AC-FND-012, 013, 014 and the page half of 010 pass.

### Iteration 6 — E2E, Workers proof, contract hand-off (Tasks 17–18)

- [ ] Playwright config + smoke; `pnpm preview` check on workerd
- [ ] Auth plan Task 0 step 2 (contract file check) → ten `ok`; full gate; update the auth contract table, HANDOFF and the feature map
- **Done:** AC-FND-002, 003, 005 (e2e), 015 pass. F-00 → DONE after `/sdv:verify-feature foundation`.

## Contract changes for F-01 (recorded in auth/plan.md, 2026-09-26)

- **`Button.variant` is `"primary" | "secondary"`**, not `… | "ghost"`. Design-system C01 has no ghost button, and the auth plan only uses primary and secondary.
- **Playwright** `baseURL` / `webServer.url` are `http://localhost:3000` (the `next dev` default). F-01 sets `BETTER_AUTH_URL` to the same value.
- **Runtime env** for `next dev` / `pnpm preview` comes from `.dev.vars`, not `.env.test`. F-01 adds its keys to both files and `.env.example`.
- **Coding rules v2.0 file split** (2026-09-27):
  - `Db` is imported from `@/adapters/db/client/client.types`.
  - `AppEnv` comes from `@/shared/env/app-env.types`, and `appEnvSchema` from `@/shared/env/app-env.schema`.
  - `RequestContext` comes from `@/composition/request-context/request-context.types`.
  - `TextFieldProps.onChange`/`onBlur` are property signatures.
  - `cn()` lives at `@/ui/cn/cn`.
- **Unit folders** (2026-09-27, to follow the folder architecture): the DB client is `src/adapters/db/client/client.ts`, the request context is `src/composition/request-context/request-context.ts`, and `withRequestDb` is `src/composition/request-db/request-db.ts`. The *F-00 contracts* table and Task 0's file check in auth/plan.md still show the old flat paths; update them in the auth revision pass (auth R-9).
- **The auth plan itself predates coding rules v2.0** and must be brought in line before F-01 is built; see auth R-8.

## Risks / open questions

- **R-1 — Next 16 renamed `middleware.ts` to `proxy.ts`.** The auth plan still has `src/middleware.ts`, and OpenNext support for the Node-runtime `proxy` must be checked. This is **F-01's** issue; it's flagged here so auth's Task 0 revisits it. F-00 creates neither file.
- **R-2 — `next/font/google` needs network at build time.** Local builds are fine. Revisit when CI arrives.
- **R-3 — The Vitest 5 `test.projects` config** is written from the v3.2+ API. If Vitest 5 changed the key, Task 2 step 4 fails loudly: check `vitest --help` / the docs and adjust only the config.
- **R-4 — Neon WebSocket on workerd** is proven only by the manual `pnpm preview` check in iteration 6. There's no CI until the CI work.
- **Deviation D-1 (C18):** `TextField` has no trailing error icon inside the input; only the message icon is shown. Reported for `/sdv:verify-feature`.
- **R-5 — `boundaries` and `@typescript-eslint` plugin instances.** If pnpm installs two copies of `typescript-eslint`, ESLint fails with `Cannot redefine plugin`. Task 2 pins the version `eslint-config-next` resolves; dedupe if it happens.
- **Not an ADR:** the TypeScript 6 / ESLint 9 pins, the `.dev.vars` convention, the health route and the lint tooling are reversible implementation choices, recorded here and in the coding rules. No new ADR.
