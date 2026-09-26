# Technical Design — F-01 Auth & Account

Status: DRAFT (2026-09-26) — replanned against the approved Pencil design; awaiting Owner approval. Blocked on F-00 Foundation and on the `CONFLICT` / `SPEC GAP` items under *Risks / Open Questions*.

## Context

This design implements [spec.md](spec.md) and [acceptance-criteria.md](acceptance-criteria.md) as modeled in [diagrams/](diagrams/) and drawn in [auth.pen](auth.pen) ([design.md](design.md), DESIGNED 2026-09-26). Scope: Owner registration, email verification, password and Google sign-in, session and status enforcement, logout, password recovery and change, and display-name update. Workspace resolution and first-workspace creation are owned by F-02; this feature only hands off to it.

Out of scope, per the spec: other social providers, magic links, 2FA/passkeys, email change, account deletion, Drive OAuth, admin UI, session/device list, and client or freelancer login.

No application code exists yet (`src/` is absent). Paths below are planned boundaries under the [approved folder architecture](../../superpowers/specs/2026-09-26-project-folder-architecture-design.md).

## Relevant Authority

- Constitution: C-002, C-003, C-004, C-006, C-007, C-008, C-009, C-011, C-012, C-103
- Business rules: BR-AUTH-001 … BR-AUTH-008; BR-WS-003 (hand-off); BR-SRC-001 (no Drive scopes)
- Acceptance criteria: AC-AUTH-001 … AC-AUTH-031
- ADRs: ADR-001 Drizzle, ADR-002 Better Auth owns identity, ADR-008 Cloudflare Workers, ADR-009 Neon per-request Pool, ADR-010 Tailwind + React Aria, ADR-011 Resend, ADR-012 Google sign-in, **ADR-013 auth rate-limit store (PROPOSED by this plan)**
- Design: `auth.pen` frames and Alert IDs listed in [design.md](design.md); design-system tokens and components in `docs/design-system/`

## Architecture

```text
src/
  app/
    (auth)/layout.tsx                  # AuthSplitLayout: form column + EditorialPanel (desktop only)
    (auth)/login/page.tsx
    (auth)/register/page.tsx
    (auth)/verify/page.tsx              # pending + invalid-link states
    (auth)/forgot-password/page.tsx     # entry + request-sent states
    (auth)/reset-password/page.tsx      # form + invalid-link states
    (auth)/account-unavailable/page.tsx
    (owner)/profile/page.tsx            # inside the App Shell
    api/auth/[...all]/route.ts          # Better Auth protocol + Google callback
    actions/auth/                       # thin server actions, one folder per action
  features/auth/
    domain/account/                     # status, verification, provider invariants (framework-free)
    domain/credentials/                 # email normalisation, password policy (A-1)
    application/
      ports/{identity,auth-email,rate-limiter,workspace-destination}/
      policy/owner-access/              # requireOwner, requireVerifiedOwner, auth-page redirect
      errors/auth-errors/
      use-cases/{register-owner,resend-verification,verify-email,login-owner,logout-owner,
                 request-password-reset,reset-password,change-password,update-display-name,
                 complete-google-sign-in}/
    ui/{auth-split-layout,editorial-panel,register-form,login-form,verify-pending,
        forgot-password-form,reset-password-form,profile-form,change-password-form,
        google-button}/
    ui/copy/auth-copy.ts                # single copy catalog (see CONFLICT-1)
  adapters/
    auth/better-auth/                   # createAuth(db) factory, hooks, IdentityPort impl
    email/auth-email-sender/            # Resend impl + in-memory fake
    rate-limit/neon-rate-limiter/       # ADR-013 impl + in-memory fake
    db/schema/auth.ts                   # Better Auth tables + extensions + rate-limit table
  composition/identity.ts               # per-request wiring: Pool → db → auth → use cases
  middleware.ts                         # early redirect only; never the authority
scripts/set-user-status.ts              # operator script (BR-AUTH-005)
tests/integration/auth/  tests/e2e/auth.spec.ts
```

Key decisions:

- **Per-request Better Auth instance.** ADR-009 forbids a module-level Pool, so `composition/identity.ts` builds `createAuth(db)` per request from the request's Pool and closes the Pool with `ctx.waitUntil(pool.end())`. Configuration (secrets, providers, hooks) is module-level; only the DB handle is per request.
- **Better Auth sits behind `IdentityPort`.** Use cases call the port (`createPasswordUser`, `verifyPassword`, `issueVerification`, `consumeVerification`, `issueReset`, `consumeReset`, `revokeSessions`, `getSession`, …). The domain and application layers never import Better Auth.
- **Status and verification gates live in `policy/owner-access`,** called by every owner page, server action and route handler. `middleware.ts` only performs cheap cookie-presence redirects.
- **Workspace hand-off is a port.** `WorkspaceDestinationPort.resolve(userId) → "ONBOARDING" | "WORKSPACE"` is implemented by F-02. Until F-02 exists, composition wires a stub that always returns `ONBOARDING`, and the redirect target is `/onboarding/workspace` (SPEC GAP-2).

## Database Changes

All in Better Auth's Drizzle schema (`adapters/db/schema/auth.ts`), generated with the Better Auth CLI and then reviewed. No second user table (ADR-002).

| Table | Change |
|---|---|
| `user` | `additionalFields`: `status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','DISABLED'))` (input: false); `email_verified_at timestamptz NULL` (input: false). Check: `email_verified = (email_verified_at IS NOT NULL)`. Unique index on `lower(email)`. |
| `account` | Better Auth default. Credential row (`provider_id = 'credential'`) exists only for password accounts; Google row for linked accounts. |
| `session` | Better Auth default. Index on `user_id` for revoke-all. |
| `verification` | Better Auth default, used for verification and reset tokens. See Risk R-2 (supersession). |
| `auth_rate_limit` (new, ADR-013) | `key text`, `window_start timestamptz`, `count int`, PK `(key, window_start)`; index on `window_start` for cleanup. Not tenant data (no `workspace_id`), and contains no raw email: the key is `operation:sha256(normalised email)` or `operation:ip`. |

Migrations are generated by Drizzle, reviewed and committed, and applied from `main` via CI only (ADR-009).

## Server / API Interface

Better Auth route handler: `app/api/auth/[...all]/route.ts` (Google OAuth start/callback, the verification-link GET, and Better Auth internal endpoints). Everything else runs through server actions. Each action does parse (Zod) → composition entry → map the result to a UI outcome.

| Action / endpoint | Input schema | Outcomes |
|---|---|---|
| `registerOwner` | name (1–100, trimmed), email, password (8–128) | `PENDING` (always the same, A-5) · field errors · `RATE_LIMITED` |
| `resendVerification` | — (restricted session) | `SENT` · `RATE_LIMITED` · `EMAIL_FAILED` (retryable) |
| `GET /verify?token` | token | verified → sign in → destination · `INVALID_LINK` |
| `loginOwner` | email, password | destination · `VERIFY_PENDING` · `ACCOUNT_UNAVAILABLE` · `INVALID_CREDENTIALS` · `RATE_LIMITED` |
| `logoutOwner` | — | signed out (current session only) |
| `requestPasswordReset` | email | `SENT` (always the same) · `RATE_LIMITED` is **not** surfaced (AC-016: silently not sent) |
| `resetPassword` | token, password, confirm | `DONE` → login · `INVALID_LINK` · field errors |
| `changePassword` | current, new, confirm | `DONE` · `WRONG_CURRENT` (field error) · field errors |
| `updateDisplayName` | name | `DONE` · field errors |
| Google start / callback | OAuth state/code (Better Auth) | destination · `GOOGLE_CANCELLED` · `GOOGLE_FAILED` · `ACCOUNT_UNAVAILABLE` |

Email is never an input to `updateDisplayName` or any other profile action; the email field is rendered read-only (AC-020).

## Domain / Application Logic

Domain (`features/auth/domain`, pure and unit-tested):

- `normaliseEmail`: trim + lowercase. `passwordPolicy`: 8–128 characters, no composition rules (A-1).
- `accessDecision(user, session) → OWNER | RESTRICTED | UNAVAILABLE | ANONYMOUS`: status is checked before verification (BR-AUTH-005, then BR-AUTH-003), matching the state diagram.
- `googleLinkDecision(existing, googleEmailVerified) → REJECT | CREATE | LINK | LINK_WITH_TAKEOVER_GUARD` (BR-AUTH-006/007).
- `hasPassword(accounts)`: controls the change-password section and forgot-password sending (BR-AUTH-008).

Application flows (one use case each; see the sequence diagrams in [diagrams/sequence/](diagrams/sequence/)):

