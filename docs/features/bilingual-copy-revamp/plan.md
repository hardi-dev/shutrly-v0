# Bilingual copy revamp — implementation plan

Feature: F-22 `bilingual-copy-revamp` · Branch `codex/bilingual-copy-revamp`
Status: PLANNED — partial: I1–I3 ready; I4–I8 blocked
Date: 2026-10-10
Sources: [technical design](technical-design.md) (DRAFT, §1–§16), [spec](spec.md) › *Language preference decisions (Owner, 2026-10-10)*, [acceptance criteria](acceptance-criteria.md), [coding rules](../../coding-rules.md), [architecture overview](../../architecture/overview.md), [ADR-025](../../architecture/decisions/ADR-025-next-intl-bilingual-localization.md).

This plan executes the iterations in technical design §16. Only I1–I3 are written as executable tasks. I4–I8 are ready in order once the Owner's 2026-10-10 decisions are applied.

Owner decision (2026-10-10): this is copy work, not design. Pencil exports and a layout review are not required. Copy changes are applied to the existing layouts, and any layout change needs its own review.

## Copy authoring rule (Owner, 2026-10-10)

- Every user-facing string in English and Indonesian is written by Codex CLI, not by Claude or any planning agent. The source of truth is `docs/features/bilingual-copy-revamp/copy-deck.md`, produced by Codex runs from a written brief.
- Implementers copy strings verbatim from the approved deck section into the sibling `*.copy.ts` file. They do not rephrase, translate, or add strings.
- If a needed string is missing from the deck, stop that task and ask Codex (new brief, same deck) to add it. Do not write the string in code, plans, or chat.
- Default template text (EN and ID) comes from deck section 11.4. Auth email text comes from deck section 12. Landing text comes from deck section 19.
- Placeholders such as `{count}` and `{filename}` and identity values (Shutrly, WhatsApp, Google Drive) are kept exactly as in the deck.
- The Owner reviews the deck before implementation. Claude may verify that keys, placeholders and tests match the deck, but may not change the wording.

## How to work this plan

- One iteration at a time, top to bottom. Each task is: write the failing test → implement → the related test passes → typecheck and lint on the changed files → one commit.
- Related checks only (Owner 2026-10-05). Never run `pnpm test`, the full integration suite or the full E2E suite.
  - Unit: `npx vitest run <paths>`
  - Integration: `npx vitest run --config vitest.integration.config.ts <file>`
  - E2E: `npx playwright test <spec>` (Playwright starts `pnpm dev`; for a build check run `pnpm build && pnpm start` first, it reuses the running server)
  - Typecheck: `pnpm typecheck`
  - Lint per file: `npx prettier --write <files> && NODE_OPTIONS=--max-old-space-size=6144 npx eslint --fix <files>`. Lint-staged runs again on commit.
- Write lint-clean code from the first draft: functions at most 50 lines, `import "server-only";` first in composition/application/adapter modules, exported types only in `*.types.ts`, no `type`/`interface` in `.tsx` or use cases, no inline object type literals in signatures, JSDoc on every exported function.
- Test names are behavior sentences prefixed with the `AC-*`/`BR-*`/`C-*` ID they cover.
- Commits: conventional, English, lowercase, no trailing period, scope `i18n` unless stated. Docs that describe a behavior change go in the same commit (C-011).
- Never type `head`; use `sed -n 'a,bp'`.
- Never read or edit `.pen` files. Never run `pnpm deploy:staging` from this worktree (hidden `.claude/` path, see CLAUDE.md).
- `pnpm db:migrate` only against the `.dev.vars` non-production database, only for a migration generated, reviewed and committed in this branch, and report each run (AGENTS.md, ADR-024).

## Iterations

| ID | Goal | Status | AC / BR / C | Layout review |
|---|---|---|---|---|
| I1 | Locale foundation: next-intl, `shared/locale`, `composition/locale`, proxy header, root layout and providers, missing-message contract, completeness harness, lint rule | Ready (starts with an Owner install checkpoint and the proxy-header spike) | AC-L10N-001 (resolution), 003, 004, 005; BR-L10N-001, 002 | No |
| I2 | `user.locale` migration and the owner, device and gallery locale actions | Ready (Owner checkpoint before `pnpm db:migrate`) | AC-L10N-001, 004; BR-L10N-001; C-101, C-104 | No |
| I3 | Locale-aware formatting and parsing (OCM-16…22), round-trip laws, React Aria local overrides removed | Ready (display patterns provisional until D-20) | AC-L10N-004 (reformat helpers), 005, 006; BR-L10N-004; C-105 | No |
| I4 | Platform defaults: EN/ID default templates, `is_default`, save modes, seeds, keyed items and roles, recipient rendering | Ready (decisions resolved 2026-10-10) | AC-L10N-006, 008, 010; BR-L10N-003, 004, 006; C-102 | No |
| I5 | Shared UI, shell, auth, landing, profile copy; language switches; auth email locale | Ready (decisions resolved 2026-10-10) | AC-L10N-001, 002, 010, 011; BR-L10N-002, 006 | No |
| I6 | Owner feature copy (OCM-01…13): catalog, clients, projects, team, sources, add-ons, templates | Ready (decisions resolved 2026-10-10) | AC-L10N-002, 006, 011; BR-L10N-002, 004 | No |
| I7 | Client gallery copy and client language switch | Ready (decisions resolved 2026-10-10) | AC-L10N-001, 002, 004, 011; C-104 | No |
| I8 | Verification: E2E per surface in both locales, build smoke, SSR/hydration, coverage report | Waits on I4–I7 | AC-L10N-011, 012 | No |

## Deviations from the technical design (for Owner review)

1. **Migration split.** Design §4 puts `user.locale` and `message_template.is_default` in one migration, `0019_locale_preferences.sql`, applied in I2. This plan generates 0019 with `user.locale` only (§4.1). The `message_template` changes (§4.2, §4.3) move to I4 as the next migration number. Reasons: spec l.25 says BR-L10N-003 and the localization policy must be updated by the Owner before template storage is implemented (Q-6), the code that reads `is_default` lands in I4, and it shortens the Risk R-3 window on the shared staging database. If the Owner prefers the design's single migration, fold §4.2–§4.3 back into 0019 before it is generated.
2. **Catalog without feature namespaces in I1.** Design §5.1 has `message-catalog` import every `*.copy.ts`. That import is D-8, which is not approved, and `eslint-plugin-boundaries` refuses it today. I1 builds the catalog machinery and tests it with fixtures; the registry starts empty. The first real registration is the first task of I5 once D-8 is answered.
3. **Owner-locale inputs arrive in I2.** `user.locale` does not exist until I2, so I1's `getRequestLocale()` passes `ownerLocale: null` to the resolver and I2 Task 10 wires the two loaders. Tests in I1 cover both branches through the pure resolver.
4. **Quantity parsing.** §7.6 says `parseQuantity(raw, locale)` accepts only the locale's decimal separator. I3 Task 3 first lists every caller and confirms each one receives typed user input, not a canonical dot-decimal from storage. If any caller parses a stored value, stop and report it as a `SPEC GAP` instead of guessing.

