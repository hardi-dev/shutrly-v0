# Technical Design — F-01 Auth & Account

Status: APPROVED (Owner 2026-09-27): revised for coding rules v2.0 and the implemented F-00, and every open decision is answered.

## Context

This design implements [spec.md](spec.md) and [acceptance-criteria.md](acceptance-criteria.md), as modeled in [diagrams/](diagrams/) and drawn in [auth.pen](auth.pen) ([design.md](design.md), DESIGNED 2026-09-26).
- **In scope:** Owner registration, email verification, password and Google sign-in, session and status enforcement, logout, password recovery and change, and display-name update.
- **Handed off to F-02:** workspace resolution and first-workspace creation.
- **Out of scope** (per the spec): other social providers, magic links, 2FA/passkeys, email change, account deletion, Drive OAuth, admin UI, session/device list, and client or freelancer login.

F-00 Foundation is implemented on `main` (2026-09-27). The step-by-step build is [plan.md](plan.md): 33 tasks, 0–32. Its code was verified on 2026-09-27 in a scratch worktree against F-00's lint config: typecheck, lint, 208 unit/DOM tests and `next build` pass, and every task was replayed on a clean checkout.

## Relevant Authority

- Constitution: C-002, C-003, C-004, C-006, C-007, C-008, C-009, C-010, C-011, C-012, C-103
- Business rules: BR-AUTH-001 … BR-AUTH-008; BR-WS-003 (hand-off); BR-SRC-001 (no Drive scopes)
- Acceptance criteria: AC-AUTH-001 … AC-AUTH-031
- ADRs:
  - ADR-001 Drizzle; ADR-002 Better Auth owns identity; ADR-003 workspace isolation (identity is not tenant data)
  - ADR-008 Cloudflare Workers; ADR-009 Neon per-request Pool
  - ADR-010 Tailwind + React Aria; ADR-011 Resend; ADR-012 Google sign-in
  - ADR-013 auth rate-limit store (Accepted 2026-09-27)
- Coding rules v2.0 (2026-09-27): boundaries, `server-only`, `.types`/`.schema`/`.copy` siblings, no `as`, JSDoc, one unit per folder
- Design: `auth.pen` frames and Alert IDs in [design.md](design.md); tokens and components in `docs/design-system/`

## Architecture

```text
src/
  features/auth/
    domain/credentials/            normaliseEmail, checkPassword, A-1 constants (Zod brands, no framework)
    domain/account/                AuthUserId, AccountStatus, accessDecision, googleLinkDecision
    application/
      ports/                       identity · account-directory · link-registry · auth-email ·
                                   rate-limiter · workspace-destination
      errors/                      AuthError, codes and field-error keys (Zod enums), EmailDeliveryError
      auth-deps/                   AuthDeps, RequestMeta (types)
      logging/auth-log/            the only auth logger (allow-listed fields)
      link-outbox/                 queued auth emails: awaited (resend) or waitUntil (register, forgot)
      rate-limits/auth-rate-limits/  A-6 rules over RateLimiterPort
      schemas/auth-fields/         shared field schemas
      policy/owner-access/         resolveOwnerAccess, requireOwner
      policy/destination-path/     F-02 routes, auth routes
      pending-email/               seal/open the SPEC GAP-3 cookie value (HMAC, expiry)
      use-cases/<verb-noun>/       one folder each, 12 use cases
    ui/<component-or-screen>/      one folder each, with *.copy.ts (Indonesian); one screen per Pencil state
  adapters/
    db/schema/auth/                Better Auth tables + auth_latest_link + auth_rate_limit
    db/account-directory/          AccountDirectoryPort over Drizzle
    db/link-registry/              LinkRegistryPort (latest link, single use)
    db/rate-limiter/               RateLimiterPort (ADR-013) + purge
    db/better-auth-database/       Better Auth's drizzleAdapter over the request's db
    auth/create-auth/              betterAuth() options, hooks, Google provider
    auth/google-guard/             BR-AUTH-007 takeover guard (in mapProfileToUser)
    auth/identity/                 IdentityPort over Better Auth (better-auth-identity.ts)
    email/auth-email-templates/    Indonesian email copy + rendering
    email/auth-email-sender/       Resend over fetch
    email/capturing-email-sender/  E2E only, localhost only
  composition/auth/
    auth-scope/                    per-request wiring over F-00 withRequestDb (ADR-009)
    session-cookies/ pending-email-cookie/   Set-Cookie bridge, SPEC GAP-3 cookie
    owner-guard/                   requireOwnerOrRedirect, redirectIfSignedIn, redirectOnRefusal
    auth-api/ register-flow/ verify-flow/ login-flow/ recovery-flow/ profile-flow/ google-flow/
    email-capture/                 one entry point per flow; app/ calls only these
  app/
    (auth)/layout.tsx + login, register, verify, verify/confirm (route), forgot-password,
      reset-password, account-unavailable, auth/continue (route)
    (owner)/profile/page.tsx       content only; F-02's (owner)/layout.tsx supplies the App Shell
    actions/auth/{register,login,recovery,profile,google}.ts
    api/auth/[...all]/route.ts     Better Auth endpoints incl. the Google callback
    api/test/auth-emails/route.ts  E2E only (404 unless capture is on for localhost)
  proxy.ts                         Next 16 Proxy: cookie-presence redirect only
  ui/patterns/alert/               design-system C24 Alert
  shared/crypto/sha256-hex/
scripts/auth/{set-user-status,purge-auth-rate-limits}.ts   run with tsx --conditions=react-server
```