- **Register:** rate-limit → lookup by normalised email → new: create user (ACTIVE, unverified) + credential, issue verification; existing unverified: issue a fresh verification (supersedes the old one), password untouched; existing verified: nothing. The response is always `PENDING`. The user is **not** signed in by registration. The pending screen is reached with a short-lived, signed, httpOnly "pending email" cookie so that resend works without a session (see SPEC GAP-3).
- **Verify:** consume the token (valid, unused, unexpired, latest) → set `email_verified_at` and `email_verified` in one update → create session (A-7) → `WorkspaceDestinationPort`.
- **Login:** rate-limit (failures only count, A-6) → Better Auth credential check → `accessDecision`: `UNAVAILABLE` creates no session; `RESTRICTED` creates a session that the policy confines to `/verify`; `OWNER` resolves the destination.
- **Request reset:** rate-limit per email silently → sends only when a credential account exists → identical response and comparable timing in all branches.
- **Reset:** consume token → set password → revoke **all** sessions (A-4) → redirect to login.
- **Change password:** verify current → set new → revoke all sessions **except** the current one.
- **Google:** Better Auth social provider with `scope: ['openid','email','profile']`; account linking with `trustedProviders: ['google']`. A `databaseHooks`/`hooks.before` guard applies `googleLinkDecision`. `LINK_WITH_TAKEOVER_GUARD` runs in one transaction: set verified, delete the credential account, delete all sessions, then Better Auth creates the new session. Status is checked after linking, and a non-active user gets no session.
- **Operator status:** `scripts/set-user-status.ts <email> <STATUS>` updates status and deletes all sessions in one transaction (BR-AUTH-005, AC-015).

## UI Components

Visual truth: `auth.pen` (frame IDs in [design.md](design.md)). Tokens come from `docs/design-system/tokens.json` via Tailwind theme variables (ADR-010).

| Unit | Location | Notes |
|---|---|---|
| `AuthSplitLayout` | `features/auth/ui/auth-split-layout` | Server component. Form column + `EditorialPanel` at ≥ desktop breakpoint; single column on mobile (panel not rendered). |
| `EditorialPanel` | `features/auth/ui/editorial-panel` | Implements Pencil component `Z5xhk`: CSS-rotated (−15°) tile grid, lime aperture tiles, bottom scrim, headline. `aria-hidden="true"`, no interactive content, images `alt=""`, loaded with low priority. Photo assets must be licensed (R-5). Scrim uses tokens, not the literal colours in the mock (design.md open item). |
| `Alert` pattern | `ui/patterns/alert` | Code counterpart of design-system C24 Alert (Info/Danger tones used here; Close off). Danger → `role="alert"`; Info → `role="status"`. Title-only variant for invalid credentials. If F-00 has not built it, this feature adds it to `ui/patterns`, not to `features/auth`. |
| Forms | `features/auth/ui/*-form` | `"use client"` islands using React Hook Form + `zodResolver` with the use-case schemas; React Aria `TextField` wrappers from `ui/primitives`; focus moves to the first error (AC-023). |
| Submit / processing | form `Button` | Processing state = disabled button + progress copy, as in `U9laqq`/`QIIvK`. A spinner component remains a design-system gap (GAP-02); none is invented here. |
| Resend control | `verify-pending` | 60 s cooldown countdown (client, UX only); the server rate limit is authoritative. |
| Profile | `(owner)/profile` | App Shell + 720 px centred column (`size.content-narrow`); change-password section hidden when `hasPassword` is false (`TInkk`). Depends on the App Shell code (see R-6). |
| Copy | `features/auth/ui/copy/auth-copy.ts` | Every auth string, including the Alert titles/bodies from design.md, lives in one catalog keyed by stable IDs so the language decision (CONFLICT-1) is a data change, not a refactor. |

## Validation

- Canonical Zod schemas beside each use case (`register-owner.schema.ts`, …), imported by both the form and the server action (coding rules). Client validation is UX only (AC-002).
- Better Auth route inputs are validated by Better Auth; Google profile claims (`email`, `email_verified`, `name`) are parsed with Zod before `googleLinkDecision`.
- Tokens are treated as opaque strings (bounded length); never parsed or logged.
- Redirect targets are not user input: destinations come from `WorkspaceDestinationPort`, and any `returnTo` is limited to a same-origin path allow-list.

## Error Handling