## Iteration I1 — Locale foundation

**Goal.** One locale is resolved per request with no global state; it drives `<html lang>`, next-intl and React Aria; missing messages fail loudly outside production and never fall back to the other language.

**AC / BR.** AC-L10N-001 (resolution only, no switch UI), AC-L10N-003, AC-L10N-004 (request isolation), AC-L10N-005 (layout agreement); BR-L10N-001, BR-L10N-002.

**Read first.**
- `technical-design.md` §3 (D-1, D-3…D-7, D-9, D-10), §5.1–§5.6, §9 items 1, 2, 4, §10 first bullet, §11 (cookie attributes, forwarded header), §12 rows AC-L10N-001/003/004/005, §14 R-1, R-2.
- `coding-rules.md` › Structure and boundaries, Next.js, Files, Where types and schemas live, Copy, Testing, Git.
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` › *Setting Headers*; `node_modules/next/dist/docs/01-app/02-guides/internationalization.md`; `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/next-root-params.md` (fallback only).
- Existing files to follow: `src/proxy.ts` + `src/proxy.test.ts`, `src/composition/auth/pending-email-cookie/pending-email-cookie.ts` (cookie module shape), `src/composition/auth/session-cookies/session-cookies.test.ts` (`vi.mock("next/headers")`), `src/composition/app-stage/app-stage.ts` (stage read), `src/ui/providers/app-providers.tsx`, `src/app/layout.tsx`, `eslint/local-rules.mjs` + `tests/lint/coding-rules.test.ts`, `src/shared/logging/logger.ts`.

### Tasks

- [ ] **I1.1 Owner checkpoint: install next-intl.** Dependency installs fail in these worktrees (pnpm store mismatch), and agents must not reinstall on their own. Ask the Owner to run, in this worktree: `pnpm add --save-exact next-intl@<version>` and, because the completeness test imports it directly, `pnpm add --save-exact @formatjs/icu-messageformat-parser@<version matching next-intl's dependency>`. Before asking, confirm the version: ADR-025 researched `4.14.9`; check its declared peers cover `next@16.3.6` and `react@19` (`npm view next-intl@4.14.9 peerDependencies`) and that the release is at least two weeks old. Commit after the Owner's install: `chore(i18n): pin next-intl and the icu message parser`. Do not start I1.2 before this commit exists.