Key decisions:

- **Per-request Better Auth.** ADR-009 forbids a module-level Pool. `composition/auth/auth-scope` therefore builds every auth adapter inside F-00's `withRequestDb`, which ends the Pool with `waitUntil(pool.end())` in `finally`. Only the options are fixed; the database handle is per request.
- **Better Auth behind ports.** `IdentityPort` covers credentials, sessions and email tokens. `AccountDirectoryPort` covers reads and operator changes on the `user` table, and `LinkRegistryPort` holds the latest link per user and purpose. Domain and application code never import Better Auth.
- **Adapters never import each other** (coding rules). Everything that touches Drizzle lives in `adapters/db/*`, including Better Auth's `drizzleAdapter`. Composition hands that adapter to `adapters/auth/identity`, and hands it the account directory and link registry as ports.
- **`app/` reaches behaviour only through composition.** Pages and actions import a flow entry point from `composition/auth/*`. They import `features/auth/application` only for schema and type files, and they never import domain code.
- **Status and verification gate** (`policy/owner-access`). It is called by every owner page (through `requireOwnerOrRedirect`), by every owner use case (`updateDisplayName` and `changePassword` call `requireOwner` themselves), and after every sign-in (`continueAfterSignIn`). `src/proxy.ts` only redirects requests that have no session cookie at all.
- **Workspace hand-off is a port.** `WorkspaceDestinationPort.resolve(userId) → "ONBOARDING" | "WORKSPACE"`. Until F-02 exists, composition wires a stub that returns `ONBOARDING` (SPEC GAP-2).

## Database Changes

`src/adapters/db/schema/auth/auth.ts`, exported from the schema barrel. The migration `drizzle/0000_auth_identity.sql` is generated and reviewed (plan Task 5), and the Owner applies it by hand (interim rule). There is no second user table (ADR-002), and none of these tables is tenant data, so none has a `workspace_id`.

| Table | Definition |
|---|---|
| `user` | Better Auth fields plus `status text NOT NULL DEFAULT 'ACTIVE'`, `CHECK (status IN ('ACTIVE','SUSPENDED','DISABLED'))`, and `email_verified_at timestamptz`, with `CHECK (email_verified = (email_verified_at IS NOT NULL))`. Unique index on `lower(email)`. |
| `account` | Better Auth default. A credential row exists only for password accounts. Unique `(provider_id, account_id)`, index on `user_id`. |
| `session` | Better Auth default; index on `user_id` for revoke-all. |
| `verification` | Better Auth default; index on `identifier`. |
| `auth_latest_link` (new) | `(user_id, purpose)` PK, `purpose` in `VERIFY_EMAIL`/`RESET_PASSWORD`, `token_hash`, `expires_at`, `created_at`. Only the latest link per user and purpose is valid, and it is deleted when used (A-3, R-2). |
| `auth_rate_limit` (new, ADR-013) | `(key, window_start)` PK, `count`, index on `window_start`. Keys are `ACTION:email:sha256(normalised email)` or `ACTION:ip:<ip>`, so no raw email is ever stored. |

