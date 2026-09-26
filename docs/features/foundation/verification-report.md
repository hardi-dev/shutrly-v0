# Verification Report — F-00 Foundation

Date: 2026-09-27 · Verified on `main` at `e193542` · Verdict: **PASS, feature → DONE** (no blocking items; follow-ups below)

## Scope

Checked against:
- constitution C-004, C-006, C-008, C-009, C-010, C-101, C-103;
- coding rules v2.0;
- BR-WS-002 and BR-WS-003 (contract only);
- ADR-001, 003, 008, 009, 010 and 014;
- [spec.md](spec.md), [acceptance-criteria.md](acceptance-criteria.md) and [technical-design.md](technical-design.md);
- `docs/design-system/token-usage.md` (APPROVED 2026-09-26).

F-00 has no Pencil frames and no UML. Visual checks are therefore limited to token usage in the primitives and pages.

## Quality gate (run 2026-09-27)

| Check | Command | Result |
|---|---|---|
| Typecheck | `pnpm typecheck` | PASS |
| Lint (Prettier, ESLint, token drift) | `pnpm lint` | PASS; `tokens.css is up to date (481 tokens)` |
| Unit + DOM tests | `pnpm test` | PASS: 22 files, 69 tests |
| Build | `pnpm build` | PASS |
| Integration (shared non-prod Neon) | `pnpm test:integration` | PASS: 2 tests |
| E2E smoke | `pnpm e2e tests/e2e/smoke.spec.ts` | PASS: 2 tests |
| Workers runtime | `pnpm preview`, then `curl :8787/` and `:8787/api/health` | PASS: home 200 (`lang="id"`, "shutrly."); health 200 `{"ok":true}`, `Cache-Control: private, no-store` |
| Migrations tooling | `drizzle-kit generate` on the current barrel, clean output folder | PASS: "No schema changes" (see F-2) |

## Acceptance criteria

| AC | Evidence | Result |
|---|---|---|
| AC-FND-001 Fresh clone runs | Playwright `webServer` starts `pnpm dev`, and the smoke test renders the token-styled home page | PASS |
| AC-FND-002 Local gate green | The quality-gate table above | PASS |
| AC-FND-003 Workers runtime | `pnpm preview` on workerd (table above) | PASS |
| AC-FND-004 Env fails fast, no leak | `src/shared/env/app-env.test.ts` (4 tests) | PASS |
| AC-FND-005 One pool per request | `client.test.ts` (new pool per call; `new Pool(` appears only in `src/adapters/db/client/client.ts`, re-checked by grep), `request-db.test.ts` (ends in `finally`, including on throw), E2E and preview `/api/health` | PASS |
| AC-FND-006 Safe integration harness | `tests/integration/foundation/db-smoke.test.ts` (`select 1`; refuses without `APP_STAGE=test`) | PASS |
| AC-FND-007 Tenant conventions | `_conventions/tenant.test.ts` (SQL from `drizzle-kit/api`) | PASS |
| AC-FND-008 Workspace scope by type | `workspace-context.test.ts` `@ts-expect-error` cases, run by `pnpm typecheck` | PASS |
| AC-FND-009 Boundaries and lint rules | Committed tests cover 4 cases: domain→`drizzle-orm`, `server-only`, `process.env`, inline copy and handler. **Documented verification (C-009), 2026-09-27:** the remaining cases were probed.<br>• Through `lintText`: domain→`next`/`better-auth`, feature→`react-aria-components`, `type`/`interface` in `.tsx`, TS `enum`, `as`, and disabling `sonarjs/*` are all reported.<br>• On real files on disk: adapter→adapter, app→adapter and feature-domain→app are all reported by `boundaries/dependencies`. | PASS (test gap: D-2 / F-1) |
| AC-FND-010 Domain errors, generic error page | `domain-error.test.ts`, `instrumentation.test.ts`, `error.test.tsx` | PASS |
| AC-FND-011 Logger redaction | `logger.test.ts` | PASS |
| AC-FND-012 Tokens as CSS variables | `build-tokens-css.test.ts` (one focused test, D-3) + `pnpm tokens:check` in lint | PASS |
| AC-FND-013 Button | `button.test.tsx` | PASS |
| AC-FND-014 TextField | `text-field.test.tsx` | PASS (visual deviation D-1) |
| AC-FND-015 Browser smoke | `tests/e2e/smoke.spec.ts` | PASS |
| AC-FND-016 Migrations use the direct URL | `tests/config/drizzle-config.test.ts` (unpooled URL, throws without it) + generate check | PASS (local environment note F-2) |

## Technical checks

- **Boundaries and layers:** enforced by lint (above).
  - `composition/health` calls the `pingDatabase` adapter, so composition holds no Drizzle.
  - `app/api/health` calls only composition.