Typed application errors with stable codes: `VALIDATION_FAILED`, `INVALID_CREDENTIALS`, `RATE_LIMITED`, `EMAIL_UNVERIFIED`, `ACCOUNT_UNAVAILABLE`, `INVALID_LINK`, `WRONG_CURRENT_PASSWORD`, `GOOGLE_CANCELLED`, `GOOGLE_FAILED`, `EMAIL_DELIVERY_FAILED`. They are mapped at the action boundary to design states:

| Code | UI (design frame) |
|---|---|
| `VALIDATION_FAILED` | field errors (`hTP6i`) |
| `INVALID_CREDENTIALS` | Danger Alert, title only (`q8b0R9`, Alert `DjUek`) |
| `ACCOUNT_UNAVAILABLE` | Account unavailable page (`kXr5x`) |
| `INVALID_LINK` | Invalid verification / reset link (`TIvfA`, `x5ds7`) |
| `RATE_LIMITED` | generic "too many attempts" form-level Alert (no account information) |
| `GOOGLE_*` | Login with generic Google message |
| `EMAIL_DELIVERY_FAILED` | retryable message on resend only (SPEC GAP-4) |
| unexpected | generic error with retry (C-007); logged with request ID |

Errors never carry passwords, tokens, URLs, cookies, OAuth codes or provider tokens.

## Concurrency / Consistency

- One identity per email: unique index on `lower(email)`. A concurrent duplicate registration catches the unique violation and returns the same `PENDING` outcome.
- Google takeover guard: one transaction (verify + delete credential + delete sessions) before the new session is created.
- Operator status change: status update and session deletion in one transaction.
- Token consumption is single-use: delete-returning in one statement, so two concurrent clicks cannot both succeed.
- Rate-limit counters: `INSERT … ON CONFLICT (key, window_start) DO UPDATE SET count = count + 1 RETURNING count` (atomic; ADR-013).
- Email sends happen after the state commit; a send failure never rolls back the account or request (AC-022).

## Security

- Session cookies: Better Auth defaults (httpOnly, secure, SameSite=Lax), 7-day sliding with daily refresh (A-2). **Cookie cache is disabled** so every request reads the session and user status from the database (AC-014).
- `requireOwner` / `requireVerifiedOwner` run in every owner page, action and route handler; middleware is never the only check (state diagram note).
- Enumeration: register, forgot-password and login failures return identical shapes. Emails for enumeration-sensitive branches are sent via `ctx.waitUntil`, so response timing does not depend on account existence (ADR-011).
- Rate limits (A-6) enforced server-side through the `RateLimiter` port (ADR-013); Cloudflare WAF provides a coarse IP flood layer in front.
- Google: identity scopes only; access/refresh tokens are not persisted beyond what Better Auth requires, and are never used (ADR-012, AC-025). OAuth state is verified by Better Auth.
- Logging: a structured logger with a redaction list (password, token, url, cookie, code, access_token, email); auth events log operation and outcome category only (C-103, AC-021).
- Secrets (`BETTER_AUTH_SECRET`, Google client secret, Resend key, DB URLs) come from Worker secret bindings.

## Testing Strategy

Unit tests are co-located (Vitest). Integration tests run against the shared non-production Neon database, and each test seeds its own uniquely-emailed users. E2E uses Playwright with fake email (captured links) and a Google provider stub.

| AC | Level | Iteration |
|---|---|---|
| AC-AUTH-001, 003 | integration | 4 |
| AC-AUTH-002 | unit (schema) + integration (server action bypassing client) | 1, 4 |
| AC-AUTH-004, 005, 006 | integration + E2E (captured link) | 4 |
| AC-AUTH-007, 008, 011, 012 | integration + E2E | 5 |
| AC-AUTH-009, 013, 014 | unit (`accessDecision`) + integration (policy on page/action/route) | 1, 5 |
| AC-AUTH-010 | integration (rate limiter + login) | 2, 5 |
| AC-AUTH-015 | integration (operator script) | 1 |
| AC-AUTH-016, 017, 018 | integration + E2E | 6 |
| AC-AUTH-019, 020 | integration + E2E | 7 |
| AC-AUTH-021 | unit (redactor) + log-capture assertions in every flow's integration tests | 2 → 9 |
| AC-AUTH-022 | integration with failing email fake | 4, 6 |
| AC-AUTH-023 | component tests (labels, `aria-describedby`, focus) + Playwright axe scan | 3 → 9 |
| AC-AUTH-024, 026, 027, 028, 029, 031 | integration (provider stub) + E2E happy path | 8 |
| AC-AUTH-025 | unit/integration: authorization URL scopes exactly `openid email profile` | 8 |
| AC-AUTH-030 | integration + E2E (profile hides the section) | 6, 7 |