## Server / API Interface

- **Better Auth routes:** `app/api/auth/[...all]/route.ts` serves Google OAuth start and callback, and Better Auth's internal endpoints.
- **Email links:** the verification link lands on `app/(auth)/verify/confirm/route.ts`, and the Google return lands on `app/(auth)/auth/continue/route.ts`.
- **Everything else** is a server action. It calls the composition entry point with the raw values, and the use case parses them with its Zod schema (the same schema the form uses).

| Action / endpoint | Input schema | Outcomes |
|---|---|---|
| `registerAction` | `registerOwnerSchema`: name 1–100 trimmed, email, password 8–128 | → `/verify` (always the same, A-5) · field errors · `RATE_LIMITED` |
| `resendVerificationAction` | none (session or pending cookie) | ok · `RATE_LIMITED` · `EMAIL_DELIVERY_FAILED` · → `/login` when no email is known |
| `GET /verify/confirm?token` | token | → destination with session · → `/verify?state=invalid` |
| `loginAction` | `loginOwnerSchema`: email, password non-empty | → destination · → `/verify` (restricted) · → `/account-unavailable` · `INVALID_CREDENTIALS` · `RATE_LIMITED` |
| `logoutAction` | none | current session ended → `/login` |
| `forgotPasswordAction` | `requestPasswordResetSchema`: email | → `/forgot-password?state=sent` (always, AC-016) |
| `resetPasswordAction` | `resetPasswordSchema`: token, password, confirm | → `/login` · → `/reset-password?state=invalid` · field errors |
| `changePasswordAction` | `changePasswordSchema`: current, new, confirm | ok · `WRONG_CURRENT_PASSWORD` (field) · field errors |
| `updateDisplayNameAction` | `updateDisplayNameSchema`: name | ok · field errors |
| `startGoogleAction` / `GET /auth/continue` | OAuth state and code (Better Auth) | → destination · → `/login?error=…` (`GOOGLE_CANCELLED` / `GOOGLE_FAILED`) · → `/account-unavailable` |

Email is never an input to a profile action; the email field is read-only, and unknown keys are stripped (AC-020).

## Domain / Application Logic

Domain (`features/auth/domain`, pure, unit-tested):

- `normaliseEmail` (trim + lowercase, Zod-branded) and `checkPassword` (8–128, no composition rules; A-1).
- `accessDecision(account) → ANONYMOUS | UNAVAILABLE | RESTRICTED | OWNER`: status first, then verification (BR-AUTH-005, then BR-AUTH-003).
- `googleLinkDecision → REJECT | CREATE | LINK | LINK_WITH_TAKEOVER_GUARD` (BR-AUTH-006/007).

Application flows (one use case each; see [diagrams/sequence/](diagrams/sequence/)):

- **Register:**
  - Steps: validate, rate-limit (per email and per IP), `createPasswordUser` (creates nothing for an existing email), then `sendVerificationLink` (a no-op for a verified account). The outbox sends in the background.
  - The answer is always the same: nobody is signed in, and the pending-email cookie is set.
- **Resend:** only for the email from the restricted session or the pending cookie. It rate-limits, then **awaits** delivery, so a failure can be shown and retried (SPEC GAP-4).
- **Verify:** `LinkRegistry.consume` (latest, unused, unexpired) → Better Auth verify, which signs the owner in (A-7) → `continueAfterSignIn`.
- **Login:** rate-limit on failures → credentials → `continueAfterSignIn`.
  - `UNAVAILABLE` revokes every session and returns `ACCOUNT_UNAVAILABLE`.
  - `RESTRICTED` keeps a session that the gate confines to `/verify`.
  - `OWNER` goes to the destination.