- **Security:**
  - No `process.env` in `src/` (grep, lint).
  - Secrets live only in git-ignored `.dev.vars` / `.env.test`.
  - The env error names keys only.
  - The logger redacts by key and scrubs URLs.
  - `onRequestError` logs the route pattern, not the path.
  - The health route is `no-store` and returns no data.
- **Isolation (BR-WS-002/003):** the conventions and the `WorkspaceContext` type contract are in place. There are no tenant tables yet, so the resolver is F-02.
- **Consistency:** the pool lifecycle is centralised in `createDb` + `withRequestDb`.

## Token usage (`token-usage.md`, APPROVED)

Scanned: `src/ui` (not stories or explorer) and `src/app`.

| Rule | Finding | Result |
|---|---|---|
| G2 no primitives | No `--color-primitive-*` in components or pages | PASS |
| G4 no hard-coded values | No hex literals. Advisory items:<br>• `button.tsx` `leading-[18px]`: the C01 label line height has no token (DESIGN TOKEN GAP).<br>• `page.tsx` `size-4`: Tailwind's default scale instead of `size-(--space-4)`, on the placeholder page that F-01/F-02 replace.<br>• Focus and border widths (1, 2, 4 px in shadows and outlines) are literal. They are the 2 px `focus.ring` / `focus.glow` and the 1 px border that token-usage §Action & focus and GAP-06 specify, but no width tokens exist. | PASS with advisories |
| G3 component tokens in components | Button, Input and TextField bind `component.button.*` / `component.input.*`; layouts use semantic/space tokens | PASS |
| G5 fg/bg pairing | Button primary/secondary/danger, input text/background and status text use their paired component tokens | PASS |
| SP1–SP11 spacing | Paddings and gaps come from `space.*` / `component.*.padding`. The adornment inset `calc(padding-x + space-6)` is built from tokens. | PASS |
| SP5 linked instances | Not applicable (no Pencil consumer in F-00) | N/A |

## Deviations (all non-blocking)

- **D-1 — TextField error icon (C18).** The C18 Error state draws a trailing circle-alert inside the input; the code shows the icon only in the message. Fix during F-01's fidelity pass against `register-errors-hTP6i`, or as a small `TextField` change (the `Input` primitive already supports `iconTrailing`).
- **D-2 — Lint test matrix.** 4 committed cases instead of the planned 33 + 19. Behaviour was verified here (AC-FND-009), but add the missing cases as committed tests. The lint helper cannot see `@/` targets through `lintText`, so boundary cases need on-disk fixture files under `tests/lint/fixtures/src/**`.
- **D-3 — Token builder test.** One focused test instead of six; covered by `tokens:check`.
- **D-4 — Commit grouping (Task 13).** Process only; no effect on behaviour.
- **D-5 — E2E port during implementation.** Re-verified on the default port 3000 in this run.
- **Scope drift after the plan (commits `8a58346`, `afebd6e`, `389cc0a`, Storybook `af719a9`…`e193542`):**
  - `Button` gained `danger`, `lg` and icons; an `Input` primitive and the semantic `Icon` registry were added.
  - `tokens.json` gained 2 icon-size tokens (481, not 479).
  - Storybook was added (ADR-014).

  These go beyond spec A-4 ("Danger and sizes beyond MD are added when a feature needs them"). They are aligned with the approved design system and tested, so they are **accepted as design-system work**. Record them in the spec (done below).
- **Doc drift fixed with this report.** The spec, ACs and technical design used old paths (`src/adapters/db/client.ts`, `.env.local`) and the old token count. They are corrected, or noted, in the status updates below.

## Follow-ups

- **F-1:** add the missing AC-FND-009 lint cases as committed tests (D-2).
- **F-2:** this checkout has an **empty, untracked `drizzle/meta/` folder**. With it, `pnpm db:generate` fails (`ENOENT drizzle/meta/_journal.json`). A clean clone works. Delete the empty folder before F-01 Task 5 (`rmdir drizzle/meta drizzle`).
- **F-3:** decide the two G4 gaps. Either add a line-height token for the C01 label (18) and width tokens for ring/border, or document them as accepted in token-usage.md. Switch `page.tsx` to `size-(--space-4)` when F-01/F-02 replace the page.
- **F-4:** D-1 TextField trailing error icon.
- **Before the first `/sdv:ship`:** CI (GitHub Actions) and Cloudflare deploy (out of F-00 scope).

## Result

Every AC has passing or documented evidence, the quality gate is green, and there is no blocking deviation. **F-00 Foundation → DONE (2026-09-27).** Next: `/sdv:build-feature auth 1`.
