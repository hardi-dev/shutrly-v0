# F-00 Foundation — Acceptance Criteria

> Localization amendment (Owner 2026-10-06): [product policy](../../product/localization.md), BR-L10N-* and [ADR-025](../../architecture/decisions/ADR-025-next-intl-bilingual-localization.md) supersede language-only instructions in this document. English is the default; EN/ID switching and complete localized copy are required. Earlier Indonesian labels/defaults remain reference examples, not an approved single-language implementation. Feature business behavior is unchanged. Update reviewed copy and approved Pencil exports before implementation; legacy data and recipient-language policies remain pending.

Area code: `FND`. Each AC lists the rules/principles it covers.

### AC-FND-001 — Fresh clone runs
Given a fresh clone with `.env.local` filled from `.env.example`
When the developer runs `pnpm install && pnpm dev`
Then the home page renders on `http://localhost:3000`, styled with token variables.
Covers: —

### AC-FND-002 — Local quality gate is green
Given the F-00 scaffold on `main`
When `pnpm typecheck && pnpm lint && pnpm test && pnpm build` runs
Then every command exits 0.
Covers: coding-rules › Quality Gate

### AC-FND-003 — Runs on the Workers runtime locally
Given the OpenNext Cloudflare config
When the developer runs `pnpm preview`
Then the app is built with OpenNext and served by Wrangler locally, and the home page renders.
Covers: ADR-008

### AC-FND-004 — Environment fails fast without leaking values
Given `DATABASE_URL` is missing or not a URL
When the environment is parsed
Then parsing throws an error naming `DATABASE_URL`, and the message contains no environment value.
Covers: C-006, C-103

### AC-FND-005 — One pool per request, always closed
Given a request that uses the database
When `createDb(env.DATABASE_URL)` is called through the request context
Then it returns a new `{ db, pool }`; `withRequestDb` registers `pool.end()` with `waitUntil` **after** the work (also when it throws); `new Pool(` appears only in `src/adapters/db/client.ts`; and `GET /api/health` answers `{ ok: true }` with `Cache-Control: private, no-store`.
Covers: ADR-009

### AC-FND-006 — Integration harness is safe on the shared database
Given `.env.test` with `APP_STAGE=test` and the non-prod `DATABASE_URL`
When `openTestDb()` is called
Then it returns a working `db` (a `select 1` succeeds) and `close()` ends the pool.
And given `APP_STAGE` is not `test`
Then `openTestDb()` throws before connecting.
Covers: ADR-009, coding-rules › Testing

### AC-FND-007 — Tenant tables get isolation constraints by convention
Given a fixture tenant parent table and child table declared with the F-00 conventions
When `drizzle-kit` generates SQL for them
Then the parent has `workspace_id uuid NOT NULL` and `UNIQUE (workspace_id, id)`, and the child references it with the composite FK `(workspace_id, parent_id) → parent(workspace_id, id)`.
Covers: BR-WS-002, ADR-003, C-101

### AC-FND-008 — Workspace scope can't be skipped by type
Given the branded `WorkspaceId` type and the `WorkspaceContext` type (`AuthUserId` stays owned by F-01)
When code passes a plain `string` or another branded ID where a `WorkspaceId` is expected, or calls an owner-scoped repository function without a `WorkspaceContext`
Then `pnpm typecheck` fails (verified by `@ts-expect-error` type tests).
Covers: BR-WS-003 (contract), coding-rules › Types

### AC-FND-009 — Architecture boundaries are enforced by lint
Given the lint configuration
When a fixture file in `features/*/domain` imports `next`, `drizzle-orm` or `better-auth`; or a file in `features/*` imports `react-aria-components`; or a file in `app/` imports from `adapters/`
Then `pnpm lint` reports a boundary error for each (the same goes for one feature importing another, or an adapter importing another adapter).
And given a source file that breaks a coding-rules **(lint)** rule (a missing `server-only`, `process.env` in `src/`, inline JSX copy, a type declared in a component, a TS `enum`, an `as` assertion, a disabled SonarJS rule)
Then `pnpm lint` reports it.
Covers: architecture overview › Boundaries, ADR-010, coding-rules v2.0

### AC-FND-010 — Typed domain errors and generic unexpected errors
Given a subclass of `DomainError` with `code = "EXAMPLE_ERROR"`
When it is thrown and caught
Then `instanceof DomainError` is true and `code` is stable.
And given an unexpected error in a server component
Then it is logged with `requestId`, and the user sees a generic error page with no stack or message.
Covers: architecture overview › Error handling

### AC-FND-011 — Logger redacts secrets and PII
Given log fields named `password`, `token`, `cookie`, `secret`, `apiKey`, `authorization`, `email`, `phone`, or any `*Url` field
When `logger.info/warn/error` writes them
Then their values are replaced with `[REDACTED]`, including in nested objects, and the output is a single JSON line with `event` and `level`.
Covers: C-103, coding-rules › Errors and Logging

### AC-FND-012 — Design tokens mirrored as CSS variables
Given `docs/design-system/tokens.json`
When `pnpm tokens:css` runs
Then `src/ui/theme/tokens.css` contains one variable per token (path `.` → `-`, e.g. `--color-semantic-surface-inverse`, `--component-alert-info-background`, `--space-4`), with light values on `:root` and dark values under the dark selector.
And when `tokens.json` changes without regenerating
Then `pnpm tokens:check` fails.
Covers: ADR-010, design-system token pipeline

### AC-FND-013 — Button primitive
Given `<Button variant="primary|secondary">`
When it is pressed with the mouse, Enter or Space
Then `onPress` fires once; with `isDisabled` it does not fire and the button is disabled; it shows a visible focus ring; `type="submit"` submits its form; colours come only from token variables.
Covers: C-008, ADR-010, design-system C01

### AC-FND-014 — TextField primitive
Given `<TextField label="Email" name="email" errorMessage="…" description="…">`
When it renders
Then the input is labelled by the label; its accessible description is the description, or the error when `errorMessage` is present (the error replaces the helper, C18); `aria-invalid="true"` is set only when `errorMessage` is present; an invalid field does not block form submission; `onChange` receives the string value; `inputRef` reaches the `<input>`.
Covers: C-008, ADR-010, design-system C18

### AC-FND-015 — Browser smoke journey
Given `playwright.config.ts` with a `webServer` that starts the app
When `pnpm e2e` runs
Then the smoke test opens the home page, `<html lang="id">` is set, the token variables are defined, and the body has the canvas background.
Covers: coding-rules › Testing

### AC-FND-016 — Migrations are generated, reviewed, and applied with the direct URL
Given a schema change exported from the barrel
When `pnpm db:generate` runs
Then a new SQL migration appears under the committed migrations folder.
And `drizzle.config.ts` (used by `pnpm db:migrate`) connects with `DATABASE_URL_UNPOOLED`, never the pooled URL, and refuses to run without it. (With no tables yet, `db:generate` reports no changes; the first real migration arrives with F-01.)
Covers: ADR-001, ADR-009, coding-rules › Data Access (CONFLICT-F00-1 on who runs it)