- **Request reset:** the same answer every time. Within the limits, it sends only for accounts that have a password (BR-AUTH-008), and it sends in the background.
- **Reset:** `LinkRegistry.consume` → Better Auth reset, which revokes **all** sessions (A-4).
- **Change password:** `requireOwner` → Better Auth `changePassword` with `revokeOtherSessions`, which keeps the current session.
- **Google:**
  - The guard runs in `mapProfileToUser`. `LINK_WITH_TAKEOVER_GUARD` verifies the account, deletes its credential and all its sessions in one transaction, and only then does Better Auth link.
  - Google is kept out of `trustedProviders`, so Google's `email_verified` is always required. A create hook refuses a new account from an unverified Google email, and an account hook strips every provider token.
  - `/auth/continue` runs `continueAfterSignIn`.
- **Operator status:** `pnpm auth:set-status <email> <STATUS>` updates the status and deletes every session in one transaction (BR-AUTH-005, AC-015).

## UI Components

**Visual truth is `auth.pen`**, implemented from **HTML exports of each frame** (Owner request, 2026-09-27; plan › *Pixel-perfect UI*):
- The Owner exports each frame to `docs/features/auth/exports/`.
- Components follow the export's structure and spacing, mapped to tokens. Missing tokens are reported as DESIGN TOKEN GAPs.
- Playwright compares every exported state with its route (`auth-fidelity.spec.ts`).

| Unit | Location | Notes |
|---|---|---|
| `AuthSplitLayout` | `features/auth/ui/auth-split-layout` | Server component. Brand, form column (`size.auth-panel`), form (`size.auth-form`), footer. `EditorialPanel` appears from `lg`; mobile has one column. |
| `EditorialPanel` | `features/auth/ui/editorial-panel` | The `Z5xhk` mosaic is an exported image (`public/auth/editorial/mosaic.webp`), with its scrim. The headline is live text. `aria-hidden`, `alt=""`. Licensed photos only (R-5). |
| `Alert` | `src/ui/patterns/alert` | C24: Info/Danger, Close off. `role=status`/`alert` only when live. |
| Screens | `features/auth/ui/<state>-screen` | One per Pencil state (login, register, verify-pending, invalid-verify-link, forgot-password, reset-sent, reset-password, invalid-reset-link, account-unavailable), plus `account-sections` for Profile. |
| Forms | `features/auth/ui/*-form` | `"use client"`. `useAuthForm` binds React Hook Form to the use case's schema. `ControlledTextField` is built on `useController`. A server field error goes to `setError`; anything else becomes a focused `AuthErrorAlert` (AC-023). |
| Processing | form `Button` | Disabled, with progress copy (`U9laqq`). A spinner is still a design-system gap. |
| Resend | `features/auth/ui/resend-verification` | 60 s client cooldown (UX only); the server limit is authoritative. |
| Profile | `(owner)/profile` + `account-sections` | 720 px column (`size.content-narrow`). The password section is hidden for Google-only accounts (`TInkk`). F-02's `(owner)/layout.tsx` provides the App Shell (R-6). |
| Copy | each unit's `*.copy.ts` | Indonesian (CONFLICT-1). Pencil strings are translated; the rest are marked `// not in Pencil`. |

## Validation

- Canonical Zod schemas sit beside each use case (`*.schema.ts`), built from the shared field schemas. The form uses the same schema (UX only), and the use case re-parses the raw values on the server (C-004, AC-002).
- Zod messages are `FieldErrorKey` values. `validationFailure` narrows them with the key schema, and each form's copy translates them.
- Better Auth validates its own route inputs. The Google claims used by the guard are typed from Better Auth's Google profile.
- Tokens are opaque, bounded strings (the reset token is capped at 512 characters). They are never parsed or logged.
- Redirect targets are never user input. They come from `DESTINATION_PATH`/`AUTH_PATH`, and the Google callback URLs are the same constants.

## Error Handling