- [ ] **I1.2 Spike: does the proxy header reach every render path? (R-1, D-7).** Timebox half a day. Nothing from the spike is committed except the log below.
  1. Work in a throwaway checkout, never in this worktree (it may hold the Owner's uncommitted files): `git worktree add --detach <scratch-dir> HEAD` with a path that has no dot folder, copy `.dev.vars`, and ask the Owner to run `pnpm install --frozen-lockfile` there if `node_modules` is missing. In it, make `src/proxy.ts` set `x-shutrly-gallery-token` for `/g/<token>` paths via `NextResponse.next({ request: { headers } })` (not `NextResponse.next({ headers })`, which exposes it to the browser).
  2. Temporarily log `Boolean((await headers()).get("x-shutrly-gallery-token"))` (never the value, C-103) from: the root layout, a page under `src/app/(client)/g/[token]/`, the gallery sign-in server action (`src/app/actions/client-access/sign-in.ts`), and a client route handler under `/g/<token>/media/`.
  3. Check the three cases under `pnpm dev`, then under `pnpm build && pnpm start`. Also check that a request sent with a forged `x-shutrly-gallery-token` to `/login` arrives without it.
  4. Remove the throwaway checkout (`git worktree remove <scratch-dir>`).
  5. Record the result in **Spike log** at the end of this file and commit it: `docs(i18n): record the proxy header spike`.
  - **Pass:** continue with I1.3.
  - **Fail (any path lacks the header) — fallback path (§5.3):** stop and report to the Owner. The fallback is a second root layout at `src/app/(client)/g/[token]/layout.tsx` that reads the token through `next/root-params`. It needs multiple root layouts, moving `src/app/not-found.tsx` to the experimental `global-not-found.js`, and root params are unavailable in server actions, so the gallery locale action would take the token as an argument (it already does, §6). This restructure changes ADR-level file layout; do not start it without the Owner.
  - Also record in the log whether reading `cookies()` in the root layout makes `/` dynamic in the `pnpm build` route table (R-2).

- [ ] **I1.3 `shared/locale` unit.** Files: `src/shared/locale/locale.ts`, `locale.types.ts`, `locale.schema.ts`, `locale.test.ts`.
  - `locale.types.ts`: `export type AppLocale = "en" | "id";` and `export type FormattingLocale = "en-US" | "id-ID";`.
  - `locale.schema.ts`: `export const appLocaleSchema = z.enum(["en", "id"]);` (§9.1).
  - `locale.ts`: `export const DEFAULT_LOCALE: AppLocale = "en";`, `export const APP_LOCALES: readonly AppLocale[] = ["en", "id"];`, `export function parseAppLocale(raw: string | undefined): AppLocale | null`, `export function formattingLocale(locale: AppLocale): FormattingLocale` (a frozen `Record<AppLocale, FormattingLocale>` lookup, §5.6).
  - Tests: `"BR-L10N-001 parses en and id"`; `"BR-L10N-001 rejects tampered, empty, upper-case and unknown values"` (`"EN"`, `""`, `"fr"`, `"en-US"`, `undefined` → `null`); `"AC-L10N-005 maps en to en-US and id to id-ID"`; `"BR-L10N-001 defaults to en"`.
  - Commit: `feat(i18n): add app locale types, schema and parsing`.

- [ ] **I1.4 `composition/locale/resolve-locale` (pure precedence, §5.2).** Files: `resolve-locale.ts`, `resolve-locale.types.ts`, `resolve-locale.test.ts`.
  - Types: `AccountLocaleInput { readonly ownerLocale: AppLocale | null; readonly deviceCookie: string | undefined }`, `GalleryLocaleInput { readonly clientCookie: string | undefined; readonly ownerLocale: AppLocale | null }`.
  - `export function resolveAccountLocale(input: AccountLocaleInput): AppLocale` — `ownerLocale` if non-null, else `parseAppLocale(deviceCookie)`, else `DEFAULT_LOCALE`.
  - `export function resolveGalleryLocale(input: GalleryLocaleInput): AppLocale` — `parseAppLocale(clientCookie)`, else `ownerLocale`, else `DEFAULT_LOCALE`.
  - Table tests (`it.each`): `"AC-L10N-001 a first visit with no cookie and no session resolves en"`; `"BR-L10N-001 a signed-in owner's user.locale wins over the device cookie"` (D-3); `"BR-L10N-001 a valid device cookie applies before sign-in"`; `"AC-L10N-001 a gallery cookie wins over the owner locale"` (D-4); `"AC-L10N-001 a client without a cookie follows the owner's current locale"`; `"BR-L10N-001 an invalid cookie is ignored as if absent"` (§9.2); `"BR-L10N-001 Accept-Language is never an input"` (assert the input types have no such field by calling with only the two fields).
  - Commit: `feat(i18n): add account and gallery locale precedence`.

- [ ] **I1.5 `composition/locale/locale-cookies`.** Files: `locale-cookies.ts`, `locale-cookies.test.ts`. Mirror `pending-email-cookie.ts`.
  - `export const DEVICE_LOCALE_COOKIE = "shutrly_locale";`, `export const GALLERY_LOCALE_COOKIE = "shutrly_gallery_locale";`, `export const LOCALE_COOKIE_MAX_AGE_SECONDS = 31_536_000;` (§11).
  - `export async function readDeviceLocaleCookie(): Promise<string | undefined>`, `export async function writeDeviceLocaleCookie(locale: AppLocale): Promise<void>` (`Path=/`), `export async function readGalleryLocaleCookie(): Promise<string | undefined>`, `export async function writeGalleryLocaleCookie(token: string, locale: AppLocale): Promise<void>` (`Path=/g/<token>`). All set `httpOnly: true, secure: true, sameSite: "lax", maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS`.
  - Tests with `vi.mock("next/headers")`: `"BR-L10N-001 writes the device cookie for the whole site for one year"`; `"AC-L10N-001 scopes the gallery cookie to its own link path"` (D-5); `"C-103 the cookie holds only the locale value"`.
  - Commit: `feat(i18n): add device and gallery locale cookies`.

- [ ] **I1.6 Proxy forwards the gallery token header (§5.3, D-7).** Edit `src/proxy.ts`, `src/proxy.test.ts`.
  - Add `export const GALLERY_TOKEN_HEADER = "x-shutrly-gallery-token";` and a helper `export function forwardHeaders(request: NextRequest): Headers` that copies the request headers, deletes `GALLERY_TOKEN_HEADER`, and sets it to the first path segment after `/g/` when the path matches `/g/<token>` or `/g/<token>/…`.
  - Every `NextResponse.next()` in `proxy` becomes `NextResponse.next({ request: { headers: forwardHeaders(request) } })`. The landing gate rewrite and the `/login` redirect are unchanged.
  - Tests: `"AC-L10N-001 forwards the gallery token to the server for /g/<token> paths"`; `"C-103 strips a forged token header from every incoming request"` (send it to `/login` and `/w/x`); `"C-103 never echoes the token header on the response"` (assert the response headers lack it); keep all existing proxy tests green.
  - Commit: `feat(i18n): forward the gallery token to server rendering`.

- [ ] **I1.7 `composition/locale/request-locale`.** Files: `request-locale.ts`, `request-locale.test.ts`.
  - `export const getRequestLocale: () => Promise<AppLocale> = cache(async () => …)` (React `cache`, request-scoped, §5.6).
  - Reads `headers()` for `GALLERY_TOKEN_HEADER`. Gallery path: `resolveGalleryLocale({ clientCookie: await readGalleryLocaleCookie(), ownerLocale: null })`. Account path: `resolveAccountLocale({ ownerLocale: null, deviceCookie: await readDeviceLocaleCookie() })`. The `ownerLocale: null` inputs are replaced in I2.10 (deviation 3). No module-level mutable state.
  - Tests (mock `next/headers`): `"AC-L10N-001 resolves en on a first visit"`; `"BR-L10N-001 uses the device cookie on account surfaces"`; `"AC-L10N-001 uses the gallery cookie only when the gallery header is present"`; `"AC-L10N-004 two calls with different cookies resolve independently"` (call twice with different mocked jars and no shared module state).
  - Commit: `feat(i18n): resolve the locale once per request`.

- [ ] **I1.8 `composition/locale/message-catalog` machinery (deviation 2).** Files: `message-catalog.ts`, `message-catalog.types.ts`, `message-catalog.test.ts`, `catalog-parity.ts`, `catalog-parity.test.ts` (both in the same unit folder; parity is the completeness gate of the catalog).
  - Types: `CopyModule<T> { readonly namespace: string; readonly surface: CatalogSurface; readonly messages: { readonly en: T; readonly id: CopyShape<T> } }`, `CatalogSurface = "landing" | "auth" | "owner" | "gallery" | "shared"`, `CopyShape<T>` (same keys as `T`, string leaves), `CatalogMessages`, `ParityProblem { namespace; key; problem: "MISSING" | "EMPTY" | "ARGUMENTS_DIFFER" }`.
  - `export const COPY_REGISTRY: readonly CopyModule<unknown>[] = [];` — empty until D-8 (comment: `// D-8 pending: feature copy modules are registered here once the boundary exception is approved`; no TODO tag).
  - `export function buildCatalog(registry, locale: AppLocale): CatalogMessages` and `export function messagesFor(locale: AppLocale, surfaces: readonly CatalogSurface[]): CatalogMessages` (per-surface picking, §5.5, R-6). Catalog objects are frozen constants.
  - `export function findParityProblems(registry): readonly ParityProblem[]` — same key sets in `en` and `id`, no empty strings, and the same ICU argument names and plural/select argument sets, parsed with `@formatjs/icu-messageformat-parser` (§9.4).
  - Tests with fixture modules declared in the test file: `"AC-L10N-003 reports a key missing in id"`; `"AC-L10N-003 reports an empty string"`; `"AC-L10N-003 reports a placeholder present in only one language"`; `"AC-L10N-003 reports a plural argument that differs"`; `"AC-L10N-003 the registered catalog has no parity problems"` (runs on `COPY_REGISTRY`, so it guards every later registration); `"BR-L10N-002 messagesFor(\"en\", [\"landing\"]) contains no owner namespace"`.
  - Also declare next-intl's `AppConfig` (`Locale: AppLocale`, `Messages` from the EN catalog type) in `message-catalog.types.ts` (§5.5).
  - Commit: `feat(i18n): add the message catalog and its parity gate`.

- [ ] **I1.9 `composition/locale/request-config` and the missing-message contract (§5.1, §9.4, D-10).** Files: `request-config.ts`, `message-errors.ts`, `message-errors.test.ts` (same unit folder), `next.config.ts`.
  - `message-errors.ts`: `export function createMessageErrorHandler(strict: boolean): (error: IntlError) => void` — logs `l10n.missing_message` (or the error code for `FORMATTING_ERROR`/`INVALID_MESSAGE`) through `logger` with `{ locale, namespace, key }` only, then throws when `strict`. `export function messageFallback(): string` returns `""`.
  - `request-config.ts`: `export default getRequestConfig(async () => ({ locale, messages: messagesFor(locale, ALL_SURFACES), timeZone: "Asia/Jakarta", onError: createMessageErrorHandler(strict), getMessageFallback: messageFallback }))` where `locale = await getRequestLocale()` and `strict` is true unless `APP_STAGE === "production"` (read through `getScopedBindings(appStageSchema)`; an unreadable stage counts as production, as in `isLandingOnly`).
  - `next.config.ts`: wrap the export with `createNextIntlPlugin("./src/composition/locale/request-config/request-config.ts")`; keep the existing headers and the OpenNext dev hook.
  - Tests: `"AC-L10N-003 throws on a missing message outside production"`; `"AC-L10N-003 logs l10n.missing_message without user data in production"`; `"AC-L10N-003 the fallback is empty, never the key and never the other language"`.
  - Commit: `feat(i18n): register next-intl with a strict missing-message contract`.

- [ ] **I1.10 Root layout and providers share one locale (§5.4, OCM-14, OCM-15).** Files: `src/app/layout.tsx`, new `src/app/layout.test.tsx`, `src/ui/providers/app-providers.tsx` (+ `app-providers.types.ts`, `app-providers.test.tsx`).
  - Layout: `const locale = await getLocale(); const messages = await getMessages();` from `next-intl/server`; render `<html lang={locale}>` and `<AppProviders locale={locale} messages={messages} strictMessages={…}>`. `metadata` stays `{ title: "Shutrly" }` (brand only).
  - `AppProvidersProps { locale: AppLocale; messages: CatalogMessages; strictMessages: boolean }` in `app-providers.types.ts`. Render `NextIntlClientProvider` (client `onError`/`getMessageFallback` defined here, §5.1) around `I18nProvider locale={formattingLocale(locale)}`.
  - Tests: `"AC-L10N-005 renders lang, next-intl and React Aria in en"` and the same for `id` (mock `next-intl/server`; assert `html[lang]`, `useLocale()` from next-intl and React Aria `useLocale().locale` in a probe child); `"AC-L10N-003 the client provider throws on a missing message when strict"`.
  - Commit: `feat(i18n): drive html lang, next-intl and react aria from one locale`.

- [ ] **I1.11 Extend `local/ui-copy` (D-9).** Files: `eslint/local-rules.mjs`, `tests/lint/coding-rules.test.ts`. The design says only that the rule "is extended to accept `t("key")` from a sibling-copy namespace". `label={t("x")}` is already accepted (a call is not a literal). Implement the namespace half: a `useTranslations(...)`/`getTranslations(...)` call whose namespace argument is a string literal is reported; an identifier imported from a sibling `./<unit>.copy` module is accepted.
  - Tests: `"AC-L10N-002 accepts t(key) with a namespace imported from a sibling copy module"`; `"AC-L10N-002 rejects a string-literal namespace"`; existing ui-copy tests still pass.
  - Update `docs/coding-rules.md` › Copy only if the Owner approves the wording (it is a higher-authority document); otherwise note the rule change in the commit body.
  - Commit: `feat(lint): require copy-module namespaces for translations`.

- [ ] **I1.12 E2E: first visit and request isolation.** File: `tests/e2e/locale/locale-resolution.spec.ts`.
  - `"AC-L10N-001 a first visit renders html lang en on /login"`.
  - `"BR-L10N-001 a device cookie of id renders html lang id on /login"`.
  - `"AC-L10N-004 concurrent visitors with different cookies each get their own language"` (two browser contexts, `Promise.all` navigations, assert each `html[lang]`).
  - Run once under `pnpm dev`, once under `pnpm build && pnpm start`; note any hydration warning as a failure.
  - Commit: `test(i18n): cover first-visit language and request isolation`.

**Done when.** All I1 unit tests and the I1 E2E spec pass; `pnpm typecheck` passes; lint passes on every changed file; `pnpm build` succeeds; the Spike log records a pass (or the Owner chose the fallback); `COPY_REGISTRY` is empty and the parity test runs on it; no page shows a message key.

## Iteration I2 — Locale preferences and actions

**Goal.** The owner's language lives on `user.locale`; owner, device and gallery switches have server actions; request resolution reads the owner's and gallery owner's stored locale.

**AC / BR / C.** AC-L10N-001, AC-L10N-004; BR-L10N-001; C-004, C-101, C-103, C-104.

**Read first.**
- `technical-design.md` §3 (D-2…D-5, D-7), §4.1, §4.5, §4.6, §5.2, §5.3, §6 rows `setOwnerLocale`, `setDeviceLocale`, `setGalleryLocale`, §9.1–§9.2, §10, §11, §12 rows AC-L10N-001/004 and the BR/C list.
- `coding-rules.md` › Data Access (`*Unscoped` naming), Validation, Next.js (thin actions), Errors and Logging, Testing.
- Existing files: `src/adapters/db/schema/auth/auth.ts`, `drizzle/0018_folder_map.sql` and `drizzle/meta/` (snapshot naming `00NN_snapshot.json`, `_journal.json` tag), `src/adapters/auth/create-auth/create-auth.ts` (`user.additionalFields`), `src/features/auth/application/ports/account-directory/account-directory.port.ts`, `src/adapters/db/account-directory/drizzle-account-directory.ts`, `tests/support/auth/fake-auth-backend.ts`, `src/features/auth/application/use-cases/update-display-name/` (use case + test pattern), `src/composition/auth/profile-flow/profile-flow.ts`, `src/app/actions/auth/profile.ts`, `src/composition/auth/owner-guard/owner-guard.ts` (`resolveOwnerAccess`), `src/features/gallery/application/ports/client-access-repository/client-access-repository.port.ts`, `src/adapters/db/gallery-repository/drizzle-client-access-repository.ts`, `src/features/gallery/application/use-cases/resolve-client-access/` (`findAvailableGallery`), `src/composition/gallery/client-access-flow/client-access-flow.ts`, `src/features/gallery/domain/client-token/client-token.ts` (`isWellFormedToken`), `tests/integration/auth/schema.test.ts`, `tests/integration/auth/better-auth-contract.test.ts`, `tests/integration/auth/db-adapters.test.ts`.

### Tasks

- [ ] **I2.1 Schema and migration 0019 (`user.locale` only, deviation 1).**
  - `src/adapters/db/schema/auth/auth.ts`: add `locale: text("locale").notNull().default("en"),` to `user`, and `check("user_locale_ck", sql\`${t.locale} in ('en','id')\`)` to its table checks.
  - Test first in `tests/integration/auth/schema.test.ts`: `"BR-L10N-001 a new user row defaults to locale en"`; `"BR-L10N-001 the database refuses a locale outside en and id"` (insert `fr`, expect a check violation).
  - Generate: `pnpm db:generate --name locale_preferences` → `drizzle/0019_locale_preferences.sql`, `drizzle/meta/0019_snapshot.json`, journal entry. Review that the SQL is exactly §4.1:
    ```sql
    ALTER TABLE "user" ADD COLUMN "locale" text DEFAULT 'en' NOT NULL;
    ALTER TABLE "user" ADD CONSTRAINT "user_locale_ck" CHECK ("locale" in ('en','id'));
    ```
    (drizzle-kit adds `--> statement-breakpoint` separators). It must contain no drop or rename. Do not edit `0003`, `0007`, `0011` or their tests.
  - Commit (schema + migration + snapshot + journal, before any run): `feat(db): add user locale preference`.

- [ ] **I2.2 Owner checkpoint, then apply 0019.** Tell the Owner that 0019 is additive (one column with a default, one check) and safe for the code deployed on staging. On approval run `pnpm db:migrate` (worktrees need `.dev.vars` copied from the main checkout) and report the run: database name, migration tag, result. Then run the two schema tests from I2.1: `npx vitest run --config vitest.integration.config.ts tests/integration/auth/schema.test.ts`. No commit.

- [ ] **I2.3 Better Auth field cannot be set by sign-up.** `create-auth.ts`: add `locale: { type: "string", required: false, defaultValue: "en", input: false },` to `user.additionalFields` (§4.1).
  - Test first in `tests/integration/auth/better-auth-contract.test.ts`: `"C-004 a sign-up body carrying locale id still creates the user with en"`.
  - Commit: `feat(auth): expose user locale to better auth as server-only`.

- [ ] **I2.4 Account record and directory carry the locale.**
  - `src/features/auth/domain/account/account.types.ts`: `AccountRecord` gains `locale: AppLocale`.
  - `account-directory.port.ts`: add `setLocale: (id: AuthUserId, locale: AppLocale) => Promise<void>;`.
  - `drizzle-account-directory.ts`: select `locale` (parse with `appLocaleSchema`; a violated value is a bug, assert it) and implement `setLocale` as one `UPDATE "user" SET locale, updated_at WHERE id`.
  - `tests/support/auth/fake-auth-backend.ts` and `fake-auth-deps.ts`: store and return `locale` (default `"en"`), implement `setLocale`.
  - Tests first: `tests/integration/auth/db-adapters.test.ts` `"BR-L10N-001 setLocale changes only that user's locale"` (seed two users, change one, assert the other stays `en`).
  - Commit: `feat(auth): read and write the owner locale in the account directory`.

- [ ] **I2.5 Use case `update-owner-locale`.** Folder `src/features/auth/application/use-cases/update-owner-locale/`: `update-owner-locale.ts`, `.schema.ts` (`updateOwnerLocaleSchema = z.object({ locale: appLocaleSchema })`), `.types.ts` (`UpdateOwnerLocaleInput`, `UpdateOwnerLocaleResult = { ok: true } | AuthFailure`), `.test.ts`.
  - `export async function updateOwnerLocale(deps: AuthDeps, input: unknown, headers: Headers): Promise<UpdateOwnerLocaleResult>` — `requireOwner(deps, headers)`, parse, `deps.accounts.setLocale(owner.id, parsed.data.locale)`, `authLog({ operation: "update-locale", outcome: "UPDATED", userId: owner.id, requestId })`. The user ID comes only from the session (C-004).
  - Tests (pattern of `update-display-name.test.ts`): `"BR-L10N-001 stores the chosen locale on the owner's own record"`; `"C-101 ignores a userId in the input and changes only the session owner"` (seed two owners, send the other's ID); `"BR-L10N-001 rejects a locale outside en and id"`; `"AC-AUTH-009 refuses an unverified session"`.
  - Commit: `feat(auth): add the update owner locale use case`.

- [ ] **I2.6 `locale-flow.updateOwnerLocale` and the `setOwnerLocale` action.** `src/composition/locale/locale-flow/locale-flow.ts` (+ `.test.ts`): `export function updateOwnerLocale(values: unknown): Promise<UpdateOwnerLocaleResult>` using `redirectOnRefusal` + `withAuthScope` like `updateProfileName`. `src/app/actions/auth/profile.ts`: `export async function setOwnerLocaleAction(values: UpdateOwnerLocaleInput): Promise<AuthFailure | undefined>` (thin; the client calls `router.refresh()` later, in I5).
  - Test: `"BR-L10N-001 the profile action returns no error after a valid change"` (mock the composition entry, as `src/app/actions/workspace/settings.test.ts` does).
  - Commit: `feat(i18n): add the owner locale action`.

- [ ] **I2.7 `setDeviceLocale` action.** `locale-flow.ts`: `export async function setDeviceLocale(values: unknown): Promise<LocaleActionResult>` — parse `{ locale }` with `appLocaleSchema`, `writeDeviceLocaleCookie`. `src/app/actions/locale/device.ts`: `setDeviceLocaleAction`. Works without a session and on landing-only production (it posts to `/`, which the proxy already allows).
  - Tests: `"BR-L10N-001 writes shutrly_locale for a valid locale"`; `"BR-L10N-001 refuses an invalid locale without writing a cookie"`.
  - Commit: `feat(i18n): add the device locale action`.

- [ ] **I2.8 Gallery owner locale lookup.** Port `client-access-repository.port.ts`: `readonly findOwnerLocaleByTokenUnscoped: (token: string) => Promise<AppLocale | null>;` (token resolution is the allowed unscoped read). Adapter in `drizzle-client-access-repository.ts`: one query joining the project link token → `workspace.owner_user_id` → `user.locale`, the same token match as `findByTokenUnscoped`.
  - Composition: `src/composition/gallery/gallery-owner-locale/gallery-owner-locale.ts` (+ `.test.ts`): `export async function loadGalleryOwnerLocale(token: string): Promise<AppLocale | null>` — returns `null` without a query when `!isWellFormedToken(token)`; catches a lookup failure, logs `l10n.gallery_owner_locale_failed` without the token (C-103) and returns `null` (§5.2).
  - Tests first: integration `tests/integration/gallery/client-access/gallery-owner-locale.test.ts` `"AC-L10N-001 returns the gallery owner's current locale"`, `"AC-L10N-001 returns null for an unknown token"`, `"AC-L10N-001 follows an owner switch on the next read"` (D-4, never snapshotted); unit `"C-104 a malformed token never reaches the database"`.
  - Commit: `feat(gallery): read the gallery owner's locale by token`.

- [ ] **I2.9 `setGalleryLocale` action (§6, C-104).** Use case `src/features/gallery/application/use-cases/check-gallery-locale-target/` (`.ts`, `.types.ts`, `.test.ts`): `export async function checkGalleryLocaleTarget(deps: SignInGalleryDeps, token: string, ip: string): Promise<boolean>` — true only when `findAvailableGallery(deps, token, ip)` returns a record with a gallery; reuses its unknown-token rate limit (ADR-023); needs no gallery password.
  - `locale-flow.ts`: `export async function setGalleryLocale(rawToken: string, values: unknown): Promise<LocaleActionResult>` — parse the locale, run the check inside `withClientScope`, then `writeGalleryLocaleCookie(rawToken, locale)`; an unavailable gallery returns a neutral refusal and writes nothing. Action: `src/app/actions/client-access/gallery-locale.ts` → `setGalleryLocaleAction(token, values)`.
  - Tests: `"C-104 writes the gallery cookie only for an available gallery"`; `"C-104 an unknown token writes nothing and counts toward the token limit"`; `"AC-L10N-004 works on the locked password screen without a client session"`; `"D-5 the cookie path is /g/<token>"`.
  - Commit: `feat(i18n): add the gallery locale action`.

- [ ] **I2.10 Wire the owner locales into `getRequestLocale` (deviation 3).** `src/composition/auth/owner-locale/owner-locale.ts` (+ test): `export async function loadSignedInOwnerLocale(): Promise<AppLocale | null>` — returns `null` when `isLandingOnly()` or when no cookie name ends with `session_token`; otherwise `resolveOwnerAccess` inside `withAuthScope` and returns `account.locale` only for an `OWNER` decision. `request-locale.ts`: account path passes `loadSignedInOwnerLocale()`; gallery path calls `loadGalleryOwnerLocale(token)` only when the gallery cookie is absent or invalid (§5.3: skip the database when the cookie is valid).
  - Unit tests (mocks): `"BR-L10N-001 a signed-in owner gets user.locale on auth and landing screens"` (D-3); `"AC-L10N-001 a valid gallery cookie skips the owner lookup"`; `"R-2 no session cookie means no session lookup"`.
  - E2E `tests/e2e/locale/locale-preferences.spec.ts`: `"BR-L10N-001 an owner with locale id sees html lang id after sign-in on another device"`; `"AC-L10N-001 a gallery client without a choice follows the owner's locale"`; `"AC-L10N-001 a gallery client's choice overrides the owner and stays on that gallery only"`; `"AC-L10N-004 a workspace switch keeps the owner locale"`. Use the existing E2E owner and gallery seeding helpers; set the locale through the actions, not SQL.
  - Commit: `feat(i18n): resolve owner and gallery owner locales per request`.

**Done when.** 0019 is committed, reviewed and applied (run reported); the I2 unit, integration and E2E tests pass; `pnpm typecheck` and lint on changed files pass; no action takes a user ID from input; the gallery cookie path is `/g/<token>`; sign-up cannot set `locale`; `message_template` is unchanged.

## Iteration I3 — Formatting and parsing

**Goal.** Every display formatter and amount/quantity parser takes the formatting locale as an argument, round-trips exactly in both locales, and never reinterprets an input silently. React Aria local `id-ID` overrides are gone.

**AC / BR / C.** AC-L10N-004 (reformat helpers only; the switch UI is I5–I7), AC-L10N-005, AC-L10N-006 (OCM-16…22), BR-L10N-004, C-105, C-004.

**Display patterns are provisional (D-20 open).** Keep today's `id-ID` output byte-for-byte. For `en-US`, use the same `Intl` options with `en-US` and the same `Rp ` prefix as today; put each pattern in one named constant per locale with the comment `// D-20 pending: display pattern awaits Owner decision`. EN tests assert round trips and separators only, never the exact EN currency prefix or date style. When the Owner answers Q-3, only those constants and the EN display tests change.

**Read first.**
- `technical-design.md` §3 (D-19, D-20, D-23), §7.6, §9.3, §12 rows AC-L10N-004/005/006, §14 R-5.
- `copy-outside-modules-audit.md` OCM-16…22 (lines 64–70).
- `coding-rules.md` › TypeScript (money), Pure domain + orchestration, Validation, Where types and schemas live.
- ADR-007 (money as digit strings).
- Existing files: `src/features/booking/domain/idr-amount/idr-amount.ts` (+ `.test.ts`, `.types.ts`), `src/features/booking/domain/package-value/package-value.ts` (+ test), `src/features/booking/domain/session/session.ts` (+ test), `src/features/gallery/domain/gallery-display/gallery-display.ts` (+ test), `src/features/communications/ui/template-problem-text/template-problem-text.ts`, `src/ui/patterns/date-field/date-field.tsx`, `src/ui/primitives/time-field/time-field.tsx`, `src/features/booking/application/schemas/service-info/service-info.schema.ts`, `src/features/booking/domain/project-record/project-record.schema.ts`.

### Tasks

- [ ] **I3.1 IDR amount: locale-aware parse and format (OCM-20, D-19).** `idr-amount.ts`:
  - `export function parseIdrAmount(raw: string, locale: FormattingLocale): IdrAmountResult` — strip an optional `Rp`/`IDR` prefix (case-insensitive) and spaces; remove the locale's group separator (`id-ID`: `.`, `en-US`: `,`); if the other separator remains → `NOT_WHOLE`; the rest unchanged (`EMPTY`, `INVALID`, `TOO_LARGE`, leading zeros).
  - `export function formatIdr(amount: string, locale: FormattingLocale): string` and `export function formatIdrNumber(amount: string, locale: FormattingLocale): string` — `BigInt` through a frozen per-locale `Intl.NumberFormat` lookup (§5.6).
  - Tests (`it.each` over both locales and `0`, `1`, `999`, `1000`, `1500000`, `IDR_MAX`): `"AC-L10N-005 parse(format(v, l), l) returns v exactly"`; `"C-105 id-ID: a comma is NOT_WHOLE, never a decimal"`; `"C-105 en-US: a dot is NOT_WHOLE, never a decimal"`; `"AC-L10N-005 accepts the Rp and IDR prefixes in both locales"`; `"AC-L10N-006 id-ID output is unchanged (Rp 750.000)"`; existing problem tests keep passing with `"id-ID"`.
  - Update callers in the same task so typecheck passes (see I3.5 for the list); temporarily the UI callers pass the locale from I3.5's hook, so do I3.5's hook first if needed (reorder within the iteration is fine; keep one commit per task).
  - Commit: `feat(booking): parse and format idr amounts per locale`.

- [ ] **I3.2 Reformat helpers for the language switch (AC-L10N-004, §7.6 last bullets).** New unit `src/features/booking/domain/locale-input/locale-input.ts` (+ `.test.ts`): `export function reformatAmountInput(raw: string, from: FormattingLocale, to: FormattingLocale): string` and `export function reformatQuantityInput(raw: string, from: FormattingLocale, to: FormattingLocale): string` — return the value re-formatted in `to` when it parses under `from`; otherwise return `raw` unchanged.
  - Tests: `"AC-L10N-004 an amount typed in id is rewritten in en with the same value"`; `"AC-L10N-004 unparseable text is kept as typed"`; `"C-105 the rewritten value parses back to the same digits"`.
  - Commit: `feat(booking): reformat amount and quantity inputs on a language switch`.

- [ ] **I3.3 Quantity: locale-aware parse and format (OCM-21, deviation 4).** First list every `parseQuantity` caller (`rg -n "parseQuantity\(" src`) and confirm each parses typed user input (today: `domain/project-items/project-items.ts`, `application/use-cases/service-results/service-results.ts`). If one parses stored canonical values, stop and report a `SPEC GAP`.
  - `export function parseQuantity(raw: string, locale: FormattingLocale): QuantityResult` — accepts only the locale's decimal separator (`id-ID` `,`, `en-US` `.`), no grouping; the other separator → `INVALID`. Scale and `QUANTITY_MAX` unchanged.
  - `export function formatQuantity(value: string, locale: FormattingLocale): string` — canonical `.` → the locale's decimal separator. Update `domain/item-summary/item-summary.ts` to take and pass the locale.
  - Callers that parse input get `locale` from their caller: `service-results.ts` and the project-items flow receive it from composition, which passes `formattingLocale(await getRequestLocale())` (server-resolved, never client-supplied, C-004).
  - Tests: `"AC-L10N-005 parse(format(v, l), l) returns v for 0, 0.5, 12.25 and QUANTITY_MAX"`; `"C-105 id-ID refuses a dot decimal"`; `"C-105 en-US refuses a comma decimal"`; `"BR-CAT-001 more than two decimals is still TOO_MANY_DECIMALS"`.
  - Commit: `feat(booking): parse and format quantities per locale`.

- [ ] **I3.4 Server-side amount schemas take the request locale (C-004).** `service-info.schema.ts`: replace the constant with `export function createServiceInfoSchema(locale: FormattingLocale)`; `project-record.schema.ts`: `export function createAgreedPriceSchema(locale: FormattingLocale)`. Use cases `add-service`, `update-service-info` and the project create/update use cases that use `agreedPriceSchema` gain a `locale: FormattingLocale` parameter; composition passes `formattingLocale(await getRequestLocale())`. Forms build the same schema with the hook from I3.5.
  - Tests: extend the existing use-case tests: `"C-004 the server parses an amount with the server-resolved locale"` (an `en-US` request refuses `750.000` as `NOT_WHOLE`; `id-ID` accepts it).
  - Commit: `feat(booking): validate amounts with the server-resolved locale`.

- [ ] **I3.5 Callers pass the active formatting locale.** Add `src/ui/hooks/use-formatting-locale/use-formatting-locale.ts` (+ test): `export function useFormattingLocale(): FormattingLocale` → `formattingLocale(useLocale())` from next-intl. Server components and application read models get it as a parameter from composition (`list-services.ts` and `get-service-detail.ts` gain `locale: FormattingLocale`).
  - Update every caller found by `rg -n "formatIdr\(|formatIdrNumber\(|formatQuantity\(" src` (today about twelve files under `src/features/booking/ui/` and the two application use cases). Text helpers (`*-text.ts`, `add-on-total.ts`) take `locale` as a parameter from their component.
  - Tests: `"AC-L10N-005 useFormattingLocale follows the provider locale"`; touched component tests render once in each locale and assert the amount uses that locale's grouping.
  - Commit: `refactor(booking): pass the active locale to amount formatting`.

- [ ] **I3.6 Session and gallery dates per locale (OCM-18, OCM-19, D-23).** `session.ts`: `formatWeekdayDate`, `formatShortDate`, `formatSessionWhen`, `formatSessionRange` gain `locale: FormattingLocale`; keep `timeZone: "UTC"` and the 24-hour `HH.MM`/`HH:MM` display per locale constant. `gallery-display.ts`: all six `formatGallery*` functions gain `locale`; keep `GALLERY_TIME_ZONE`. Per-locale frozen `Intl.DateTimeFormat` lookups (§5.6). Update the callers listed by `rg -n "formatGallery|formatWeekdayDate|formatShortDate|formatSessionWhen|formatSessionRange" src` (about twenty files under `src/features/booking/ui/` and `src/features/gallery/ui/`).
  - Tests: `"AC-L10N-005 id-ID output is unchanged"` (existing expectations); `"AC-L10N-005 en-US uses the same instant and time zone"` (assert the day number and 24-hour time, not the month style, D-20); `"AC-L10N-005 Asia/Jakarta midnight boundary stays on the same calendar day in both locales"`.
  - Commit: `feat(i18n): format session and gallery dates per locale`.

- [ ] **I3.7 Template character limit number (OCM-22).** `template-problem-text.ts`: `templateProblemText(type, key, locale: FormattingLocale)`; the limit is formatted with the passed locale. Update its callers in `features/communications/ui`.
  - Tests: `"AC-L10N-006 formats 2000 with the active locale"` (`2.000` in id-ID, `2,000` in en-US).
  - Commit: `feat(communications): format the template length limit per locale`.

- [ ] **I3.8 Remove React Aria local overrides (OCM-16, OCM-17).** `date-field.tsx`: remove the local `I18nProvider locale="id-ID"` and its `LOCALE` constant; its own date formatters take the locale from React Aria `useLocale()` (allowed in `src/ui`). `time-field.tsx`: remove the local provider; keep `hourCycle={24}` (D-23). ISO values and time zones are unchanged.
  - Tests in `date-field.test.tsx` / `time-field.test.tsx`: `"AC-L10N-005 the date field follows the app provider locale"` (render under `I18nProvider` `en-US` and `id-ID`, assert the accessible segment labels differ and the ISO value is identical); `"D-23 the time field shows 24-hour time in en-US"`.
  - Commit: `fix(ui): let date and time fields follow the app locale`.

**Done when.** Every OCM-16…22 site takes a locale; round-trip tests pass for both locales at all boundary values; `id-ID` output is byte-for-byte unchanged; no `"id-ID"` literal remains in `src/` outside `src/shared/locale/locale.ts` (check with `rg -n '"id-ID"' src`); `pnpm typecheck` and lint on changed files pass; `pnpm build` succeeds. Known interim state: screens still show Indonesian `.copy.ts` text while numbers and dates follow the resolved locale (default `en`) until I5–I7 convert their copy. Nothing is released (spec l.23); do not deploy this branch to staging before I8 without the Owner.

## Blocked iterations (outline only)

### I4 — Platform defaults

- **Goal.** EN/ID default templates in code; `message_template.is_default` with nullable `content` (§4.2, §4.3, migration after 0019 per deviation 1); `resolveTemplateContent`; save modes `custom`/`default` (D-13); seeds write `is_default = true, content = NULL`; backfill tests frozen against a historical constant; `renderTemplateForRecipient(template, language, values)` for F-15; keyed item definitions, roles and project-item snapshots (§4.4, §7.4).
- **AC / BR / C.** AC-L10N-006, 008, 010; BR-L10N-003, 004, 006; C-102, C-106.
- **Status.** Ready. Open decisions resolved 2026-10-10 (see technical design §3).
- **First task once unblocked.** Freeze the historical constant: add `HISTORICAL_0003_TEMPLATE_CONTENT` to `tests/config/message-template-backfill.test.ts` (copied from `drizzle/0003_message_template_backfill.sql`) and point the test at it, so `DEFAULT_TEMPLATE_CONTENT` can become `Record<AppLocale, Record<TemplateType, string>>` without touching migration 0003. Commit `test(communications): freeze the 0003 template backfill literals`.

### I5 — Shared UI, shell, auth, landing, profile; language switches

- **Goal.** Register the first copy modules in the catalog; convert shared UI, app shell, auth screens, landing and profile copy to `{ en, id }` ICU messages; build `src/ui/patterns/language-switch/`, `features/auth/ui/profile-language-field/`, `features/auth/ui/auth-language-switch/` and the landing placement (§8); apply the amount/quantity reformat on switch; auth email locale (§7.3).
- **AC / BR.** AC-L10N-001, 002, 010, 011; BR-L10N-002, 006.
- **Status.** Ready. Open decisions resolved 2026-10-10 (see technical design §3).
  - Auth layout language switch (login, register, verify, forgot/reset password): idle, pending, failed — desktop and mobile; each in EN and ID.
  - Landing page with the switch placement: idle, pending, failed — desktop and mobile; EN and ID.
  - App shell (navigation, mobile drawer, workspace switcher) in EN and ID — desktop and mobile.
  - Auth email locale control, only if D-17 approves one: preselected, changed, submitting.
- **First task once unblocked.** Register `src/app/not-found.copy.ts` and `src/app/error.copy.ts` (no screen layout change) as the first `CopyModule`s in `COPY_REGISTRY`, converted to `{ en, id }` from the copy deck, with the parity test green. Commit `feat(i18n): register the first copy modules`.

### I6 — Owner feature copy

- **Goal.** Convert catalog, clients, projects, team, sources, add-ons and template screens (OCM-01…13): option arrays, error-code maps (stable keys), skeleton text equal to final text, ICU plurals for counts and the icon-button badge.
- **AC / BR.** AC-L10N-002, 006, 011; BR-L10N-002, 004.
- **Status.** Ready. Open decisions resolved 2026-10-10 (see technical design §3).
- **First task once unblocked.** Convert `src/ui/primitives/icon-button` badge text (OCM-09) to one ICU plural `{count, plural, …}` with a render test in both locales. Commit `feat(ui): announce the icon button badge count per locale`.

### I7 — Client gallery copy and client switch

- **Goal.** Convert the client gallery (password gate, home, photos, picks, review, final delivery) and add `features/gallery/ui/client-language-switch/`, which must not clear selections, the pick-note draft or the password field.
- **AC / BR / C.** AC-L10N-001, 002, 004, 011; C-104.
- **Status.** Ready. Open decisions resolved 2026-10-10 (see technical design §3).
- **First task once unblocked.** E2E spec `tests/e2e/locale/gallery-switch.spec.ts`: `"AC-L10N-004 switching language on the photos page keeps selections and the pick note draft"` (fails until the switch exists). Commit with the switch implementation.

### I8 — Verification

- **Goal.** E2E journeys per surface in both locales (owner creates a project in ID; client picks and submits in ID), `next build` + start smoke with hydration warnings failing the test, visual comparison against the current screens, and a coverage report separating implemented coverage from future surfaces.
- **AC.** AC-L10N-011, 012.
- **Status.** Ready. Open decisions resolved 2026-10-10 (see technical design §3).
- **First task once unblocked.** `tests/e2e/locale/build-smoke.spec.ts` run against `pnpm build && pnpm start`: every top-level route in EN and ID with a console listener that fails on hydration warnings.

## Owner actions required

**Decisions to answer** (technical-design §3, §15):
- D-8 / Q-6: approve the narrow `eslint-plugin-boundaries` exception so `composition/locale/message-catalog` may import `*.copy.ts` from `features/*/ui`, `src/ui` and `src/app` — or name another placement for the registry. Blocks I5–I7.
- D-17 / Q-1: how the owner chooses the auth email language before sign-in. Blocks the auth email part of I5.
- D-18 / Q-2: `default_key` for item definitions, roles and project-item snapshots. Blocks I4 and the keyed labels in I6.
- D-20 / Q-3: EN display patterns for IDR and dates per locale. I3 ships provisional constants; the answer changes only those constants and EN display tests.
- D-21 / Q-5: template "changed elsewhere" conflict state, or keep last-write-wins. Affects I4 scope.
- D-22 / Q-4: copy the pre-sign-in locale into `user.locale` at registration; should a Profile switch also write the device cookie. Affects I5.
- Deviations 1–4 in this plan, especially the 0019 split (deviation 1).
- I1.1: install and pin `next-intl` and `@formatjs/icu-messageformat-parser` in this worktree.
- I2.2: go-ahead to apply 0019 to the shared non-production database.


**Higher-authority documents to amend and approve** (do not edit them as part of this plan):
- `docs/domain/business-rules.md` BR-L10N-003 (l.439, "reviewed EN/ID versions") and BR-L10N-005 (l.445, migration and historical-viewing policy), to match spec l.23–29.
- `docs/product/localization.md` l.12, l.14, l.27–29 (pairs, readiness, legacy policy).
- `docs/coding-rules.md` l.198 Copy bullet ("Owner-authored descriptions/templates support both versions"), and the boundary table (l.48) if D-8 is approved; the `local/ui-copy` wording from I1.11.
- ADR-025 l.21 ("one logical template … with language versions").
- `acceptance-criteria.md` AC-L10N-007 (paired authoring and readiness) and AC-L10N-009 (legacy migration policy), both superseded by the 2026-10-10 decisions.
- Copy deck corrections listed in technical-design §13.

## Spike log

Run 2026-10-10 by I1.2, in a throwaway checkout of commit `690a9d40` (removed afterwards). The proxy was instrumented to forward `x-shutrly-gallery-token` on `/g/<token>` paths and to strip any incoming value. Only booleans were logged, never the token (C-103).

| Date | Path checked | `pnpm dev` | `pnpm build && pnpm start` | Notes |
|---|---|---|---|---|
| 2026-10-10 | Root layout (RSC) on `/g/<token>` | pass (`true`) | pass (`true`, `APP_STAGE=development`) | Header reaches the root layout. |
| 2026-10-10 | Gallery page `/g/[token]` | pass (`true`) | pass (`true`) | Page reads the header. |
| 2026-10-10 | Gallery server action | not verified | not verified | No action was triggered; the form needs a browser. Still to check in I1.6 or I2. |
| 2026-10-10 | Gallery route handler `/g/[token]/media/...` | pass (`true`) | pass (`true`) | Handler reads the header. |
| 2026-10-10 | Forged header on `/login` stripped | pass (`false`) | pass (`false`) | Stripped on the normal `NextResponse.next()` path. |
| 2026-10-10 | Forged header on the landing-gate rewrite | not in plan | **FAIL: header reached the layout (`true`)** | The gate rewrite does not pass through the forwarded headers, so a forged value survives on that path. Fix in I1.6: apply `forwardHeaders` to every response, including rewrites and redirects. |
| 2026-10-10 | `/` dynamic in build route table (R-2) | n/a | observed: `/` is `ƒ` (dynamic) | No static baseline was built, so the effect of reading cookies in the root layout is not measured. Every route in this build is already dynamic. |

**Result: the header path passes (fallback in §5.3 not needed).** One gap is fixed in I1.6 (gate rewrite). Two checks are still open: the server action and the R-2 baseline comparison.

Environment notes found while running the spike:
- `APP_STAGE` accepts only `development`, `test` or `production` (`app-stage.schema.ts`). `staging` is treated as unreadable and falls back to the landing-only gate.
- `next start` reads bindings from `process.env` (`request-context.ts`), but `.dev.vars` is not loaded automatically, so `/login` returns 500 without it.