Every test name carries its `AC-AUTH-*` / `BR-AUTH-*` ID. Visual fidelity against `auth.pen` is checked at the end of each UI iteration (screenshot comparison, desktop 1440 and mobile 390).

## Implementation Iterations

Each iteration runs plan → implement → test → verify → commit and is done only when the quality gate in [coding-rules.md](../../coding-rules.md) passes. The step-by-step task breakdown (tasks 0–29, with code and tests) is in [plan.md](plan.md). **Gate:** iteration 1 starts after F-00 Foundation provides the scaffold, env/secrets, `adapters/db` per-request Pool, error model, logger, test harness and base UI primitives.

### Iteration 1 — Identity core
- [ ] Domain: `normaliseEmail`, `passwordPolicy`, `accessDecision`, `googleLinkDecision`, `hasPassword`, with unit tests.
- [ ] Better Auth schema generation + `status` / `email_verified_at` extensions + constraints; reviewed migration.
- [ ] `createAuth(db)` factory and `IdentityPort` adapter; spike Better Auth token single-use/supersession behaviour (R-2) and scrypt CPU time on Workers (R-3).
- [ ] `scripts/set-user-status.ts`.
- **Done when:** the migration is applied to non-production via CI; unit tests are green; the integration test for AC-AUTH-015 is green; R-2/R-3 findings are recorded in this document.

### Iteration 2 — Auth ports
- [ ] `AuthEmailSender` port, Resend adapter, in-memory fake (captures links for tests).
- [ ] ADR-013 `RateLimiter`: Neon adapter + fake + cleanup job.
- [ ] Log redaction for auth fields.
- **Done when:** adapter tests are green; the rate limiter enforces the A-6 windows in an integration test; a redaction unit test proves no secret fields survive.

### Iteration 3 — Auth screen shell
- [ ] `AuthSplitLayout`, `EditorialPanel` (with placeholder-licensed assets), `ui/patterns/alert`, `auth-copy.ts`.
- [ ] `(auth)` route group layout; responsive breakpoint matching the desktop/mobile frames.
- **Done when:** Login and Register render static against `amp4Y`/`IOC5i` and `m3QGM`/`UryLp` within visual tolerance; the Alert renders Info/Danger/title-only; component a11y tests are green.

### Iteration 4 — Register and verify
- [ ] `registerOwner`, `resendVerification`, `verifyEmail` use cases + actions; Register, Verification pending and Invalid verification link screens.
- **Done when:** AC-AUTH-001 … 006 and 022 (register/resend) pass; screens match `p3NbDB`, `TIvfA`, `hTP6i` and their mobile pairs.

### Iteration 5 — Login, logout and access gate
- [ ] `loginOwner`, `logoutOwner`; `requireOwner` / `requireVerifiedOwner`; middleware; restricted session; Account unavailable page; auth-page redirect; `WorkspaceDestinationPort` stub.
- **Done when:** AC-AUTH-007 … 014 pass; the processing, invalid-credentials and focus states match `U9laqq`, `q8b0R9`, `u9HFU`.

### Iteration 6 — Password recovery
- [ ] `requestPasswordReset`, `resetPassword`; Forgot password, Reset request sent, Set new password and Invalid reset link screens.
- **Done when:** AC-AUTH-016 … 018 and the forgot-password part of 030 pass; screens match `o9WtCo`, `DccPx`, `RFaNT`, `x5ds7`.

### Iteration 7 — Profile and change password
- [ ] `updateDisplayName`, `changePassword`; Profile page within the App Shell; Google-only variant.
- **Done when:** AC-AUTH-019, 020 and the profile part of 030 pass; screens match `t7CXVK` and `TInkk`.

### Iteration 8 — Google sign-in
- [ ] Google provider config; claim parsing; linking guard hook and transaction; cancelled/failed/unavailable outcomes; Google buttons wired.
- **Done when:** AC-AUTH-024 … 029 and 031 pass, including the takeover-guard integration test (ADR-012).

### Iteration 9 — Journey verification
- [ ] Playwright J-01 (register → verify → onboarding hand-off), password and Google variants; axe scan on every auth screen; log audit across all flows; Pencil fidelity pass on all 15 pairs.
- **Done when:** the E2E and a11y suites are green, AC-AUTH-021 and 023 are verified end-to-end, and a deviation report is written; ready for `/sdv:verify-feature auth`.