Codes (`authErrorCodeSchema`): `VALIDATION_FAILED`, `INVALID_CREDENTIALS`, `RATE_LIMITED`, `EMAIL_UNVERIFIED`, `ACCOUNT_UNAVAILABLE`, `AUTH_REQUIRED`, `INVALID_LINK`, `WRONG_CURRENT_PASSWORD`, `GOOGLE_CANCELLED`, `GOOGLE_FAILED`, `EMAIL_DELIVERY_FAILED`. Use cases return `{ ok: false, code }` for expected failures. `requireOwner` throws `AuthError`, which the owner guard turns into a redirect.

| Code | UI (design frame) |
|---|---|
| `VALIDATION_FAILED` | field errors (`hTP6i`) |
| `INVALID_CREDENTIALS` | Danger Alert, title only (`q8b0R9`, Alert `DjUek`) |
| `ACCOUNT_UNAVAILABLE` | Account unavailable page (`kXr5x`) |
| `INVALID_LINK` | Invalid verification / reset link (`TIvfA`, `x5ds7`) |
| `RATE_LIMITED` | form-level Danger Alert, no account information |
| `GOOGLE_*` | Login with the Google message (`?error=`) |
| `EMAIL_DELIVERY_FAILED` | retryable message on resend only (SPEC GAP-4) |
| unexpected | re-thrown to the route's error boundary (`app/error.tsx`, retry; C-007); logged by `onRequestError` |

Errors never carry passwords, tokens, URLs, cookies, OAuth codes or provider tokens.

## Concurrency / Consistency

- One identity per email: the unique index on `lower(email)`, and `createPasswordUser` reports `created: false` for an existing email.
- Single-use links: `DELETE … RETURNING` on `auth_latest_link` in one statement, so two concurrent clicks cannot both succeed (integration-tested).
- Google takeover guard: verify + delete credential + delete sessions in one transaction, before Better Auth links.
- Operator status: the status update and the session deletion run in one transaction.
- Rate limits: `INSERT … ON CONFLICT (key, window_start) DO UPDATE SET count = count + 1 RETURNING count`, which is atomic (ADR-013).
- Emails are sent after the state commits; a failed send never rolls back the account or the request (AC-022).

## Security

- **Session cookies:** Better Auth defaults (httpOnly, secure, SameSite=Lax); 7 days, sliding with a daily refresh (A-2). **The cookie cache is disabled**, so every request reads the session and the status from the database (AC-014).
- **Owner gate:** `requireOwner` runs on every owner page, action and use case; the Proxy is never the only check.
- **Enumeration:** register, forgot password and login failures return the same shapes. Enumeration-sensitive emails are sent through `waitUntil`, so response timing does not depend on whether the account exists (ADR-011).
- **Rate limits (A-6):** enforced server-side through `RateLimiterPort` (ADR-013). Cloudflare WAF is a coarse IP flood layer in front.
- **Google:** identity scopes only (`openid email profile`). No provider tokens are stored: the account hook nulls them and `updateAccountOnSignIn` is false (ADR-012, AC-025).
- **Pending-email cookie** (SPEC GAP-3): an HMAC-SHA-256 seal with the app secret, a 30-minute expiry and a constant-time comparison; httpOnly, Secure, SameSite=Lax.
- **Logging:** only `authLog`, which forwards allow-listed fields, and F-00's logger redacts by key on top of that (C-103, AC-021).
- **E2E capture route:** 404 unless `E2E_EMAIL_CAPTURE=1` **and** `BETTER_AUTH_URL` is localhost.
- **Secrets** (`BETTER_AUTH_SECRET`, Google secret, Resend key, DB URLs) come only from Worker bindings (`AppEnv`), never `process.env` in `src/`.

## Testing Strategy

- **Unit (Vitest):** domain, use cases over in-memory fakes (`tests/support/auth`), adapters without I/O, composition helpers, the Proxy, and every form and screen (DOM).
- **Integration:** the real adapters and Better Auth on the shared non-production Neon database. Every test uses its own unique emails and IPs.
- **E2E (Playwright):** captured email links, axe on every auth screen, and pixel fidelity against the HTML exports.

| AC | Level | Plan task |
|---|---|---|
| AC-AUTH-001–003 | unit (register-owner) + integration (auth-flows, contract) + E2E | 13, 19, 22, 31 |
| AC-AUTH-004–006 | unit (verify-email, resend, pending seal) + integration (identity adapter) + E2E | 10, 13, 14, 19, 31 |
| AC-AUTH-007–010, 013 | unit (login-owner, continue-after-sign-in, rate limits) + integration | 9, 12, 15, 22 |
| AC-AUTH-011, 014 | unit (owner-access, Proxy, owner guard) + integration + E2E | 11, 22, 23, 31 |
| AC-AUTH-012 | unit (logout-owner, session cookies) | 15, 22 |
| AC-AUTH-015 | unit (set-owner-status) + integration (account directory) | 12, 18 |
| AC-AUTH-016–018 | unit + integration (link registry, identity adapter, flows) + E2E | 16, 18, 19, 22, 31 |
| AC-AUTH-019–020 | unit (use cases, account-sections) + integration + E2E | 17, 22, 30, 31 |
| AC-AUTH-021 | unit (auth-log, outbox, delivery error, sender) + log audit | 7, 8, 20, 32 |
| AC-AUTH-022 | unit (register, resend, resend control) | 13, 27 |
| AC-AUTH-023 | DOM tests on every form and screen + axe | 24–31 |
| AC-AUTH-024–029, 031 | unit (guard, Google error, start) + integration (Google callback against the real endpoint) + E2E (cancel) | 17, 19, 28, 31 |
| AC-AUTH-030 | unit (login, reset, account-sections) | 15, 16, 30 |

Every test title starts with its `AC-AUTH-*`/`BR-AUTH-*` ID. Visual fidelity is checked in each UI task (fidelity pass) and automatically in `auth-fidelity.spec.ts`, at 1440 and 390.

## Implementation Iterations

Each iteration is done only when the quality gate in [coding-rules.md](../../coding-rules.md) passes. Tasks with code and tests are in [plan.md](plan.md).

### Iteration 1 — Identity core (tasks 0–5)
- [ ] Gate; dependencies and the `@tests` alias; auth env keys; credentials and account domain; auth schema and migration.
- **Done when:** the unit gate is green and the Owner has applied `0000_auth_identity.sql` to non-production.

### Iteration 2 — Application core (tasks 6–11)
- [ ] Ports, errors, logging and outbox, rate limits, field schemas and paths, pending-email seal, owner-access policy and use-case fakes.
- **Done when:** the unit gate is green.

### Iteration 3 — Use cases (tasks 12–17)
- [ ] All 12 use cases, unit-tested over fakes.
- **Done when:** the unit gate is green.

### Iteration 4 — Adapters (tasks 18–21)
- [ ] Drizzle adapters, the Better Auth adapter with the Google guard, email adapters, operator scripts.
- **Done when:** `pnpm test:integration` is green, and R-2/R-3 findings are recorded.

### Iteration 5 — Composition and routes (tasks 22–23)
- [ ] Auth scope, cookies, owner guard, flow entry points, Better Auth route, Proxy.
- **Done when:** the full gate and `pnpm build` are green.

### Iteration 6 — Auth UI foundation (tasks 24–26)
- [ ] Alert and icons, split layout and editorial panel, form plumbing.
- **Done when:** the design-token gaps are resolved and the layout matches the `amp4Y`/`IOC5i` exports.

### Iteration 7 — Screens (tasks 27–30)
- [ ] Register and verification, login and unavailable, recovery, profile.
- **Done when:** every screen passes its fidelity pass against its export.

### Iteration 8 — Journey verification (tasks 31–32)
- [ ] J-01 journeys, axe, pixel fidelity, logging audit, deviations and docs.
- **Done when:** all suites are green; ready for `/sdv:verify-feature auth`.

## Risks / Open Questions