## Risks / Open Questions

- **CONFLICT-1 — UI language.** The approved design uses English as the primary language for auth screens (design.md). Coding rules and ADR-010 say "MVP UI language: Indonesian with English fallback", and the spec leaves copy as an open question. Needs an Owner decision recorded in coding-rules.md (or an amendment) before iteration 3. The copy catalog keeps either answer cheap.
- **SPEC GAP-2 — F-02 destination contract.** The interim port returns `ONBOARDING | WORKSPACE`; F-02 must confirm the contract and the routes.
- **SPEC GAP-3 — Resend without a session.** After registration the visitor is not signed in, but the pending screen offers resend. The plan uses a short-lived signed "pending email" cookie. Confirm that, or require login first (the unverified login creates a restricted session that can resend).
- **SPEC GAP-4 — Email failure visibility vs. enumeration.** AC-AUTH-022 asks for a retryable message when sending fails during register/reset; A-5 and ADR-011 require identical, non-blocking responses. Proposed: public forms always show the generic outcome (whose screen already offers resend or a new request); only the authenticated resend surfaces `EMAIL_DELIVERY_FAILED`. Needs the Owner to amend AC-022 or reject this.
- **R-1 — Rate-limit store (ADR-013, PROPOSED).** Cloudflare's Workers rate-limit binding only supports short periods (10 s / 60 s) and can't key on the email in the request body, so it cannot express A-6's 15-minute and 1-hour windows per email. ADR-013 proposes Neon-backed counters behind the `RateLimiter` port, which amends ADR-008's "rate limiting via Cloudflare features". Owner approval needed.
- **R-2 — Token supersession.** Better Auth's email-verification token may be a stateless signed token that is neither single-use nor superseded by a newer link (A-3, AC-005/006/018). Spike in iteration 1; if it isn't native, store the latest token's hash in `verification` and reject others in a before-hook.
- **R-3 — Password hashing on Workers.** Better Auth's scrypt hashing is CPU-heavy; it must fit the Workers CPU limit on the chosen plan. Measure in iteration 1.
- **R-4 — Better Auth option names** (`requireEmailVerification: false`, `autoSignInAfterVerification`, `revokeSessionsOnPasswordReset`, `accountLinking.trustedProviders`, cookie cache) must be checked against the installed version; the takeover guard must be re-verified on upgrades (ADR-012).
- **R-5 — Editorial photos** are Unsplash placeholders in the design; licensed or commissioned photos are needed before production.
- **R-6 — App Shell in code.** RESOLVED (Owner 2026-09-26): the App Shell, Sidebar and App Panel code (design-system C28–C30) is built by **F-02 Workspace**, not F-00 or F-01. Iteration 7 (Profile) waits until F-02 provides `src/ui/patterns/app-shell/app-shell.tsx`.
- **R-7 — Next 16 renamed `middleware.ts` to `proxy.ts`.** F-00 pins Next 16.3.6 (required by OpenNext 1.20.6). This plan's `src/middleware.ts` must be revisited in Task 0: use the `proxy.ts` convention and confirm that OpenNext Cloudflare supports it. Found while planning F-00, 2026-09-26.
- **R-8 — F-00 not built yet.** F-00 is PLANNED ([foundation/plan.md](../foundation/plan.md)). Nothing here can start until it's built and verified.
- **R-9 — This plan predates coding rules v2.0** (2026-09-27, [coding-rules.md](../../coding-rules.md)). Before Task 1, re-plan the code in [plan.md](plan.md) against the new rules; `pnpm lint` from F-00 will reject the current code. The known gaps are:
  - no `import "server-only"` in `adapters/`, `composition/` or `features/*/application`;
  - exported types and Zod schemas that must move into sibling `*.types.ts` / `*.schema.ts` files;
  - UI copy inline in JSX, which must move into `*.copy.ts` files (the language is still pending CONFLICT-1);
  - about 16 `as` assertions;
  - `process.env` reads in `src/`, which must use `getRequestContext().env` instead;
  - inline JSX handlers;
  - missing JSDoc;
  - imports of `Db`, `AppEnv`, `appEnvSchema` and `RequestContext`, which now come from F-00's `*.types.ts` / `*.schema.ts` files (see plan.md › *F-00 contracts*).

  Recommended: run `/sdv:plan-feature auth` as a revision pass, after F-00 is built so that its lint config can check the revised code.