- **CONFLICT-1 — UI language. RESOLVED (Owner 2026-09-27): Indonesian.** Pencil copy is translated in each `*.copy.ts`. The Owner updates `auth.pen` text before exporting, so exports and pages render the same strings.
- **SPEC GAP-2 — F-02 destination contract. DECIDED (Owner 2026-09-27):** `ONBOARDING → /onboarding/workspace`, `WORKSPACE → /workspace`. The stub returns `ONBOARDING` until F-02 implements the port.
- **SPEC GAP-3 — Resend without a session. DECIDED (Owner 2026-09-27):** a signed, httpOnly, 30-minute pending-email cookie.
- **SPEC GAP-4 — Email failure visibility vs. enumeration. DECIDED (Owner 2026-09-27):** public forms always show the generic outcome; only resend surfaces `EMAIL_DELIVERY_FAILED`. AC-AUTH-022 is amended accordingly.
- **R-1 — Rate-limit store. RESOLVED:** ADR-013 Accepted (Owner 2026-09-27). Neon counters behind `RateLimiterPort`; ADR-008 now points to it. Until CI exists, the purge runs by hand (`pnpm auth:purge-rate-limits`); schedule it before the first ship.
- **R-2 — Token supersession.** Resolved by design: Better Auth 1.7.6 verification JWTs are reusable, and older reset tokens stay valid. `auth_latest_link` makes links single-use and superseding. `better-auth-contract.test.ts` pins the library behaviour.
- **R-3 — Password hashing on Workers. RESOLVED (2026-09-27).** A local `pnpm preview` sign-up through `/api/auth/sign-up/email` returned `200 OK (513ms)` in Wrangler output. The `/register` page is a later UI task, so the mounted Better Auth endpoint was used as the equivalent measurement path.
- **R-4 — Better Auth upgrades.** The option names and the Google guard are pinned by the contract and Google integration tests; re-run both on every upgrade (ADR-012).
- **R-5 — Editorial photos.** The mosaic export must use licensed or commissioned photos before production.
- **R-6 — App Shell in code. RESOLVED (Owner 2026-09-26):** F-02 builds the App Shell and `(owner)/layout.tsx`. The Profile page renders only its content.
- **R-7 — Next 16 Proxy. RESOLVED (2026-09-27):** `src/proxy.ts` with an exported `proxy`. `next build` on OpenNext 1.20.6 bundles it (`ƒ Proxy (Middleware)`).
- **R-8 — F-00. RESOLVED:** implemented on `main` (2026-09-27), awaiting `/sdv:verify-feature foundation`.
- **R-9 — Coding rules v2.0. RESOLVED (2026-09-27):** the plan was rewritten and verified against F-00's lint config. See *Changes to F-00 files* below.
- **ADR-012 wording. RESOLVED:** ADR-012 was amended on 2026-09-27. Google is not a trusted provider, and the takeover guard runs in `mapProfileToUser`.
- **Environment. DECIDED (Owner 2026-09-27):** one non-production Neon database serves `next dev`, integration tests and E2E; there is no Neon branch. `.dev.vars` and `.env.test` point to it, and tests keep their own unique rows (ADR-009).
- **DESIGN TOKEN GAPs (Iteration 6). APPROVED (Owner 2026-09-27):**
  - T1 `size.auth-panel` = 600 (the desktop form column);
  - T2 `size.auth-form` = 420 (the form width);
  - T3 `font.size.hero` = 44 (the editorial headline);
  - T4 `space.16` = 64 (the editorial inset).

  The editorial body uses `font.size.body` 14, where Pencil shows 15. Add them through the design-system pipeline (G8) before plan Task 25. The Owner will translate `auth.pen` to Indonesian, and export the frames to HTML when implementation reaches the UI.
- **Changes to F-00 files** (plan Tasks 1–2, 24):
  - `appEnvSchema` gains the auth keys, and a `TEST_APP_ENV` fixture updates three F-00 tests.
  - A `@tests/*` alias is added to tsconfig and both Vitest configs.
  - SonarJS `no-hardcoded-passwords` and `no-hardcoded-ip` are turned off for test files only, with the reason recorded in coding-rules.
  - The icon registry gains `info` and `google`.

## Deviations

None yet. Implementation records every fidelity difference and plan deviation here (plan Task 32).
