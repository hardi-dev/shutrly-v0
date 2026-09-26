# F-01 Auth & Account Implementation Plan

> **For agentic workers:** Execute this plan one task at a time, in order, test-first, with one commit per task ([AGENTS.md](../../../AGENTS.md)). Steps use checkbox (`- [ ]`) syntax. Copy every code block **verbatim**; the one exception is the *fidelity pass* in UI tasks, which may change only `className` tokens and element nesting (see *Pixel-perfect UI*).

**Goal:** Let an Owner register, verify their email, sign in with a password or Google, recover or change their password, and update their display name. Every owner request is gated by account status and email verification.

**Architecture:** Better Auth 1.7.6 owns identity, credentials, sessions and tokens (ADR-002). It runs per request over the request's Neon Pool (ADR-009), behind `IdentityPort`. Framework-free rules live in `features/auth/domain`. Use cases in `features/auth/application` orchestrate ports: identity, account directory, link registry, email, rate limiter and workspace destination. `adapters/` implements the ports, `composition/auth/*` wires them per request and exposes one entry point per flow, and `app/` holds thin pages, server actions and route handlers.

**Tech stack:** Next.js 16.3.6 App Router on Cloudflare Workers (OpenNext 1.20.6) · TypeScript 6.0.3 strict · Better Auth `1.7.6` + Drizzle adapter · Drizzle ORM 0.45 · Neon `@neondatabase/serverless` Pool · Resend over `fetch` · Zod 4 · React Hook Form 7 · React Aria Components through `src/ui` · Tailwind CSS v4 · Vitest 5 · Playwright + `@axe-core/playwright`.

**Source documents:** [spec.md](spec.md) · [acceptance-criteria.md](acceptance-criteria.md) · [technical-design.md](technical-design.md) · [design.md](design.md) · [diagrams/](diagrams/) · [constitution](../../constitution.md) · [coding rules v2.0](../../coding-rules.md) · [architecture overview](../../architecture/overview.md) · [ADR-013](../../architecture/decisions/ADR-013-auth-rate-limit-store.md) (Accepted).

## How this plan was verified

This plan was rewritten on 2026-09-27 for coding rules v2.0 and the implemented F-00. Every code block was then run in a scratch worktree of `main` with the pinned versions:

- `pnpm typecheck`, `pnpm lint` (Prettier, ESLint with the F-00 rules, token check) and `pnpm build` pass.
- `pnpm test` passes: 208 unit and DOM tests, including F-00's own.
- `pnpm db:generate` produces the migration shown in Task 5.
- The plan was replayed task by task on a clean checkout. Each task's commit passes `pnpm typecheck && pnpm lint && pnpm test`.

What could **not** run there:
- Integration tests (`tests/integration/auth/*`). They need the Task 5 migration applied to the shared non-production database, and only the Owner applies migrations.
- E2E specs (`tests/e2e/auth/*`). They need that database, plus the HTML exports.

Both are linted and type-checked. If one fails when you first run it, read the error and fix the cause, not the test; if the fix would change a plan decision, stop and ask the Owner.

## Global constraints

- **Authority.** The server decides everything (C-004). Client validation, the Proxy (`src/proxy.ts`) and hidden UI are convenience only; `requireOwner` runs on every owner page, action and route.
- **One identity table.** Better Auth's `user` is the only identity record. Never add an `owner` or domain user table (BR-AUTH-002, ADR-002).
- **Layers and boundaries** (coding rules › Structure and boundaries, enforced by lint):
  - `app/` imports only `composition/`, feature `ui/`, feature `application` **schemas and types**, `src/ui` and `shared`. Behaviour is always reached through `composition/auth/*`.
  - An adapter never imports another adapter. Everything that touches Drizzle lives in `adapters/db/*`, including Better Auth's database adapter; `adapters/auth/*` receives it from composition.
  - A folder may not be named exactly `better-auth` or `resend`: the vendor-import ban (`better-auth/*`, `resend`) matches path segments. Vendor prefixes go in file names (`better-auth-identity.ts`).
  - Every non-test module in `adapters/`, `composition/` and `features/*/application` starts with `import "server-only";` (except `*.types.ts`, `*.schema.ts` and the Drizzle schema folder).
- **Files.** One unit per folder; exported types in `x.types.ts`, Zod schemas in `x.schema.ts`, user-facing copy in `x.copy.ts`; no `as` (a justified `eslint-disable` is used exactly once, in `use-server-failure.ts`); no inline JSX handlers; JSDoc on every exported function.
- **Copy.** The UI language is **Indonesian** (CONFLICT-1, Owner 2026-09-27). Every string lives in the unit's `*.copy.ts`. Strings drawn in Pencil are translations of `auth.pen`; strings not drawn there carry `// not in Pencil` and are listed for Owner review.
- **No secrets in logs.** Never log passwords, tokens, cookies, links, OAuth codes, Google tokens or email addresses (C-103, AC-AUTH-021). Auth code logs only through `authLog`.
- **Database.** One Neon Pool per request, closed with `waitUntil(pool.end())` (ADR-009): auth reuses F-00's `withRequestDb`. Integration tests share the non-production database: unique emails and IPs, assertions on their own rows only, no truncation.
- **Migrations.** Generated by Drizzle into `./drizzle`, reviewed and committed. **Only the Owner runs `pnpm db:migrate`** (interim rule until CI exists).
- **Rules as constants.** A-1 lengths, A-2/A-3 lifetimes and A-6 limits are named constants next to the rule ID; tests assert them.
- **Tests.** Every test title starts with the `AC-AUTH-*` / `BR-AUTH-*` ID it covers. Unit tests sit beside their unit; use cases are unit-tested over in-memory fakes (`tests/support/auth/*`) and integration-tested over the real adapters.
- **Commits.** Conventional, English, lowercase, no trailing period; each ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` when an agent writes it.

## Pixel-perfect UI: HTML exports

UI tasks are built from **HTML exports of the approved Pencil frames**, not from hand-measured values. For each UI task:

1. **Before writing code, ask the Owner to export the task's frames** from `docs/features/auth/auth.pen` to HTML. They go into `docs/features/auth/exports/`, named `<state>-<frameId>.html`, one desktop (1440) and one mobile (390) file per state; see the table below. Exported images (the editorial mosaic) go into `public/auth/editorial/`. If an export is missing, **stop and ask**; never open the `.pen` file yourself.
2. **Write the task's code as given.** It fixes the behaviour, accessibility, copy and tokens, and its tests do not depend on styling.
3. **Fidelity pass.** Open the export beside the running page at the same viewport. Compare structure, spacing, typography and colour, and adjust only `className` values and element nesting to match. Map every raw value in the export to a token. A value with no token is a **DESIGN TOKEN GAP**: record it and ask the Owner; never write the raw value (token-usage G4).
4. **Record** every remaining difference in technical-design.md › *Deviations*. Task 31's `auth-fidelity.spec.ts` compares each exported page with its route pixel by pixel.

The exports must show **Indonesian copy**. Before exporting, the Owner (or `/sdv:design-feature auth` with the Owner) replaces the English strings in `auth.pen` with the Indonesian strings from the `*.copy.ts` files in this plan, so the export and the page render the same text.

| Export file (desktop · mobile) | State | Route | Task |
|---|---|---|---|
| `login-amp4Y` · `login-IOC5i` | Login | `/login` | 28 |
| `login-invalid-q8b0R9` · `login-invalid-n4KUP` | Login invalid credentials | `/login` after a wrong password | 28 |
| `login-processing-U9laqq` · `login-processing-QIIvK` | Login processing | `/login` while submitting | 28 |
| `login-focus-u9HFU` · `login-focus-g0ghE` | Login keyboard focus | `/login` with focus on email | 28 |
| `register-m3QGM` · `register-UryLp` | Register | `/register` | 27 |
| `register-errors-hTP6i` · `register-errors-aIY0r` | Register field errors | `/register` after invalid submit | 27 |
| `verify-pending-p3NbDB` · `verify-pending-TXoQI` | Verification pending | `/verify` | 27 |
| `invalid-verify-link-TIvfA` · `invalid-verify-link-ifV1Z` | Invalid verification link | `/verify?state=invalid` | 27 |
| `forgot-password-o9WtCo` · `forgot-password-e091S` | Forgot password | `/forgot-password` | 29 |
| `reset-sent-DccPx` · `reset-sent-NkvJG` | Reset request sent | `/forgot-password?state=sent` | 29 |
| `reset-password-RFaNT` · `reset-password-vHZGg` | Set new password | `/reset-password?token=…` | 29 |
| `invalid-reset-link-x5ds7` · `invalid-reset-link-Hf3VK` | Invalid reset link | `/reset-password` | 29 |
| `account-unavailable-kXr5x` · `account-unavailable-FFue5` | Account unavailable | `/account-unavailable` | 28 |
| `profile-t7CXVK` · `profile-vEZsy` | Profile and password | `/profile` | 30 |
| `profile-google-TInkk` · `profile-google-Vygzt` | Google-only profile | `/profile` | 30 |
| `public/auth/editorial/mosaic.webp` (+ `@2x`) | Editorial mosaic of `Z5xhk`, with its scrim, **without** the headline text | every desktop auth route | 25 |

## Decisions this plan assumes

The open items from [technical-design.md](technical-design.md) › *Risks / Open Questions*. All were answered on 2026-09-27. **Task 0 re-checks that the records match.** If an answer differs, revise the listed tasks first.

| Item | Answer assumed here | Status | Tasks affected |
|---|---|---|---|
| Environment | One non-production Neon database for `next dev`, integration tests and E2E; no Neon branch. `.dev.vars` and `.env.test` point to it | **Decided** (Owner 2026-09-27) | 0 |
| CONFLICT-1 UI language | Indonesian; Pencil copy is translated | **Decided** (Owner 2026-09-27) | 20, 24–30 |
| Editorial panel | Mosaic is an exported image; headline stays live text | **Decided** (Owner 2026-09-27) | 25 |
| R-6 App Shell | F-02 provides `(owner)/layout.tsx` with the App Shell; the Profile page renders only its content | **Decided** (Owner 2026-09-26) | 30 |
| SPEC GAP-2 F-02 destination | `WorkspaceDestinationPort.resolve() → "ONBOARDING" \| "WORKSPACE"` → `/onboarding/workspace`, `/workspace`; stub returns `ONBOARDING` until F-02 | **Decided** (Owner 2026-09-27) | 6, 10, 22 |
| SPEC GAP-3 resend without a session | A signed, httpOnly `shutrly_pending_email` cookie (30 min) | **Decided** (Owner 2026-09-27) | 10, 22, 27 |
| SPEC GAP-4 email failure visibility | Register and forgot password send in the background and always show the generic screen; only resend awaits and can show `EMAIL_DELIVERY_FAILED` | **Decided** (Owner 2026-09-27; AC-022 amended) | 13, 16, 27 |
| ADR-013 | Auth rate limits in Neon (`auth_rate_limit`) | **Accepted** (Owner 2026-09-27) | 5, 9, 18 |
| ADR-012 wording | Google is **not** in `trustedProviders`; the takeover guard runs in `mapProfileToUser` | **Amended** (2026-09-27) | 19 |
| DESIGN TOKEN GAPs T1–T4 | New tokens `size.auth-panel` (600), `size.auth-form` (420), `font.size.hero` (44) and `space.16` (64); the editorial body uses `font.size.body` (14, not 15) | **Approved** (Owner 2026-09-27); added through the design-system pipeline before Task 25 | 25 |

## Verified library facts (Better Auth 1.7.6)

- **Verification tokens are stateless** HS256 JWTs: neither single-use nor superseded. Reset tokens are stored as `reset-password:<token>`, and requesting a new one does not delete older ones. Hence `auth_latest_link` and `LinkRegistryPort` (Tasks 5, 18). `better-auth-contract.test.ts` pins this.
- **Implicit account linking** refuses an unverified local user (`requireLocalEmailVerified`, default `true`), but skips the Google `email_verified` check for providers in `trustedProviders`. So `trustedProviders` stays empty, and the BR-AUTH-007 takeover guard runs in Google `mapProfileToUser`, which receives the ID-token claims before the local-user lookup.
- `auth.api.*` with `returnHeaders: true` returns `{ headers, response }`; `set-cookie` is read from `headers`.
- Database hooks: `before` returns `false` to abort or `{ data }` to modify.
- Options used: `emailAndPassword` (`requireEmailVerification`, `autoSignIn`, `resetPasswordTokenExpiresIn`, `revokeSessionsOnPasswordReset`, `sendResetPassword`), `emailVerification` (`sendOnSignUp`, `autoSignInAfterVerification`, `expiresIn`, `sendVerificationEmail`), `session` (`expiresIn`, `updateAge`, `cookieCache`), `account` (`accountLinking`, `updateAccountOnSignIn`), `databaseHooks`, `rateLimit`, `advanced.ipAddress.ipAddressHeaders`.
- `better-auth/adapters/drizzle` exports `drizzleAdapter`; `better-auth/api` exports `APIError`.

## F-00 contracts this plan consumes

Checked against `main` on 2026-09-27.

| Path | Export | Used as |
|---|---|---|
| `src/adapters/db/client/client.ts` · `client.types.ts` | `createDb(url): DbHandle` · `Db`, `DbHandle` | Drizzle over a new Pool; adapters and scripts |
| `src/adapters/db/schema/index.ts` | schema barrel | this plan adds `export * from "./auth/auth"` |
| `src/composition/request-db/request-db.ts` | `withRequestDb(work)` | the per-request Pool, closed in `finally` via `waitUntil` |
| `src/composition/request-context/request-context.ts` · `.types.ts` | `getRequestContext()` · `RequestContext` | env, `waitUntil`, IP, request ID, headers |
| `src/shared/env/app-env.schema.ts` · `app-env.ts` · `.types.ts` | `appEnvSchema` · `parseAppEnv` · `AppEnv` | Task 2 adds the auth keys |
| `src/shared/errors/domain-error.ts` | `DomainError` | base of `AuthError`, `EmailDeliveryError` |
| `src/shared/logging/logger.ts` | `logger` | only through `authLog` |
| `src/ui/primitives/button/button.tsx` | `Button` (`variant` primary/secondary/danger, `size` md/lg) | every action |
| `src/ui/primitives/text-field/text-field.tsx` | `TextField` (controlled, `errorMessage`, `isReadOnly`) | every field |
| `src/ui/primitives/icon/icon.tsx` · `icon.registry.ts` | `Icon`, `ICON_REGISTRY` | Task 24 adds `info` and `google` |
| `src/ui/cn/cn.ts` | `cn` | class merging |
| `src/ui/theme/tokens.css` | token variables | every style |
| `tests/integration/helpers/test-db.ts` | `openTestDb()` | integration tests |
| `playwright.config.ts` | `baseURL` `http://localhost:3000`, `webServer` `pnpm dev` | E2E |

## File structure

```text
src/features/auth/
  domain/credentials/            normaliseEmail, checkPassword, A-1 constants
  domain/account/                AuthUserId, AccountStatus, accessDecision, googleLinkDecision
  application/
    ports/{identity,account-directory,link-registry,auth-email,rate-limiter,workspace-destination}/
    errors/{auth-errors,email-delivery-error}/
    auth-deps/                   AuthDeps, RequestMeta (types only)
    logging/auth-log/            the only auth logger
    link-outbox/                 queued auth emails; await or waitUntil
    rate-limits/auth-rate-limits/  A-6 rules over RateLimiterPort
    schemas/auth-fields/         shared field schemas
    policy/{owner-access,destination-path}/
    pending-email/               seal/open the SPEC GAP-3 cookie value
    use-cases/{set-owner-status,continue-after-sign-in,register-owner,resend-verification,
               verify-email,login-owner,logout-owner,request-password-reset,reset-password,
               update-display-name,change-password,start-google-sign-in}/
  ui/                            one folder per component or screen, each with *.copy.ts
src/adapters/
  db/schema/auth/                Better Auth tables + auth_latest_link + auth_rate_limit
  db/{account-directory,link-registry,rate-limiter,better-auth-database}/
  auth/{create-auth,google-guard,identity}/
  email/{auth-email-templates,auth-email-sender,capturing-email-sender}/
src/composition/auth/
  auth-scope/ session-cookies/ pending-email-cookie/ owner-guard/ auth-api/
  register-flow/ verify-flow/ login-flow/ recovery-flow/ profile-flow/ google-flow/ email-capture/
src/app/
  (auth)/layout.tsx, login/, register/, verify/, verify/confirm/route.ts, forgot-password/,
  reset-password/, account-unavailable/, auth/continue/route.ts
  (owner)/profile/page.tsx
  actions/auth/{register,login,recovery,profile,google}.ts
  api/auth/[...all]/route.ts, api/test/auth-emails/route.ts
src/proxy.ts
src/ui/patterns/alert/
src/shared/crypto/sha256-hex/
scripts/auth/{set-user-status,purge-auth-rate-limits}.ts
tests/support/{auth,env}/        fakes and fixtures (test-only)
tests/integration/auth/          real adapters on the shared non-production database
tests/e2e/auth/                  journeys, accessibility, fidelity
drizzle/0000_auth_identity.sql   generated
```

---
## Task 0: Preconditions gate

**Files:** none. This task only checks, and stops the plan if a check fails.

- [ ] **Step 1: Owner decisions.** Open [technical-design.md](technical-design.md) › *Risks / Open Questions*. Check that every row of *Decisions this plan assumes* has a recorded Owner answer that matches. All were answered on 2026-09-27. The approved design tokens must exist before Task 25. If an answer differs, stop and revise the affected tasks.

- [ ] **Step 2: F-00 is verified.** `docs/product/feature-map.md` shows F-00 as DONE, or the Owner says to proceed. Then run:

```bash
pnpm typecheck && pnpm lint && pnpm test
```

Expected: all pass on a clean `main`.

- [ ] **Step 3: Environment keys.** There is one non-production Neon database and no Neon branch (Owner 2026-09-27): `.dev.vars` and `.env.test` already point to it. The keys below were added on 2026-09-27. `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` and `E2E_EMAIL_CAPTURE` have values. Check that the Owner has filled `GOOGLE_*`, `RESEND_API_KEY` and `AUTH_EMAIL_FROM`; if not, stop and ask. Never write or print them yourself; both files are git-ignored.

```bash
BETTER_AUTH_SECRET=      # ≥ 32 random characters, different per environment
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=        # non-production OAuth client (identity scopes only, ADR-012)
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=          # a Resend test key
AUTH_EMAIL_FROM=Shutrly <auth@…>   # a verified Resend sender
E2E_EMAIL_CAPTURE=1      # .dev.vars only: keeps auth emails in memory for local E2E (Task 31)
```

- [ ] **Step 4: Nothing to commit.** Continue with Task 1.

---

# Iteration 1 — Identity core

## Task 1: Dependencies and test tooling

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml` (dependencies)
- Modify: `tsconfig.json`, `vitest.config.ts`, `vitest.integration.config.ts` (the `@tests/*` alias)
- Modify: `eslint.config.mjs` (two SonarJS rules off for tests)
- Modify: `docs/coding-rules.md` (record why)


- [ ] **Step 1: Install the pinned auth dependencies.**

```bash
pnpm add -E better-auth@1.7.6
pnpm add -D -E @axe-core/playwright@4.13.0
```

Expected: `package.json` lists `"better-auth": "1.7.6"` and `"@axe-core/playwright": "4.13.0"`. Keep Better Auth pinned exactly: the Google linking guard must be re-verified on every upgrade (ADR-012).

- [ ] **Step 2: Add the `@tests/*` alias** so unit tests in `src/` can import the shared fakes in `tests/support/`.
  - In `tsconfig.json`, change `paths` to `"paths": { "@/*": ["./src/*"], "@tests/*": ["./tests/*"] }`.
  - In **both** `vitest.config.ts` and `vitest.integration.config.ts`, add this line to `resolve.alias`, right after the `"@"` entry:

```ts
      "@tests": fileURLToPath(new URL("./tests", import.meta.url)),
```

Note that `simple-import-sort` sorts `@tests/…` imports with the packages (before `vitest`), not with `@/…`. `pnpm lint --fix` keeps them in that order.

- [ ] **Step 3: Allow fixed test credentials and IPs in tests only.** In `eslint.config.mjs`, in the block whose `files` is `TESTS`, add these two rules after `"max-lines-per-function": "off",`:

```js
      // Tests use fixed non-production credentials and private-range IPs (coding-rules › Tooling).
      "sonarjs/no-hardcoded-passwords": "off",
      "sonarjs/no-hardcoded-ip": "off",
```

- [ ] **Step 4: Record the reason in the coding rules.** In `docs/coding-rules.md` › *Tooling*, after the paragraph about turning off a SonarJS rule, add:

```markdown
Turned off for test files only (`TESTS` glob in `eslint.config.mjs`): `sonarjs/no-hardcoded-passwords` and `sonarjs/no-hardcoded-ip`. Tests use fixed non-production credentials and private-range IPs, which are not secrets.
```

- [ ] **Step 5: Run the gate.**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: PASS (nothing uses the new packages yet).

- [ ] **Step 6: Commit.**

```bash
git add package.json pnpm-lock.yaml tsconfig.json vitest.config.ts vitest.integration.config.ts eslint.config.mjs docs/coding-rules.md
git commit -m "chore(auth): pin better-auth and axe, add the tests alias"
```

## Task 2: Auth keys in the app environment

**Files:**
- Modify: `src/shared/env/app-env.schema.ts`
- Create: `tests/support/env/test-app-env.ts`
- Modify: `src/shared/env/app-env.test.ts`, `src/composition/request-context/request-context.test.ts`, `src/composition/request-db/request-db.test.ts`
- Modify: `.env.example`

`parseAppEnv` drops unknown bindings, so auth keys must be part of `appEnvSchema`. F-00's tests build an `AppEnv` by hand, so they move to one complete fixture.

- [ ] **Step 1: Add the shared test fixture.**

`tests/support/env/test-app-env.ts`

```ts
import type { AppEnv } from "@/shared/env/app-env.types";

/** A complete, fake `AppEnv` for unit tests. Non-production values only. */
export const TEST_APP_ENV: AppEnv = {
  DATABASE_URL: "postgresql://user:pw@db.example/app",
  APP_STAGE: "test",
  BETTER_AUTH_SECRET: "test-secret-at-least-32-characters-long",
  BETTER_AUTH_URL: "http://localhost:3000",
  GOOGLE_CLIENT_ID: "test-google-client-id",
  GOOGLE_CLIENT_SECRET: "test-google-client-secret",
  RESEND_API_KEY: "re_test",
  AUTH_EMAIL_FROM: "Shutrly <auth@test.shutrly.dev>",
};
```

- [ ] **Step 2: Update F-00's tests to use it.** Replace the three files with:

`src/shared/env/app-env.test.ts`

```ts
import { TEST_APP_ENV } from "@tests/support/env/test-app-env";
import { describe, expect, it } from "vitest";

import { parseAppEnv } from "./app-env";

const valid = {
  ...TEST_APP_ENV,
  DATABASE_URL: "postgresql://user:pw@db.example.neon.tech/app?sslmode=require",
};

describe("parseAppEnv", () => {
  it("AC-FND-004 accepts a valid environment and drops unknown bindings", () => {
    expect(parseAppEnv({ ...valid, ASSETS: {} })).toEqual(valid);
  });

  it("AC-FND-004 names a missing key", () => {
    const withoutUrl = Object.fromEntries(
      Object.entries(valid).filter(([key]) => key !== "DATABASE_URL"),
    );
    expect(() => parseAppEnv(withoutUrl)).toThrow("Invalid environment: DATABASE_URL");
  });

  it("AC-FND-004 names every invalid key", () => {
    expect(() => parseAppEnv({ ...valid, DATABASE_URL: "nope", APP_STAGE: "staging" })).toThrow(
      "Invalid environment: DATABASE_URL, APP_STAGE",
    );
  });

  it("AC-FND-004 never echoes a value", () => {
    let message = "";
    try {
      parseAppEnv({ ...valid, DATABASE_URL: "not-a-url-supersecret123" });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toBe("Invalid environment: DATABASE_URL");
    expect(message).not.toContain("supersecret123");
  });
});
```

`src/composition/request-context/request-context.test.ts`

```ts
import { TEST_APP_ENV } from "@tests/support/env/test-app-env";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn() }));

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";

import { getRequestContext } from "./request-context";

const waitUntil = vi.fn();
const env = { ...TEST_APP_ENV, ASSETS: {} };

function givenRequest(
  requestHeaders: Record<string, string>,
  bindings: Record<string, unknown> = env,
) {
  vi.mocked(getCloudflareContext).mockResolvedValue({
    env: bindings,
    ctx: { waitUntil },
    cf: undefined,
  });
  vi.mocked(headers).mockResolvedValue(new Headers(requestHeaders));
}

beforeEach(() => vi.clearAllMocks());

describe("getRequestContext", () => {
  it("AC-FND-004 parses the Worker bindings into AppEnv", async () => {
    givenRequest({});
    const rc = await getRequestContext();
    expect(rc.env).toEqual(TEST_APP_ENV);
  });

  it("AC-FND-004 fails fast on invalid bindings", async () => {
    givenRequest({}, { APP_STAGE: "test" });
    await expect(getRequestContext()).rejects.toThrow("Invalid environment: DATABASE_URL");
  });

  it("uses cf-connecting-ip, then the first x-forwarded-for hop, then unknown", async () => {
    givenRequest({ "cf-connecting-ip": "203.0.113.7", "x-forwarded-for": "198.51.100.1" });
    expect((await getRequestContext()).ip).toBe("203.0.113.7");
    givenRequest({ "x-forwarded-for": " 198.51.100.1 , 10.0.0.1" });
    expect((await getRequestContext()).ip).toBe("198.51.100.1");
    givenRequest({});
    expect((await getRequestContext()).ip).toBe("unknown");
  });

  it("uses cf-ray as the request ID, else a random UUID", async () => {
    givenRequest({ "cf-ray": "8f1c2d3e4f5a6b7c-SIN" });
    expect((await getRequestContext()).requestId).toBe("8f1c2d3e4f5a6b7c-SIN");
    givenRequest({});
    expect((await getRequestContext()).requestId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("AC-FND-005 delegates waitUntil to the Worker execution context", async () => {
    givenRequest({});
    const promise = Promise.resolve();
    (await getRequestContext()).waitUntil(promise);
    expect(waitUntil).toHaveBeenCalledWith(promise);
  });
});
```

`src/composition/request-db/request-db.test.ts`

```ts
import { TEST_APP_ENV } from "@tests/support/env/test-app-env";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../request-context/request-context", () => ({ getRequestContext: vi.fn() }));
vi.mock("@/adapters/db/client/client", () => ({ createDb: vi.fn() }));

import { createDb } from "@/adapters/db/client/client";

import { getRequestContext } from "../request-context/request-context";
import { withRequestDb } from "./request-db";

const events: string[] = [];
const endPromise = Promise.resolve();
const end = vi.fn(() => {
  events.push("end");
  return endPromise;
});
const waitUntil = vi.fn();
const fakeDb = { fake: true };
const rc = {
  env: TEST_APP_ENV,
  waitUntil,
  ip: "203.0.113.7",
  requestId: "r1",
  headers: new Headers(),
};

beforeEach(() => {
  vi.clearAllMocks();
  events.length = 0;
  vi.mocked(getRequestContext).mockResolvedValue(rc);
  vi.mocked(createDb).mockReturnValue({ db: fakeDb, pool: { end } } as never);
});

describe("withRequestDb", () => {
  it("AC-FND-005 opens a db from the request env and returns the result", async () => {
    const result = await withRequestDb((db, context) => {
      expect(db).toBe(fakeDb);
      expect(context).toBe(rc);
      return Promise.resolve(42);
    });
    expect(result).toBe(42);
    expect(createDb).toHaveBeenCalledWith(rc.env.DATABASE_URL);
  });

  it("AC-FND-005 ends the pool after the work and hands it to waitUntil", async () => {
    await withRequestDb(() => {
      events.push("work");
      return Promise.resolve();
    });
    expect(events).toEqual(["work", "end"]);
    expect(waitUntil).toHaveBeenCalledWith(endPromise);
  });

  it("AC-FND-005 still ends the pool when the work throws", async () => {
    await expect(withRequestDb(() => Promise.reject(new Error("query failed")))).rejects.toThrow(
      "query failed",
    );
    expect(end).toHaveBeenCalledTimes(1);
    expect(waitUntil).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail.**

Run: `pnpm typecheck`
Expected: FAIL. `TEST_APP_ENV` has keys that `AppEnv` does not have yet (`BETTER_AUTH_SECRET`, …).

- [ ] **Step 4: Add the auth keys.**

`src/shared/env/app-env.schema.ts`

```ts
import { z } from "zod";

// Worker bindings read per request. Features extend this object with their own keys.
export const appEnvSchema = z.object({
  DATABASE_URL: z.url(),
  APP_STAGE: z.enum(["development", "test", "production"]),
  // F-01 Auth (ADR-002, ADR-011, ADR-012). Secrets come from Worker secret bindings.
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  AUTH_EMAIL_FROM: z.string().min(3),
  // E2E only: "1" keeps auth emails in memory on a localhost BETTER_AUTH_URL.
  E2E_EMAIL_CAPTURE: z.enum(["1"]).optional(),
});
```

- [ ] **Step 5: Document the keys.** Append to `.env.example`:

```bash
# F-01 Auth (.dev.vars and .env.test). Non-production values only.
BETTER_AUTH_SECRET=      # >= 32 random characters
BETTER_AUTH_URL=         # http://localhost:3000 locally
GOOGLE_CLIENT_ID=        # non-production OAuth client, identity scopes only (ADR-012)
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=          # a Resend test key
AUTH_EMAIL_FROM=         # "Shutrly <auth@…>", a verified Resend sender
E2E_EMAIL_CAPTURE=       # 1 in .dev.vars for local E2E: auth emails stay in memory (Task 31)
```

- [ ] **Step 6: Run the gate.**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: PASS.

- [ ] **Step 7: Commit.**

```bash
git add src/shared/env tests/support/env src/composition/request-context/request-context.test.ts src/composition/request-db/request-db.test.ts .env.example
git commit -m "feat(auth): add the auth keys to the app environment"
```

## Task 3: Credentials domain

**Files:** `src/features/auth/domain/credentials/credentials.{ts,schema.ts,types.ts,test.ts}`

- [ ] **Step 1: Write the failing test.**

`src/features/auth/domain/credentials/credentials.test.ts`

```ts
import { describe, expect, it } from "vitest";

import {
  checkPassword,
  normaliseEmail,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "./credentials";

describe("normaliseEmail", () => {
  it("BR-AUTH-002 trims and lower-cases so one address maps to one identity", () => {
    expect(normaliseEmail("  Owner@Example.COM ")).toBe("owner@example.com");
  });
});

describe("checkPassword", () => {
  it("AC-AUTH-002 rejects a password shorter than 8 characters", () => {
    expect(checkPassword("a".repeat(PASSWORD_MIN_LENGTH - 1))).toBe("TOO_SHORT");
  });

  it("AC-AUTH-002 accepts exactly 8 and exactly 128 characters", () => {
    expect(checkPassword("a".repeat(PASSWORD_MIN_LENGTH))).toBe("OK");
    expect(checkPassword("a".repeat(PASSWORD_MAX_LENGTH))).toBe("OK");
  });

  it("AC-AUTH-002 rejects a password longer than 128 characters", () => {
    expect(checkPassword("a".repeat(PASSWORD_MAX_LENGTH + 1))).toBe("TOO_LONG");
  });

  it("AC-AUTH-002 applies no composition rules (A-1)", () => {
    expect(checkPassword("aaaaaaaa")).toBe("OK");
  });
});
```

- [ ] **Step 2: Run it to verify it fails.**

Run: `pnpm test src/features/auth/domain/credentials`
Expected: FAIL, `Cannot find module './credentials'`.

- [ ] **Step 3: Write the schema, types and implementation.** The brand comes from Zod's `.brand()`, so no `as` is needed.

`src/features/auth/domain/credentials/credentials.schema.ts`

```ts
import { z } from "zod";

// Trimmed and lower-cased, so one address maps to one identity (BR-AUTH-002).
export const normalisedEmailSchema = z.string().trim().toLowerCase().brand<"NormalisedEmail">();
```

`src/features/auth/domain/credentials/credentials.types.ts`

```ts
import type { z } from "zod";

import type { normalisedEmailSchema } from "./credentials.schema";

export type NormalisedEmail = z.infer<typeof normalisedEmailSchema>;

export type PasswordCheck = "OK" | "TOO_SHORT" | "TOO_LONG";
```

`src/features/auth/domain/credentials/credentials.ts`

```ts
import { normalisedEmailSchema } from "./credentials.schema";
import type { NormalisedEmail, PasswordCheck } from "./credentials.types";

/** A-1: the shortest accepted password. */
export const PASSWORD_MIN_LENGTH = 8;
/** A-1: the longest accepted password. */
export const PASSWORD_MAX_LENGTH = 128;
/** Spec › Inputs: the longest display name. */
export const DISPLAY_NAME_MAX_LENGTH = 100;

/**
 * Trim and lower-case an email so one address maps to one identity (BR-AUTH-002).
 * @param raw - the email as typed
 * @returns the branded normalised email
 */
export function normaliseEmail(raw: string): NormalisedEmail {
  return normalisedEmailSchema.parse(raw);
}

/**
 * Check a new password against A-1: length only, no composition rules. Length is
 * `string.length` (UTF-16 units), the same measure Better Auth applies.
 * @param password - the candidate password
 * @returns `OK`, `TOO_SHORT` or `TOO_LONG`
 */
export function checkPassword(password: string): PasswordCheck {
  if (password.length < PASSWORD_MIN_LENGTH) return "TOO_SHORT";
  if (password.length > PASSWORD_MAX_LENGTH) return "TOO_LONG";
  return "OK";
}
```

- [ ] **Step 4: Run it to verify it passes.**

Run: `pnpm test src/features/auth/domain/credentials && pnpm lint`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit.**

```bash
git add src/features/auth/domain/credentials
git commit -m "feat(auth): add email normalisation and the password policy"
```

## Task 4: Account domain

**Files:** `src/features/auth/domain/account/account.{ts,schema.ts,types.ts,test.ts}`

- [ ] **Step 1: Write the failing test.**

`src/features/auth/domain/account/account.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { accessDecision, asAuthUserId, googleLinkDecision, isAccountStatus } from "./account";

describe("accessDecision", () => {
  it("BR-AUTH-003 is ANONYMOUS without an account", () => {
    expect(accessDecision(null)).toBe("ANONYMOUS");
  });

  it.each(["SUSPENDED", "DISABLED"] as const)(
    "AC-AUTH-013 BR-AUTH-005 blocks a %s account even when verified",
    (status) => {
      expect(accessDecision({ status, emailVerified: true })).toBe("UNAVAILABLE");
    },
  );

  it("BR-AUTH-005 checks status before verification", () => {
    expect(accessDecision({ status: "SUSPENDED", emailVerified: false })).toBe("UNAVAILABLE");
  });

  it("AC-AUTH-009 BR-AUTH-003 restricts an active unverified account", () => {
    expect(accessDecision({ status: "ACTIVE", emailVerified: false })).toBe("RESTRICTED");
  });

  it("AC-AUTH-007 grants owner access to an active verified account", () => {
    expect(accessDecision({ status: "ACTIVE", emailVerified: true })).toBe("OWNER");
  });
});

describe("googleLinkDecision", () => {
  it("AC-AUTH-028 BR-AUTH-006 rejects an unverified Google email", () => {
    expect(googleLinkDecision({ googleEmailVerified: false, existing: null })).toBe("REJECT");
    const existing = { emailVerified: true };
    expect(googleLinkDecision({ googleEmailVerified: false, existing })).toBe("REJECT");
  });

  it("AC-AUTH-024 creates an account when none matches", () => {
    expect(googleLinkDecision({ googleEmailVerified: true, existing: null })).toBe("CREATE");
  });

  it("AC-AUTH-026 links to a verified account", () => {
    const existing = { emailVerified: true };
    expect(googleLinkDecision({ googleEmailVerified: true, existing })).toBe("LINK");
  });

  it("AC-AUTH-027 BR-AUTH-007 guards a link to an unverified account", () => {
    const existing = { emailVerified: false };
    expect(googleLinkDecision({ googleEmailVerified: true, existing })).toBe(
      "LINK_WITH_TAKEOVER_GUARD",
    );
  });
});

describe("account IDs and statuses", () => {
  it("BR-AUTH-005 accepts only the three statuses", () => {
    expect(isAccountStatus("ACTIVE")).toBe(true);
    expect(isAccountStatus("active")).toBe(false);
  });

  it("BR-AUTH-002 brands a non-empty user ID and refuses an empty one", () => {
    expect(asAuthUserId("u_1")).toBe("u_1");
    expect(() => asAuthUserId("")).toThrow();
  });
});
```

- [ ] **Step 2: Run it to verify it fails.**

Run: `pnpm test src/features/auth/domain/account`
Expected: FAIL, `Cannot find module './account'`.

- [ ] **Step 3: Write the schema, types and implementation.**

`src/features/auth/domain/account/account.schema.ts`

```ts
import { z } from "zod";

// Better Auth user IDs are opaque strings (ADR-002); the brand stops them mixing with other IDs.
export const authUserIdSchema = z.string().min(1).brand<"AuthUserId">();

export const accountStatusSchema = z.enum(["ACTIVE", "SUSPENDED", "DISABLED"]);
```

`src/features/auth/domain/account/account.types.ts`

```ts
import type { z } from "zod";

import type { NormalisedEmail } from "../credentials/credentials.types";
import type { accountStatusSchema, authUserIdSchema } from "./account.schema";

export type AuthUserId = z.infer<typeof authUserIdSchema>;

export type AccountStatus = z.infer<typeof accountStatusSchema>;

export interface AccountRecord {
  id: AuthUserId;
  email: NormalisedEmail;
  name: string;
  status: AccountStatus;
  emailVerified: boolean;
  hasPassword: boolean;
}

export type AccessSubject = Pick<AccountRecord, "status" | "emailVerified">;

export type AccessDecision = "ANONYMOUS" | "UNAVAILABLE" | "RESTRICTED" | "OWNER";

export interface GoogleLinkInput {
  googleEmailVerified: boolean;
  existing: Pick<AccountRecord, "emailVerified"> | null;
}

export type GoogleLinkDecision = "REJECT" | "CREATE" | "LINK" | "LINK_WITH_TAKEOVER_GUARD";
```

`src/features/auth/domain/account/account.ts`

```ts
import { accountStatusSchema, authUserIdSchema } from "./account.schema";
import type {
  AccessDecision,
  AccessSubject,
  AccountStatus,
  AuthUserId,
  GoogleLinkDecision,
  GoogleLinkInput,
} from "./account.types";

/** The three account statuses (BR-AUTH-005). */
export const ACCOUNT_STATUSES = accountStatusSchema.options;

/**
 * Brand a Better Auth user ID. It checks only that the ID is non-empty; the ID stays opaque.
 * @param raw - the user ID from Better Auth or the database
 * @returns the branded `AuthUserId`
 */
export function asAuthUserId(raw: string): AuthUserId {
  return authUserIdSchema.parse(raw);
}

/**
 * Tell whether a stored or typed value is one of the account statuses.
 * @param value - the raw status
 * @returns true for `ACTIVE`, `SUSPENDED` or `DISABLED`
 */
export function isAccountStatus(value: string): value is AccountStatus {
  return accountStatusSchema.safeParse(value).success;
}

/**
 * Decide what a session may do. Status is checked before verification (BR-AUTH-005, then
 * BR-AUTH-003), as in diagrams/state.md.
 * @param account - the session's account, or null without one
 * @returns `ANONYMOUS`, `UNAVAILABLE`, `RESTRICTED` or `OWNER`
 */
export function accessDecision(account: AccessSubject | null): AccessDecision {
  if (!account) return "ANONYMOUS";
  if (account.status !== "ACTIVE") return "UNAVAILABLE";
  if (!account.emailVerified) return "RESTRICTED";
  return "OWNER";
}

/**
 * Decide how a Google sign-in relates to a local account (BR-AUTH-006, BR-AUTH-007).
 * @param input - Google's `email_verified` claim and the local account with that email
 * @returns `REJECT`, `CREATE`, `LINK` or `LINK_WITH_TAKEOVER_GUARD`
 */
export function googleLinkDecision(input: GoogleLinkInput): GoogleLinkDecision {
  if (!input.googleEmailVerified) return "REJECT";
  if (!input.existing) return "CREATE";
  return input.existing.emailVerified ? "LINK" : "LINK_WITH_TAKEOVER_GUARD";
}
```

- [ ] **Step 4: Run it to verify it passes.**

Run: `pnpm test src/features/auth/domain && pnpm lint`
Expected: PASS (17 tests across both domain folders).

- [ ] **Step 5: Commit.**

```bash
git add src/features/auth/domain/account
git commit -m "feat(auth): add account access and Google link decisions"
```

## Task 5: Auth schema and migration

**Files:**
- Create: `src/adapters/db/schema/auth/auth.ts`
- Modify: `src/adapters/db/schema/index.ts`
- Create (generated): `drizzle/0000_auth_identity.sql`, `drizzle/meta/*`
- Test: `tests/integration/auth/schema.test.ts`

Identity is not tenant data: these tables have no `workspace_id` (ADR-003 applies to workspace-owned rows). Property names match Better Auth's field names so its Drizzle adapter maps them; columns are `snake_case`.


- [ ] **Step 1: Write the failing integration test.** It needs the shared test helpers first:

`tests/support/auth/unique.ts`

```ts
/** A fresh address per call, so tests on the shared database never collide (ADR-009). */
export function uniqueEmail(tag = "owner"): string {
  return `${tag}+${crypto.randomUUID()}@test.shutrly.dev`;
}

/** A random private-range IP, so rate-limit counters never leak between tests. */
export function uniqueIp(): string {
  const [a = 0, b = 0, c = 0] = crypto.getRandomValues(new Uint8Array(3));
  return ["10", a, b, c].join(".");
}
```

`tests/integration/auth/schema.test.ts`

```ts
import { uniqueEmail } from "@tests/support/auth/unique";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { user } from "@/adapters/db/schema/auth/auth";

import { openTestDb } from "../helpers/test-db";

let db: Db;
let close: () => Promise<void>;
beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

const base = () => ({ id: crypto.randomUUID(), name: "Owner", email: uniqueEmail() });

describe("auth schema", () => {
  it("BR-AUTH-002 defaults a new user to ACTIVE and unverified", async () => {
    const row = base();
    await db.insert(user).values(row);
    const [saved] = await db.select().from(user).where(eq(user.id, row.id));
    expect(saved).toMatchObject({ status: "ACTIVE", emailVerified: false, emailVerifiedAt: null });
  });

  it("BR-AUTH-005 rejects an unknown status", async () => {
    await expect(db.insert(user).values({ ...base(), status: "BANNED" })).rejects.toThrow();
  });

  it("BR-AUTH-002 keeps email_verified and email_verified_at consistent", async () => {
    await expect(db.insert(user).values({ ...base(), emailVerified: true })).rejects.toThrow();
    const verified = { ...base(), emailVerified: true, emailVerifiedAt: new Date() };
    await expect(db.insert(user).values(verified)).resolves.toBeDefined();
  });

  it("BR-AUTH-002 allows one identity per email regardless of case", async () => {
    const email = uniqueEmail();
    await db.insert(user).values({ ...base(), email });
    const upper = { ...base(), email: email.toUpperCase() };
    await expect(db.insert(user).values(upper)).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Write the schema and export it from the barrel.**

`src/adapters/db/schema/auth/auth.ts`

```ts
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Better Auth's tables (ADR-002) plus F-01's extensions. Property names match Better Auth's
// field names so its Drizzle adapter maps them; columns are snake_case (coding rules).
// Not tenant data: identity sits above workspaces, so there is no workspace_id (ADR-003).

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    status: text("status").notNull().default("ACTIVE"),
    image: text("image"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("user_email_lower_uq").on(sql`lower(${t.email})`),
    check("user_status_ck", sql`${t.status} in ('ACTIVE','SUSPENDED','DISABLED')`),
    check("user_email_verified_ck", sql`${t.emailVerified} = (${t.emailVerifiedAt} is not null)`),
  ],
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("account_user_id_idx").on(t.userId),
    uniqueIndex("account_provider_uq").on(t.providerId, t.accountId),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

// A-3: the latest link per user and purpose. Only its hash is stored, and it is consumed once.
export const authLatestLink = pgTable(
  "auth_latest_link",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    purpose: text("purpose").$type<"VERIFY_EMAIL" | "RESET_PASSWORD">().notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.purpose] }),
    check("auth_latest_link_purpose_ck", sql`${t.purpose} in ('VERIFY_EMAIL','RESET_PASSWORD')`),
  ],
);

// ADR-013 fixed-window counters. Keys hash the email; they never contain a raw address.
export const authRateLimit = pgTable(
  "auth_rate_limit",
  {
    key: text("key").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.key, t.windowStart] }),
    index("auth_rate_limit_window_idx").on(t.windowStart),
  ],
);
```

`src/adapters/db/schema/index.ts`

```ts
// Schema barrel: each feature re-exports its table file here, e.g. `export * from "./auth/auth"`.
export * from "./auth/auth";
```

- [ ] **Step 3: Generate and review the migration.**

Run: `pnpm db:generate --name auth_identity`
Expected: `drizzle/0000_auth_identity.sql` plus `drizzle/meta/`. Read the SQL and check that:
- it creates exactly six tables: `user`, `session`, `account`, `verification`, `auth_latest_link` and `auth_rate_limit`;
- it contains `user_status_ck`, `user_email_verified_ck`, `auth_latest_link_purpose_ck`, and `CREATE UNIQUE INDEX "user_email_lower_uq" ON "user" USING btree (lower("email"))`;
- every foreign key to `user` is `ON DELETE cascade`;
- it contains no `DROP`.

- [ ] **Step 4: Run the unit gate.**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add src/adapters/db/schema drizzle tests/support/auth/unique.ts tests/integration/auth/schema.test.ts
git commit -m "feat(auth): add the Better Auth schema with status, latest-link and rate-limit tables"
```

- [ ] **Step 6: Stop: the Owner applies the migration.** Ask the Owner to run `pnpm db:migrate` from a clean `main` against the shared non-production database. **Never run it yourself.** You can continue with Tasks 6–17, which need no database. Before Task 18, confirm the migration is applied, then run:

Run: `pnpm test:integration tests/integration/auth/schema.test.ts`
Expected: PASS (4 tests).

---

# Iteration 2 — Application core

## Task 6: Ports

**Files:** `src/features/auth/application/ports/{identity,account-directory,link-registry,auth-email,rate-limiter,workspace-destination}/<name>.port.ts`

A port file may declare its interface together with its contract types (coding rules › Where types and schemas live). Ports have no behaviour, so this task's check is the type-checker.

- [ ] **Step 1: Write the ports.**

`src/features/auth/application/ports/auth-email/auth-email.port.ts`

```ts
import "server-only";

export type AuthLinkKind = "VERIFY_EMAIL" | "RESET_PASSWORD";

export interface AuthLink {
  kind: AuthLinkKind;
  to: string;
  name: string;
  url: string;
}

/** Delivers one auth email. Throws `EmailDeliveryError` when the provider refuses it. */
export interface AuthEmailPort {
  send: (link: AuthLink) => Promise<void>;
}
```

`src/features/auth/application/ports/rate-limiter/rate-limiter.port.ts`

```ts
import "server-only";

export interface RateLimitRule {
  limit: number;
  windowSeconds: number;
}

/** Fixed-window counters (ADR-013). Keys never contain a raw email. */
export interface RateLimiterPort {
  /** True while the current window's count is below the limit. Does not count. */
  peek: (key: string, rule: RateLimitRule) => Promise<boolean>;
  /** Counts one attempt; true if the count, including this one, is within the limit. */
  hit: (key: string, rule: RateLimitRule) => Promise<boolean>;
}
```

`src/features/auth/application/ports/workspace-destination/workspace-destination.port.ts`

```ts
import "server-only";

import type { AuthUserId } from "@/features/auth/domain/account/account.types";

// SPEC GAP-2: F-02 implements this port; until then composition wires a stub (ONBOARDING).
export type OwnerDestination = "ONBOARDING" | "WORKSPACE";

/** Where a signed-in owner goes next: first-workspace creation or their workspace (BR-AUTH-004). */
export interface WorkspaceDestinationPort {
  resolve: (userId: AuthUserId) => Promise<OwnerDestination>;
}
```

`src/features/auth/application/ports/account-directory/account-directory.port.ts`

```ts
import "server-only";

import type {
  AccountRecord,
  AccountStatus,
  AuthUserId,
} from "@/features/auth/domain/account/account.types";
import type { NormalisedEmail } from "@/features/auth/domain/credentials/credentials.types";

/** Reads and operator changes on the Better Auth `user` table (ADR-002). Not workspace data. */
export interface AccountDirectoryPort {
  findByEmail: (email: NormalisedEmail) => Promise<AccountRecord | null>;
  getById: (id: AuthUserId) => Promise<AccountRecord | null>;
  /** BR-AUTH-005: the status change and the session revocation commit together. */
  setStatusAndRevokeSessions: (id: AuthUserId, status: AccountStatus) => Promise<void>;
  revokeAllSessions: (id: AuthUserId) => Promise<void>;
  /** BR-AUTH-007: verify, delete the password and revoke every session, in one transaction. */
  applyGoogleTakeoverGuard: (id: AuthUserId) => Promise<void>;
}
```

`src/features/auth/application/ports/link-registry/link-registry.port.ts`

```ts
import "server-only";

import type { AuthUserId } from "@/features/auth/domain/account/account.types";

import type { AuthLinkKind } from "../auth-email/auth-email.port";

export interface IssuedLink {
  userId: AuthUserId;
  purpose: AuthLinkKind;
  token: string;
  ttlSeconds: number;
}

/** The latest link per user and purpose; single use, and a newer link supersedes it (A-3). */
export interface LinkRegistryPort {
  record: (link: IssuedLink) => Promise<void>;
  /** Deletes the link and returns its user when the token is current; null otherwise. */
  consume: (purpose: AuthLinkKind, token: string) => Promise<AuthUserId | null>;
  isCurrent: (purpose: AuthLinkKind, token: string) => Promise<boolean>;
}
```

`src/features/auth/application/ports/identity/identity.port.ts`

```ts
import "server-only";

import type { AuthUserId } from "@/features/auth/domain/account/account.types";
import type { NormalisedEmail } from "@/features/auth/domain/credentials/credentials.types";

/** Raw `Set-Cookie` values from Better Auth; the edge copies them onto the response. */
export interface SessionCookies {
  setCookies: string[];
}

export interface SignedIn extends SessionCookies {
  ok: true;
  userId: AuthUserId;
}

export interface Refused {
  ok: false;
}

export interface NewPasswordUser {
  name: string;
  email: NormalisedEmail;
  password: string;
}

export interface UserCreation {
  created: boolean;
}

export interface PasswordCredentials {
  email: NormalisedEmail;
  password: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordChanged extends SessionCookies {
  ok: true;
}

export interface GoogleRedirects {
  callbackURL: string;
  errorCallbackURL: string;
}

export interface GoogleStart extends SessionCookies {
  url: string;
}

/** Better Auth behind a port (ADR-002): credentials, sessions and email tokens. */
export interface IdentityPort {
  getSessionUserId: (headers: Headers) => Promise<AuthUserId | null>;
  /** Creates nothing for an existing email; `created` tells the caller which case it was. */
  createPasswordUser: (input: NewPasswordUser) => Promise<UserCreation>;
  /** Issues a new link that supersedes older ones; does nothing for a verified account. */
  sendVerificationLink: (email: NormalisedEmail) => Promise<void>;
  verifyEmail: (token: string) => Promise<SignedIn | Refused>;
  signInWithPassword: (input: PasswordCredentials, headers: Headers) => Promise<SignedIn | Refused>;
  signOut: (headers: Headers) => Promise<SessionCookies>;
  sendResetLink: (email: NormalisedEmail) => Promise<void>;
  isResetLinkUsable: (token: string) => Promise<boolean>;
  resetPassword: (input: PasswordReset) => Promise<boolean>;
  changePassword: (input: PasswordChange, headers: Headers) => Promise<PasswordChanged | Refused>;
  updateName: (name: string, headers: Headers) => Promise<void>;
  googleSignInUrl: (redirects: GoogleRedirects) => Promise<GoogleStart>;
}
```

- [ ] **Step 2: Run the gate.**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 3: Commit.**

```bash
git add src/features/auth/application/ports
git commit -m "feat(auth): add the auth application ports"
```

## Task 7: Auth errors

**Files:**
- `src/features/auth/application/errors/auth-errors/auth-errors.{ts,schema.ts,types.ts,test.ts}`
- `src/features/auth/application/errors/email-delivery-error/email-delivery-error.{ts,test.ts}`

The codes and field-error keys are Zod enums in a `.schema.ts`. Client forms can import them, and `validationFailure` narrows a message to a `FieldErrorKey` without `as`.

- [ ] **Step 1: Write the failing tests.**

`src/features/auth/application/errors/auth-errors/auth-errors.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { AuthError, failure, validationFailure } from "./auth-errors";

function issuesOf(schema: z.ZodType, input: unknown): z.ZodError {
  const parsed = schema.safeParse(input);
  if (parsed.success) throw new Error("expected a validation failure");
  return parsed.error;
}

describe("auth errors", () => {
  it("AC-AUTH-002 maps Zod issues to one message key per field", () => {
    const schema = z.object({
      email: z.email("email.invalid"),
      password: z.string().min(8, "password.length"),
    });
    expect(validationFailure(issuesOf(schema, { email: "nope", password: "short" }))).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { email: "email.invalid", password: "password.length" },
    });
  });

  it("AC-AUTH-002 keeps the first issue when a field has several", () => {
    const schema = z.object({ name: z.string().min(1, "name.required").max(0, "name.tooLong") });
    expect(validationFailure(issuesOf(schema, { name: "" })).fieldErrors).toEqual({
      name: "name.required",
    });
  });

  it("AC-AUTH-002 treats a message that is not a FieldErrorKey as a schema bug", () => {
    const schema = z.object({ name: z.string().min(1, "free text") });
    expect(() => validationFailure(issuesOf(schema, { name: "" }))).toThrow(/FieldErrorKey/);
  });

  it("AC-AUTH-008 builds a plain failure and a throwable error with a stable code", () => {
    expect(failure("RATE_LIMITED")).toEqual({ ok: false, code: "RATE_LIMITED" });
    expect(new AuthError("ACCOUNT_UNAVAILABLE").code).toBe("ACCOUNT_UNAVAILABLE");
  });
});
```

`src/features/auth/application/errors/email-delivery-error/email-delivery-error.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { EmailDeliveryError } from "./email-delivery-error";

describe("EmailDeliveryError", () => {
  it("AC-AUTH-021 names the email kind and status but never a link or recipient", () => {
    const error = new EmailDeliveryError("VERIFY_EMAIL", 503);
    expect(error.code).toBe("EMAIL_DELIVERY_FAILED");
    expect(error.message).toBe("Auth email delivery failed (VERIFY_EMAIL, HTTP 503)");
    expect(new EmailDeliveryError("RESET_PASSWORD").message).toBe(
      "Auth email delivery failed (RESET_PASSWORD)",
    );
  });
});
```

- [ ] **Step 2: Run them to verify they fail.**

Run: `pnpm test src/features/auth/application/errors`
Expected: FAIL, missing modules.

- [ ] **Step 3: Write the implementation.**

`src/features/auth/application/errors/auth-errors/auth-errors.schema.ts`

```ts
import { z } from "zod";

// Stable codes the edge maps to screens and messages (technical-design.md › Error Handling).
export const authErrorCodeSchema = z.enum([
  "VALIDATION_FAILED",
  "INVALID_CREDENTIALS",
  "RATE_LIMITED",
  "EMAIL_UNVERIFIED",
  "ACCOUNT_UNAVAILABLE",
  "AUTH_REQUIRED",
  "INVALID_LINK",
  "WRONG_CURRENT_PASSWORD",
  "GOOGLE_CANCELLED",
  "GOOGLE_FAILED",
  "EMAIL_DELIVERY_FAILED",
]);

// Zod messages in auth schemas are these keys; each form's *.copy.ts translates them.
export const fieldErrorKeySchema = z.enum([
  "name.required",
  "name.tooLong",
  "email.invalid",
  "password.required",
  "password.length",
  "password.mismatch",
  "password.wrongCurrent",
]);
```

`src/features/auth/application/errors/auth-errors/auth-errors.types.ts`

```ts
import type { z } from "zod";

import type { authErrorCodeSchema, fieldErrorKeySchema } from "./auth-errors.schema";

export type AuthErrorCode = z.infer<typeof authErrorCodeSchema>;

export type FieldErrorKey = z.infer<typeof fieldErrorKeySchema>;

export type FieldErrors = Partial<Record<string, FieldErrorKey>>;

export interface AuthFailure {
  ok: false;
  code: AuthErrorCode;
  fieldErrors?: FieldErrors;
}

export interface AuthSuccess {
  ok: true;
}

export type AuthResult<T extends object = object> = (AuthSuccess & T) | AuthFailure;
```

`src/features/auth/application/errors/auth-errors/auth-errors.ts`

```ts
import "server-only";

import type { z } from "zod";

import { DomainError } from "@/shared/errors/domain-error";

import { fieldErrorKeySchema } from "./auth-errors.schema";
import type { AuthErrorCode, AuthFailure, FieldErrors } from "./auth-errors.types";

/** A refused auth request that the edge turns into a redirect or a status code. */
export class AuthError extends DomainError {
  readonly code: AuthErrorCode;

  /**
   * @param code - the stable refusal code
   */
  constructor(code: AuthErrorCode) {
    super(code);
    this.code = code;
  }
}

/**
 * Build the failure result a use case returns for an expected refusal.
 * @param code - the stable error code
 * @param fieldErrors - optional message keys per field
 * @returns the `{ ok: false }` result
 */
export function failure(code: AuthErrorCode, fieldErrors?: FieldErrors): AuthFailure {
  return fieldErrors ? { ok: false, code, fieldErrors } : { ok: false, code };
}

/**
 * Turn Zod issues into one message key per field, keeping the first issue of each field.
 * @param error - the error from `safeParse` on an auth schema
 * @returns a `VALIDATION_FAILED` failure with `fieldErrors`
 */
export function validationFailure(error: z.ZodError): AuthFailure {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const field = typeof issue.path[0] === "string" ? issue.path[0] : "form";
    const key = fieldErrorKeySchema.safeParse(issue.message);
    // Auth schemas only use FieldErrorKey messages; anything else is a bug in a schema.
    if (!key.success) throw new Error(`Auth schema message on "${field}" is not a FieldErrorKey`);
    fieldErrors[field] ??= key.data;
  }
  return failure("VALIDATION_FAILED", fieldErrors);
}
```

`src/features/auth/application/errors/email-delivery-error/email-delivery-error.ts`

```ts
import "server-only";

import { DomainError } from "@/shared/errors/domain-error";

import type { AuthLinkKind } from "../../ports/auth-email/auth-email.port";

/** The email provider refused or failed a send. Never carries the link or recipient (C-103). */
export class EmailDeliveryError extends DomainError {
  readonly code = "EMAIL_DELIVERY_FAILED";
  readonly kind: AuthLinkKind;
  readonly status: number | undefined;

  /**
   * @param kind - which auth email failed
   * @param status - the provider's HTTP status, when there was a response
   */
  constructor(kind: AuthLinkKind, status?: number) {
    const suffix = status === undefined ? "" : `, HTTP ${String(status)}`;
    super(`Auth email delivery failed (${kind}${suffix})`);
    this.kind = kind;
    this.status = status;
  }
}
```

- [ ] **Step 4: Run them to verify they pass.**

Run: `pnpm test src/features/auth/application/errors && pnpm lint`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit.**

```bash
git add src/features/auth/application/errors
git commit -m "feat(auth): add typed auth errors and field-error keys"
```

## Task 8: Auth logging, link outbox and dependencies

**Files:**
- `src/features/auth/application/logging/auth-log/auth-log.{ts,types.ts,test.ts}`
- `src/features/auth/application/link-outbox/link-outbox.{ts,types.ts,test.ts}`
- `src/features/auth/application/auth-deps/auth-deps.types.ts`
- Test support: `tests/support/auth/recording-email-sender.ts`

- [ ] **Step 1: Write the test double and the failing tests.**

`tests/support/auth/recording-email-sender.ts`

```ts
import { EmailDeliveryError } from "@/features/auth/application/errors/email-delivery-error/email-delivery-error";
import type {
  AuthEmailPort,
  AuthLink,
  AuthLinkKind,
} from "@/features/auth/application/ports/auth-email/auth-email.port";

/** Test double for the email port: records sent links, or fails every send when `failing`. */
export class RecordingEmailSender implements AuthEmailPort {
  readonly sent: AuthLink[] = [];
  failing = false;

  send(link: AuthLink): Promise<void> {
    if (this.failing) return Promise.reject(new EmailDeliveryError(link.kind, 503));
    this.sent.push(link);
    return Promise.resolve();
  }

  linksTo(to: string, kind: AuthLinkKind): AuthLink[] {
    return this.sent.filter((link) => link.to === to && link.kind === kind);
  }

  lastUrl(to: string, kind: AuthLinkKind): string | undefined {
    return this.linksTo(to, kind).at(-1)?.url;
  }
}
```

`src/features/auth/application/logging/auth-log/auth-log.test.ts`

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/logging/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { logger } from "@/shared/logging/logger";

import { authLog } from "./auth-log";
import type { AuthLogEvent } from "./auth-log.types";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("authLog", () => {
  it("AC-AUTH-021 forwards only allow-listed fields, even when extra fields sneak in", () => {
    const leaky = {
      operation: "login",
      outcome: "INVALID_CREDENTIALS",
      requestId: "r1",
      password: "hunter22",
      url: "https://x/verify?token=abc",
      email: "a@b.c",
    } as AuthLogEvent;
    authLog(leaky);
    expect(logger.info).toHaveBeenCalledWith("auth", {
      operation: "login",
      outcome: "INVALID_CREDENTIALS",
      requestId: "r1",
      userId: undefined,
      detail: undefined,
    });
    expect(JSON.stringify(vi.mocked(logger.info).mock.calls)).not.toMatch(/hunter22|abc|a@b\.c/);
  });

  it("AC-AUTH-021 logs at the requested level", () => {
    authLog({ operation: "email-send", outcome: "DELIVERY_FAILED", requestId: "r2" }, "error");
    expect(logger.error).toHaveBeenCalledOnce();
  });
});
```

`src/features/auth/application/link-outbox/link-outbox.test.ts`

```ts
import { RecordingEmailSender } from "@tests/support/auth/recording-email-sender";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/shared/logging/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { logger } from "@/shared/logging/logger";

import type { AuthLink } from "../ports/auth-email/auth-email.port";
import { LinkOutbox } from "./link-outbox";

const link: AuthLink = {
  kind: "VERIFY_EMAIL",
  to: "o@x.dev",
  name: "O",
  url: "https://app/verify/confirm?token=secret",
};

describe("LinkOutbox", () => {
  it("AC-AUTH-001 sends queued links on flush and empties the queue", async () => {
    const sender = new RecordingEmailSender();
    const outbox = new LinkOutbox(sender, "r1");
    outbox.enqueue(link);
    expect(await outbox.flush()).toBe("SENT");
    expect(sender.sent).toEqual([link]);
    expect(outbox.pendingCount).toBe(0);
  });

  it("AC-AUTH-021 AC-AUTH-022 reports FAILED and logs no link when the provider fails", async () => {
    const sender = new RecordingEmailSender();
    sender.failing = true;
    const outbox = new LinkOutbox(sender, "r1");
    outbox.enqueue(link);
    expect(await outbox.flush()).toBe("FAILED");
    expect(JSON.stringify(vi.mocked(logger.error).mock.calls)).not.toContain("secret");
  });

  it("AC-AUTH-016 hands a background flush to waitUntil, and skips it when nothing is queued", async () => {
    const sender = new RecordingEmailSender();
    const outbox = new LinkOutbox(sender, "r1");
    const waitUntil = vi.fn();
    outbox.flushInBackground(waitUntil);
    expect(waitUntil).not.toHaveBeenCalled();
    outbox.enqueue(link);
    outbox.flushInBackground(waitUntil);
    await waitUntil.mock.calls[0]?.[0];
    expect(sender.sent).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run them to verify they fail.**

Run: `pnpm test src/features/auth/application/logging src/features/auth/application/link-outbox`
Expected: FAIL, missing modules.

- [ ] **Step 3: Write the implementation.**

`src/features/auth/application/logging/auth-log/auth-log.types.ts`

```ts
import type { AuthUserId } from "@/features/auth/domain/account/account.types";

import type { AuthLinkKind } from "../../ports/auth-email/auth-email.port";

export type AuthOperation =
  | "register"
  | "verify-email"
  | "resend-verification"
  | "login"
  | "logout"
  | "forgot-password"
  | "reset-password"
  | "change-password"
  | "update-profile"
  | "google-sign-in"
  | "access-gate"
  | "email-send"
  | "operator-status";

export type AuthLogLevel = "info" | "warn" | "error";

export interface AuthLogEvent {
  operation: AuthOperation;
  outcome: string;
  requestId: string;
  userId?: AuthUserId;
  detail?: AuthLinkKind;
}
```

`src/features/auth/application/logging/auth-log/auth-log.ts`

```ts
import "server-only";

import { logger } from "@/shared/logging/logger";

import type { AuthLogEvent, AuthLogLevel } from "./auth-log.types";

/**
 * Log one auth event through an allow-list, so no password, token, URL, cookie or email can
 * pass through (C-103, AC-AUTH-021). It is the only logger call in auth code.
 * @param event - operation, outcome category, request ID and optional user ID / link kind
 * @param level - defaults to `info`
 * @returns nothing
 */
export function authLog(event: AuthLogEvent, level: AuthLogLevel = "info"): void {
  const { operation, outcome, requestId, userId, detail } = event;
  logger[level]("auth", { operation, outcome, requestId, userId, detail });
}
```

`src/features/auth/application/link-outbox/link-outbox.types.ts`

```ts
export type DeliveryOutcome = "SENT" | "FAILED";
```

`src/features/auth/application/link-outbox/link-outbox.ts`

```ts
import "server-only";

import type { WaitUntil } from "../auth-deps/auth-deps.types";
import { authLog } from "../logging/auth-log/auth-log";
import type { AuthEmailPort, AuthLink } from "../ports/auth-email/auth-email.port";
import type { DeliveryOutcome } from "./link-outbox.types";

/**
 * Collects the links produced during one request. The use case decides whether to await the
 * sends (resend, SPEC GAP-4) or hand them to `waitUntil` (register, forgot password; ADR-011).
 */
export class LinkOutbox {
  private readonly pending: AuthLink[] = [];
  private readonly sender: AuthEmailPort;
  private readonly requestId: string;

  /**
   * @param sender - the email port that delivers each link
   * @param requestId - logged with delivery failures
   */
  constructor(sender: AuthEmailPort, requestId: string) {
    this.sender = sender;
    this.requestId = requestId;
  }

  /**
   * Queue a link produced by the identity adapter.
   * @param link - the link and its recipient
   * @returns nothing
   */
  enqueue(link: AuthLink): void {
    this.pending.push(link);
  }

  /** The number of links not yet sent. */
  get pendingCount(): number {
    return this.pending.length;
  }

  /**
   * Send every queued link. A failed send is logged without its link and reported, not thrown.
   * @returns `SENT` when every send succeeded, otherwise `FAILED`
   */
  async flush(): Promise<DeliveryOutcome> {
    const links = this.pending.splice(0);
    const results = await Promise.allSettled(links.map((link) => this.sender.send(link)));
    const failed = links.filter((_, index) => results[index]?.status === "rejected");
    for (const link of failed) this.logFailure(link);
    return failed.length === 0 ? "SENT" : "FAILED";
  }

  /**
   * Send the queued links after the response, so response timing never depends on them.
   * @param waitUntil - the Worker's `waitUntil`
   * @returns nothing; does not schedule work when nothing is queued
   */
  flushInBackground(waitUntil: WaitUntil): void {
    if (this.pending.length === 0) return;
    waitUntil(this.flush());
  }

  private logFailure(link: AuthLink): void {
    const { requestId } = this;
    const event = { operation: "email-send", outcome: "DELIVERY_FAILED", requestId } as const;
    authLog({ ...event, detail: link.kind }, "error");
  }
}
```

`src/features/auth/application/auth-deps/auth-deps.types.ts`

```ts
import type { LinkOutbox } from "../link-outbox/link-outbox";
import type { AccountDirectoryPort } from "../ports/account-directory/account-directory.port";
import type { IdentityPort } from "../ports/identity/identity.port";
import type { RateLimiterPort } from "../ports/rate-limiter/rate-limiter.port";
import type { WorkspaceDestinationPort } from "../ports/workspace-destination/workspace-destination.port";

export type WaitUntil = (promise: Promise<unknown>) => void;

/** Everything an auth use case needs, built per request by composition (ADR-009). */
export interface AuthDeps {
  identity: IdentityPort;
  accounts: AccountDirectoryPort;
  rateLimiter: RateLimiterPort;
  outbox: LinkOutbox;
  destination: WorkspaceDestinationPort;
  waitUntil: WaitUntil;
  requestId: string;
}

export interface RequestMeta {
  ip: string;
  headers: Headers;
}
```

- [ ] **Step 4: Run them to verify they pass.**

Run: `pnpm test src/features/auth/application && pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add src/features/auth/application/logging src/features/auth/application/link-outbox src/features/auth/application/auth-deps tests/support/auth/recording-email-sender.ts
git commit -m "feat(auth): add allow-listed auth logging and the link outbox"
```

## Task 9: Auth rate limits (A-6, ADR-013)

**Files:**
- `src/shared/crypto/sha256-hex/sha256-hex.{ts,test.ts}`
- `src/features/auth/application/rate-limits/auth-rate-limits/auth-rate-limits.{ts,types.ts,test.ts}`
- Test support: `tests/support/auth/in-memory-rate-limiter.ts`, `tests/support/auth/credentials.ts`

- [ ] **Step 1: Write the test doubles and the failing tests.**

`tests/support/auth/in-memory-rate-limiter.ts`

```ts
import type {
  RateLimiterPort,
  RateLimitRule,
} from "@/features/auth/application/ports/rate-limiter/rate-limiter.port";

/** Test double for ADR-013's fixed-window limiter, with an injectable clock. */
export class InMemoryRateLimiter implements RateLimiterPort {
  private readonly counts = new Map<string, number>();

  constructor(private readonly now: () => number = () => Date.now()) {}

  peek(key: string, rule: RateLimitRule): Promise<boolean> {
    return Promise.resolve((this.counts.get(this.slot(key, rule)) ?? 0) < rule.limit);
  }

  hit(key: string, rule: RateLimitRule): Promise<boolean> {
    const slot = this.slot(key, rule);
    const next = (this.counts.get(slot) ?? 0) + 1;
    this.counts.set(slot, next);
    return Promise.resolve(next <= rule.limit);
  }

  keys(): string[] {
    return [...this.counts.keys()];
  }

  private slot(key: string, rule: RateLimitRule): string {
    return `${key}@${String(Math.floor(this.now() / (rule.windowSeconds * 1000)))}`;
  }
}
```

`tests/support/auth/credentials.ts`

```ts
// Fixed test credentials for fakes and the non-production database only.
export const PASSWORD = "correct-horse";
export const WRONG_PASSWORD = "wrong-horse";
export const NEW_PASSWORD = "new-horse-1";
export const OTHER_NEW_PASSWORD = "new-horse-2";
```

`src/shared/crypto/sha256-hex/sha256-hex.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { sha256Hex } from "./sha256-hex";

describe("sha256Hex", () => {
  it("ADR-013 returns the standard SHA-256 hex digest", async () => {
    expect(await sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});
```

`src/features/auth/application/rate-limits/auth-rate-limits/auth-rate-limits.test.ts`

```ts
import { InMemoryRateLimiter } from "@tests/support/auth/in-memory-rate-limiter";
import { uniqueIp } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { allowLimitedAction, isLoginBlocked, recordLoginFailure } from "./auth-rate-limits";

const email = normaliseEmail("owner@example.com");
const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ip = uniqueIp();

async function attempts(count: number, run: (i: number) => Promise<boolean>): Promise<boolean[]> {
  const results: boolean[] = [];
  for (let i = 0; i < count; i++) results.push(await run(i));
  return results;
}

describe("auth rate limits (A-6)", () => {
  it("AC-AUTH-016 allows 3 per hour per email, then refuses", async () => {
    const limiter = new InMemoryRateLimiter();
    const results = await attempts(4, () =>
      allowLimitedAction(limiter, "FORGOT_PASSWORD", email, uniqueIp()),
    );
    expect(results).toEqual([true, true, true, false]);
  });

  it("AC-AUTH-016 allows 20 per hour per IP across different emails", async () => {
    const limiter = new InMemoryRateLimiter();
    const results = await attempts(21, (i) =>
      allowLimitedAction(limiter, "REGISTER", normaliseEmail(`o${String(i)}@x.dev`), ip),
    );
    expect(results.filter(Boolean)).toHaveLength(20);
  });

  it("AC-AUTH-016 counts each action separately", async () => {
    const limiter = new InMemoryRateLimiter();
    await attempts(3, () => allowLimitedAction(limiter, "REGISTER", email, ip));
    expect(await allowLimitedAction(limiter, "RESEND_VERIFICATION", email, ip)).toBe(true);
  });

  it("AC-AUTH-010 blocks login after 5 failures for the email, even from a new IP", async () => {
    const limiter = new InMemoryRateLimiter();
    for (let i = 0; i < 5; i++) await recordLoginFailure(limiter, email, uniqueIp());
    expect(await isLoginBlocked(limiter, email, ip)).toBe(true);
  });

  it("AC-AUTH-010 blocks login after 5 failures from one IP, even for another email", async () => {
    const limiter = new InMemoryRateLimiter();
    for (let i = 0; i < 5; i++) {
      await recordLoginFailure(limiter, normaliseEmail(`o${String(i)}@x.dev`), ip);
    }
    expect(await isLoginBlocked(limiter, email, ip)).toBe(true);
  });

  it("AC-AUTH-010 four failures do not block, and the window resets after 15 minutes", async () => {
    let now = Date.UTC(2026, 0, 1);
    const limiter = new InMemoryRateLimiter(() => now);
    for (let i = 0; i < 4; i++) await recordLoginFailure(limiter, email, ip);
    expect(await isLoginBlocked(limiter, email, ip)).toBe(false);
    await recordLoginFailure(limiter, email, ip);
    expect(await isLoginBlocked(limiter, email, ip)).toBe(true);
    now += FIFTEEN_MINUTES;
    expect(await isLoginBlocked(limiter, email, ip)).toBe(false);
  });

  it("AC-AUTH-021 ADR-013 keys never contain the raw email", async () => {
    const limiter = new InMemoryRateLimiter();
    await allowLimitedAction(limiter, "REGISTER", email, ip);
    expect(limiter.keys().join(" ")).not.toContain("owner@example.com");
  });
});
```

- [ ] **Step 2: Run them to verify they fail.**

Run: `pnpm test src/shared/crypto src/features/auth/application/rate-limits`
Expected: FAIL, missing modules.

- [ ] **Step 3: Write the implementation.**

`src/shared/crypto/sha256-hex/sha256-hex.ts`

```ts
/**
 * Hash a string with SHA-256 through Web Crypto, which Workers and Node 22 both provide.
 * @param value - the text to hash
 * @returns the lower-case hex digest
 */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
```

`src/features/auth/application/rate-limits/auth-rate-limits/auth-rate-limits.types.ts`

```ts
export type LimitedAction = "REGISTER" | "FORGOT_PASSWORD" | "RESEND_VERIFICATION";
```

`src/features/auth/application/rate-limits/auth-rate-limits/auth-rate-limits.ts`

```ts
import "server-only";

import type { NormalisedEmail } from "@/features/auth/domain/credentials/credentials.types";
import { sha256Hex } from "@/shared/crypto/sha256-hex/sha256-hex";

import type { RateLimiterPort, RateLimitRule } from "../../ports/rate-limiter/rate-limiter.port";
import type { LimitedAction } from "./auth-rate-limits.types";

const MINUTE = 60;
const HOUR = 60 * MINUTE;

/** A-6: failed logins per email and per IP; register/forgot/resend per email and per IP. */
export const AUTH_RATE_RULES = {
  LOGIN_FAILURE: { limit: 5, windowSeconds: 15 * MINUTE },
  PER_EMAIL: { limit: 3, windowSeconds: HOUR },
  PER_IP: { limit: 20, windowSeconds: HOUR },
} as const satisfies Record<string, RateLimitRule>;

// ADR-013: keys hash the email so the table never holds a raw address.
async function emailKey(scope: string, email: NormalisedEmail): Promise<string> {
  return `${scope}:email:${await sha256Hex(email)}`;
}

function ipKey(scope: string, ip: string): string {
  return `${scope}:ip:${ip}`;
}

/**
 * Count one register, forgot-password or resend attempt against both A-6 limits.
 * @param limiter - the rate limiter port
 * @param action - which limited action this is
 * @param email - the normalised email the action targets
 * @param ip - the client IP
 * @returns true when both the per-email and the per-IP limit still allow it
 */
export async function allowLimitedAction(
  limiter: RateLimiterPort,
  action: LimitedAction,
  email: NormalisedEmail,
  ip: string,
): Promise<boolean> {
  const [byEmail, byIp] = await Promise.all([
    limiter.hit(await emailKey(action, email), AUTH_RATE_RULES.PER_EMAIL),
    limiter.hit(ipKey(action, ip), AUTH_RATE_RULES.PER_IP),
  ]);
  return byEmail && byIp;
}

/**
 * Tell whether login is blocked by earlier failures for this email or this IP (A-6).
 * @param limiter - the rate limiter port
 * @param email - the normalised email being signed in
 * @param ip - the client IP
 * @returns true once either failure count has reached the limit
 */
export async function isLoginBlocked(
  limiter: RateLimiterPort,
  email: NormalisedEmail,
  ip: string,
): Promise<boolean> {
  const [byEmail, byIp] = await Promise.all([
    limiter.peek(await emailKey("LOGIN_FAILURE", email), AUTH_RATE_RULES.LOGIN_FAILURE),
    limiter.peek(ipKey("LOGIN_FAILURE", ip), AUTH_RATE_RULES.LOGIN_FAILURE),
  ]);
  return !(byEmail && byIp);
}

/**
 * Count one failed login for the email and for the IP; only failures count (A-6).
 * @param limiter - the rate limiter port
 * @param email - the normalised email that failed
 * @param ip - the client IP
 * @returns nothing
 */
export async function recordLoginFailure(
  limiter: RateLimiterPort,
  email: NormalisedEmail,
  ip: string,
): Promise<void> {
  await Promise.all([
    limiter.hit(await emailKey("LOGIN_FAILURE", email), AUTH_RATE_RULES.LOGIN_FAILURE),
    limiter.hit(ipKey("LOGIN_FAILURE", ip), AUTH_RATE_RULES.LOGIN_FAILURE),
  ]);
}
```

- [ ] **Step 4: Run them to verify they pass.**

Run: `pnpm test src/shared/crypto src/features/auth/application/rate-limits && pnpm lint`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit.**

```bash
git add src/shared/crypto src/features/auth/application/rate-limits tests/support/auth
git commit -m "feat(auth): enforce the A-6 limits through the rate limiter port"
```

## Task 10: Field schemas, auth paths and the pending-email seal

**Files:**
- `src/features/auth/application/schemas/auth-fields/auth-fields.schema.ts`
- `src/features/auth/application/policy/destination-path/destination-path.ts`
- `src/features/auth/application/pending-email/pending-email.{ts,test.ts}`

- [ ] **Step 1: Write the failing test** for the SPEC GAP-3 seal.

`src/features/auth/application/pending-email/pending-email.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { openPendingEmail, PENDING_EMAIL_TTL_SECONDS, sealPendingEmail } from "./pending-email";

const secret = "s".repeat(32);
const EMAIL = "owner@example.com";

describe("pending email seal (SPEC GAP-3)", () => {
  it("AC-AUTH-006 round-trips the email within its lifetime", async () => {
    const sealed = await sealPendingEmail(EMAIL, secret, 1_000);
    expect(await openPendingEmail(sealed, secret, 2_000)).toBe(EMAIL);
  });

  it("AC-AUTH-021 does not store the email as plain text", async () => {
    expect(await sealPendingEmail(EMAIL, secret, 1_000)).not.toContain(EMAIL);
  });

  it("AC-AUTH-006 refuses tampering, another secret, garbage and expiry", async () => {
    const sealed = await sealPendingEmail(EMAIL, secret, 1_000);
    const victim = await sealPendingEmail("victim@example.com", secret, 1_000);
    const forged = `${victim.split(".")[0] ?? ""}${sealed.slice(sealed.indexOf("."))}`;
    const expired = 1_000 + PENDING_EMAIL_TTL_SECONDS * 1000 + 1;
    expect(await openPendingEmail(forged, secret, 2_000)).toBeNull();
    expect(await openPendingEmail(sealed, "t".repeat(32), 2_000)).toBeNull();
    expect(await openPendingEmail("nonsense", secret, 2_000)).toBeNull();
    expect(await openPendingEmail(undefined, secret, 2_000)).toBeNull();
    expect(await openPendingEmail(sealed, secret, expired)).toBeNull();
  });
});
```

- [ ] **Step 2: Run it to verify it fails.**

Run: `pnpm test src/features/auth/application/pending-email`
Expected: FAIL, `Cannot find module './pending-email'`.

- [ ] **Step 3: Write the implementation.**

`src/features/auth/application/pending-email/pending-email.ts`

```ts
import "server-only";

/** SPEC GAP-3: how long the Verification pending screen can resend without a session. */
export const PENDING_EMAIL_TTL_SECONDS = 30 * 60;

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string): string {
  const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/"));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

async function sign(payload: string, secret: string): Promise<string> {
  const algorithm = { name: "HMAC", hash: "SHA-256" };
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), algorithm, false, [
    "sign",
  ]);
  return toBase64Url(
    new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload))),
  );
}

// Compares every character so the time taken doesn't reveal where a forged signature differs.
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function decodeEmail(encoded: string): string | null {
  try {
    return fromBase64Url(encoded);
  } catch {
    return null;
  }
}

/**
 * Seal the registered email into a signed, expiring cookie value (SPEC GAP-3). Base64url is
 * an encoding, not encryption: the HMAC stops forgery, and the cookie is httpOnly.
 * @param email - the normalised email that just registered
 * @param secret - the app secret (`BETTER_AUTH_SECRET`)
 * @param now - the current time in ms, for tests
 * @returns `email.expiry.signature`
 */
export async function sealPendingEmail(
  email: string,
  secret: string,
  now = Date.now(),
): Promise<string> {
  const payload = `${toBase64Url(encoder.encode(email))}.${String(now + PENDING_EMAIL_TTL_SECONDS * 1000)}`;
  return `${payload}.${await sign(payload, secret)}`;
}

/**
 * Open a sealed pending-email value, refusing forged, foreign, malformed or expired values.
 * @param value - the cookie value, if any
 * @param secret - the app secret used to seal it
 * @param now - the current time in ms, for tests
 * @returns the email, or null
 */
export async function openPendingEmail(
  value: string | undefined,
  secret: string,
  now = Date.now(),
): Promise<string | null> {
  const [email, expires, signature, ...rest] = value?.split(".") ?? [];
  if (!email || !expires || !signature || rest.length > 0) return null;
  if (!constantTimeEqual(signature, await sign(`${email}.${expires}`, secret))) return null;
  const expiry = Number(expires);
  if (!Number.isFinite(expiry) || expiry <= now) return null;
  return decodeEmail(email);
}
```

`src/features/auth/application/schemas/auth-fields/auth-fields.schema.ts`

```ts
import { z } from "zod";

import {
  DISPLAY_NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/features/auth/domain/credentials/credentials";

// Field schemas shared by the auth use-case schemas. Messages are FieldErrorKey values.
export const emailFieldSchema = z.string().trim().pipe(z.email("email.invalid"));

export const newPasswordFieldSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, "password.length")
  .max(PASSWORD_MAX_LENGTH, "password.length");

// Login and change-password: any non-empty value; a wrong-length password is simply wrong (A-5).
export const currentPasswordFieldSchema = z.string().min(1, "password.required");

export const displayNameFieldSchema = z
  .string()
  .trim()
  .min(1, "name.required")
  .max(DISPLAY_NAME_MAX_LENGTH, "name.tooLong");
```

`src/features/auth/application/policy/destination-path/destination-path.ts`

```ts
import "server-only";

import type { OwnerDestination } from "../../ports/workspace-destination/workspace-destination.port";

/** SPEC GAP-2: the F-02 routes for each owner destination. */
export const DESTINATION_PATH: Record<OwnerDestination, string> = {
  ONBOARDING: "/onboarding/workspace",
  WORKSPACE: "/workspace",
};

/** The auth screens that the access gate and the Google hand-off send people to. */
export const AUTH_PATH = {
  login: "/login",
  verify: "/verify",
  unavailable: "/account-unavailable",
  googleContinue: "/auth/continue",
} as const;
```

- [ ] **Step 4: Run it to verify it passes.**

Run: `pnpm test src/features/auth/application/pending-email && pnpm typecheck && pnpm lint`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit.**

```bash
git add src/features/auth/application/schemas src/features/auth/application/policy/destination-path src/features/auth/application/pending-email
git commit -m "feat(auth): add field schemas, auth paths and the pending-email seal"
```

## Task 11: Use-case fakes and the owner access policy

**Files:**
- Test support: `tests/support/auth/fake-auth-backend.ts`, `tests/support/auth/fake-auth-deps.ts`
- `src/features/auth/application/policy/owner-access/owner-access.{ts,types.ts,test.ts}`

`FakeAuthBackend` stands in for Better Auth and the account directory in use-case unit tests. It keeps the A-3 link semantics (latest link only, single use). The real adapters are covered by `tests/integration/auth`.

- [ ] **Step 1: Write the fakes and the failing test.**

`tests/support/auth/fake-auth-backend.ts`

```ts
import type { AccountDirectoryPort } from "@/features/auth/application/ports/account-directory/account-directory.port";
import type {
  AuthLink,
  AuthLinkKind,
} from "@/features/auth/application/ports/auth-email/auth-email.port";
import type {
  IdentityPort,
  SessionCookies,
} from "@/features/auth/application/ports/identity/identity.port";
import { asAuthUserId } from "@/features/auth/domain/account/account";
import type {
  AccountRecord,
  AccountStatus,
  AuthUserId,
} from "@/features/auth/domain/account/account.types";
import type { NormalisedEmail } from "@/features/auth/domain/credentials/credentials.types";

const COOKIE = "fake.session_token";
const BASE_URL = "http://localhost:3000";
const LINK_PATH: Record<AuthLinkKind, string> = {
  VERIFY_EMAIL: "/verify/confirm",
  RESET_PASSWORD: "/reset-password",
};

interface FakeUser {
  id: AuthUserId;
  name: string;
  email: NormalisedEmail;
  password: string | null;
  status: AccountStatus;
  emailVerified: boolean;
}

/**
 * In-memory stand-in for Better Auth plus the account directory, for use-case unit tests.
 * It keeps A-3 semantics (latest link only, single use); the real adapter is covered by
 * tests/integration/auth.
 */
export class FakeAuthBackend {
  readonly users = new Map<AuthUserId, FakeUser>();
  readonly sessions = new Map<string, AuthUserId>();
  private readonly latest = new Map<string, string>();

  constructor(private readonly onLink: (link: AuthLink) => void) {}

  readonly accounts: AccountDirectoryPort = {
    findByEmail: (email) => Promise.resolve(this.record(this.byEmail(email))),
    getById: (id) => Promise.resolve(this.record(this.users.get(id))),
    setStatusAndRevokeSessions: (id, status) => {
      this.mustGet(id).status = status;
      this.revoke(id);
      return Promise.resolve();
    },
    revokeAllSessions: (id) => {
      this.revoke(id);
      return Promise.resolve();
    },
    applyGoogleTakeoverGuard: (id) => {
      const user = this.mustGet(id);
      Object.assign(user, { emailVerified: true, password: null });
      this.revoke(id);
      return Promise.resolve();
    },
  };

  readonly identity: IdentityPort = {
    getSessionUserId: (headers) => Promise.resolve(this.sessionUser(headers)),
    createPasswordUser: ({ name, email, password }) => {
      if (this.byEmail(email)) return Promise.resolve({ created: false });
      const id = asAuthUserId(crypto.randomUUID());
      const user = { id, name, email, password, status: "ACTIVE", emailVerified: false } as const;
      this.users.set(id, { ...user });
      return Promise.resolve({ created: true });
    },
    sendVerificationLink: (email) => {
      const user = this.byEmail(email);
      if (user && !user.emailVerified) this.issue(user, "VERIFY_EMAIL");
      return Promise.resolve();
    },
    verifyEmail: (token) => {
      const user = this.consume("VERIFY_EMAIL", token);
      if (!user) return Promise.resolve({ ok: false });
      user.emailVerified = true;
      return Promise.resolve({ ok: true, userId: user.id, ...this.startSession(user.id) });
    },
    signInWithPassword: ({ email, password }) => {
      const user = this.byEmail(email);
      if (!user?.password || user.password !== password) return Promise.resolve({ ok: false });
      return Promise.resolve({ ok: true, userId: user.id, ...this.startSession(user.id) });
    },
    signOut: (headers) => {
      const token = this.token(headers);
      if (token) this.sessions.delete(token);
      return Promise.resolve({ setCookies: [`${COOKIE}=; Max-Age=0; Path=/`] });
    },
    sendResetLink: (email) => {
      const user = this.byEmail(email);
      if (user) this.issue(user, "RESET_PASSWORD");
      return Promise.resolve();
    },
    isResetLinkUsable: (token) => Promise.resolve(this.findLink("RESET_PASSWORD", token) !== null),
    resetPassword: ({ token, newPassword }) => {
      const user = this.consume("RESET_PASSWORD", token);
      if (!user) return Promise.resolve(false);
      user.password = newPassword;
      this.revoke(user.id);
      return Promise.resolve(true);
    },
    changePassword: ({ currentPassword, newPassword }, headers) => {
      const user = this.users.get(this.sessionUser(headers) ?? asAuthUserId("none"));
      if (user?.password !== currentPassword) return Promise.resolve({ ok: false });
      user.password = newPassword;
      const current = this.token(headers);
      for (const [token, id] of this.sessions) {
        if (id === user.id && token !== current) this.sessions.delete(token);
      }
      return Promise.resolve({ ok: true, setCookies: [] });
    },
    updateName: (name, headers) => {
      const user = this.users.get(this.sessionUser(headers) ?? asAuthUserId("none"));
      if (user) user.name = name;
      return Promise.resolve();
    },
    googleSignInUrl: ({ callbackURL }) =>
      Promise.resolve({
        url: `https://accounts.google.com/o/oauth2/v2/auth?redirect=${callbackURL}`,
        setCookies: ["fake.state=s; Path=/"],
      }),
  };

  seedUser(user: Omit<FakeUser, "id">): AuthUserId {
    const id = asAuthUserId(crypto.randomUUID());
    this.users.set(id, { ...user, id });
    return id;
  }

  signIn(id: AuthUserId): Headers {
    return FakeAuthBackend.headersFrom(this.startSession(id));
  }

  static headersFrom(cookies: SessionCookies): Headers {
    return new Headers({ cookie: cookies.setCookies.map((c) => c.split(";")[0]).join("; ") });
  }

  private startSession(id: AuthUserId): SessionCookies {
    const token = crypto.randomUUID();
    this.sessions.set(token, id);
    return { setCookies: [`${COOKIE}=${token}; Path=/; HttpOnly`] };
  }

  private issue(user: FakeUser, kind: AuthLinkKind): void {
    const token = crypto.randomUUID();
    this.latest.set(`${kind}:${user.id}`, token);
    const url = `${BASE_URL}${LINK_PATH[kind]}?token=${token}`;
    this.onLink({ kind, to: user.email, name: user.name, url });
  }

  private findLink(kind: AuthLinkKind, token: string): FakeUser | null {
    for (const user of this.users.values()) {
      if (this.latest.get(`${kind}:${user.id}`) === token) return user;
    }
    return null;
  }

  private consume(kind: AuthLinkKind, token: string): FakeUser | null {
    const user = this.findLink(kind, token);
    if (user) this.latest.delete(`${kind}:${user.id}`);
    return user;
  }

  private token(headers: Headers): string | undefined {
    const cookie = headers.get("cookie") ?? "";
    return cookie
      .split("; ")
      .find((part) => part.startsWith(`${COOKIE}=`))
      ?.slice(COOKIE.length + 1);
  }

  private sessionUser(headers: Headers): AuthUserId | null {
    const token = this.token(headers);
    return token === undefined ? null : (this.sessions.get(token) ?? null);
  }

  private revoke(id: AuthUserId): void {
    for (const [token, userId] of this.sessions) if (userId === id) this.sessions.delete(token);
  }

  private byEmail(email: NormalisedEmail): FakeUser | undefined {
    return [...this.users.values()].find((user) => user.email === email);
  }

  private mustGet(id: AuthUserId): FakeUser {
    const user = this.users.get(id);
    if (!user) throw new Error("fake: unknown user");
    return user;
  }

  private record(user: FakeUser | undefined): AccountRecord | null {
    if (!user) return null;
    const { password, ...rest } = user;
    return { ...rest, hasPassword: password !== null };
  }
}
```

`tests/support/auth/fake-auth-deps.ts`

```ts
import type { AuthDeps, RequestMeta } from "@/features/auth/application/auth-deps/auth-deps.types";
import { LinkOutbox } from "@/features/auth/application/link-outbox/link-outbox";
import type { OwnerDestination } from "@/features/auth/application/ports/workspace-destination/workspace-destination.port";

import { FakeAuthBackend } from "./fake-auth-backend";
import { InMemoryRateLimiter } from "./in-memory-rate-limiter";
import { RecordingEmailSender } from "./recording-email-sender";
import { uniqueIp } from "./unique";

export interface FakeAuth {
  deps: AuthDeps;
  backend: FakeAuthBackend;
  sender: RecordingEmailSender;
  /** Runs everything handed to `waitUntil`, like the Worker does after the response. */
  settle: () => Promise<void>;
}

/** Use-case dependencies over in-memory fakes; `destination` defaults to ONBOARDING. */
export function fakeAuthDeps(destination: OwnerDestination = "ONBOARDING"): FakeAuth {
  const sender = new RecordingEmailSender();
  const outbox = new LinkOutbox(sender, "test-request");
  const backend = new FakeAuthBackend((link) => {
    outbox.enqueue(link);
  });
  const background: Promise<unknown>[] = [];
  const deps: AuthDeps = {
    identity: backend.identity,
    accounts: backend.accounts,
    rateLimiter: new InMemoryRateLimiter(),
    outbox,
    destination: { resolve: () => Promise.resolve(destination) },
    waitUntil: (promise) => {
      background.push(promise);
    },
    requestId: "test-request",
  };
  const settle = async (): Promise<void> => {
    await Promise.allSettled(background.splice(0));
  };
  return { deps, backend, sender, settle };
}

/** Request metadata with a fresh IP, so rate-limit counters stay per test. */
export function meta(headers: Headers = new Headers()): RequestMeta {
  return { ip: uniqueIp(), headers };
}

/** The `token` query parameter of an emailed link. */
export function tokenFrom(url: string | undefined): string {
  if (!url) throw new Error("expected an emailed link");
  return new URL(url).searchParams.get("token") ?? "";
}
```

`src/features/auth/application/policy/owner-access/owner-access.test.ts`

```ts
import { PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import type { AccountStatus } from "@/features/auth/domain/account/account.types";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { requireOwner, resolveOwnerAccess } from "./owner-access";

function session(status: AccountStatus, emailVerified: boolean) {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  const seed = { name: "Alya", email, password: PASSWORD, status, emailVerified };
  const userId = fake.backend.seedUser(seed);
  return { ...fake, userId, headers: fake.backend.signIn(userId) };
}

describe("owner access policy", () => {
  it("AC-AUTH-007 returns the account for a verified active session", async () => {
    const { deps, userId, headers } = session("ACTIVE", true);
    await expect(requireOwner(deps, headers)).resolves.toMatchObject({ id: userId });
  });

  it("AC-AUTH-014 refuses a request without a session", async () => {
    const { deps } = session("ACTIVE", true);
    await expect(requireOwner(deps, new Headers())).rejects.toMatchObject({
      code: "AUTH_REQUIRED",
    });
    expect((await resolveOwnerAccess(deps, new Headers())).decision).toBe("ANONYMOUS");
  });

  it("AC-AUTH-009 BR-AUTH-003 refuses an unverified session", async () => {
    const { deps, headers } = session("ACTIVE", false);
    await expect(requireOwner(deps, headers)).rejects.toMatchObject({ code: "EMAIL_UNVERIFIED" });
  });

  it("AC-AUTH-014 refuses a surviving session once the status is no longer ACTIVE", async () => {
    const { deps, backend, userId, headers } = session("ACTIVE", true);
    const user = backend.users.get(userId);
    if (!user) throw new Error("expected the seeded user");
    // Changed without revoking, to prove the per-request check (not revocation) blocks access.
    user.status = "SUSPENDED";
    await expect(requireOwner(deps, headers)).rejects.toMatchObject({
      code: "ACCOUNT_UNAVAILABLE",
    });
  });
});
```

- [ ] **Step 2: Run it to verify it fails.**

Run: `pnpm test src/features/auth/application/policy`
Expected: FAIL, `Cannot find module './owner-access'`.

- [ ] **Step 3: Write the policy.**

`src/features/auth/application/policy/owner-access/owner-access.types.ts`

```ts
import type { AccessDecision, AccountRecord } from "@/features/auth/domain/account/account.types";

import type { AuthDeps } from "../../auth-deps/auth-deps.types";

export type OwnerAccessDeps = Pick<AuthDeps, "identity" | "accounts">;

export interface OwnerAccess {
  decision: AccessDecision;
  account: AccountRecord | null;
}
```

`src/features/auth/application/policy/owner-access/owner-access.ts`

```ts
import "server-only";

import { accessDecision } from "@/features/auth/domain/account/account";
import type { AccountRecord } from "@/features/auth/domain/account/account.types";

import { AuthError } from "../../errors/auth-errors/auth-errors";
import type { OwnerAccess, OwnerAccessDeps } from "./owner-access.types";

/**
 * Read the session and its account from the database on every call. The cookie cache is off,
 * so a status change blocks even sessions that were never revoked (AC-AUTH-014).
 * @param deps - the identity and account ports
 * @param headers - the request headers carrying the session cookie
 * @returns the access decision and the account, if any
 */
export async function resolveOwnerAccess(
  deps: OwnerAccessDeps,
  headers: Headers,
): Promise<OwnerAccess> {
  const userId = await deps.identity.getSessionUserId(headers);
  const account = userId ? await deps.accounts.getById(userId) : null;
  return { decision: accessDecision(account), account };
}

/**
 * The gate for every owner page, action and route (C-004): an active, verified session.
 * @param deps - the identity and account ports
 * @param headers - the request headers carrying the session cookie
 * @returns the owner's account; throws `AuthError` `AUTH_REQUIRED`, `EMAIL_UNVERIFIED` or
 *   `ACCOUNT_UNAVAILABLE` otherwise
 */
export async function requireOwner(
  deps: OwnerAccessDeps,
  headers: Headers,
): Promise<AccountRecord> {
  const { decision, account } = await resolveOwnerAccess(deps, headers);
  if (decision === "OWNER" && account) return account;
  if (decision === "RESTRICTED") throw new AuthError("EMAIL_UNVERIFIED");
  if (decision === "UNAVAILABLE") throw new AuthError("ACCOUNT_UNAVAILABLE");
  throw new AuthError("AUTH_REQUIRED");
}
```

- [ ] **Step 4: Run it to verify it passes.**

Run: `pnpm test src/features/auth/application/policy && pnpm lint`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit.**

```bash
git add tests/support/auth src/features/auth/application/policy/owner-access
git commit -m "feat(auth): add the owner access policy and use-case fakes"
```

---

# Iteration 3 — Use cases

Every use case lives in its own folder: `x.ts`, plus `x.schema.ts` when it takes input, `x.types.ts` and `x.test.ts`. The use case parses its own input: the application layer validates, and the action just passes values through (C-004, architecture overview). Its unit tests run over `fakeAuthDeps()`.

## Task 12: `continueAfterSignIn` and `setOwnerStatus`

**Files:** `src/features/auth/application/use-cases/{continue-after-sign-in,set-owner-status}/*`

- [ ] **Step 1: Write the failing tests.**

`src/features/auth/application/use-cases/continue-after-sign-in/continue-after-sign-in.test.ts`

```ts
import { PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import type { AccountStatus } from "@/features/auth/domain/account/account.types";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { continueAfterSignIn } from "./continue-after-sign-in";

function owner(status: AccountStatus, emailVerified: boolean, destination?: "WORKSPACE") {
  const fake = fakeAuthDeps(destination);
  const email = normaliseEmail(uniqueEmail());
  const seed = { name: "Alya", email, password: PASSWORD, status, emailVerified };
  const userId = fake.backend.seedUser(seed);
  fake.backend.signIn(userId);
  return { ...fake, userId };
}

describe("continueAfterSignIn", () => {
  it("AC-AUTH-004 BR-AUTH-004 sends a verified owner without a workspace to onboarding", async () => {
    const { deps, userId } = owner("ACTIVE", true);
    expect(await continueAfterSignIn(deps, userId)).toEqual({
      kind: "OWNER",
      path: "/onboarding/workspace",
    });
  });

  it("AC-AUTH-007 sends an owner with a workspace to it", async () => {
    const { deps, userId } = owner("ACTIVE", true, "WORKSPACE");
    expect(await continueAfterSignIn(deps, userId)).toEqual({ kind: "OWNER", path: "/workspace" });
  });

  it("AC-AUTH-009 confines an unverified owner to /verify", async () => {
    const { deps, userId } = owner("ACTIVE", false);
    expect(await continueAfterSignIn(deps, userId)).toEqual({
      kind: "RESTRICTED",
      path: "/verify",
    });
  });

  it("AC-AUTH-013 revokes every session of a non-active owner", async () => {
    const { deps, backend, userId } = owner("SUSPENDED", true);
    expect(await continueAfterSignIn(deps, userId)).toEqual({
      kind: "UNAVAILABLE",
      path: "/account-unavailable",
    });
    expect(backend.sessions.size).toBe(0);
  });
});
```

`src/features/auth/application/use-cases/set-owner-status/set-owner-status.test.ts`

```ts
import { PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { setOwnerStatus } from "./set-owner-status";

function seeded() {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  const userId = fake.backend.seedUser({
    name: "Alya",
    email,
    password: PASSWORD,
    status: "ACTIVE",
    emailVerified: true,
  });
  return { fake, email, userId };
}

describe("setOwnerStatus", () => {
  it("AC-AUTH-015 changes the status and revokes every session", async () => {
    const { fake, email, userId } = seeded();
    fake.backend.signIn(userId);
    fake.backend.signIn(userId);
    const result = await setOwnerStatus(fake.deps, { email, status: "SUSPENDED" });
    expect(result).toEqual({ ok: true, userId });
    expect(fake.backend.sessions.size).toBe(0);
    expect((await fake.deps.accounts.getById(userId))?.status).toBe("SUSPENDED");
  });

  it("AC-AUTH-015 setting ACTIVE again restores access", async () => {
    const { fake, email, userId } = seeded();
    await setOwnerStatus(fake.deps, { email, status: "DISABLED" });
    await setOwnerStatus(fake.deps, { email, status: "ACTIVE" });
    expect((await fake.deps.accounts.getById(userId))?.status).toBe("ACTIVE");
  });

  it("AC-AUTH-015 refuses an unknown status and an unknown email", async () => {
    const { fake } = seeded();
    expect(await setOwnerStatus(fake.deps, { email: uniqueEmail(), status: "ACTIVE" })).toEqual({
      ok: false,
      reason: "NOT_FOUND",
    });
    expect(await setOwnerStatus(fake.deps, { email: uniqueEmail(), status: "BANNED" })).toEqual({
      ok: false,
      reason: "UNKNOWN_STATUS",
    });
  });
});
```

- [ ] **Step 2: Run them to verify they fail.**

Run: `pnpm test src/features/auth/application/use-cases`
Expected: FAIL, missing modules.

- [ ] **Step 3: Write the use cases.**

`src/features/auth/application/use-cases/continue-after-sign-in/continue-after-sign-in.types.ts`

```ts
import type { AuthDeps } from "../../auth-deps/auth-deps.types";

export type SignInOutcome =
  | { kind: "OWNER"; path: string }
  | { kind: "RESTRICTED"; path: "/verify" }
  | { kind: "UNAVAILABLE"; path: "/account-unavailable" };

export type ContinueDeps = Pick<AuthDeps, "accounts" | "destination" | "requestId">;
```

`src/features/auth/application/use-cases/continue-after-sign-in/continue-after-sign-in.ts`

```ts
import "server-only";

import { accessDecision } from "@/features/auth/domain/account/account";
import type { AuthUserId } from "@/features/auth/domain/account/account.types";

import { authLog } from "../../logging/auth-log/auth-log";
import { AUTH_PATH, DESTINATION_PATH } from "../../policy/destination-path/destination-path";
import type { ContinueDeps, SignInOutcome } from "./continue-after-sign-in.types";

/**
 * Decide where a new session goes, after every way of signing in (password, verification link,
 * Google). A non-active owner keeps no session (BR-AUTH-005, AC-AUTH-013/031).
 * @param deps - the account directory, the F-02 destination port and a request ID
 * @param userId - the user the session belongs to
 * @returns the F-02 destination, `/verify` or `/account-unavailable`
 */
export async function continueAfterSignIn(
  deps: ContinueDeps,
  userId: AuthUserId,
): Promise<SignInOutcome> {
  const decision = accessDecision(await deps.accounts.getById(userId));
  if (decision === "OWNER") {
    return { kind: "OWNER", path: DESTINATION_PATH[await deps.destination.resolve(userId)] };
  }
  if (decision === "RESTRICTED") return { kind: "RESTRICTED", path: AUTH_PATH.verify };
  await deps.accounts.revokeAllSessions(userId);
  const event = { operation: "access-gate", outcome: "UNAVAILABLE", userId } as const;
  authLog({ ...event, requestId: deps.requestId }, "warn");
  return { kind: "UNAVAILABLE", path: AUTH_PATH.unavailable };
}
```

`src/features/auth/application/use-cases/set-owner-status/set-owner-status.types.ts`

```ts
import type { AuthUserId } from "@/features/auth/domain/account/account.types";

import type { AuthDeps } from "../../auth-deps/auth-deps.types";

export interface SetOwnerStatusInput {
  email: string;
  status: string;
}

export type SetOwnerStatusDeps = Pick<AuthDeps, "accounts" | "requestId">;

export type SetOwnerStatusResult =
  { ok: true; userId: AuthUserId } | { ok: false; reason: "UNKNOWN_STATUS" | "NOT_FOUND" };
```

`src/features/auth/application/use-cases/set-owner-status/set-owner-status.ts`

```ts
import "server-only";

import { isAccountStatus } from "@/features/auth/domain/account/account";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { authLog } from "../../logging/auth-log/auth-log";
import type {
  SetOwnerStatusDeps,
  SetOwnerStatusInput,
  SetOwnerStatusResult,
} from "./set-owner-status.types";

/**
 * Operator-only status change (BR-AUTH-005): set the status and revoke every session in one
 * transaction. There is no in-app caller; `scripts/set-user-status.ts` runs it.
 * @param deps - the account directory and a request ID for the log
 * @param input - the owner's email and the new status
 * @returns the changed user, or why nothing changed
 */
export async function setOwnerStatus(
  deps: SetOwnerStatusDeps,
  input: SetOwnerStatusInput,
): Promise<SetOwnerStatusResult> {
  if (!isAccountStatus(input.status)) return { ok: false, reason: "UNKNOWN_STATUS" };
  const found = await deps.accounts.findByEmail(normaliseEmail(input.email));
  if (!found) return { ok: false, reason: "NOT_FOUND" };
  await deps.accounts.setStatusAndRevokeSessions(found.id, input.status);
  const event = { operation: "operator-status", outcome: input.status, userId: found.id } as const;
  authLog({ ...event, requestId: deps.requestId }, "warn");
  return { ok: true, userId: found.id };
}
```

- [ ] **Step 4: Run them to verify they pass.**

Run: `pnpm test src/features/auth/application/use-cases && pnpm lint`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit.**

```bash
git add src/features/auth/application/use-cases
git commit -m "feat(auth): add the post-sign-in access gate and the operator status change"
```

## Task 13: `registerOwner` and `resendVerification`

**Files:** `src/features/auth/application/use-cases/{register-owner,resend-verification}/*`

- [ ] **Step 1: Write the failing tests.**

`src/features/auth/application/use-cases/register-owner/register-owner.test.ts`

```ts
import { PASSWORD, WRONG_PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps, meta, tokenFrom } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { registerOwner } from "./register-owner";

const values = (email: string, password = PASSWORD) => ({ name: "Alya", email, password });

describe("registerOwner", () => {
  it("AC-AUTH-001 creates one ACTIVE unverified identity and emails a verification link", async () => {
    const { deps, sender, settle } = fakeAuthDeps();
    const email = uniqueEmail();
    expect(await registerOwner(deps, values(`  ${email.toUpperCase()} `), meta())).toEqual({
      ok: true,
      email,
    });
    await settle();
    expect(await deps.accounts.findByEmail(normaliseEmail(email))).toMatchObject({
      status: "ACTIVE",
      emailVerified: false,
      hasPassword: true,
    });
    expect(sender.linksTo(email, "VERIFY_EMAIL")).toHaveLength(1);
  });

  it.each([
    [{ name: "", email: "a@b.co", password: PASSWORD }, { name: "name.required" }],
    [{ name: "A", email: "not-an-email", password: PASSWORD }, { email: "email.invalid" }],
    [{ name: "A", email: "a@b.co", password: "short" }, { password: "password.length" }],
    [{ name: "A", email: "a@b.co", password: "x".repeat(129) }, { password: "password.length" }],
  ])("AC-AUTH-002 rejects invalid input on the server: %o", async (bad, fieldErrors) => {
    const { deps, backend } = fakeAuthDeps();
    expect(await registerOwner(deps, bad, meta())).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors,
    });
    expect(backend.users.size).toBe(0);
  });

  it("AC-AUTH-003 an existing unverified email gets the same answer and a fresh link", async () => {
    const { deps, sender, settle } = fakeAuthDeps();
    const email = uniqueEmail();
    await registerOwner(deps, values(email), meta());
    expect(await registerOwner(deps, values(email, WRONG_PASSWORD), meta())).toEqual({
      ok: true,
      email,
    });
    await settle();
    expect(sender.linksTo(email, "VERIFY_EMAIL")).toHaveLength(2);
    const credentials = { email: normaliseEmail(email), password: PASSWORD };
    expect((await deps.identity.signInWithPassword(credentials, new Headers())).ok).toBe(true);
  });

  it("AC-AUTH-003 an existing verified email gets the same answer and no email", async () => {
    const { deps, sender, settle } = fakeAuthDeps();
    const email = uniqueEmail();
    await registerOwner(deps, values(email), meta());
    await settle();
    await deps.identity.verifyEmail(tokenFrom(sender.lastUrl(email, "VERIFY_EMAIL")));
    expect(await registerOwner(deps, values(email), meta())).toEqual({ ok: true, email });
    await settle();
    expect(sender.linksTo(email, "VERIFY_EMAIL")).toHaveLength(1);
  });

  it("AC-AUTH-010 refuses the 4th registration for one email within an hour (A-6)", async () => {
    const { deps } = fakeAuthDeps();
    const email = uniqueEmail();
    for (let i = 0; i < 3; i++) await registerOwner(deps, values(email), meta());
    expect(await registerOwner(deps, values(email), meta())).toEqual({
      ok: false,
      code: "RATE_LIMITED",
    });
  });

  it("AC-AUTH-022 a provider failure still records the account and answers the same", async () => {
    const { deps, sender, settle } = fakeAuthDeps();
    sender.failing = true;
    const email = uniqueEmail();
    expect(await registerOwner(deps, values(email), meta())).toEqual({ ok: true, email });
    await settle();
    expect(await deps.accounts.findByEmail(normaliseEmail(email))).not.toBeNull();
  });
});
```

`src/features/auth/application/use-cases/resend-verification/resend-verification.test.ts`

```ts
import { PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps, meta, tokenFrom } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { registerOwner } from "../register-owner/register-owner";
import { resendVerification } from "./resend-verification";

async function pendingOwner() {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  await registerOwner(fake.deps, { name: "Alya", email, password: PASSWORD }, meta());
  await fake.settle();
  return { ...fake, email };
}

describe("resendVerification", () => {
  it("AC-AUTH-006 sends a new link and the previous one stops working", async () => {
    const { deps, sender, email } = await pendingOwner();
    const first = tokenFrom(sender.lastUrl(email, "VERIFY_EMAIL"));
    expect(await resendVerification(deps, { email }, meta())).toEqual({ ok: true });
    const second = tokenFrom(sender.lastUrl(email, "VERIFY_EMAIL"));
    expect(second).not.toBe(first);
    expect((await deps.identity.verifyEmail(first)).ok).toBe(false);
    expect((await deps.identity.verifyEmail(second)).ok).toBe(true);
  });

  it("AC-AUTH-006 refuses after 3 resends per hour (A-6)", async () => {
    const { deps, email } = await pendingOwner();
    for (let i = 0; i < 3; i++) await resendVerification(deps, { email }, meta());
    expect(await resendVerification(deps, { email }, meta())).toEqual({
      ok: false,
      code: "RATE_LIMITED",
    });
  });

  it("AC-AUTH-003 answers ok for an already verified email and sends nothing", async () => {
    const { deps, sender, email } = await pendingOwner();
    await deps.identity.verifyEmail(tokenFrom(sender.lastUrl(email, "VERIFY_EMAIL")));
    const before = sender.sent.length;
    expect(await resendVerification(deps, { email }, meta())).toEqual({ ok: true });
    expect(sender.sent).toHaveLength(before);
  });

  it("AC-AUTH-022 surfaces a retryable delivery failure (SPEC GAP-4)", async () => {
    const { deps, sender, email } = await pendingOwner();
    sender.failing = true;
    expect(await resendVerification(deps, { email }, meta())).toEqual({
      ok: false,
      code: "EMAIL_DELIVERY_FAILED",
    });
  });
});
```

- [ ] **Step 2: Run them to verify they fail.**

Run: `pnpm test src/features/auth/application/use-cases/register-owner src/features/auth/application/use-cases/resend-verification`
Expected: FAIL, missing modules.

- [ ] **Step 3: Write the use cases.**

`src/features/auth/application/use-cases/register-owner/register-owner.schema.ts`

```ts
import { z } from "zod";

import {
  displayNameFieldSchema,
  emailFieldSchema,
  newPasswordFieldSchema,
} from "../../schemas/auth-fields/auth-fields.schema";

// Shared by the Register form (UX) and the use case (authority, C-004).
export const registerOwnerSchema = z.object({
  name: displayNameFieldSchema,
  email: emailFieldSchema,
  password: newPasswordFieldSchema,
});
```

`src/features/auth/application/use-cases/register-owner/register-owner.types.ts`

```ts
import type { z } from "zod";

import type { NormalisedEmail } from "@/features/auth/domain/credentials/credentials.types";

import type { AuthResult } from "../../errors/auth-errors/auth-errors.types";
import type { registerOwnerSchema } from "./register-owner.schema";

export type RegisterOwnerInput = z.input<typeof registerOwnerSchema>;

export interface PendingRegistration {
  email: NormalisedEmail;
}

export type RegisterOwnerResult = AuthResult<PendingRegistration>;
```

`src/features/auth/application/use-cases/register-owner/register-owner.ts`

```ts
import "server-only";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import type { AuthDeps, RequestMeta } from "../../auth-deps/auth-deps.types";
import { failure, validationFailure } from "../../errors/auth-errors/auth-errors";
import { authLog } from "../../logging/auth-log/auth-log";
import { allowLimitedAction } from "../../rate-limits/auth-rate-limits/auth-rate-limits";
import { registerOwnerSchema } from "./register-owner.schema";
import type { RegisterOwnerResult } from "./register-owner.types";

/**
 * Register an Owner without revealing whether the email already exists (A-5). New,
 * existing-unverified and existing-verified emails make the same calls and get the same answer;
 * the identity adapter only creates or emails where the account's state allows it.
 * @param deps - the per-request auth ports
 * @param input - the untrusted form values
 * @param meta - the client IP and headers
 * @returns `{ ok, email }` (always the same), a validation failure, or `RATE_LIMITED`
 */
export async function registerOwner(
  deps: AuthDeps,
  input: unknown,
  meta: RequestMeta,
): Promise<RegisterOwnerResult> {
  const parsed = registerOwnerSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const email = normaliseEmail(parsed.data.email);
  const log = { operation: "register", requestId: deps.requestId } as const;

  if (!(await allowLimitedAction(deps.rateLimiter, "REGISTER", email, meta.ip))) {
    authLog({ ...log, outcome: "RATE_LIMITED" }, "warn");
    return failure("RATE_LIMITED");
  }
  const { name, password } = parsed.data;
  await deps.identity.createPasswordUser({ name, email, password });
  await deps.identity.sendVerificationLink(email);
  // ADR-011: the send happens after the response, so timing can't reveal the account state.
  deps.outbox.flushInBackground(deps.waitUntil);
  authLog({ ...log, outcome: "PENDING" });
  return { ok: true, email };
}
```

`src/features/auth/application/use-cases/resend-verification/resend-verification.types.ts`

```ts
import type { NormalisedEmail } from "@/features/auth/domain/credentials/credentials.types";

import type { AuthResult } from "../../errors/auth-errors/auth-errors.types";

/** The email to resend to, taken from the session or the pending-email cookie, never input. */
export interface ResendSubject {
  email: NormalisedEmail;
}

export type ResendVerificationResult = AuthResult;
```

`src/features/auth/application/use-cases/resend-verification/resend-verification.ts`

```ts
import "server-only";

import type { AuthDeps, RequestMeta } from "../../auth-deps/auth-deps.types";
import { failure } from "../../errors/auth-errors/auth-errors";
import { authLog } from "../../logging/auth-log/auth-log";
import { allowLimitedAction } from "../../rate-limits/auth-rate-limits/auth-rate-limits";
import type { ResendSubject, ResendVerificationResult } from "./resend-verification.types";

/**
 * Send a fresh verification link that supersedes the older ones (AC-AUTH-006). Delivery is
 * awaited here, so a provider failure can be shown and retried (SPEC GAP-4, AC-AUTH-022).
 * @param deps - the per-request auth ports
 * @param subject - the email from the restricted session or the pending-email cookie
 * @param meta - the client IP and headers
 * @returns ok, `RATE_LIMITED` or `EMAIL_DELIVERY_FAILED`
 */
export async function resendVerification(
  deps: AuthDeps,
  subject: ResendSubject,
  meta: RequestMeta,
): Promise<ResendVerificationResult> {
  const log = { operation: "resend-verification", requestId: deps.requestId } as const;
  if (
    !(await allowLimitedAction(deps.rateLimiter, "RESEND_VERIFICATION", subject.email, meta.ip))
  ) {
    authLog({ ...log, outcome: "RATE_LIMITED" }, "warn");
    return failure("RATE_LIMITED");
  }
  await deps.identity.sendVerificationLink(subject.email);
  // A verified account gets no link, and the same answer (A-5).
  if (deps.outbox.pendingCount === 0) return { ok: true };
  const delivery = await deps.outbox.flush();
  authLog({ ...log, outcome: delivery });
  return delivery === "SENT" ? { ok: true } : failure("EMAIL_DELIVERY_FAILED");
}
```

- [ ] **Step 4: Run them to verify they pass.**

Run: `pnpm test src/features/auth/application/use-cases && pnpm lint`
Expected: PASS (all use-case tests so far: 20).

- [ ] **Step 5: Commit.**

```bash
git add src/features/auth/application/use-cases/register-owner src/features/auth/application/use-cases/resend-verification
git commit -m "feat(auth): register owners without revealing existing accounts"
```

## Task 14: `verifyEmail`

**Files:** `src/features/auth/application/use-cases/verify-email/*`

- [ ] **Step 1: Write the failing test.**

`src/features/auth/application/use-cases/verify-email/verify-email.test.ts`

```ts
import { PASSWORD } from "@tests/support/auth/credentials";
import { FakeAuthBackend } from "@tests/support/auth/fake-auth-backend";
import { fakeAuthDeps, meta, tokenFrom } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { registerOwner } from "../register-owner/register-owner";
import { verifyEmail } from "./verify-email";

async function pendingLink() {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  await registerOwner(fake.deps, { name: "Alya", email, password: PASSWORD }, meta());
  await fake.settle();
  return { ...fake, email, token: tokenFrom(fake.sender.lastUrl(email, "VERIFY_EMAIL")) };
}

describe("verifyEmail", () => {
  it("AC-AUTH-004 verifies, signs in and hands off to first-workspace creation", async () => {
    const { deps, email, token } = await pendingLink();
    const result = await verifyEmail(deps, token);
    if (!result.ok) throw new Error("expected success");
    expect(result.outcome).toEqual({ kind: "OWNER", path: "/onboarding/workspace" });
    expect((await deps.accounts.findByEmail(email))?.emailVerified).toBe(true);
    const headers = FakeAuthBackend.headersFrom(result);
    expect(await deps.identity.getSessionUserId(headers)).not.toBeNull();
  });

  it("AC-AUTH-005 refuses a superseded, tampered or empty link without verifying", async () => {
    const { deps, settle, email, token } = await pendingLink();
    await deps.identity.sendVerificationLink(email);
    await settle();
    const invalid = { ok: false, code: "INVALID_LINK" };
    expect(await verifyEmail(deps, token)).toEqual(invalid);
    expect(await verifyEmail(deps, `${token}x`)).toEqual(invalid);
    expect(await verifyEmail(deps, "")).toEqual(invalid);
    expect((await deps.accounts.findByEmail(email))?.emailVerified).toBe(false);
  });

  it("AC-AUTH-005 a link works only once", async () => {
    const { deps, token } = await pendingLink();
    expect((await verifyEmail(deps, token)).ok).toBe(true);
    expect(await verifyEmail(deps, token)).toEqual({ ok: false, code: "INVALID_LINK" });
  });

  it("AC-AUTH-013 a suspended owner who verifies gets no session", async () => {
    const { deps, backend, email, token } = await pendingLink();
    const account = await deps.accounts.findByEmail(email);
    if (!account) throw new Error("expected the registered account");
    await deps.accounts.setStatusAndRevokeSessions(account.id, "SUSPENDED");
    expect(await verifyEmail(deps, token)).toMatchObject({
      ok: true,
      outcome: { kind: "UNAVAILABLE" },
      setCookies: [],
    });
    expect(backend.sessions.size).toBe(0);
  });
});
```

- [ ] **Step 2: Run it to verify it fails.**

Run: `pnpm test src/features/auth/application/use-cases/verify-email`
Expected: FAIL, `Cannot find module './verify-email'`.

- [ ] **Step 3: Write the use case.**

`src/features/auth/application/use-cases/verify-email/verify-email.types.ts`

```ts
import type { AuthResult } from "../../errors/auth-errors/auth-errors.types";
import type { SessionCookies } from "../../ports/identity/identity.port";
import type { SignInOutcome } from "../continue-after-sign-in/continue-after-sign-in.types";

export interface VerifiedSession extends SessionCookies {
  outcome: SignInOutcome;
}

export type VerifyEmailResult = AuthResult<VerifiedSession>;
```

`src/features/auth/application/use-cases/verify-email/verify-email.ts`

```ts
import "server-only";

import type { AuthDeps } from "../../auth-deps/auth-deps.types";
import { failure } from "../../errors/auth-errors/auth-errors";
import { authLog } from "../../logging/auth-log/auth-log";
import { continueAfterSignIn } from "../continue-after-sign-in/continue-after-sign-in";
import type { VerifyEmailResult } from "./verify-email.types";

/**
 * Consume a verification link: only the latest, unused, unexpired one works (A-3). A valid link
 * verifies the email and signs the owner in (A-7), then the access gate decides where they go.
 * @param deps - the per-request auth ports
 * @param token - the `token` from the emailed link
 * @returns the outcome and session cookies, or `INVALID_LINK`
 */
export async function verifyEmail(deps: AuthDeps, token: string): Promise<VerifyEmailResult> {
  const log = { operation: "verify-email", requestId: deps.requestId } as const;
  const verified = token ? await deps.identity.verifyEmail(token) : { ok: false as const };
  if (!verified.ok) {
    authLog({ ...log, outcome: "INVALID_LINK" });
    return failure("INVALID_LINK");
  }
  const outcome = await continueAfterSignIn(deps, verified.userId);
  authLog({ ...log, outcome: outcome.kind, userId: verified.userId });
  const setCookies = outcome.kind === "UNAVAILABLE" ? [] : verified.setCookies;
  return { ok: true, outcome, setCookies };
}
```

- [ ] **Step 4: Run it to verify it passes.**

Run: `pnpm test src/features/auth/application/use-cases/verify-email && pnpm lint`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit.**

```bash
git add src/features/auth/application/use-cases/verify-email
git commit -m "feat(auth): verify email links once and hand off to the workspace destination"
```

## Task 15: `loginOwner` and `logoutOwner`

**Files:** `src/features/auth/application/use-cases/{login-owner,logout-owner}/*`

- [ ] **Step 1: Write the failing tests.**

`src/features/auth/application/use-cases/login-owner/login-owner.test.ts`

```ts
import { PASSWORD, WRONG_PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps, meta } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail, uniqueIp } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import type { AccountStatus } from "@/features/auth/domain/account/account.types";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { loginOwner } from "./login-owner";

function owner(status: AccountStatus = "ACTIVE", emailVerified = true, password = PASSWORD) {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  const userId = fake.backend.seedUser({ name: "Alya", email, password, status, emailVerified });
  return { ...fake, email, userId };
}

describe("loginOwner", () => {
  it("AC-AUTH-007 a verified active owner gets a session and the workspace hand-off", async () => {
    const { deps, email } = owner();
    expect(await loginOwner(deps, { email, password: PASSWORD }, meta())).toMatchObject({
      ok: true,
      outcome: { kind: "OWNER", path: "/onboarding/workspace" },
    });
  });

  it("AC-AUTH-008 unknown email and wrong password give the same generic failure", async () => {
    const { deps, email } = owner();
    const unknown = await loginOwner(deps, { email: uniqueEmail(), password: PASSWORD }, meta());
    const wrong = await loginOwner(deps, { email, password: WRONG_PASSWORD }, meta());
    expect(unknown).toEqual({ ok: false, code: "INVALID_CREDENTIALS" });
    expect(wrong).toEqual(unknown);
  });

  it("AC-AUTH-002 validates input on the server", async () => {
    const { deps } = owner();
    expect(await loginOwner(deps, { email: "nope", password: "" }, meta())).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { email: "email.invalid", password: "password.required" },
    });
  });

  it("AC-AUTH-009 an unverified owner gets a restricted session pointed at /verify", async () => {
    const { deps, email } = owner("ACTIVE", false);
    expect(await loginOwner(deps, { email, password: PASSWORD }, meta())).toMatchObject({
      ok: true,
      outcome: { kind: "RESTRICTED", path: "/verify" },
    });
  });

  it("AC-AUTH-010 after 5 failures the correct password is refused too", async () => {
    const { deps, email } = owner();
    const ip = uniqueIp();
    const from = { ip, headers: new Headers() };
    for (let i = 0; i < 5; i++) await loginOwner(deps, { email, password: WRONG_PASSWORD }, from);
    expect(await loginOwner(deps, { email, password: PASSWORD }, meta())).toEqual({
      ok: false,
      code: "RATE_LIMITED",
    });
  });

  it.each(["SUSPENDED", "DISABLED"] as const)(
    "AC-AUTH-013 a %s owner gets no session",
    async (status) => {
      const { deps, backend, email } = owner(status);
      expect(await loginOwner(deps, { email, password: PASSWORD }, meta())).toEqual({
        ok: false,
        code: "ACCOUNT_UNAVAILABLE",
      });
      expect(backend.sessions.size).toBe(0);
    },
  );

  it("AC-AUTH-030 a Google-only account gets the generic password-login error", async () => {
    const fake = fakeAuthDeps();
    const email = normaliseEmail(uniqueEmail("google"));
    const seed = { name: "Alya", email, password: null, status: "ACTIVE", emailVerified: true };
    fake.backend.seedUser({ ...seed, status: "ACTIVE" });
    expect(await loginOwner(fake.deps, { email, password: PASSWORD }, meta())).toEqual({
      ok: false,
      code: "INVALID_CREDENTIALS",
    });
  });
});
```

`src/features/auth/application/use-cases/logout-owner/logout-owner.test.ts`

```ts
import { fakeAuthDeps } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { logoutOwner } from "./logout-owner";

describe("logoutOwner", () => {
  it("AC-AUTH-012 ends only the current session", async () => {
    const { deps, backend } = fakeAuthDeps();
    const email = normaliseEmail(uniqueEmail());
    const seed = { name: "Alya", email, password: "p", status: "ACTIVE", emailVerified: true };
    const userId = backend.seedUser({ ...seed, status: "ACTIVE" });
    const deviceA = backend.signIn(userId);
    const deviceB = backend.signIn(userId);
    await logoutOwner(deps, deviceA);
    expect(await deps.identity.getSessionUserId(deviceA)).toBeNull();
    expect(await deps.identity.getSessionUserId(deviceB)).toBe(userId);
  });
});
```

- [ ] **Step 2: Run them to verify they fail.**

Run: `pnpm test src/features/auth/application/use-cases/login-owner src/features/auth/application/use-cases/logout-owner`
Expected: FAIL, missing modules.

- [ ] **Step 3: Write the use cases.**

`src/features/auth/application/use-cases/login-owner/login-owner.schema.ts`

```ts
import { z } from "zod";

import {
  currentPasswordFieldSchema,
  emailFieldSchema,
} from "../../schemas/auth-fields/auth-fields.schema";

export const loginOwnerSchema = z.object({
  email: emailFieldSchema,
  password: currentPasswordFieldSchema,
});
```

`src/features/auth/application/use-cases/login-owner/login-owner.types.ts`

```ts
import type { z } from "zod";

import type { AuthResult } from "../../errors/auth-errors/auth-errors.types";
import type { VerifiedSession } from "../verify-email/verify-email.types";
import type { loginOwnerSchema } from "./login-owner.schema";

export type LoginOwnerInput = z.input<typeof loginOwnerSchema>;

export type LoginOwnerResult = AuthResult<VerifiedSession>;
```

`src/features/auth/application/use-cases/login-owner/login-owner.ts`

```ts
import "server-only";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import type { AuthDeps, RequestMeta } from "../../auth-deps/auth-deps.types";
import { failure, validationFailure } from "../../errors/auth-errors/auth-errors";
import { authLog } from "../../logging/auth-log/auth-log";
import {
  isLoginBlocked,
  recordLoginFailure,
} from "../../rate-limits/auth-rate-limits/auth-rate-limits";
import { continueAfterSignIn } from "../continue-after-sign-in/continue-after-sign-in";
import { loginOwnerSchema } from "./login-owner.schema";
import type { LoginOwnerResult } from "./login-owner.types";

/**
 * Password sign-in, in the order of diagrams/sequence/login-email-password.md: rate limit →
 * credentials → status → verification. Unknown email and wrong password look the same (A-5).
 * @param deps - the per-request auth ports
 * @param input - the untrusted form values
 * @param meta - the client IP and headers
 * @returns the outcome and session cookies, or a failure code
 */
export async function loginOwner(
  deps: AuthDeps,
  input: unknown,
  meta: RequestMeta,
): Promise<LoginOwnerResult> {
  const parsed = loginOwnerSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const email = normaliseEmail(parsed.data.email);
  const log = { operation: "login", requestId: deps.requestId } as const;

  if (await isLoginBlocked(deps.rateLimiter, email, meta.ip)) {
    authLog({ ...log, outcome: "RATE_LIMITED" }, "warn");
    return failure("RATE_LIMITED");
  }
  const credentials = { email, password: parsed.data.password };
  const signedIn = await deps.identity.signInWithPassword(credentials, meta.headers);
  if (!signedIn.ok) {
    await recordLoginFailure(deps.rateLimiter, email, meta.ip);
    authLog({ ...log, outcome: "INVALID_CREDENTIALS" });
    return failure("INVALID_CREDENTIALS");
  }
  const outcome = await continueAfterSignIn(deps, signedIn.userId);
  authLog({ ...log, outcome: outcome.kind, userId: signedIn.userId });
  if (outcome.kind === "UNAVAILABLE") return failure("ACCOUNT_UNAVAILABLE");
  return { ok: true, outcome, setCookies: signedIn.setCookies };
}
```

`src/features/auth/application/use-cases/logout-owner/logout-owner.ts`

```ts
import "server-only";

import type { AuthDeps } from "../../auth-deps/auth-deps.types";
import { authLog } from "../../logging/auth-log/auth-log";
import type { SessionCookies } from "../../ports/identity/identity.port";

/**
 * End the current session only; other devices stay signed in (AC-AUTH-012).
 * @param deps - the per-request auth ports
 * @param headers - the request headers carrying the session cookie
 * @returns the cookies that clear the session
 */
export async function logoutOwner(deps: AuthDeps, headers: Headers): Promise<SessionCookies> {
  const cleared = await deps.identity.signOut(headers);
  authLog({ operation: "logout", outcome: "SIGNED_OUT", requestId: deps.requestId });
  return cleared;
}
```

- [ ] **Step 4: Run them to verify they pass.**

Run: `pnpm test src/features/auth/application/use-cases/login-owner src/features/auth/application/use-cases/logout-owner && pnpm lint`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit.**

```bash
git add src/features/auth/application/use-cases/login-owner src/features/auth/application/use-cases/logout-owner
git commit -m "feat(auth): add password sign-in with the status gate and single-session logout"
```

## Task 16: `requestPasswordReset` and `resetPassword`

**Files:** `src/features/auth/application/use-cases/{request-password-reset,reset-password}/*`

- [ ] **Step 1: Write the failing tests.**

`src/features/auth/application/use-cases/request-password-reset/request-password-reset.test.ts`

```ts
import { PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps, meta } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { requestPasswordReset } from "./request-password-reset";

function owner(password: string | null = PASSWORD) {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  fake.backend.seedUser({ name: "Alya", email, password, status: "ACTIVE", emailVerified: true });
  return { ...fake, email };
}

describe("requestPasswordReset", () => {
  it("AC-AUTH-016 answers the same for registered and unknown emails", async () => {
    const { deps, sender, settle, email } = owner();
    const unknown = uniqueEmail();
    expect(await requestPasswordReset(deps, { email }, meta())).toEqual({ ok: true });
    expect(await requestPasswordReset(deps, { email: unknown }, meta())).toEqual({ ok: true });
    await settle();
    expect(sender.linksTo(email, "RESET_PASSWORD")).toHaveLength(1);
    expect(sender.linksTo(unknown, "RESET_PASSWORD")).toHaveLength(0);
  });

  it("AC-AUTH-016 silently stops sending after 3 per hour", async () => {
    const { deps, sender, settle, email } = owner();
    for (let i = 0; i < 4; i++) {
      expect(await requestPasswordReset(deps, { email }, meta())).toEqual({ ok: true });
    }
    await settle();
    expect(sender.linksTo(email, "RESET_PASSWORD")).toHaveLength(3);
  });

  it("AC-AUTH-030 BR-AUTH-008 a Google-only account gets the confirmation but no email", async () => {
    const { deps, sender, settle, email } = owner(null);
    expect(await requestPasswordReset(deps, { email }, meta())).toEqual({ ok: true });
    await settle();
    expect(sender.sent).toHaveLength(0);
  });

  it("AC-AUTH-002 validates the email on the server", async () => {
    const { deps } = owner();
    expect(await requestPasswordReset(deps, { email: "nope" }, meta())).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { email: "email.invalid" },
    });
  });
});
```

`src/features/auth/application/use-cases/reset-password/reset-password.test.ts`

```ts
import { NEW_PASSWORD, OTHER_NEW_PASSWORD, PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps, tokenFrom } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { resetPassword } from "./reset-password";

function owner() {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  const seed = { name: "Alya", email, password: PASSWORD, emailVerified: true } as const;
  const userId = fake.backend.seedUser({ ...seed, status: "ACTIVE" });
  const linkFor = async () => {
    await fake.deps.identity.sendResetLink(email);
    await fake.deps.outbox.flush();
    return tokenFrom(fake.sender.lastUrl(email, "RESET_PASSWORD"));
  };
  return { ...fake, email, userId, linkFor };
}

const values = (token: string, password = NEW_PASSWORD, confirm = password) => ({
  token,
  password,
  confirm,
});

describe("resetPassword", () => {
  it("AC-AUTH-017 changes the password, revokes every session and burns the link", async () => {
    const { deps, backend, email, userId, linkFor } = owner();
    const otherDevice = backend.signIn(userId);
    const token = await linkFor();
    expect(await resetPassword(deps, values(token))).toEqual({ ok: true });
    expect(await deps.identity.getSessionUserId(otherDevice)).toBeNull();
    const signIn = await deps.identity.signInWithPassword(
      { email, password: NEW_PASSWORD },
      new Headers(),
    );
    expect(signIn.ok).toBe(true);
    expect(await resetPassword(deps, values(token, OTHER_NEW_PASSWORD))).toEqual({
      ok: false,
      code: "INVALID_LINK",
    });
  });

  it("AC-AUTH-018 a superseded or tampered link leaves the password unchanged", async () => {
    const { deps, email, linkFor } = owner();
    const first = await linkFor();
    await linkFor();
    const invalid = { ok: false, code: "INVALID_LINK" };
    expect(await resetPassword(deps, values(first))).toEqual(invalid);
    expect(await resetPassword(deps, values("tampered"))).toEqual(invalid);
    expect(await resetPassword(deps, values(""))).toEqual(invalid);
    const credentials = { email, password: PASSWORD };
    expect((await deps.identity.signInWithPassword(credentials, new Headers())).ok).toBe(true);
  });

  it("AC-AUTH-002 validates the new password and the confirmation", async () => {
    const { deps } = owner();
    expect(await resetPassword(deps, values("t", "short"))).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { password: "password.length" },
    });
    expect(await resetPassword(deps, values("t", NEW_PASSWORD, OTHER_NEW_PASSWORD))).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { confirm: "password.mismatch" },
    });
  });
});
```

- [ ] **Step 2: Run them to verify they fail.**

Run: `pnpm test src/features/auth/application/use-cases/request-password-reset src/features/auth/application/use-cases/reset-password`
Expected: FAIL, missing modules.

- [ ] **Step 3: Write the use cases.**

`src/features/auth/application/use-cases/request-password-reset/request-password-reset.schema.ts`

```ts
import { z } from "zod";

import { emailFieldSchema } from "../../schemas/auth-fields/auth-fields.schema";

export const requestPasswordResetSchema = z.object({ email: emailFieldSchema });
```

`src/features/auth/application/use-cases/request-password-reset/request-password-reset.types.ts`

```ts
import type { z } from "zod";

import type { AuthResult } from "../../errors/auth-errors/auth-errors.types";
import type { requestPasswordResetSchema } from "./request-password-reset.schema";

export type RequestPasswordResetInput = z.input<typeof requestPasswordResetSchema>;

export type RequestPasswordResetResult = AuthResult;
```

`src/features/auth/application/use-cases/request-password-reset/request-password-reset.ts`

```ts
import "server-only";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import type { AuthDeps, RequestMeta } from "../../auth-deps/auth-deps.types";
import { validationFailure } from "../../errors/auth-errors/auth-errors";
import { authLog } from "../../logging/auth-log/auth-log";
import { allowLimitedAction } from "../../rate-limits/auth-rate-limits/auth-rate-limits";
import { requestPasswordResetSchema } from "./request-password-reset.schema";
import type { RequestPasswordResetResult } from "./request-password-reset.types";

/**
 * Forgot password: the same answer for every email (A-5). Mail goes out only for a
 * password-backed account (BR-AUTH-008) within the A-6 limits, after the response (ADR-011).
 * Over the limit it is silently not sent (AC-AUTH-016).
 * @param deps - the per-request auth ports
 * @param input - the untrusted form values
 * @param meta - the client IP and headers
 * @returns ok, or a validation failure
 */
export async function requestPasswordReset(
  deps: AuthDeps,
  input: unknown,
  meta: RequestMeta,
): Promise<RequestPasswordResetResult> {
  const parsed = requestPasswordResetSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const email = normaliseEmail(parsed.data.email);

  if (await allowLimitedAction(deps.rateLimiter, "FORGOT_PASSWORD", email, meta.ip)) {
    const account = await deps.accounts.findByEmail(email);
    if (account?.hasPassword) await deps.identity.sendResetLink(email);
    deps.outbox.flushInBackground(deps.waitUntil);
  }
  authLog({ operation: "forgot-password", outcome: "CONFIRMED", requestId: deps.requestId });
  return { ok: true };
}
```

`src/features/auth/application/use-cases/reset-password/reset-password.schema.ts`

```ts
import { z } from "zod";

import { newPasswordFieldSchema } from "../../schemas/auth-fields/auth-fields.schema";

export const resetPasswordSchema = z
  .object({ token: z.string().max(512), password: newPasswordFieldSchema, confirm: z.string() })
  .refine((values) => values.password === values.confirm, {
    path: ["confirm"],
    message: "password.mismatch",
  });
```

`src/features/auth/application/use-cases/reset-password/reset-password.types.ts`

```ts
import type { z } from "zod";

import type { AuthResult } from "../../errors/auth-errors/auth-errors.types";
import type { resetPasswordSchema } from "./reset-password.schema";

export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;

export type ResetPasswordResult = AuthResult;
```

`src/features/auth/application/use-cases/reset-password/reset-password.ts`

```ts
import "server-only";

import type { AuthDeps } from "../../auth-deps/auth-deps.types";
import { failure, validationFailure } from "../../errors/auth-errors/auth-errors";
import { authLog } from "../../logging/auth-log/auth-log";
import { resetPasswordSchema } from "./reset-password.schema";
import type { ResetPasswordResult } from "./reset-password.types";

/**
 * Set a new password from the latest, unused reset link (A-3). Every session is revoked, so the
 * owner signs in again on every device (A-4, AC-AUTH-017).
 * @param deps - the per-request auth ports
 * @param input - the untrusted token, password and confirmation
 * @returns ok, a validation failure, or `INVALID_LINK`
 */
export async function resetPassword(deps: AuthDeps, input: unknown): Promise<ResetPasswordResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const { token, password } = parsed.data;
  const reset = token ? await deps.identity.resetPassword({ token, newPassword: password }) : false;
  const outcome = reset ? "RESET" : "INVALID_LINK";
  authLog({ operation: "reset-password", outcome, requestId: deps.requestId });
  return reset ? { ok: true } : failure("INVALID_LINK");
}
```

- [ ] **Step 4: Run them to verify they pass.**

Run: `pnpm test src/features/auth/application/use-cases && pnpm lint`
Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add src/features/auth/application/use-cases/request-password-reset src/features/auth/application/use-cases/reset-password
git commit -m "feat(auth): add password recovery with single-use superseding reset links"
```

## Task 17: `updateDisplayName`, `changePassword` and `startGoogleSignIn`

**Files:** `src/features/auth/application/use-cases/{update-display-name,change-password,start-google-sign-in}/*`

`updateDisplayName` and `changePassword` call `requireOwner` themselves, so they are safe even when a caller forgets the guard (C-004).

- [ ] **Step 1: Write the failing tests.**

`src/features/auth/application/use-cases/update-display-name/update-display-name.test.ts`

```ts
import { PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { updateDisplayName } from "./update-display-name";

function signedInOwner(emailVerified = true) {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  const seed = { name: "Alya", email, password: PASSWORD, emailVerified } as const;
  const userId = fake.backend.seedUser({ ...seed, status: "ACTIVE" });
  return { ...fake, email, userId, headers: fake.backend.signIn(userId) };
}

describe("updateDisplayName", () => {
  it("AC-AUTH-020 updates the name on the single user record; the email cannot change", async () => {
    const { deps, email, userId, headers } = signedInOwner();
    const input = { name: "  Alya Pratama ", email: "other@example.com" };
    expect(await updateDisplayName(deps, input, headers)).toEqual({ ok: true });
    expect(await deps.accounts.getById(userId)).toMatchObject({ name: "Alya Pratama", email });
  });

  it("AC-AUTH-020 rejects an empty name", async () => {
    const { deps, headers } = signedInOwner();
    expect(await updateDisplayName(deps, { name: "   " }, headers)).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { name: "name.required" },
    });
  });

  it("AC-AUTH-009 refuses an unverified session", async () => {
    const { deps, headers } = signedInOwner(false);
    await expect(updateDisplayName(deps, { name: "X" }, headers)).rejects.toMatchObject({
      code: "EMAIL_UNVERIFIED",
    });
  });
});
```

`src/features/auth/application/use-cases/change-password/change-password.test.ts`

```ts
import { NEW_PASSWORD, PASSWORD, WRONG_PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { changePassword } from "./change-password";

function signedInOwner() {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  const seed = { name: "Alya", email, password: PASSWORD, emailVerified: true } as const;
  const userId = fake.backend.seedUser({ ...seed, status: "ACTIVE" });
  return { ...fake, email, userId, headers: fake.backend.signIn(userId) };
}

const values = (currentPassword: string) => ({
  currentPassword,
  newPassword: NEW_PASSWORD,
  confirm: NEW_PASSWORD,
});

describe("changePassword", () => {
  it("AC-AUTH-019 keeps the current session and revokes the others", async () => {
    const { deps, backend, email, userId, headers } = signedInOwner();
    const other = backend.signIn(userId);
    expect(await changePassword(deps, values(PASSWORD), headers)).toMatchObject({ ok: true });
    expect(await deps.identity.getSessionUserId(headers)).toBe(userId);
    expect(await deps.identity.getSessionUserId(other)).toBeNull();
    const credentials = { email, password: NEW_PASSWORD };
    expect((await deps.identity.signInWithPassword(credentials, new Headers())).ok).toBe(true);
  });

  it("AC-AUTH-019 a wrong current password changes nothing and flags the field", async () => {
    const { deps, email, headers } = signedInOwner();
    expect(await changePassword(deps, values(WRONG_PASSWORD), headers)).toEqual({
      ok: false,
      code: "WRONG_CURRENT_PASSWORD",
      fieldErrors: { currentPassword: "password.wrongCurrent" },
    });
    const credentials = { email, password: PASSWORD };
    expect((await deps.identity.signInWithPassword(credentials, new Headers())).ok).toBe(true);
  });

  it("AC-AUTH-002 requires a matching confirmation", async () => {
    const { deps, headers } = signedInOwner();
    const input = { ...values(PASSWORD), confirm: WRONG_PASSWORD };
    expect(await changePassword(deps, input, headers)).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { confirm: "password.mismatch" },
    });
  });

  it("AC-AUTH-014 refuses a session without an owner", async () => {
    const { deps } = signedInOwner();
    await expect(changePassword(deps, values(PASSWORD), new Headers())).rejects.toMatchObject({
      code: "AUTH_REQUIRED",
    });
  });
});
```

`src/features/auth/application/use-cases/start-google-sign-in/start-google-sign-in.test.ts`

```ts
import { fakeAuthDeps } from "@tests/support/auth/fake-auth-deps";
import { describe, expect, it } from "vitest";

import { startGoogleSignIn } from "./start-google-sign-in";

describe("startGoogleSignIn", () => {
  it("AC-AUTH-024 AC-AUTH-029 returns to /auth/continue, or to /login on failure", async () => {
    const { deps } = fakeAuthDeps();
    const spy = deps.identity.googleSignInUrl;
    const calls: unknown[] = [];
    deps.identity.googleSignInUrl = (redirects) => {
      calls.push(redirects);
      return spy(redirects);
    };
    const start = await startGoogleSignIn(deps);
    expect(calls).toEqual([{ callbackURL: "/auth/continue", errorCallbackURL: "/login" }]);
    expect(start.setCookies).not.toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run them to verify they fail.**

Run: `pnpm test src/features/auth/application/use-cases/update-display-name src/features/auth/application/use-cases/change-password src/features/auth/application/use-cases/start-google-sign-in`
Expected: FAIL, missing modules.

- [ ] **Step 3: Write the use cases.**

`src/features/auth/application/use-cases/update-display-name/update-display-name.schema.ts`

```ts
import { z } from "zod";

import { displayNameFieldSchema } from "../../schemas/auth-fields/auth-fields.schema";

// Only `name` is accepted; unknown keys such as `email` are stripped (AC-AUTH-020).
export const updateDisplayNameSchema = z.object({ name: displayNameFieldSchema });
```

`src/features/auth/application/use-cases/update-display-name/update-display-name.types.ts`

```ts
import type { z } from "zod";

import type { AuthResult } from "../../errors/auth-errors/auth-errors.types";
import type { updateDisplayNameSchema } from "./update-display-name.schema";

export type UpdateDisplayNameInput = z.input<typeof updateDisplayNameSchema>;

export type UpdateDisplayNameResult = AuthResult;
```

`src/features/auth/application/use-cases/update-display-name/update-display-name.ts`

```ts
import "server-only";

import type { AuthDeps } from "../../auth-deps/auth-deps.types";
import { validationFailure } from "../../errors/auth-errors/auth-errors";
import { authLog } from "../../logging/auth-log/auth-log";
import { requireOwner } from "../../policy/owner-access/owner-access";
import { updateDisplayNameSchema } from "./update-display-name.schema";
import type { UpdateDisplayNameResult } from "./update-display-name.types";

/**
 * Change the owner's display name on the single user record; the email never changes
 * (AC-AUTH-020). It checks the owner itself, so a caller that forgets the guard is still safe.
 * @param deps - the per-request auth ports
 * @param input - the untrusted form values
 * @param headers - the request headers carrying the session cookie
 * @returns ok or a validation failure; throws `AuthError` for a non-owner session
 */
export async function updateDisplayName(
  deps: AuthDeps,
  input: unknown,
  headers: Headers,
): Promise<UpdateDisplayNameResult> {
  const owner = await requireOwner(deps, headers);
  const parsed = updateDisplayNameSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  await deps.identity.updateName(parsed.data.name, headers);
  const event = { operation: "update-profile", outcome: "UPDATED", userId: owner.id } as const;
  authLog({ ...event, requestId: deps.requestId });
  return { ok: true };
}
```

`src/features/auth/application/use-cases/change-password/change-password.schema.ts`

```ts
import { z } from "zod";

import {
  currentPasswordFieldSchema,
  newPasswordFieldSchema,
} from "../../schemas/auth-fields/auth-fields.schema";

export const changePasswordSchema = z
  .object({
    currentPassword: currentPasswordFieldSchema,
    newPassword: newPasswordFieldSchema,
    confirm: z.string(),
  })
  .refine((values) => values.newPassword === values.confirm, {
    path: ["confirm"],
    message: "password.mismatch",
  });
```

`src/features/auth/application/use-cases/change-password/change-password.types.ts`

```ts
import type { z } from "zod";

import type { AuthResult } from "../../errors/auth-errors/auth-errors.types";
import type { SessionCookies } from "../../ports/identity/identity.port";
import type { changePasswordSchema } from "./change-password.schema";

export type ChangePasswordInput = z.input<typeof changePasswordSchema>;

export type ChangePasswordResult = AuthResult<SessionCookies>;
```

`src/features/auth/application/use-cases/change-password/change-password.ts`

```ts
import "server-only";

import type { AuthDeps } from "../../auth-deps/auth-deps.types";
import { failure, validationFailure } from "../../errors/auth-errors/auth-errors";
import { authLog } from "../../logging/auth-log/auth-log";
import { requireOwner } from "../../policy/owner-access/owner-access";
import { changePasswordSchema } from "./change-password.schema";
import type { ChangePasswordResult } from "./change-password.types";

/**
 * Change the password with the current one; other sessions are revoked and this one stays
 * (A-4, AC-AUTH-019). It checks the owner itself (C-004).
 * @param deps - the per-request auth ports
 * @param input - the untrusted current, new and confirmation passwords
 * @param headers - the request headers carrying the session cookie
 * @returns the refreshed session cookies, a validation failure or `WRONG_CURRENT_PASSWORD`
 */
export async function changePassword(
  deps: AuthDeps,
  input: unknown,
  headers: Headers,
): Promise<ChangePasswordResult> {
  const owner = await requireOwner(deps, headers);
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const { currentPassword, newPassword } = parsed.data;
  const changed = await deps.identity.changePassword({ currentPassword, newPassword }, headers);
  const outcome = changed.ok ? "CHANGED" : "WRONG_CURRENT";
  authLog({ operation: "change-password", outcome, requestId: deps.requestId, userId: owner.id });
  if (!changed.ok) {
    return failure("WRONG_CURRENT_PASSWORD", { currentPassword: "password.wrongCurrent" });
  }
  return { ok: true, setCookies: changed.setCookies };
}
```

`src/features/auth/application/use-cases/start-google-sign-in/start-google-sign-in.ts`

```ts
import "server-only";

import type { AuthDeps } from "../../auth-deps/auth-deps.types";
import { AUTH_PATH } from "../../policy/destination-path/destination-path";
import type { GoogleStart } from "../../ports/identity/identity.port";

/**
 * Start Google sign-in with identity scopes only (ADR-012). Better Auth returns to
 * `/auth/continue` on success and to `/login?error=…` on failure or cancel.
 * @param deps - the identity port
 * @returns the Google authorization URL and the OAuth state cookies
 */
export function startGoogleSignIn(deps: Pick<AuthDeps, "identity">): Promise<GoogleStart> {
  return deps.identity.googleSignInUrl({
    callbackURL: AUTH_PATH.googleContinue,
    errorCallbackURL: AUTH_PATH.login,
  });
}
```

- [ ] **Step 4: Run the gate.**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: PASS. Every use case is now unit-tested.

- [ ] **Step 5: Commit.**

```bash
git add src/features/auth/application/use-cases
git commit -m "feat(auth): add display-name update, password change and Google sign-in start"
```

**Iterations 1–3 done check:** `pnpm typecheck && pnpm lint && pnpm test` passes. Every use case has its unit tests. The Task 5 migration is applied, or the Owner has been asked to apply it.

---

# Iteration 4 — Adapters

**Gate:** the Task 5 migration is applied to the shared non-production database (Owner), and `pnpm test:integration tests/integration/auth/schema.test.ts` passes. If it is not applied yet, write this iteration's code and run the unit gate, but do not mark the iteration done.

## Task 18: Database adapters

**Files:**
- `src/adapters/db/account-directory/drizzle-account-directory.ts`
- `src/adapters/db/link-registry/drizzle-link-registry.ts`
- `src/adapters/db/rate-limiter/neon-rate-limiter.{ts,types.ts}`
- `src/adapters/db/better-auth-database/better-auth-database.ts`
- Test: `tests/integration/auth/db-adapters.test.ts`

Every Drizzle-backed adapter lives in `adapters/db`, because an adapter never imports another adapter. The project `tsconfig` does not set `noUncheckedIndexedAccess`, so query rows are read with `.at(0)`, which is typed `T | undefined`.

- [ ] **Step 1: Write the failing integration test.**

`tests/integration/auth/db-adapters.test.ts`

```ts
import { uniqueEmail } from "@tests/support/auth/unique";
import { count, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createDrizzleAccountDirectory } from "@/adapters/db/account-directory/drizzle-account-directory";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleLinkRegistry } from "@/adapters/db/link-registry/drizzle-link-registry";
import { createNeonRateLimiter } from "@/adapters/db/rate-limiter/neon-rate-limiter";
import { account, session, user } from "@/adapters/db/schema/auth/auth";
import { asAuthUserId } from "@/features/auth/domain/account/account";
import type { AuthUserId } from "@/features/auth/domain/account/account.types";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { openTestDb } from "../helpers/test-db";

let db: Db;
let close: () => Promise<void>;
beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

interface SeedOptions {
  verified: boolean;
  password: boolean;
  sessions: number;
}

async function seedOwner({ verified, password, sessions }: SeedOptions) {
  const id = crypto.randomUUID();
  const email = uniqueEmail();
  const verifiedAt = verified ? new Date() : null;
  await db
    .insert(user)
    .values({ id, name: "Owner", email, emailVerified: verified, emailVerifiedAt: verifiedAt });
  if (password) {
    const credential = { id: crypto.randomUUID(), accountId: id, providerId: "credential" };
    await db.insert(account).values({ ...credential, userId: id, password: "hash" });
  }
  for (let i = 0; i < sessions; i++) {
    const expiresAt = new Date(Date.now() + 3_600_000);
    await db
      .insert(session)
      .values({ id: crypto.randomUUID(), token: crypto.randomUUID(), userId: id, expiresAt });
  }
  return { id: asAuthUserId(id), email: normaliseEmail(email) };
}

async function sessionCount(id: AuthUserId): Promise<number> {
  const rows = await db.select({ n: count() }).from(session).where(eq(session.userId, id));
  return rows.at(0)?.n ?? 0;
}

describe("Drizzle account directory", () => {
  it("BR-AUTH-008 reports whether the account has a password", async () => {
    const accounts = createDrizzleAccountDirectory(db);
    const withPassword = await seedOwner({ verified: true, password: true, sessions: 0 });
    const googleOnly = await seedOwner({ verified: true, password: false, sessions: 0 });
    expect((await accounts.getById(withPassword.id))?.hasPassword).toBe(true);
    expect((await accounts.findByEmail(googleOnly.email))?.hasPassword).toBe(false);
  });

  it("AC-AUTH-015 a status change revokes every session in the same transaction", async () => {
    const accounts = createDrizzleAccountDirectory(db);
    const owner = await seedOwner({ verified: true, password: true, sessions: 2 });
    await accounts.setStatusAndRevokeSessions(owner.id, "SUSPENDED");
    expect(await sessionCount(owner.id)).toBe(0);
    expect((await accounts.getById(owner.id))?.status).toBe("SUSPENDED");
  });

  it("AC-AUTH-027 the takeover guard verifies, removes the password and revokes sessions", async () => {
    const accounts = createDrizzleAccountDirectory(db);
    const owner = await seedOwner({ verified: false, password: true, sessions: 2 });
    await accounts.applyGoogleTakeoverGuard(owner.id);
    expect(await accounts.getById(owner.id)).toMatchObject({
      emailVerified: true,
      hasPassword: false,
    });
    expect(await sessionCount(owner.id)).toBe(0);
  });
});

describe("Drizzle latest-link registry (A-3)", () => {
  it("AC-AUTH-005 accepts only the latest link, once", async () => {
    const links = createDrizzleLinkRegistry(db);
    const { id } = await seedOwner({ verified: false, password: true, sessions: 0 });
    const ttlSeconds = 3600;
    await links.record({ userId: id, purpose: "VERIFY_EMAIL", token: "first", ttlSeconds });
    await links.record({ userId: id, purpose: "VERIFY_EMAIL", token: "second", ttlSeconds });
    expect(await links.consume("VERIFY_EMAIL", "first")).toBeNull();
    expect(await links.consume("VERIFY_EMAIL", "second")).toBe(id);
    expect(await links.consume("VERIFY_EMAIL", "second")).toBeNull();
  });

  it("AC-AUTH-018 an expired link is not current", async () => {
    const { id } = await seedOwner({ verified: true, password: true, sessions: 0 });
    await createDrizzleLinkRegistry(db).record({
      userId: id,
      purpose: "RESET_PASSWORD",
      token: "t",
      ttlSeconds: 3600,
    });
    const inTwoHours = createDrizzleLinkRegistry(db, () => new Date(Date.now() + 7_200_000));
    expect(await inTwoHours.isCurrent("RESET_PASSWORD", "t")).toBe(false);
  });

  it("AC-AUTH-005 two concurrent consumes cannot both succeed", async () => {
    const links = createDrizzleLinkRegistry(db);
    const { id } = await seedOwner({ verified: false, password: true, sessions: 0 });
    await links.record({ userId: id, purpose: "VERIFY_EMAIL", token: "race", ttlSeconds: 3600 });
    const results = await Promise.all([
      links.consume("VERIFY_EMAIL", "race"),
      links.consume("VERIFY_EMAIL", "race"),
    ]);
    expect(results.filter((userId) => userId !== null)).toHaveLength(1);
  });
});

describe("Neon rate limiter (ADR-013)", () => {
  const rule = { limit: 2, windowSeconds: 60 };
  const key = () => `test:${crypto.randomUUID()}`;

  it("AC-AUTH-010 counts hits atomically and refuses after the limit", async () => {
    const limiter = createNeonRateLimiter(db);
    const k = key();
    const results = await Promise.all([
      limiter.hit(k, rule),
      limiter.hit(k, rule),
      limiter.hit(k, rule),
    ]);
    expect(results.filter(Boolean)).toHaveLength(2);
    expect(await limiter.peek(k, rule)).toBe(false);
  });

  it("AC-AUTH-010 peek does not count", async () => {
    const limiter = createNeonRateLimiter(db);
    const k = key();
    await limiter.peek(k, rule);
    await limiter.peek(k, rule);
    expect(await limiter.hit(k, rule)).toBe(true);
  });

  it("AC-AUTH-010 starts a new window after windowSeconds", async () => {
    let now = new Date("2000-01-01T00:00:00Z");
    const limiter = createNeonRateLimiter(db, () => now);
    const k = key();
    await limiter.hit(k, rule);
    await limiter.hit(k, rule);
    expect(await limiter.peek(k, rule)).toBe(false);
    now = new Date("2000-01-01T00:01:00Z");
    expect(await limiter.peek(k, rule)).toBe(true);
  });

  it("AC-AUTH-021 ADR-013 purges windows older than the cutoff", async () => {
    const limiter = createNeonRateLimiter(db, () => new Date("2000-01-01T00:00:00Z"));
    await limiter.hit(key(), rule);
    expect(await limiter.purgeBefore(new Date("2000-01-01T01:00:00Z"))).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run it to verify it fails.**

Run: `pnpm test:integration tests/integration/auth/db-adapters.test.ts`
Expected: FAIL, missing modules.

- [ ] **Step 3: Write the adapters.**

`src/adapters/db/account-directory/drizzle-account-directory.ts`

```ts
import "server-only";

import type { SQL } from "drizzle-orm";
import { and, eq, sql } from "drizzle-orm";

import type { AccountDirectoryPort } from "@/features/auth/application/ports/account-directory/account-directory.port";
import { asAuthUserId, isAccountStatus } from "@/features/auth/domain/account/account";
import type { AccountRecord } from "@/features/auth/domain/account/account.types";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import type { Db } from "../client/client.types";
import { account, session, user } from "../schema/auth/auth";

const CREDENTIAL = "credential";

async function loadAccount(db: Db, where: SQL): Promise<AccountRecord | null> {
  const hasPassword = sql<boolean>`exists (select 1 from ${account}
    where ${account.userId} = ${user.id} and ${account.providerId} = ${CREDENTIAL})`;
  const rows = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      emailVerified: user.emailVerified,
      hasPassword,
    })
    .from(user)
    .where(where);
  const row = rows.at(0);
  if (!row) return null;
  // The CHECK constraint makes this unreachable; a failure means the schema drifted.
  if (!isAccountStatus(row.status)) throw new Error("user row has an unknown status");
  const { id, email, status, ...rest } = row;
  return { ...rest, id: asAuthUserId(id), email: normaliseEmail(email), status };
}

/**
 * The account directory over Better Auth's tables. Identity is not tenant data, so these reads
 * are keyed by the unique user ID or the unique lower-cased email (ADR-002, BR-AUTH-002).
 * @param db - the request-scoped Drizzle database
 * @returns the `AccountDirectoryPort`
 */
export function createDrizzleAccountDirectory(db: Db): AccountDirectoryPort {
  const revokeAll = async (id: string): Promise<void> => {
    await db.delete(session).where(eq(session.userId, id));
  };
  return {
    findByEmail: (email) => loadAccount(db, sql`lower(${user.email}) = ${email}`),
    getById: (id) => loadAccount(db, eq(user.id, id)),
    revokeAllSessions: revokeAll,
    async setStatusAndRevokeSessions(id, status) {
      await db.transaction(async (tx) => {
        await tx.update(user).set({ status, updatedAt: new Date() }).where(eq(user.id, id));
        await tx.delete(session).where(eq(session.userId, id));
      });
    },
    async applyGoogleTakeoverGuard(id) {
      const now = new Date();
      const isCredential = and(eq(account.userId, id), eq(account.providerId, CREDENTIAL));
      await db.transaction(async (tx) => {
        const verified = { emailVerified: true, emailVerifiedAt: now, updatedAt: now };
        await tx.update(user).set(verified).where(eq(user.id, id));
        await tx.delete(account).where(isCredential);
        await tx.delete(session).where(eq(session.userId, id));
      });
    },
  };
}
```

`src/adapters/db/link-registry/drizzle-link-registry.ts`

```ts
import "server-only";

import { and, eq, gt } from "drizzle-orm";

import type { AuthLinkKind } from "@/features/auth/application/ports/auth-email/auth-email.port";
import type { LinkRegistryPort } from "@/features/auth/application/ports/link-registry/link-registry.port";
import { asAuthUserId } from "@/features/auth/domain/account/account";
import { sha256Hex } from "@/shared/crypto/sha256-hex/sha256-hex";

import type { Db } from "../client/client.types";
import { authLatestLink } from "../schema/auth/auth";

/**
 * The latest-link registry (R-2): Better Auth 1.7 verification JWTs are reusable and older
 * reset tokens stay valid, so only the latest link per user and purpose is accepted, once (A-3).
 * @param db - the request-scoped Drizzle database
 * @param now - the clock, for tests
 * @returns the `LinkRegistryPort`
 */
export function createDrizzleLinkRegistry(
  db: Db,
  now: () => Date = () => new Date(),
): LinkRegistryPort {
  const current = async (purpose: AuthLinkKind, token: string) =>
    and(
      eq(authLatestLink.purpose, purpose),
      eq(authLatestLink.tokenHash, await sha256Hex(token)),
      gt(authLatestLink.expiresAt, now()),
    );
  return {
    async record({ userId, purpose, token, ttlSeconds }) {
      const tokenHash = await sha256Hex(token);
      const createdAt = now();
      const expiresAt = new Date(createdAt.getTime() + ttlSeconds * 1000);
      await db
        .insert(authLatestLink)
        .values({ userId, purpose, tokenHash, expiresAt, createdAt })
        .onConflictDoUpdate({
          target: [authLatestLink.userId, authLatestLink.purpose],
          set: { tokenHash, expiresAt, createdAt },
        });
    },
    // One DELETE … RETURNING, so two concurrent clicks cannot both succeed.
    async consume(purpose, token) {
      const rows = await db
        .delete(authLatestLink)
        .where(await current(purpose, token))
        .returning({ userId: authLatestLink.userId });
      const userId = rows.at(0)?.userId;
      return userId === undefined ? null : asAuthUserId(userId);
    },
    async isCurrent(purpose, token) {
      const rows = await db
        .select({ userId: authLatestLink.userId })
        .from(authLatestLink)
        .where(await current(purpose, token));
      return rows.length === 1;
    },
  };
}
```

`src/adapters/db/rate-limiter/neon-rate-limiter.types.ts`

```ts
import type { RateLimiterPort } from "@/features/auth/application/ports/rate-limiter/rate-limiter.port";

export interface PurgeableRateLimiter extends RateLimiterPort {
  /** Deletes windows that started before `cutoff`; returns how many were removed. */
  purgeBefore: (cutoff: Date) => Promise<number>;
}
```

`src/adapters/db/rate-limiter/neon-rate-limiter.ts`

```ts
import "server-only";

import { and, eq, lt, sql } from "drizzle-orm";

import type { RateLimitRule } from "@/features/auth/application/ports/rate-limiter/rate-limiter.port";

import type { Db } from "../client/client.types";
import { authRateLimit } from "../schema/auth/auth";
import type { PurgeableRateLimiter } from "./neon-rate-limiter.types";

/**
 * ADR-013 fixed-window counters in Neon. `hit` is one atomic upsert, so concurrent requests
 * cannot both slip under the limit.
 * @param db - the request-scoped Drizzle database
 * @param now - the clock, for tests
 * @returns the rate limiter, plus `purgeBefore` for the cleanup script
 */
export function createNeonRateLimiter(
  db: Db,
  now: () => Date = () => new Date(),
): PurgeableRateLimiter {
  const windowStart = (rule: RateLimitRule): Date => {
    const size = rule.windowSeconds * 1000;
    return new Date(Math.floor(now().getTime() / size) * size);
  };
  return {
    async peek(key, rule) {
      const rows = await db
        .select({ count: authRateLimit.count })
        .from(authRateLimit)
        .where(and(eq(authRateLimit.key, key), eq(authRateLimit.windowStart, windowStart(rule))));
      return (rows.at(0)?.count ?? 0) < rule.limit;
    },
    async hit(key, rule) {
      const rows = await db
        .insert(authRateLimit)
        .values({ key, windowStart: windowStart(rule), count: 1 })
        .onConflictDoUpdate({
          target: [authRateLimit.key, authRateLimit.windowStart],
          set: { count: sql`${authRateLimit.count} + 1` },
        })
        .returning({ count: authRateLimit.count });
      const row = rows.at(0);
      // An upsert with RETURNING yields exactly one row; no row means the insert failed.
      if (!row) throw new Error("rate-limit upsert returned no row");
      return row.count <= rule.limit;
    },
    async purgeBefore(cutoff) {
      const removed = await db
        .delete(authRateLimit)
        .where(lt(authRateLimit.windowStart, cutoff))
        .returning({ key: authRateLimit.key });
      return removed.length;
    },
  };
}
```

`src/adapters/db/better-auth-database/better-auth-database.ts`

```ts
import "server-only";

import { drizzleAdapter } from "better-auth/adapters/drizzle";

import type { Db } from "../client/client.types";
import * as authSchema from "../schema/auth/auth";

/**
 * Better Auth's database adapter over the request's Drizzle database. It lives in
 * `adapters/db` because only this adapter may touch the schema; `adapters/auth` receives it
 * from composition (an adapter never imports another adapter).
 * @param db - the request-scoped Drizzle database (ADR-009)
 * @returns the value for Better Auth's `database` option
 */
export function createBetterAuthDatabase(db: Db): ReturnType<typeof drizzleAdapter> {
  return drizzleAdapter(db, { provider: "pg", schema: authSchema });
}
```

- [ ] **Step 4: Run it to verify it passes.**

Run: `pnpm test:integration tests/integration/auth/db-adapters.test.ts && pnpm typecheck && pnpm lint`
Expected: PASS (10 tests).

- [ ] **Step 5: Commit.**

```bash
git add src/adapters/db tests/integration/auth/db-adapters.test.ts
git commit -m "feat(auth): add the account directory, latest-link registry and Neon rate limiter"
```

## Task 19: Better Auth adapter

**Files:**
- `src/adapters/auth/create-auth/create-auth.{ts,types.ts,test.ts}`
- `src/adapters/auth/google-guard/google-guard.{ts,test.ts}`
- `src/adapters/auth/identity/better-auth-identity.{ts,types.ts}`
- Tests: `tests/integration/auth/helpers/auth-harness.ts`, `tests/integration/auth/helpers/google-callback.ts`, `tests/integration/auth/better-auth-contract.test.ts`, `tests/integration/auth/identity-adapter.test.ts`, `tests/integration/auth/google-sign-in.test.ts`

Folder names avoid `better-auth`: the lint ban on `better-auth/*` imports matches that path segment. **Why the Google guard runs in `mapProfileToUser`:** Better Auth 1.7.6 calls it with the ID-token claims *before* it looks up the local user (`social-providers/google.mjs`, then `oauth2/link-account.mjs`). The guard therefore turns an unverified local account into a verified one, with no password and no sessions, before Better Auth's `requireLocalEmailVerified` check allows the link. Google stays out of `trustedProviders`, so Google's `email_verified` is always required (BR-AUTH-006), as amended ADR-012 now states.

- [ ] **Step 1: Write the failing unit tests.**

`src/adapters/auth/create-auth/create-auth.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { AUTH_TTL, isSocialCallback } from "./create-auth";

describe("createAuth options", () => {
  it("AC-AUTH-028 recognises Better Auth's social callback endpoints", () => {
    expect(isSocialCallback({ path: "/callback/google" })).toBe(true);
    expect(isSocialCallback({ path: "/sign-up/email" })).toBe(false);
    expect(isSocialCallback(null)).toBe(false);
  });

  it("AC-AUTH-005 AC-AUTH-018 uses the A-2 and A-3 lifetimes", () => {
    expect(AUTH_TTL).toEqual({
      sessionSeconds: 604_800,
      sessionUpdateAgeSeconds: 86_400,
      verifySeconds: 86_400,
      resetSeconds: 3_600,
    });
  });
});
```

`src/adapters/auth/google-guard/google-guard.test.ts`

```ts
import { PASSWORD } from "@tests/support/auth/credentials";
import { fakeAuthDeps } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { createGoogleClaimsGuard } from "./google-guard";

function owner(emailVerified: boolean) {
  const fake = fakeAuthDeps();
  const email = normaliseEmail(uniqueEmail());
  const seed = { name: "Alya", email, password: PASSWORD, emailVerified } as const;
  const userId = fake.backend.seedUser({ ...seed, status: "ACTIVE" });
  fake.backend.signIn(userId);
  return { ...fake, email, userId, guard: createGoogleClaimsGuard(fake.backend.accounts) };
}

describe("Google claims guard", () => {
  it("AC-AUTH-027 BR-AUTH-007 secures an unverified account before Google links it", async () => {
    const { deps, backend, email, userId, guard } = owner(false);
    await guard({ email: email.toUpperCase(), email_verified: true });
    expect(await deps.accounts.getById(userId)).toMatchObject({
      emailVerified: true,
      hasPassword: false,
    });
    expect(backend.sessions.size).toBe(0);
  });

  it("AC-AUTH-026 leaves a verified account and its password alone", async () => {
    const { deps, backend, email, userId, guard } = owner(true);
    await guard({ email, email_verified: true });
    expect(await deps.accounts.getById(userId)).toMatchObject({ hasPassword: true });
    expect(backend.sessions.size).toBe(1);
  });

  it("AC-AUTH-028 does nothing for an unverified Google email", async () => {
    const { deps, email, userId, guard } = owner(false);
    await guard({ email, email_verified: false });
    expect(await deps.accounts.getById(userId)).toMatchObject({
      emailVerified: false,
      hasPassword: true,
    });
  });
});
```

- [ ] **Step 2: Write the integration harness and the failing integration tests.**

`tests/integration/auth/helpers/auth-harness.ts`

```ts
import { RecordingEmailSender } from "@tests/support/auth/recording-email-sender";
import { uniqueIp } from "@tests/support/auth/unique";

import { createBetterAuthIdentity } from "@/adapters/auth/identity/better-auth-identity";
import { createDrizzleAccountDirectory } from "@/adapters/db/account-directory/drizzle-account-directory";
import { createBetterAuthDatabase } from "@/adapters/db/better-auth-database/better-auth-database";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleLinkRegistry } from "@/adapters/db/link-registry/drizzle-link-registry";
import { createNeonRateLimiter } from "@/adapters/db/rate-limiter/neon-rate-limiter";
import type { AuthDeps, RequestMeta } from "@/features/auth/application/auth-deps/auth-deps.types";
import { LinkOutbox } from "@/features/auth/application/link-outbox/link-outbox";
import { parseAppEnv } from "@/shared/env/app-env";
import type { AppEnv } from "@/shared/env/app-env.types";

import { openTestDb } from "../../helpers/test-db";

export interface AuthHarness {
  db: Db;
  env: AppEnv;
  deps: AuthDeps;
  sender: RecordingEmailSender;
  handler: (request: Request) => Promise<Response>;
  settle: () => Promise<void>;
  close: () => Promise<void>;
}

/** The real auth adapters over the shared non-production database (ADR-009). */
export async function openAuthHarness(): Promise<AuthHarness> {
  const { db, close } = await openTestDb();
  const env = parseAppEnv(process.env);
  const sender = new RecordingEmailSender();
  const outbox = new LinkOutbox(sender, "test-request");
  const accounts = createDrizzleAccountDirectory(db);
  const { identity, handler } = createBetterAuthIdentity({
    database: createBetterAuthDatabase(db),
    env,
    accounts,
    links: createDrizzleLinkRegistry(db),
    onLink: (link) => {
      outbox.enqueue(link);
    },
  });
  const background: Promise<unknown>[] = [];
  const deps: AuthDeps = {
    identity,
    accounts,
    rateLimiter: createNeonRateLimiter(db),
    outbox,
    destination: { resolve: () => Promise.resolve("ONBOARDING") },
    waitUntil: (promise) => {
      background.push(promise);
    },
    requestId: "test-request",
  };
  const settle = async (): Promise<void> => {
    await Promise.allSettled(background.splice(0));
  };
  return { db, env, deps, sender, handler, settle, close };
}

/** Request metadata with a fresh IP, so rate-limit counters stay per test. */
export function meta(headers: Headers = new Headers()): RequestMeta {
  return { ip: uniqueIp(), headers };
}

/** A `cookie` header carrying the given `Set-Cookie` values. */
export function cookieHeaders(setCookies: string[]): Headers {
  return new Headers({ cookie: setCookies.map((cookie) => cookie.split(";")[0]).join("; ") });
}
```

`tests/integration/auth/helpers/google-callback.ts`

```ts
import { vi } from "vitest";

import type { AuthHarness } from "./auth-harness";
import { cookieHeaders } from "./auth-harness";

export interface GoogleTestClaims {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
}

export interface CallbackResult {
  path: string;
  error: string | null;
  setCookies: string[];
}

const base64Url = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");

// Better Auth 1.7.6 decodes (does not re-verify) the ID token that Google's token endpoint
// returns over TLS. If an upgrade changes that, this helper is the one place to adapt.
function idToken(claims: GoogleTestClaims, audience: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: "https://accounts.google.com",
    aud: audience,
    iat: now,
    exp: now + 3600,
    ...claims,
  };
  return `${base64Url({ alg: "RS256", typ: "JWT" })}.${base64Url(payload)}.sig`;
}

/**
 * Drive Better Auth's real Google callback, replacing only Google's token endpoint.
 * @param h - the auth harness
 * @param claims - the ID-token claims, or "cancel" for a denied consent
 * @returns where Better Auth redirected, its `error`, and the cookies it set
 */
export async function googleCallback(
  h: AuthHarness,
  claims: GoogleTestClaims | "cancel",
): Promise<CallbackResult> {
  const redirects = { callbackURL: "/auth/continue", errorCallbackURL: "/login" };
  const start = await h.deps.identity.googleSignInUrl(redirects);
  const state = new URL(start.url).searchParams.get("state") ?? "";
  const query =
    claims === "cancel" ? `error=access_denied&state=${state}` : `code=test-code&state=${state}`;
  const realFetch = globalThis.fetch;
  vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input);
    if (claims === "cancel" || !url.startsWith("https://oauth2.googleapis.com/token")) {
      return realFetch(input, init);
    }
    const body = { access_token: "ya29.test", id_token: idToken(claims, h.env.GOOGLE_CLIENT_ID) };
    return Promise.resolve(Response.json({ ...body, expires_in: 3600, token_type: "Bearer" }));
  });
  try {
    const url = `${h.env.BETTER_AUTH_URL}/api/auth/callback/google?${query}`;
    const response = await h.handler(
      new Request(url, { headers: cookieHeaders(start.setCookies) }),
    );
    const location = new URL(response.headers.get("location") ?? "/", h.env.BETTER_AUTH_URL);
    const error = location.searchParams.get("error");
    return { path: location.pathname, error, setCookies: response.headers.getSetCookie() };
  } finally {
    vi.unstubAllGlobals();
  }
}
```

`tests/integration/auth/better-auth-contract.test.ts`

```ts
import { NEW_PASSWORD, PASSWORD } from "@tests/support/auth/credentials";
import { uniqueEmail } from "@tests/support/auth/unique";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createAuth } from "@/adapters/auth/create-auth/create-auth";
import type { Auth, IssuedToken } from "@/adapters/auth/create-auth/create-auth.types";
import { createBetterAuthDatabase } from "@/adapters/db/better-auth-database/better-auth-database";
import type { Db } from "@/adapters/db/client/client.types";
import { user } from "@/adapters/db/schema/auth/auth";
import { parseAppEnv } from "@/shared/env/app-env";

import { openTestDb } from "../helpers/test-db";

// Pins the Better Auth 1.7.6 behaviour the plan relies on. If an upgrade breaks one of these,
// revisit the plan's "Verified library facts" before changing code (ADR-012).
let db: Db;
let close: () => Promise<void>;
let auth: Auth;
const issued: IssuedToken[] = [];

beforeAll(async () => {
  ({ db, close } = await openTestDb());
  auth = createAuth({
    database: createBetterAuthDatabase(db),
    env: parseAppEnv(process.env),
    onToken: (token) => {
      issued.push(token);
      return Promise.resolve();
    },
    onGoogleClaims: () => Promise.resolve(),
  });
});
afterAll(() => close());

function lastToken(email: string, kind: IssuedToken["kind"]): string {
  const token = issued.findLast((t) => t.user.email === email && t.kind === kind)?.token;
  if (!token) throw new Error(`no ${kind} token for ${email}`);
  return token;
}

async function signUp(): Promise<string> {
  const email = uniqueEmail();
  await auth.api.signUpEmail({ body: { name: "Owner", email, password: PASSWORD } });
  return email;
}

describe("Better Auth 1.7.6 contract", () => {
  it("AC-AUTH-001 sign-up creates an ACTIVE unverified user without a session", async () => {
    const email = uniqueEmail();
    const body = { name: "Owner", email, password: PASSWORD };
    const { headers } = await auth.api.signUpEmail({ body, returnHeaders: true });
    expect(headers.getSetCookie()).toHaveLength(0);
    const [row] = await db.select().from(user).where(eq(user.email, email));
    expect(row).toMatchObject({ status: "ACTIVE", emailVerified: false });
  });

  it("AC-AUTH-004 verifying signs in and sets email_verified_at through the hook", async () => {
    const email = await signUp();
    await auth.api.sendVerificationEmail({ body: { email } });
    const query = { token: lastToken(email, "VERIFY_EMAIL") };
    const { headers } = await auth.api.verifyEmail({ query, returnHeaders: true });
    expect(headers.getSetCookie().join(";")).toContain("session_token");
    const rows = await db.select().from(user).where(eq(user.email, email));
    expect(rows.at(0)?.emailVerifiedAt).toBeInstanceOf(Date);
  });

  it("AC-AUTH-005 R-2 verification tokens are reusable, so the link registry must guard them", async () => {
    const email = await signUp();
    await auth.api.sendVerificationEmail({ body: { email } });
    const query = { token: lastToken(email, "VERIFY_EMAIL") };
    await auth.api.verifyEmail({ query });
    await expect(auth.api.verifyEmail({ query })).resolves.toBeDefined();
  });

  it("AC-AUTH-018 R-2 an older reset token still works after a newer one is issued", async () => {
    const email = await signUp();
    await auth.api.requestPasswordReset({ body: { email } });
    const first = lastToken(email, "RESET_PASSWORD");
    await auth.api.requestPasswordReset({ body: { email } });
    const body = { token: first, newPassword: NEW_PASSWORD };
    await expect(auth.api.resetPassword({ body })).resolves.toBeDefined();
  });

  it("AC-AUTH-009 an unverified user can sign in; the restriction is ours to enforce", async () => {
    const email = await signUp();
    const body = { email, password: PASSWORD };
    const { headers } = await auth.api.signInEmail({ body, returnHeaders: true });
    expect(headers.getSetCookie().join(";")).toContain("session_token");
  });
});
```

`tests/integration/auth/identity-adapter.test.ts`

```ts
import { PASSWORD, WRONG_PASSWORD } from "@tests/support/auth/credentials";
import { tokenFrom } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { type AuthHarness, cookieHeaders, openAuthHarness } from "./helpers/auth-harness";

let h: AuthHarness;
beforeAll(async () => {
  h = await openAuthHarness();
});
afterAll(() => h.close());

async function registered() {
  const email = normaliseEmail(uniqueEmail());
  const created = await h.deps.identity.createPasswordUser({
    name: "Owner",
    email,
    password: PASSWORD,
  });
  expect(created).toEqual({ created: true });
  return email;
}

async function linkFor(email: string, kind: "VERIFY_EMAIL" | "RESET_PASSWORD") {
  await h.deps.outbox.flush();
  return tokenFrom(h.sender.lastUrl(email, kind));
}

describe("Better Auth identity adapter", () => {
  it("AC-AUTH-003 a second registration for the same email creates nothing", async () => {
    const email = await registered();
    const again = await h.deps.identity.createPasswordUser({
      name: "X",
      email,
      password: WRONG_PASSWORD,
    });
    expect(again).toEqual({ created: false });
  });

  it("AC-AUTH-004 emails verification links to our /verify/confirm route", async () => {
    const email = await registered();
    await h.deps.identity.sendVerificationLink(email);
    await h.deps.outbox.flush();
    expect(new URL(h.sender.lastUrl(email, "VERIFY_EMAIL") ?? "").pathname).toBe("/verify/confirm");
  });

  it("AC-AUTH-005 AC-AUTH-006 a verification link works once and a newer one supersedes it", async () => {
    const email = await registered();
    await h.deps.identity.sendVerificationLink(email);
    const first = await linkFor(email, "VERIFY_EMAIL");
    await h.deps.identity.sendVerificationLink(email);
    const second = await linkFor(email, "VERIFY_EMAIL");
    expect((await h.deps.identity.verifyEmail(first)).ok).toBe(false);
    expect((await h.deps.identity.verifyEmail(second)).ok).toBe(true);
    expect((await h.deps.identity.verifyEmail(second)).ok).toBe(false);
  });

  it("AC-AUTH-018 reset links are single-use and superseded", async () => {
    const email = await registered();
    await h.deps.identity.sendResetLink(email);
    const first = await linkFor(email, "RESET_PASSWORD");
    await h.deps.identity.sendResetLink(email);
    const second = await linkFor(email, "RESET_PASSWORD");
    expect(await h.deps.identity.isResetLinkUsable(first)).toBe(false);
    expect(await h.deps.identity.resetPassword({ token: first, newPassword: "new-horse-1" })).toBe(
      false,
    );
    expect(await h.deps.identity.resetPassword({ token: second, newPassword: "new-horse-1" })).toBe(
      true,
    );
    expect(await h.deps.identity.resetPassword({ token: second, newPassword: "new-horse-2" })).toBe(
      false,
    );
  });

  it("AC-AUTH-008 signs in with the right password only", async () => {
    const email = await registered();
    const wrong = await h.deps.identity.signInWithPassword(
      { email, password: WRONG_PASSWORD },
      new Headers(),
    );
    expect(wrong.ok).toBe(false);
    const right = await h.deps.identity.signInWithPassword(
      { email, password: PASSWORD },
      new Headers(),
    );
    if (!right.ok) throw new Error("expected a session");
    expect(await h.deps.identity.getSessionUserId(cookieHeaders(right.setCookies))).toBe(
      right.userId,
    );
  });
});
```

`tests/integration/auth/google-sign-in.test.ts`

```ts
import { PASSWORD } from "@tests/support/auth/credentials";
import { tokenFrom } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { and, eq, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { account, user } from "@/adapters/db/schema/auth/auth";
import { continueAfterSignIn } from "@/features/auth/application/use-cases/continue-after-sign-in/continue-after-sign-in";
import { registerOwner } from "@/features/auth/application/use-cases/register-owner/register-owner";
import type { AuthUserId } from "@/features/auth/domain/account/account.types";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { type AuthHarness, cookieHeaders, meta, openAuthHarness } from "./helpers/auth-harness";
import { googleCallback } from "./helpers/google-callback";

let h: AuthHarness;
beforeAll(async () => {
  h = await openAuthHarness();
});
afterAll(() => h.close());

const claims = (email: string, verified = true) => ({
  sub: crypto.randomUUID(),
  email,
  email_verified: verified,
  name: "Alya Google",
});

async function usersWith(email: string): Promise<number> {
  const rows = await h.db
    .select({ id: user.id })
    .from(user)
    .where(sql`lower(${user.email}) = ${email}`);
  return rows.length;
}

async function googleAccount(userId: AuthUserId) {
  const google = and(eq(account.userId, userId), eq(account.providerId, "google"));
  return (await h.db.select().from(account).where(google)).at(0);
}

async function owner(verified: boolean) {
  const email = normaliseEmail(uniqueEmail());
  await registerOwner(h.deps, { name: "Alya", email, password: PASSWORD }, meta());
  await h.settle();
  if (verified)
    await h.deps.identity.verifyEmail(tokenFrom(h.sender.lastUrl(email, "VERIFY_EMAIL")));
  const found = await h.deps.accounts.findByEmail(email);
  if (!found) throw new Error("fixture: registration failed");
  return { email, userId: found.id };
}

describe("Google sign-in (ADR-012)", () => {
  it("AC-AUTH-025 requests exactly openid email profile", async () => {
    const { url } = await h.deps.identity.googleSignInUrl({
      callbackURL: "/auth/continue",
      errorCallbackURL: "/login",
    });
    expect(new URL(url).searchParams.get("scope")?.split(" ").sort()).toEqual([
      "email",
      "openid",
      "profile",
    ]);
  });

  it("AC-AUTH-024 AC-AUTH-025 creates one verified password-less account and stores no tokens", async () => {
    const email = normaliseEmail(uniqueEmail("g"));
    const result = await googleCallback(h, claims(email));
    expect(result).toMatchObject({ path: "/auth/continue", error: null });
    const created = await h.deps.accounts.findByEmail(email);
    expect(created).toMatchObject({ status: "ACTIVE", emailVerified: true, hasPassword: false });
    if (!created) throw new Error("expected the created account");
    expect(await googleAccount(created.id)).toMatchObject({
      accessToken: null,
      refreshToken: null,
      idToken: null,
    });
  });

  it("AC-AUTH-026 links to an existing verified account and keeps its password", async () => {
    const { email, userId } = await owner(true);
    const result = await googleCallback(h, claims(email));
    expect(result.error).toBeNull();
    expect(await usersWith(email)).toBe(1);
    expect(await h.deps.identity.getSessionUserId(cookieHeaders(result.setCookies))).toBe(userId);
    expect((await h.deps.accounts.getById(userId))?.hasPassword).toBe(true);
  });

  it("AC-AUTH-027 BR-AUTH-007 takes over an unverified pre-registration safely", async () => {
    const { email, userId } = await owner(false);
    const squatter = await h.deps.identity.signInWithPassword(
      { email, password: PASSWORD },
      new Headers(),
    );
    const result = await googleCallback(h, claims(email));
    expect(result.error).toBeNull();
    expect(await h.deps.accounts.getById(userId)).toMatchObject({
      emailVerified: true,
      hasPassword: false,
    });
    if (squatter.ok)
      expect(await h.deps.identity.getSessionUserId(cookieHeaders(squatter.setCookies))).toBeNull();
  });

  it("AC-AUTH-028 refuses an unverified Google email and creates or links nothing", async () => {
    const email = normaliseEmail(uniqueEmail("g"));
    expect((await googleCallback(h, claims(email, false))).path).toBe("/login");
    expect(await usersWith(email)).toBe(0);
    const existing = await owner(true);
    expect((await googleCallback(h, claims(existing.email, false))).path).toBe("/login");
    expect(await googleAccount(existing.userId)).toBeUndefined();
  });

  it("AC-AUTH-029 a cancelled consent creates nothing and returns to login", async () => {
    expect(await googleCallback(h, "cancel")).toMatchObject({
      path: "/login",
      error: "access_denied",
    });
  });

  it("AC-AUTH-031 a suspended Google owner ends with no session", async () => {
    const email = normaliseEmail(uniqueEmail("g"));
    await googleCallback(h, claims(email));
    const created = await h.deps.accounts.findByEmail(email);
    if (!created) throw new Error("expected the created account");
    await h.deps.accounts.setStatusAndRevokeSessions(created.id, "SUSPENDED");
    await googleCallback(h, claims(email));
    expect(await continueAfterSignIn(h.deps, created.id)).toEqual({
      kind: "UNAVAILABLE",
      path: "/account-unavailable",
    });
  });
});
```

- [ ] **Step 3: Run them to verify they fail.**

Run: `pnpm test src/adapters/auth; pnpm test:integration tests/integration/auth`
Expected: FAIL, missing modules.

- [ ] **Step 4: Write the adapter.**

`src/adapters/auth/create-auth/create-auth.types.ts`

```ts
import type { drizzleAdapter } from "better-auth/adapters/drizzle";

import type { AuthLinkKind } from "@/features/auth/application/ports/auth-email/auth-email.port";

import type { createAuth } from "./create-auth";

export interface AuthEnv {
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

export interface TokenUser {
  id: string;
  email: string;
  name: string;
}

export interface TokenMail {
  user: TokenUser;
  token: string;
}

export interface IssuedToken {
  kind: AuthLinkKind;
  user: TokenUser;
  token: string;
}

export interface GoogleClaims {
  email: string;
  email_verified: boolean;
}

export interface UserHookData {
  emailVerified: boolean;
  emailVerifiedAt?: Date | null;
}

export interface AccountHookData {
  providerId: string;
}

export interface HookContext {
  path?: string;
}

export interface CreateAuthDeps {
  database: ReturnType<typeof drizzleAdapter>;
  env: AuthEnv;
  onToken: (issued: IssuedToken) => Promise<void>;
  onGoogleClaims: (claims: GoogleClaims) => Promise<void>;
}

export type Auth = ReturnType<typeof createAuth>;
```

`src/adapters/auth/create-auth/create-auth.ts`

```ts
import "server-only";

import { betterAuth } from "better-auth";

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/features/auth/domain/credentials/credentials";

import type {
  AccountHookData,
  CreateAuthDeps,
  GoogleClaims,
  HookContext,
  TokenMail,
  TokenUser,
  UserHookData,
} from "./create-auth.types";

const HOUR = 60 * 60;
const DAY = 24 * HOUR;

/** A-2 session lifetime and refresh; A-3 link lifetimes. */
export const AUTH_TTL = {
  sessionSeconds: 7 * DAY,
  sessionUpdateAgeSeconds: DAY,
  verifySeconds: DAY,
  resetSeconds: HOUR,
} as const;

function pickUser(user: TokenUser): TokenUser {
  return { id: user.id, email: user.email, name: user.name };
}

/**
 * True for Better Auth's OAuth callback requests, e.g. `/callback/google`.
 * @param ctx - the endpoint context Better Auth passes to database hooks, if any
 * @returns whether the hook runs inside a social sign-in callback
 */
export function isSocialCallback(ctx: HookContext | null): boolean {
  return ctx?.path?.startsWith("/callback/") ?? false;
}

function emailOptions({ onToken }: CreateAuthDeps) {
  return {
    emailAndPassword: {
      enabled: true,
      minPasswordLength: PASSWORD_MIN_LENGTH,
      maxPasswordLength: PASSWORD_MAX_LENGTH,
      // Unverified users get a restricted session instead (BR-AUTH-003, AC-AUTH-009).
      requireEmailVerification: false,
      autoSignIn: false,
      resetPasswordTokenExpiresIn: AUTH_TTL.resetSeconds,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: ({ user, token }: TokenMail) =>
        onToken({ kind: "RESET_PASSWORD", user: pickUser(user), token }),
    },
    emailVerification: {
      sendOnSignUp: false,
      autoSignInAfterVerification: true,
      expiresIn: AUTH_TTL.verifySeconds,
      sendVerificationEmail: ({ user, token }: TokenMail) =>
        onToken({ kind: "VERIFY_EMAIL", user: pickUser(user), token }),
    },
  };
}

function googleOptions({ env, onGoogleClaims }: CreateAuthDeps) {
  return {
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        // Runs with the ID-token claims before Better Auth looks up the local user (BR-AUTH-007).
        mapProfileToUser: async (profile: GoogleClaims) => {
          await onGoogleClaims({ email: profile.email, email_verified: profile.email_verified });
          return {};
        },
      },
    },
    account: {
      // Google is deliberately not trusted, so Better Auth always requires Google's
      // email_verified before it links (BR-AUTH-006; ADR-012 wording, see plan decisions).
      accountLinking: { enabled: true, trustedProviders: [] },
      // Never refresh or store provider tokens on sign-in (ADR-012).
      updateAccountOnSignIn: false,
    },
  };
}

function databaseHooks() {
  const withoutTokens = {
    accessToken: null,
    refreshToken: null,
    idToken: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
  };
  return {
    user: {
      create: {
        before: (user: UserHookData, ctx: HookContext | null) =>
          // AC-AUTH-028: no account from an unverified Google email.
          Promise.resolve(
            isSocialCallback(ctx) && !user.emailVerified
              ? false
              : { data: { ...user, emailVerifiedAt: user.emailVerified ? new Date() : null } },
          ),
      },
      update: {
        before: (user: Partial<UserHookData>) =>
          Promise.resolve(
            user.emailVerified === true && !user.emailVerifiedAt
              ? { data: { ...user, emailVerifiedAt: new Date() } }
              : undefined,
          ),
      },
    },
    account: {
      create: {
        // ADR-012: keep the Google link, drop every provider token.
        before: (acc: AccountHookData) =>
          Promise.resolve(
            acc.providerId === "google" ? { data: { ...acc, ...withoutTokens } } : undefined,
          ),
      },
    },
  };
}

/**
 * Build Better Auth for one request. ADR-009 forbids sharing the Pool behind `database`
 * across requests, so this runs per request; only the options are fixed.
 * @param deps - the request's database adapter, the env, and the token and Google callbacks
 * @returns the Better Auth instance
 */
export function createAuth(deps: CreateAuthDeps) {
  return betterAuth({
    secret: deps.env.BETTER_AUTH_SECRET,
    baseURL: deps.env.BETTER_AUTH_URL,
    database: deps.database,
    // Auth limits are enforced by the application RateLimiterPort (ADR-013).
    rateLimit: { enabled: false },
    advanced: { ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] } },
    user: {
      additionalFields: {
        status: { type: "string", required: false, defaultValue: "ACTIVE", input: false },
        emailVerifiedAt: { type: "date", required: false, input: false },
      },
    },
    session: {
      expiresIn: AUTH_TTL.sessionSeconds,
      updateAge: AUTH_TTL.sessionUpdateAgeSeconds,
      // Status is read from the database on every request (AC-AUTH-014).
      cookieCache: { enabled: false },
    },
    ...emailOptions(deps),
    ...googleOptions(deps),
    databaseHooks: databaseHooks(),
  });
}
```

`src/adapters/auth/google-guard/google-guard.ts`

```ts
import "server-only";

import type { AccountDirectoryPort } from "@/features/auth/application/ports/account-directory/account-directory.port";
import { googleLinkDecision } from "@/features/auth/domain/account/account";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import type { GoogleClaims } from "../create-auth/create-auth.types";

/**
 * The BR-AUTH-007 takeover guard. Better Auth 1.7.6 calls Google `mapProfileToUser` with the
 * ID-token claims before it looks up the local user, so an unverified local account that is
 * about to be linked is verified, loses its password and loses every session first.
 * @param accounts - the account directory port
 * @returns the callback for `CreateAuthDeps.onGoogleClaims`
 */
export function createGoogleClaimsGuard(
  accounts: Pick<AccountDirectoryPort, "findByEmail" | "applyGoogleTakeoverGuard">,
): (claims: GoogleClaims) => Promise<void> {
  return async (claims) => {
    const existing = await accounts.findByEmail(normaliseEmail(claims.email));
    const decision = googleLinkDecision({ googleEmailVerified: claims.email_verified, existing });
    if (decision === "LINK_WITH_TAKEOVER_GUARD" && existing) {
      await accounts.applyGoogleTakeoverGuard(existing.id);
    }
  };
}
```

`src/adapters/auth/identity/better-auth-identity.types.ts`

```ts
import type { AccountDirectoryPort } from "@/features/auth/application/ports/account-directory/account-directory.port";
import type { AuthLink } from "@/features/auth/application/ports/auth-email/auth-email.port";
import type { IdentityPort } from "@/features/auth/application/ports/identity/identity.port";
import type { LinkRegistryPort } from "@/features/auth/application/ports/link-registry/link-registry.port";

import type { AuthEnv, CreateAuthDeps } from "../create-auth/create-auth.types";

export interface BetterAuthIdentityDeps {
  database: CreateAuthDeps["database"];
  env: AuthEnv;
  accounts: AccountDirectoryPort;
  links: LinkRegistryPort;
  onLink: (link: AuthLink) => void;
}

export interface BetterAuthIdentity {
  identity: IdentityPort;
  /** Better Auth's own endpoints, including the Google callback (`/api/auth/*`). */
  handler: (request: Request) => Promise<Response>;
}
```

`src/adapters/auth/identity/better-auth-identity.ts`

```ts
import "server-only";

import { APIError } from "better-auth/api";

import type { AuthLinkKind } from "@/features/auth/application/ports/auth-email/auth-email.port";
import type { IdentityPort } from "@/features/auth/application/ports/identity/identity.port";
import { asAuthUserId } from "@/features/auth/domain/account/account";

import { AUTH_TTL, createAuth } from "../create-auth/create-auth";
import type { Auth, IssuedToken } from "../create-auth/create-auth.types";
import { createGoogleClaimsGuard } from "../google-guard/google-guard";
import type { BetterAuthIdentity, BetterAuthIdentityDeps } from "./better-auth-identity.types";

const LINK_PATH: Record<AuthLinkKind, string> = {
  VERIFY_EMAIL: "/verify/confirm",
  RESET_PASSWORD: "/reset-password",
};
const LINK_TTL: Record<AuthLinkKind, number> = {
  VERIFY_EMAIL: AUTH_TTL.verifySeconds,
  RESET_PASSWORD: AUTH_TTL.resetSeconds,
};

// Better Auth refuses expected cases (bad password, bad token, no session) with APIError;
// those become "not ok". Anything else is unexpected and propagates.
async function attempt<T>(run: () => Promise<T>): Promise<T | null> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof APIError) return null;
    throw error;
  }
}

function sessionMethods(auth: Auth, deps: BetterAuthIdentityDeps) {
  return {
    async getSessionUserId(headers) {
      const current = await auth.api.getSession({ headers });
      return current ? asAuthUserId(current.user.id) : null;
    },
    async signInWithPassword({ email, password }, headers) {
      const body = { email, password };
      const result = await attempt(() =>
        auth.api.signInEmail({ body, headers, returnHeaders: true }),
      );
      if (!result) return { ok: false };
      const userId = asAuthUserId(result.response.user.id);
      return { ok: true, userId, setCookies: result.headers.getSetCookie() };
    },
    async signOut(headers) {
      const result = await attempt(() => auth.api.signOut({ headers, returnHeaders: true }));
      return { setCookies: result ? result.headers.getSetCookie() : [] };
    },
    async googleSignInUrl({ callbackURL, errorCallbackURL }) {
      const body = { provider: "google", callbackURL, errorCallbackURL, disableRedirect: true };
      const { headers, response } = await auth.api.signInSocial({ body, returnHeaders: true });
      if (!response.url) throw new Error("Better Auth returned no Google authorization URL");
      return { url: response.url, setCookies: headers.getSetCookie() };
    },
    async createPasswordUser({ name, email, password }) {
      const result = await attempt(() => auth.api.signUpEmail({ body: { name, email, password } }));
      if (!result) return { created: false };
      // With autoSignIn off, Better Auth answers an existing email with a synthetic user.
      return { created: (await deps.accounts.getById(asAuthUserId(result.user.id))) !== null };
    },
  } satisfies Partial<IdentityPort>;
}

function linkMethods(auth: Auth, deps: BetterAuthIdentityDeps) {
  return {
    async sendVerificationLink(email) {
      await auth.api.sendVerificationEmail({ body: { email } });
    },
    async verifyEmail(token) {
      const userId = await deps.links.consume("VERIFY_EMAIL", token);
      if (!userId) return { ok: false };
      const query = { token };
      const result = await attempt(() => auth.api.verifyEmail({ query, returnHeaders: true }));
      if (!result) return { ok: false };
      return { ok: true, userId, setCookies: result.headers.getSetCookie() };
    },
    async sendResetLink(email) {
      await auth.api.requestPasswordReset({ body: { email } });
    },
    isResetLinkUsable: (token) => deps.links.isCurrent("RESET_PASSWORD", token),
    async resetPassword({ token, newPassword }) {
      if (!(await deps.links.consume("RESET_PASSWORD", token))) return false;
      const body = { token, newPassword };
      return (await attempt(() => auth.api.resetPassword({ body }))) !== null;
    },
  } satisfies Partial<IdentityPort>;
}

function accountMethods(auth: Auth) {
  return {
    async changePassword({ currentPassword, newPassword }, headers) {
      const body = { currentPassword, newPassword, revokeOtherSessions: true };
      const result = await attempt(() =>
        auth.api.changePassword({ body, headers, returnHeaders: true }),
      );
      if (!result) return { ok: false };
      return { ok: true, setCookies: result.headers.getSetCookie() };
    },
    async updateName(name, headers) {
      await auth.api.updateUser({ body: { name }, headers });
    },
  } satisfies Partial<IdentityPort>;
}

/**
 * Better Auth behind `IdentityPort` (ADR-002), built per request over the request's database
 * (ADR-009). Every issued link is recorded in the latest-link registry before it is emailed.
 * @param deps - the database adapter, env, account directory, link registry and link sink
 * @returns the identity port and Better Auth's route handler
 */
export function createBetterAuthIdentity(deps: BetterAuthIdentityDeps): BetterAuthIdentity {
  const onToken = async ({ kind, user, token }: IssuedToken): Promise<void> => {
    const userId = asAuthUserId(user.id);
    await deps.links.record({ userId, purpose: kind, token, ttlSeconds: LINK_TTL[kind] });
    const url = `${deps.env.BETTER_AUTH_URL}${LINK_PATH[kind]}?token=${encodeURIComponent(token)}`;
    deps.onLink({ kind, to: user.email, name: user.name, url });
  };
  const onGoogleClaims = createGoogleClaimsGuard(deps.accounts);
  const auth = createAuth({ database: deps.database, env: deps.env, onToken, onGoogleClaims });
  const identity: IdentityPort = {
    ...sessionMethods(auth, deps),
    ...linkMethods(auth, deps),
    ...accountMethods(auth),
  };
  return { identity, handler: (request) => auth.handler(request) };
}
```

- [ ] **Step 5: Run the tests to verify they pass.**

Run: `pnpm test src/adapters/auth && pnpm test:integration tests/integration/auth && pnpm lint`
Expected: PASS.
- If one of the two **R-2** contract tests fails, Better Auth now enforces single use itself. Keep the registry, and record the change under R-2.
- If **AC-AUTH-028** (existing verified account) fails because Better Auth links without Google's `email_verified`, its linking rules changed. Stop and re-read `oauth2/link-account.mjs` in the installed version before changing code.

- [ ] **Step 6: Measure hashing cost on Workers (R-3).** Run `pnpm preview`, register one account through `/register`, and read the CPU time of that `POST` in the Wrangler output. Record the number under R-3 in technical-design.md. If it is close to the plan's CPU limit, stop and ask the Owner (cheaper scrypt settings or a paid Workers plan).

- [ ] **Step 7: Commit.**

```bash
git add src/adapters/auth tests/integration/auth docs/features/auth/technical-design.md
git commit -m "feat(auth): add the Better Auth identity adapter with the Google takeover guard"
```

## Task 20: Email adapters

**Files:**
- `src/adapters/email/auth-email-templates/auth-email-templates.{ts,copy.ts,types.ts,test.ts}`
- `src/adapters/email/auth-email-sender/resend-auth-email-sender.{ts,types.ts,test.ts}`
- `src/adapters/email/capturing-email-sender/capturing-email-sender.{ts,types.ts,test.ts}`

The email copy is Indonesian (CONFLICT-1) and is not drawn in Pencil. List it for Owner review in Task 32.

- [ ] **Step 1: Write the failing tests.**

`src/adapters/email/auth-email-templates/auth-email-templates.test.ts`

```ts
import { describe, expect, it } from "vitest";

import type { AuthLink } from "@/features/auth/application/ports/auth-email/auth-email.port";

import { renderAuthEmail } from "./auth-email-templates";
import { AUTH_EMAIL_COPY } from "./auth-email-templates.copy";

const verify: AuthLink = {
  kind: "VERIFY_EMAIL",
  to: "owner@example.com",
  name: "Alya <b>",
  url: "https://app.shutrly.dev/verify/confirm?token=t&x=1",
};

describe("renderAuthEmail", () => {
  it("AC-AUTH-001 puts the link in the text body and escapes the name and URL in HTML", () => {
    const mail = renderAuthEmail(verify);
    expect(mail.subject).toBe(AUTH_EMAIL_COPY.VERIFY_EMAIL.subject);
    expect(mail.text).toContain(verify.url);
    expect(mail.html).toContain("Alya &lt;b&gt;");
    expect(mail.html).toContain("token=t&amp;x=1");
  });

  it("AC-AUTH-005 AC-AUTH-018 states each link's lifetime (A-3)", () => {
    expect(renderAuthEmail(verify).text).toContain(AUTH_EMAIL_COPY.VERIFY_EMAIL.expiry);
    const reset = renderAuthEmail({ ...verify, kind: "RESET_PASSWORD" });
    expect(reset.subject).toBe(AUTH_EMAIL_COPY.RESET_PASSWORD.subject);
    expect(reset.text).toContain(AUTH_EMAIL_COPY.RESET_PASSWORD.expiry);
  });
});
```

`src/adapters/email/auth-email-sender/resend-auth-email-sender.test.ts`

```ts
import { describe, expect, it, vi } from "vitest";

import { EmailDeliveryError } from "@/features/auth/application/errors/email-delivery-error/email-delivery-error";
import type { AuthLink } from "@/features/auth/application/ports/auth-email/auth-email.port";

import { createResendAuthEmailSender } from "./resend-auth-email-sender";

const verify: AuthLink = {
  kind: "VERIFY_EMAIL",
  to: "owner@example.com",
  name: "Alya",
  url: "https://app.shutrly.dev/verify/confirm?token=secret-token",
};

describe("Resend auth email sender (ADR-011)", () => {
  it("AC-AUTH-001 posts the rendered email to Resend with the API key", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response("{}", { status: 200 })));
    const sender = createResendAuthEmailSender({
      apiKey: "re_k",
      from: "S <a@x.dev>",
      fetch: fetchMock,
    });
    await sender.send(verify);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers).toMatchObject({ Authorization: "Bearer re_k" });
    const body = JSON.parse(init.body as string) as { to: string[]; text: string };
    expect(body.to).toEqual(["owner@example.com"]);
    expect(body.text).toContain(verify.url);
  });

  it("AC-AUTH-021 AC-AUTH-022 throws EmailDeliveryError without the link on HTTP failure", async () => {
    const failing = () => Promise.resolve(new Response("no", { status: 500 }));
    const sender = createResendAuthEmailSender({ apiKey: "k", from: "f", fetch: failing });
    const error: unknown = await sender.send(verify).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(EmailDeliveryError);
    expect(String(error)).not.toContain("secret-token");
  });

  it("AC-AUTH-022 throws EmailDeliveryError on a network failure", async () => {
    const offline = () => Promise.reject(new TypeError("network"));
    const sender = createResendAuthEmailSender({ apiKey: "k", from: "f", fetch: offline });
    await expect(sender.send(verify)).rejects.toBeInstanceOf(EmailDeliveryError);
  });
});
```

`src/adapters/email/capturing-email-sender/capturing-email-sender.test.ts`

```ts
import { describe, expect, it } from "vitest";

import {
  capturedLinks,
  createCapturingEmailSender,
  isEmailCaptureEnabled,
} from "./capturing-email-sender";

const LOCAL = "http://localhost:3000";

describe("capturing email sender (E2E only)", () => {
  it("AC-AUTH-021 is enabled only with the flag on a localhost base URL", () => {
    expect(isEmailCaptureEnabled({ BETTER_AUTH_URL: LOCAL })).toBe(false);
    expect(isEmailCaptureEnabled({ E2E_EMAIL_CAPTURE: "1", BETTER_AUTH_URL: LOCAL })).toBe(true);
    const production = { E2E_EMAIL_CAPTURE: "1", BETTER_AUTH_URL: "https://app.shutrly.com" };
    expect(isEmailCaptureEnabled(production)).toBe(false);
  });

  it("AC-AUTH-004 keeps the links per recipient", async () => {
    const link = { kind: "VERIFY_EMAIL", to: "e2e@x.dev", name: "E", url: "u" } as const;
    await createCapturingEmailSender().send(link);
    expect(capturedLinks("E2E@x.dev")).toEqual([link]);
  });
});
```

- [ ] **Step 2: Run them to verify they fail.**

Run: `pnpm test src/adapters/email`
Expected: FAIL, missing modules.

- [ ] **Step 3: Write the adapters.**

`src/adapters/email/auth-email-templates/auth-email-templates.copy.ts`

```ts
import "server-only";

// not in Pencil — auth email copy (Indonesian, CONFLICT-1 resolved 2026-09-27); Owner review.
export const AUTH_EMAIL_COPY = {
  greeting: "Halo",
  VERIFY_EMAIL: {
    subject: "Verifikasi email Anda untuk Shutrly",
    intro: "Konfirmasi email Anda untuk menyelesaikan pendaftaran Shutrly.",
    action: "Verifikasi email",
    expiry: "Tautan ini berlaku 24 jam dan hanya bisa dipakai sekali.",
    ignore: "Jika Anda tidak membuat akun Shutrly, abaikan email ini.",
  },
  RESET_PASSWORD: {
    subject: "Atur ulang kata sandi Shutrly Anda",
    intro: "Buat kata sandi baru untuk akun Shutrly Anda.",
    action: "Buat kata sandi baru",
    expiry: "Tautan ini berlaku satu jam dan hanya bisa dipakai sekali.",
    ignore: "Jika Anda tidak memintanya, abaikan email ini. Kata sandi Anda tidak berubah.",
  },
} as const;
```

`src/adapters/email/auth-email-templates/auth-email-templates.types.ts`

```ts
export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}
```

`src/adapters/email/auth-email-templates/auth-email-templates.ts`

```ts
import "server-only";

import type { AuthLink } from "@/features/auth/application/ports/auth-email/auth-email.port";

import { AUTH_EMAIL_COPY } from "./auth-email-templates.copy";
import type { RenderedEmail } from "./auth-email-templates.types";

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

/**
 * Render the verification or reset email as plain text and minimal HTML. The name and URL are
 * escaped in HTML; the copy lives in `auth-email-templates.copy.ts`.
 * @param link - the link kind, recipient name and URL
 * @returns the subject, text body and HTML body
 */
export function renderAuthEmail(link: AuthLink): RenderedEmail {
  const copy = AUTH_EMAIL_COPY[link.kind];
  const greeting = `${AUTH_EMAIL_COPY.greeting} ${link.name},`;
  const text = [greeting, "", copy.intro, link.url, "", copy.expiry, copy.ignore].join("\n");
  const html = [
    `<p>${escapeHtml(greeting)}</p>`,
    `<p>${copy.intro}</p>`,
    `<p><a href="${escapeHtml(link.url)}">${copy.action}</a></p>`,
    `<p>${copy.expiry}</p>`,
    `<p>${copy.ignore}</p>`,
  ].join("");
  return { subject: copy.subject, text, html };
}
```

`src/adapters/email/auth-email-sender/resend-auth-email-sender.types.ts`

```ts
export interface ResendConfig {
  apiKey: string;
  from: string;
  fetch?: typeof fetch;
}
```

`src/adapters/email/auth-email-sender/resend-auth-email-sender.ts`

```ts
import "server-only";

import { EmailDeliveryError } from "@/features/auth/application/errors/email-delivery-error/email-delivery-error";
import type {
  AuthEmailPort,
  AuthLink,
} from "@/features/auth/application/ports/auth-email/auth-email.port";

import { renderAuthEmail } from "../auth-email-templates/auth-email-templates";
import type { ResendConfig } from "./resend-auth-email-sender.types";

const RESEND_URL = "https://api.resend.com/emails";

/**
 * Auth emails through Resend's HTTP API with `fetch`, which works on Workers (ADR-011).
 * @param config - the API key, the sender address and an optional `fetch` for tests
 * @returns the `AuthEmailPort`; `send` throws `EmailDeliveryError` without the link or recipient
 */
export function createResendAuthEmailSender(config: ResendConfig): AuthEmailPort {
  const doFetch = config.fetch ?? fetch;
  const post = (link: AuthLink): Promise<Response> => {
    const mail = renderAuthEmail(link);
    return doFetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: config.from, to: [link.to], ...mail }),
    });
  };
  return {
    async send(link) {
      // The network error is dropped on purpose: it may echo request details (C-103).
      const response = await post(link).catch(() => null);
      if (!response) throw new EmailDeliveryError(link.kind);
      if (!response.ok) throw new EmailDeliveryError(link.kind, response.status);
    },
  };
}
```

`src/adapters/email/capturing-email-sender/capturing-email-sender.types.ts`

```ts
export interface CaptureEnv {
  E2E_EMAIL_CAPTURE?: string;
  BETTER_AUTH_URL: string;
}
```

`src/adapters/email/capturing-email-sender/capturing-email-sender.ts`

```ts
import "server-only";

import type {
  AuthEmailPort,
  AuthLink,
} from "@/features/auth/application/ports/auth-email/auth-email.port";

import type { CaptureEnv } from "./capturing-email-sender.types";

// E2E only, under local `next dev`: links stay in this process so Playwright can open them.
const captured: AuthLink[] = [];

/**
 * Tell whether E2E email capture may run: the flag is set and the app URL is localhost.
 * @param env - the flag and the app base URL
 * @returns true only for a localhost base URL with `E2E_EMAIL_CAPTURE=1`
 */
export function isEmailCaptureEnabled(env: CaptureEnv): boolean {
  if (env.E2E_EMAIL_CAPTURE !== "1") return false;
  const host = new URL(env.BETTER_AUTH_URL).hostname;
  return host === "localhost" || host === "127.0.0.1";
}

/**
 * An email port that keeps links in memory instead of sending them.
 * @returns the capturing `AuthEmailPort`
 */
export function createCapturingEmailSender(): AuthEmailPort {
  return {
    send: (link) => {
      captured.push(link);
      return Promise.resolve();
    },
  };
}

/**
 * The links captured for one recipient, oldest first.
 * @param to - the recipient email
 * @returns the captured links
 */
export function capturedLinks(to: string): AuthLink[] {
  return captured.filter((link) => link.to === to.toLowerCase());
}
```

- [ ] **Step 4: Run them to verify they pass.**

Run: `pnpm test src/adapters/email && pnpm lint`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit.**

```bash
git add src/adapters/email
git commit -m "feat(auth): add the Resend auth email sender, templates and E2E capture"
```

## Task 21: Operator scripts

**Files:** `scripts/auth/set-user-status.ts`, `scripts/auth/purge-auth-rate-limits.ts`, `package.json` (scripts)

The scripts import server modules, which start with `import "server-only"`. Outside Next, that import throws unless Node resolves the `react-server` export condition. The package scripts therefore run `tsx --conditions=react-server`. There is no scheduler until CI exists: the Owner runs the purge by hand (ADR-013 follow-up in technical-design.md).

- [ ] **Step 1: Write the scripts.**

`scripts/auth/set-user-status.ts`

```ts
// Operator-only status change (BR-AUTH-005, AC-AUTH-015). Revokes every session of the user.
// Usage: DATABASE_URL=<pooled url> pnpm auth:set-status <email> <ACTIVE|SUSPENDED|DISABLED>
import { createDrizzleAccountDirectory } from "@/adapters/db/account-directory/drizzle-account-directory";
import { createDb } from "@/adapters/db/client/client";
import { setOwnerStatus } from "@/features/auth/application/use-cases/set-owner-status/set-owner-status";

async function main(email: string, status: string, url: string): Promise<void> {
  const { db, pool } = createDb(url);
  try {
    const accounts = createDrizzleAccountDirectory(db);
    const result = await setOwnerStatus({ accounts, requestId: "operator" }, { email, status });
    if (result.ok)
      console.log(`User ${result.userId} is now ${status}; every session was revoked.`);
    else {
      console.error(`Not changed: ${result.reason}`);
      process.exitCode = 1;
    }
  } finally {
    await pool.end();
  }
}

function fail(error: unknown): void {
  console.error(error);
  process.exitCode = 1;
}

const [email, status] = process.argv.slice(2);
const url = process.env.DATABASE_URL;
if (!email || !status || !url) {
  console.error("Usage: DATABASE_URL=… pnpm auth:set-status <email> <ACTIVE|SUSPENDED|DISABLED>");
  process.exitCode = 2;
} else {
  main(email, status, url).catch(fail);
}
```

`scripts/auth/purge-auth-rate-limits.ts`

```ts
// ADR-013 cleanup: delete rate-limit windows older than 2 hours (the longest window is 1 hour).
// Usage: DATABASE_URL=<pooled url> pnpm auth:purge-rate-limits
import { createDb } from "@/adapters/db/client/client";
import { createNeonRateLimiter } from "@/adapters/db/rate-limiter/neon-rate-limiter";

const RETENTION_MS = 2 * 60 * 60 * 1000;

async function main(url: string): Promise<void> {
  const { db, pool } = createDb(url);
  try {
    const cutoff = new Date(Date.now() - RETENTION_MS);
    const removed = await createNeonRateLimiter(db).purgeBefore(cutoff);
    console.log(`Purged ${String(removed)} expired auth rate-limit windows.`);
  } finally {
    await pool.end();
  }
}

function fail(error: unknown): void {
  console.error(error);
  process.exitCode = 1;
}

const url = process.env.DATABASE_URL;
if (url) main(url).catch(fail);
else {
  console.error("Usage: DATABASE_URL=… pnpm auth:purge-rate-limits");
  process.exitCode = 2;
}
```

- [ ] **Step 2: Add the package scripts.** In `package.json` › `scripts`, after `"db:migrate"`, add:

```json
    "auth:set-status": "tsx --conditions=react-server scripts/auth/set-user-status.ts",
    "auth:purge-rate-limits": "tsx --conditions=react-server scripts/auth/purge-auth-rate-limits.ts",
```

- [ ] **Step 3: Check the usage path.**

Run: `DATABASE_URL= pnpm -s auth:set-status`
Expected: `Usage: DATABASE_URL=… pnpm auth:set-status <email> <ACTIVE|SUSPENDED|DISABLED>`, exit code 2. The use case behind it is unit-tested in Task 12 (AC-AUTH-015) and integration-tested in Task 18.

- [ ] **Step 4: Run the gate and commit.**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

```bash
git add scripts/auth package.json
git commit -m "feat(auth): add the operator status and rate-limit purge scripts"
```

---

# Iteration 5 — Composition and routes

`composition/auth/*` is the only place where auth adapters meet their ports. It exposes one small entry point per flow, and `app/` calls only these (coding rules › Import boundaries). The flows reuse F-00's `withRequestDb`, so ADR-009's per-request Pool and its `finally` close are inherited, not re-implemented.

## Task 22: Auth scope, cookies and the owner guard

**Files:**
- `src/composition/auth/auth-scope/auth-scope.{ts,types.ts}`
- `src/composition/auth/session-cookies/session-cookies.{ts,types.ts,test.ts}`
- `src/composition/auth/pending-email-cookie/pending-email-cookie.ts`
- `src/composition/auth/owner-guard/owner-guard.{ts,test.ts}`
- `src/composition/auth/auth-api/auth-api.ts`, `src/app/api/auth/[...all]/route.ts`
- Test: `tests/integration/auth/auth-flows.test.ts`

- [ ] **Step 1: Write the failing tests.**

`src/composition/auth/session-cookies/session-cookies.test.ts`

```ts
import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));

import { parseSetCookie } from "./session-cookies";

describe("parseSetCookie", () => {
  it("AC-AUTH-007 reads the name, value and attributes of a Better Auth session cookie", () => {
    const raw =
      "better-auth.session_token=abc.def; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Lax";
    expect(parseSetCookie(raw)).toEqual({
      name: "better-auth.session_token",
      value: "abc.def",
      maxAge: 604800,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
  });

  it("AC-AUTH-012 keeps '=' inside the value and reads a deletion cookie", () => {
    expect(parseSetCookie("a=b=c; Max-Age=0; Path=/")).toMatchObject({
      name: "a",
      value: "b=c",
      maxAge: 0,
    });
  });
});
```

`src/composition/auth/owner-guard/owner-guard.test.ts`

```ts
import { describe, expect, it, vi } from "vitest";

vi.mock("../auth-scope/auth-scope", () => ({ withAuthScope: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

import { AuthError } from "@/features/auth/application/errors/auth-errors/auth-errors";

import { ownerRedirectFor, redirectOnRefusal } from "./owner-guard";

describe("owner guard", () => {
  it("AC-AUTH-009 AC-AUTH-013 sends each refusal to its screen", () => {
    expect(ownerRedirectFor("AUTH_REQUIRED")).toBe("/login");
    expect(ownerRedirectFor("EMAIL_UNVERIFIED")).toBe("/verify");
    expect(ownerRedirectFor("ACCOUNT_UNAVAILABLE")).toBe("/account-unavailable");
  });

  it("AC-AUTH-014 turns a refusal into a redirect and lets other errors through", async () => {
    const refused = () => Promise.reject(new AuthError("ACCOUNT_UNAVAILABLE"));
    await expect(redirectOnRefusal(refused)).rejects.toThrow("redirect:/account-unavailable");
    const broken = () => Promise.reject(new Error("db down"));
    await expect(redirectOnRefusal(broken)).rejects.toThrow("db down");
  });
});
```

`tests/integration/auth/auth-flows.test.ts`

```ts
import { NEW_PASSWORD, PASSWORD } from "@tests/support/auth/credentials";
import { tokenFrom } from "@tests/support/auth/fake-auth-deps";
import { uniqueEmail } from "@tests/support/auth/unique";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { user } from "@/adapters/db/schema/auth/auth";
import { requireOwner } from "@/features/auth/application/policy/owner-access/owner-access";
import { changePassword } from "@/features/auth/application/use-cases/change-password/change-password";
import { loginOwner } from "@/features/auth/application/use-cases/login-owner/login-owner";
import { registerOwner } from "@/features/auth/application/use-cases/register-owner/register-owner";
import { requestPasswordReset } from "@/features/auth/application/use-cases/request-password-reset/request-password-reset";
import { resetPassword } from "@/features/auth/application/use-cases/reset-password/reset-password";
import { verifyEmail } from "@/features/auth/application/use-cases/verify-email/verify-email";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { type AuthHarness, cookieHeaders, meta, openAuthHarness } from "./helpers/auth-harness";

let h: AuthHarness;
beforeAll(async () => {
  h = await openAuthHarness();
});
afterAll(() => h.close());

async function verifiedOwner() {
  const email = normaliseEmail(uniqueEmail());
  await registerOwner(h.deps, { name: "Alya", email, password: PASSWORD }, meta());
  await h.settle();
  const verified = await verifyEmail(h.deps, tokenFrom(h.sender.lastUrl(email, "VERIFY_EMAIL")));
  if (!verified.ok) throw new Error("fixture: verification failed");
  return { email, headers: cookieHeaders(verified.setCookies) };
}

async function signIn(email: string, password = PASSWORD): Promise<Headers> {
  const result = await loginOwner(h.deps, { email, password }, meta());
  if (!result.ok) throw new Error(`fixture: sign-in failed (${result.code})`);
  return cookieHeaders(result.setCookies);
}

describe("auth flows on the real adapters", () => {
  it("AC-AUTH-001 AC-AUTH-004 register → verify → owner session → onboarding hand-off", async () => {
    const { email, headers } = await verifiedOwner();
    const owner = await requireOwner(h.deps, headers);
    expect(owner).toMatchObject({ email, status: "ACTIVE", emailVerified: true });
  });

  it("AC-AUTH-009 an unverified sign-in is restricted to /verify", async () => {
    const email = normaliseEmail(uniqueEmail());
    await registerOwner(h.deps, { name: "Alya", email, password: PASSWORD }, meta());
    const result = await loginOwner(h.deps, { email, password: PASSWORD }, meta());
    expect(result).toMatchObject({ ok: true, outcome: { kind: "RESTRICTED", path: "/verify" } });
  });

  it("AC-AUTH-014 a surviving session is refused once the status is no longer ACTIVE", async () => {
    const { email, headers } = await verifiedOwner();
    await h.db.update(user).set({ status: "SUSPENDED" }).where(eq(user.email, email));
    await expect(requireOwner(h.deps, headers)).rejects.toMatchObject({
      code: "ACCOUNT_UNAVAILABLE",
    });
  });

  it("AC-AUTH-017 a reset revokes every session and the new password works", async () => {
    const { email, headers } = await verifiedOwner();
    await requestPasswordReset(h.deps, { email }, meta());
    await h.settle();
    const token = tokenFrom(h.sender.lastUrl(email, "RESET_PASSWORD"));
    const reset = await resetPassword(h.deps, {
      token,
      password: NEW_PASSWORD,
      confirm: NEW_PASSWORD,
    });
    expect(reset).toEqual({ ok: true });
    expect(await h.deps.identity.getSessionUserId(headers)).toBeNull();
    await expect(signIn(email, NEW_PASSWORD)).resolves.toBeInstanceOf(Headers);
  });

  it("AC-AUTH-019 a password change keeps this session and revokes the others", async () => {
    const { email } = await verifiedOwner();
    const current = await signIn(email);
    const other = await signIn(email);
    const input = { currentPassword: PASSWORD, newPassword: NEW_PASSWORD, confirm: NEW_PASSWORD };
    const result = await changePassword(h.deps, input, current);
    if (!result.ok) throw new Error(`expected success (${result.code})`);
    const refreshed = result.setCookies.length > 0 ? cookieHeaders(result.setCookies) : current;
    expect(await h.deps.identity.getSessionUserId(refreshed)).not.toBeNull();
    expect(await h.deps.identity.getSessionUserId(other)).toBeNull();
  });
});
```

- [ ] **Step 2: Run them to verify they fail.**

Run: `pnpm test src/composition/auth`
Expected: FAIL, missing modules. (`auth-flows.test.ts` exercises the use cases over the real adapters, so it can already pass.)

- [ ] **Step 3: Write the composition units.**

`src/composition/auth/auth-scope/auth-scope.types.ts`

```ts
import type { AuthDeps, RequestMeta } from "@/features/auth/application/auth-deps/auth-deps.types";

export interface AuthScope extends AuthDeps {
  meta: RequestMeta;
  /** Signs app-level cookies (the pending-email cookie). */
  secret: string;
  /** Better Auth's own endpoints (`/api/auth/*`). */
  handler: (request: Request) => Promise<Response>;
}
```

`src/composition/auth/auth-scope/auth-scope.ts`

```ts
import "server-only";

import { createBetterAuthIdentity } from "@/adapters/auth/identity/better-auth-identity";
import { createDrizzleAccountDirectory } from "@/adapters/db/account-directory/drizzle-account-directory";
import { createBetterAuthDatabase } from "@/adapters/db/better-auth-database/better-auth-database";
import { createDrizzleLinkRegistry } from "@/adapters/db/link-registry/drizzle-link-registry";
import { createNeonRateLimiter } from "@/adapters/db/rate-limiter/neon-rate-limiter";
import { createResendAuthEmailSender } from "@/adapters/email/auth-email-sender/resend-auth-email-sender";
import {
  createCapturingEmailSender,
  isEmailCaptureEnabled,
} from "@/adapters/email/capturing-email-sender/capturing-email-sender";
import { LinkOutbox } from "@/features/auth/application/link-outbox/link-outbox";
import type { AuthEmailPort } from "@/features/auth/application/ports/auth-email/auth-email.port";
import type { WorkspaceDestinationPort } from "@/features/auth/application/ports/workspace-destination/workspace-destination.port";
import type { AppEnv } from "@/shared/env/app-env.types";

import { withRequestDb } from "../../request-db/request-db";
import type { AuthScope } from "./auth-scope.types";

// SPEC GAP-2: F-02 replaces this stub with the real workspace resolver.
const onboardingUntilWorkspaceExists: WorkspaceDestinationPort = {
  resolve: () => Promise.resolve("ONBOARDING"),
};

function emailSender(env: AppEnv): AuthEmailPort {
  if (isEmailCaptureEnabled(env)) return createCapturingEmailSender();
  return createResendAuthEmailSender({ apiKey: env.RESEND_API_KEY, from: env.AUTH_EMAIL_FROM });
}

/**
 * Run `work` with request-scoped auth services over the request's database; the Pool is
 * closed after the work settles (ADR-009). The only place auth adapters meet their ports.
 * @param work - the auth work for this request
 * @returns whatever `work` resolves to
 */
export function withAuthScope<T>(work: (scope: AuthScope) => Promise<T>): Promise<T> {
  return withRequestDb((db, rc) => {
    const outbox = new LinkOutbox(emailSender(rc.env), rc.requestId);
    const accounts = createDrizzleAccountDirectory(db);
    const { identity, handler } = createBetterAuthIdentity({
      database: createBetterAuthDatabase(db),
      env: rc.env,
      accounts,
      links: createDrizzleLinkRegistry(db),
      onLink: (link) => {
        outbox.enqueue(link);
      },
    });
    return work({
      identity,
      accounts,
      rateLimiter: createNeonRateLimiter(db),
      outbox,
      destination: onboardingUntilWorkspaceExists,
      waitUntil: (promise) => {
        rc.waitUntil(promise);
      },
      requestId: rc.requestId,
      meta: { ip: rc.ip, headers: rc.headers },
      secret: rc.env.BETTER_AUTH_SECRET,
      handler,
    });
  });
}
```

`src/composition/auth/session-cookies/session-cookies.types.ts`

```ts
export interface ParsedCookie {
  name: string;
  value: string;
  path?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
}
```

`src/composition/auth/session-cookies/session-cookies.ts`

```ts
import "server-only";

import { cookies } from "next/headers";

import type { ParsedCookie } from "./session-cookies.types";

const SAME_SITE: readonly string[] = ["lax", "strict", "none"];

function isSameSite(value: string): value is NonNullable<ParsedCookie["sameSite"]> {
  return SAME_SITE.includes(value);
}

function applyAttribute(cookie: ParsedCookie, key: string, value: string): void {
  const lower = value.toLowerCase();
  if (key === "path") cookie.path = value;
  else if (key === "max-age") cookie.maxAge = Number(value);
  else if (key === "expires") cookie.expires = new Date(value);
  else if (key === "httponly") cookie.httpOnly = true;
  else if (key === "secure") cookie.secure = true;
  else if (key === "samesite" && isSameSite(lower)) cookie.sameSite = lower;
}

/**
 * Parse one `Set-Cookie` header from Better Auth into Next's cookie shape.
 * @param raw - the header value
 * @returns the name, value and attributes
 */
export function parseSetCookie(raw: string): ParsedCookie {
  const [pair = "", ...attributes] = raw.split(";").map((part) => part.trim());
  const split = pair.indexOf("=");
  const cookie: ParsedCookie = { name: pair.slice(0, split), value: pair.slice(split + 1) };
  for (const attribute of attributes) {
    const [key = "", ...rest] = attribute.split("=");
    applyAttribute(cookie, key.toLowerCase(), rest.join("="));
  }
  return cookie;
}

/**
 * Copy Better Auth's `Set-Cookie` headers into Next's cookie store; server actions can't
 * return raw headers.
 * @param setCookies - the raw header values
 * @returns nothing
 */
export async function applySetCookies(setCookies: string[]): Promise<void> {
  const jar = await cookies();
  for (const raw of setCookies) jar.set(parseSetCookie(raw));
}
```

`src/composition/auth/pending-email-cookie/pending-email-cookie.ts`

```ts
import "server-only";

import { cookies } from "next/headers";

import {
  openPendingEmail,
  PENDING_EMAIL_TTL_SECONDS,
  sealPendingEmail,
} from "@/features/auth/application/pending-email/pending-email";

/** SPEC GAP-3: identifies the just-registered email so Verification pending can resend. */
export const PENDING_EMAIL_COOKIE = "shutrly_pending_email";

/**
 * Store the sealed email in a short-lived, httpOnly cookie.
 * @param email - the normalised email that just registered
 * @param secret - the app secret
 * @returns nothing
 */
export async function writePendingEmail(email: string, secret: string): Promise<void> {
  (await cookies()).set({
    name: PENDING_EMAIL_COOKIE,
    value: await sealPendingEmail(email, secret),
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_EMAIL_TTL_SECONDS,
  });
}

/**
 * Read and verify the pending-email cookie of this request.
 * @param secret - the app secret
 * @returns the email, or null when missing, forged or expired
 */
export async function readPendingEmail(secret: string): Promise<string | null> {
  return openPendingEmail((await cookies()).get(PENDING_EMAIL_COOKIE)?.value, secret);
}

/**
 * Delete the pending-email cookie once it is no longer needed (verified or signed out).
 * @returns nothing
 */
export async function clearPendingEmail(): Promise<void> {
  (await cookies()).delete(PENDING_EMAIL_COOKIE);
}
```

`src/composition/auth/owner-guard/owner-guard.ts`

```ts
import "server-only";

import { redirect } from "next/navigation";

import { AuthError } from "@/features/auth/application/errors/auth-errors/auth-errors";
import type { AuthErrorCode } from "@/features/auth/application/errors/auth-errors/auth-errors.types";
import {
  AUTH_PATH,
  DESTINATION_PATH,
} from "@/features/auth/application/policy/destination-path/destination-path";
import {
  requireOwner,
  resolveOwnerAccess,
} from "@/features/auth/application/policy/owner-access/owner-access";
import type { AccountRecord } from "@/features/auth/domain/account/account.types";

import { withAuthScope } from "../auth-scope/auth-scope";

/**
 * The screen for each refusal of the owner gate.
 * @param code - the refusal code from `requireOwner`
 * @returns `/verify`, `/account-unavailable` or `/login`
 */
export function ownerRedirectFor(code: AuthErrorCode): string {
  if (code === "EMAIL_UNVERIFIED") return AUTH_PATH.verify;
  if (code === "ACCOUNT_UNAVAILABLE") return AUTH_PATH.unavailable;
  return AUTH_PATH.login;
}

/**
 * Run owner work and turn a gate refusal into a redirect (C-004): pages and server actions.
 * @param work - work that calls `requireOwner` (directly or through a use case)
 * @returns the work's result; redirects on `AuthError`
 */
export async function redirectOnRefusal<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof AuthError) redirect(ownerRedirectFor(error.code));
    throw error;
  }
}

/**
 * The first call in every owner page (C-004): an active, verified owner or a redirect.
 * @returns the owner's account
 */
export function requireOwnerOrRedirect(): Promise<AccountRecord> {
  return redirectOnRefusal(() => withAuthScope((scope) => requireOwner(scope, scope.meta.headers)));
}

/**
 * AC-AUTH-011: auth pages send a signed-in owner on to their destination, and a restricted
 * session to Verification pending.
 * @returns nothing; redirects when there is a usable session
 */
export async function redirectIfSignedIn(): Promise<void> {
  const target = await withAuthScope(async (scope) => {
    const { decision, account } = await resolveOwnerAccess(scope, scope.meta.headers);
    if (decision === "OWNER" && account) {
      return DESTINATION_PATH[await scope.destination.resolve(account.id)];
    }
    return decision === "RESTRICTED" ? AUTH_PATH.verify : null;
  });
  if (target) redirect(target);
}
```

`src/composition/auth/auth-api/auth-api.ts`

```ts
import "server-only";

import { withAuthScope } from "../auth-scope/auth-scope";

/**
 * Better Auth's own endpoints under `/api/auth/*`, including the Google callback.
 * @param request - the incoming request
 * @returns Better Auth's response
 */
export function handleAuthRequest(request: Request): Promise<Response> {
  return withAuthScope((scope) => scope.handler(request));
}
```

- [ ] **Step 4: Mount Better Auth's endpoints** (Google start/callback and Better Auth's internal routes).

`src/app/api/auth/[...all]/route.ts`

```ts
import { handleAuthRequest } from "@/composition/auth/auth-api/auth-api";

export const dynamic = "force-dynamic";

export function GET(request: Request): Promise<Response> {
  return handleAuthRequest(request);
}

export function POST(request: Request): Promise<Response> {
  return handleAuthRequest(request);
}
```

- [ ] **Step 5: Run the tests to verify they pass.**

Run: `pnpm test src/composition/auth && pnpm test:integration tests/integration/auth/auth-flows.test.ts && pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add src/composition/auth "src/app/api/auth" tests/integration/auth/auth-flows.test.ts
git commit -m "feat(auth): wire request-scoped auth composition, cookies and the owner guard"
```

## Task 23: Flow entry points and the Proxy

**Files:**
- `src/composition/auth/{register-flow,verify-flow,login-flow,recovery-flow,profile-flow,google-flow,email-capture}/*`
- `src/app/api/test/auth-emails/route.ts`
- `src/proxy.{ts,test.ts}`

These entry points are thin: they build the scope, call one use case, and move cookies. Unit tests would only restate their wiring. Their behaviour is covered by the use-case unit tests, `auth-flows.test.ts`, and the Task 31 E2E journeys.

**Next 16 renamed `middleware.ts` to `proxy.ts`** (R-7; see `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`), and the export is named `proxy`. The OpenNext 1.20.6 build bundles it (`ƒ Proxy (Middleware)` in `pnpm build`). The Proxy only checks that a session cookie is present; it is never the authority.

- [ ] **Step 1: Write the failing Proxy test.**

`src/proxy.test.ts`

```ts
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { isPublicPath, proxy } from "./proxy";

describe("proxy (early redirect only)", () => {
  it("AC-AUTH-011 treats the auth screens and Better Auth's endpoints as public", () => {
    const paths = ["/login", "/verify/confirm", "/auth/continue", "/api/auth/callback/google"];
    for (const path of paths) expect(isPublicPath(path)).toBe(true);
    expect(isPublicPath("/profile")).toBe(false);
  });

  it("AC-AUTH-014 redirects an owner page without a session cookie to /login", () => {
    const response = proxy(new NextRequest("http://localhost:3000/profile"));
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("AC-AUTH-014 lets a request with a session cookie through; the guard still decides", () => {
    const headers = { cookie: "better-auth.session_token=abc" };
    const response = proxy(new NextRequest("http://localhost:3000/profile", { headers }));
    expect(response.headers.get("location")).toBeNull();
  });
});
```

- [ ] **Step 2: Run it to verify it fails.**

Run: `pnpm test src/proxy.test.ts`
Expected: FAIL, `Cannot find module './proxy'`.

- [ ] **Step 3: Write the Proxy.**

`src/proxy.ts`

```ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Next 16 Proxy (formerly middleware): an early cookie-presence redirect only. The owner guard
// in composition is the authority on every page, action and route (C-004).
const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/verify",
  "/forgot-password",
  "/reset-password",
  "/account-unavailable",
  "/auth/continue",
  "/api/auth",
  "/api/health",
  "/api/test",
];

/**
 * Tell whether a path is reachable without a session.
 * @param pathname - the request path
 * @returns true for the auth screens, Better Auth's endpoints and the health/test routes
 */
export function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  );
}

/**
 * Send a request without any session cookie to `/login` before rendering an owner page.
 * @param request - the incoming request
 * @returns a redirect to `/login`, or the request unchanged
 */
export function proxy(request: NextRequest): NextResponse {
  if (isPublicPath(request.nextUrl.pathname)) return NextResponse.next();
  const hasSession = request.cookies
    .getAll()
    .some((cookie) => cookie.name.endsWith("session_token"));
  if (hasSession) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|auth/editorial/).*)"],
};
```

- [ ] **Step 4: Write the flow entry points.**

`src/composition/auth/register-flow/register-flow.ts`

```ts
import "server-only";

import { registerOwner } from "@/features/auth/application/use-cases/register-owner/register-owner";
import type { RegisterOwnerResult } from "@/features/auth/application/use-cases/register-owner/register-owner.types";
import { resendVerification } from "@/features/auth/application/use-cases/resend-verification/resend-verification";
import type { ResendVerificationResult } from "@/features/auth/application/use-cases/resend-verification/resend-verification.types";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import { withAuthScope } from "../auth-scope/auth-scope";
import { readPendingEmail, writePendingEmail } from "../pending-email-cookie/pending-email-cookie";

/**
 * Register, then remember the email in the pending-email cookie (SPEC GAP-3).
 * @param values - the untrusted Register form values
 * @returns the use-case result
 */
export function register(values: unknown): Promise<RegisterOwnerResult> {
  return withAuthScope(async (scope) => {
    const result = await registerOwner(scope, values, scope.meta);
    if (result.ok) await writePendingEmail(result.email, scope.secret);
    return result;
  });
}

/**
 * Resend verification to the restricted session's email, else the pending-email cookie's.
 * @returns the use-case result, or null when the request identifies no email
 */
export function resendVerificationEmail(): Promise<ResendVerificationResult | null> {
  return withAuthScope(async (scope) => {
    const userId = await scope.identity.getSessionUserId(scope.meta.headers);
    const account = userId ? await scope.accounts.getById(userId) : null;
    const email = account?.email ?? (await readPendingEmail(scope.secret));
    if (!email) return null;
    return resendVerification(scope, { email: normaliseEmail(email) }, scope.meta);
  });
}
```

`src/composition/auth/verify-flow/verify-flow.types.ts`

```ts
export type VerifyPageState =
  { kind: "REDIRECT"; path: string } | { kind: "SHOW"; canResend: boolean };
```

`src/composition/auth/verify-flow/verify-flow.ts`

```ts
import "server-only";

import { NextResponse } from "next/server";

import {
  AUTH_PATH,
  DESTINATION_PATH,
} from "@/features/auth/application/policy/destination-path/destination-path";
import { resolveOwnerAccess } from "@/features/auth/application/policy/owner-access/owner-access";
import { verifyEmail } from "@/features/auth/application/use-cases/verify-email/verify-email";

import { withAuthScope } from "../auth-scope/auth-scope";
import {
  PENDING_EMAIL_COOKIE,
  readPendingEmail,
} from "../pending-email-cookie/pending-email-cookie";
import type { VerifyPageState } from "./verify-flow.types";

const INVALID_VERIFY_LINK = "/verify?state=invalid";

/**
 * The emailed verification link (GET /verify/confirm): verify, sign in, redirect (A-7).
 * @param request - the link request; its `token` query parameter is the link token
 * @returns a 303 to the destination with the session cookies, or to the invalid-link screen
 */
export function verifyEmailLinkResponse(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  return withAuthScope(async (scope) => {
    const result = await verifyEmail(scope, token);
    const path = result.ok ? result.outcome.path : INVALID_VERIFY_LINK;
    const response = NextResponse.redirect(new URL(path, request.url), 303);
    if (!result.ok) return response;
    for (const cookie of result.setCookies) response.headers.append("set-cookie", cookie);
    response.cookies.delete(PENDING_EMAIL_COOKIE);
    return response;
  });
}

/**
 * Who may see Verification pending: a restricted session or a valid pending-email cookie.
 * A verified owner goes on to their destination; an unavailable one to its screen.
 * @returns where to redirect, or whether the resend control can work
 */
export function loadVerifyPage(): Promise<VerifyPageState> {
  return withAuthScope(async (scope) => {
    const { decision, account } = await resolveOwnerAccess(scope, scope.meta.headers);
    if (decision === "OWNER" && account) {
      const path = DESTINATION_PATH[await scope.destination.resolve(account.id)];
      return { kind: "REDIRECT", path };
    }
    if (decision === "UNAVAILABLE") return { kind: "REDIRECT", path: AUTH_PATH.unavailable };
    const canResend = decision === "RESTRICTED" || (await readPendingEmail(scope.secret)) !== null;
    return { kind: "SHOW", canResend };
  });
}
```

`src/composition/auth/login-flow/login-flow.ts`

```ts
import "server-only";

import { loginOwner } from "@/features/auth/application/use-cases/login-owner/login-owner";
import type { LoginOwnerResult } from "@/features/auth/application/use-cases/login-owner/login-owner.types";
import { logoutOwner } from "@/features/auth/application/use-cases/logout-owner/logout-owner";

import { withAuthScope } from "../auth-scope/auth-scope";
import { clearPendingEmail } from "../pending-email-cookie/pending-email-cookie";
import { applySetCookies } from "../session-cookies/session-cookies";

/**
 * Password sign-in; on success the session cookies are set on the response.
 * @param values - the untrusted Login form values
 * @returns the use-case result (the caller redirects to `outcome.path`)
 */
export async function login(values: unknown): Promise<LoginOwnerResult> {
  const result = await withAuthScope((scope) => loginOwner(scope, values, scope.meta));
  if (result.ok) await applySetCookies(result.setCookies);
  return result;
}

/**
 * Sign out of this session only (AC-AUTH-012) and forget any pending email.
 * @returns nothing
 */
export async function logout(): Promise<void> {
  const cleared = await withAuthScope((scope) => logoutOwner(scope, scope.meta.headers));
  await applySetCookies(cleared.setCookies);
  await clearPendingEmail();
}
```

`src/composition/auth/recovery-flow/recovery-flow.ts`

```ts
import "server-only";

import { requestPasswordReset } from "@/features/auth/application/use-cases/request-password-reset/request-password-reset";
import type { RequestPasswordResetResult } from "@/features/auth/application/use-cases/request-password-reset/request-password-reset.types";
import { resetPassword } from "@/features/auth/application/use-cases/reset-password/reset-password";
import type { ResetPasswordResult } from "@/features/auth/application/use-cases/reset-password/reset-password.types";

import { withAuthScope } from "../auth-scope/auth-scope";

/**
 * Forgot password (AC-AUTH-016): always the same answer.
 * @param values - the untrusted Forgot password form values
 * @returns the use-case result
 */
export function requestReset(values: unknown): Promise<RequestPasswordResetResult> {
  return withAuthScope((scope) => requestPasswordReset(scope, values, scope.meta));
}

/**
 * Set a new password from a reset link (AC-AUTH-017).
 * @param values - the untrusted token, password and confirmation
 * @returns the use-case result
 */
export function resetWithLink(values: unknown): Promise<ResetPasswordResult> {
  return withAuthScope((scope) => resetPassword(scope, values));
}

/**
 * Check a reset link when its page opens, so a used or superseded link shows the invalid
 * screen at once (AC-AUTH-018).
 * @param token - the link token; empty means no link
 * @returns whether the link can still be used
 */
export function isResetLinkUsable(token: string): Promise<boolean> {
  if (!token) return Promise.resolve(false);
  return withAuthScope((scope) => scope.identity.isResetLinkUsable(token));
}
```

`src/composition/auth/profile-flow/profile-flow.types.ts`

```ts
export interface ProfileView {
  email: string;
  name: string;
  hasPassword: boolean;
}
```

`src/composition/auth/profile-flow/profile-flow.ts`

```ts
import "server-only";

import { changePassword } from "@/features/auth/application/use-cases/change-password/change-password";
import type { ChangePasswordResult } from "@/features/auth/application/use-cases/change-password/change-password.types";
import { updateDisplayName } from "@/features/auth/application/use-cases/update-display-name/update-display-name";
import type { UpdateDisplayNameResult } from "@/features/auth/application/use-cases/update-display-name/update-display-name.types";

import { withAuthScope } from "../auth-scope/auth-scope";
import { redirectOnRefusal, requireOwnerOrRedirect } from "../owner-guard/owner-guard";
import { applySetCookies } from "../session-cookies/session-cookies";
import type { ProfileView } from "./profile-flow.types";

/**
 * The Profile page's data, behind the owner gate (C-004). Only what the page shows.
 * @returns the owner's email, name and whether they have a password (BR-AUTH-008)
 */
export async function loadProfile(): Promise<ProfileView> {
  const { email, name, hasPassword } = await requireOwnerOrRedirect();
  return { email, name, hasPassword };
}

/**
 * Update the display name (AC-AUTH-020); a non-owner session is redirected.
 * @param values - the untrusted Profile form values
 * @returns the use-case result
 */
export function updateProfileName(values: unknown): Promise<UpdateDisplayNameResult> {
  return redirectOnRefusal(() =>
    withAuthScope((scope) => updateDisplayName(scope, values, scope.meta.headers)),
  );
}

/**
 * Change the password (AC-AUTH-019) and keep this session's refreshed cookies.
 * @param values - the untrusted Change password form values
 * @returns the use-case result
 */
export async function changeOwnPassword(values: unknown): Promise<ChangePasswordResult> {
  const result = await redirectOnRefusal(() =>
    withAuthScope((scope) => changePassword(scope, values, scope.meta.headers)),
  );
  if (result.ok) await applySetCookies(result.setCookies);
  return result;
}
```

`src/composition/auth/google-flow/google-flow.ts`

```ts
import "server-only";

import { NextResponse } from "next/server";

import { AUTH_PATH } from "@/features/auth/application/policy/destination-path/destination-path";
import { continueAfterSignIn } from "@/features/auth/application/use-cases/continue-after-sign-in/continue-after-sign-in";
import { startGoogleSignIn } from "@/features/auth/application/use-cases/start-google-sign-in/start-google-sign-in";

import { withAuthScope } from "../auth-scope/auth-scope";
import { applySetCookies } from "../session-cookies/session-cookies";

/**
 * Start Google sign-in (AC-AUTH-024): set Better Auth's OAuth state cookies.
 * @returns the Google authorization URL to redirect to
 */
export async function startGoogle(): Promise<string> {
  const { url, setCookies } = await withAuthScope((scope) => startGoogleSignIn(scope));
  await applySetCookies(setCookies);
  return url;
}

/**
 * Landing point after Google (GET /auth/continue): the status and verification gate, then the
 * F-02 hand-off (AC-AUTH-024, 026, 027, 031).
 * @param request - the request carrying the new session cookie
 * @returns a 303 to the destination, `/account-unavailable` or `/login`
 */
export function continueAfterGoogleResponse(request: Request): Promise<Response> {
  return withAuthScope(async (scope) => {
    const userId = await scope.identity.getSessionUserId(request.headers);
    const path = userId ? (await continueAfterSignIn(scope, userId)).path : AUTH_PATH.login;
    return NextResponse.redirect(new URL(path, request.url), 303);
  });
}
```

`src/composition/auth/email-capture/email-capture.ts`

```ts
import "server-only";

import {
  capturedLinks,
  isEmailCaptureEnabled,
} from "@/adapters/email/capturing-email-sender/capturing-email-sender";

import { getRequestContext } from "../../request-context/request-context";

/**
 * E2E only: the links captured for `?to=`, or 404 unless capture is on for localhost.
 * @param request - the Playwright request
 * @returns the captured links as JSON, never cached
 */
export async function capturedLinksResponse(request: Request): Promise<Response> {
  const { env } = await getRequestContext();
  if (!isEmailCaptureEnabled(env)) return new Response(null, { status: 404 });
  const to = new URL(request.url).searchParams.get("to") ?? "";
  return Response.json(capturedLinks(to), { headers: { "Cache-Control": "no-store" } });
}
```

`src/app/api/test/auth-emails/route.ts`

```ts
import { capturedLinksResponse } from "@/composition/auth/email-capture/email-capture";

export const dynamic = "force-dynamic";

// E2E only: 404 unless E2E_EMAIL_CAPTURE=1 on a localhost BETTER_AUTH_URL.
export function GET(request: Request): Promise<Response> {
  return capturedLinksResponse(request);
}
```

- [ ] **Step 5: Run the gate.**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
Expected: PASS. The build lists `ƒ Proxy (Middleware)` and the `/api/auth/[...all]` and `/api/test/auth-emails` routes.

- [ ] **Step 6: Commit.**

```bash
git add src/composition/auth src/proxy.ts src/proxy.test.ts src/app/api/test
git commit -m "feat(auth): add the auth flow entry points and the Next 16 proxy"
```

**Iterations 4–5 done check:** `pnpm typecheck && pnpm lint && pnpm test && pnpm build` passes, and `pnpm test:integration` passes against the migrated non-production database.

---

# Iteration 6 — Auth UI foundation

**Gate:** the Owner has translated `auth.pen` to Indonesian and exported the frames in *Pixel-perfect UI: HTML exports*. Each UI task begins by checking its own exports.

Screens map one-to-one to Pencil states: `features/auth/ui/<state>-screen/` renders exactly one frame, and its `*.copy.ts` holds that frame's text. Pages only load data and pick the screen.

## Task 24: Icons and the Alert pattern

**Files:**
- Modify: `src/ui/primitives/icon/icon.types.ts`, `src/ui/primitives/icon/icon.registry.ts` (add `info`, `google`)
- Create: `src/ui/patterns/alert/alert.{tsx,types.ts,test.tsx}`
- Modify: `docs/design-system/components/icon.md` (the registry list)

`Alert` is the code counterpart of design-system C24 ([alert.md](../../design-system/components/alert.md)): Close off, the icon fixed by tone, `component.alert.*` tokens. It lives in `src/ui/patterns` because other features will use it (ADR-010). React 19 passes `ref` as a prop, so there is no `forwardRef`.

- [ ] **Step 0: Check the reference.** Open `design-system.lib.pen` › C24 through the Owner, or `docs/design-system/components/alert.md`, for the Info and Danger tones.

- [ ] **Step 1: Write the failing test.**

`src/ui/patterns/alert/alert.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert } from "./alert";

describe("Alert (C24)", () => {
  it("AC-AUTH-023 static guidance is not announced as a live region", () => {
    render(<Alert tone="info" title="Title" body="Body" />);
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("AC-AUTH-023 live danger feedback uses role=alert and can take focus", () => {
    render(<Alert tone="danger" title="Wrong" live />);
    expect(screen.getByRole("alert")).toHaveAttribute("tabindex", "-1");
  });

  it("AC-AUTH-023 live info feedback uses role=status", () => {
    render(<Alert tone="info" title="Sent" live />);
    expect(screen.getByRole("status")).toHaveTextContent("Sent");
  });

  it("AC-AUTH-008 renders the title only when there is no body, with a decorative icon", () => {
    const { container } = render(<Alert tone="danger" title="Only title" />);
    expect(container.querySelectorAll("p")).toHaveLength(1);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
```

- [ ] **Step 2: Run it to verify it fails.**

Run: `pnpm test src/ui/patterns/alert`
Expected: FAIL, `Cannot find module './alert'`.

- [ ] **Step 3: Register the two icons.** The existing `icon.test.tsx` renders every registered name, so it covers them.

`src/ui/primitives/icon/icon.types.ts`

```ts
import type { HugeiconsIconProps } from "@hugeicons/react";

export type IconName =
  | "search"
  | "chevron-down"
  | "calendar"
  | "eye"
  | "eye-off"
  | "circle-alert"
  | "plus"
  | "send"
  | "arrow-right"
  | "trash-2"
  | "info"
  | "google";

export type IconSize = "sm" | "md";

export interface IconProps extends Omit<HugeiconsIconProps, "icon" | "size"> {
  name: IconName;
  size?: IconSize;
}
```

`src/ui/primitives/icon/icon.registry.ts`

```ts
import {
  Add01Icon,
  Alert02Icon,
  ArrowRight05Icon,
  Calendar03Icon,
  ChevronDownIcon,
  Delete02Icon,
  GoogleIcon,
  InformationCircleIcon,
  Search01Icon,
  SentIcon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import type { IconName } from "./icon.types";

export const ICON_NAMES: readonly IconName[] = [
  "search",
  "chevron-down",
  "calendar",
  "eye",
  "eye-off",
  "circle-alert",
  "plus",
  "send",
  "arrow-right",
  "trash-2",
  "info",
  "google",
];

export const ICON_REGISTRY: Record<IconName, IconSvgElement> = {
  search: Search01Icon,
  "chevron-down": ChevronDownIcon,
  calendar: Calendar03Icon,
  eye: ViewIcon,
  "eye-off": ViewOffIcon,
  "circle-alert": Alert02Icon,
  plus: Add01Icon,
  send: SentIcon,
  "arrow-right": ArrowRight05Icon,
  "trash-2": Delete02Icon,
  info: InformationCircleIcon,
  google: GoogleIcon,
};
```

In `docs/design-system/components/icon.md`, add `info` (Hugeicons `InformationCircleIcon`) and `google` (`GoogleIcon`) to the registry list.

- [ ] **Step 4: Write the Alert.**

`src/ui/patterns/alert/alert.types.ts`

```ts
import type { Ref } from "react";

export type AlertTone = "info" | "danger";

export interface AlertProps {
  tone: AlertTone;
  title: string;
  body?: string;
  /** True when inserted as feedback (role alert/status); false for static guidance. */
  live?: boolean;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}
```

`src/ui/patterns/alert/alert.tsx`

```tsx
import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";

import type { AlertProps, AlertTone } from "./alert.types";

// C24 Alert (docs/design-system/components/alert.md): Close off, icon fixed by tone.
const TONE: Record<AlertTone, string> = {
  info: "bg-(--component-alert-info-background) border-(--component-alert-info-border)",
  danger: "bg-(--component-alert-danger-background) border-(--component-alert-danger-border)",
};
const ICON_TONE: Record<AlertTone, string> = {
  info: "text-(--component-alert-info-icon)",
  danger: "text-(--component-alert-danger-icon)",
};
const TITLE_TONE: Record<AlertTone, string> = {
  info: "text-(--component-alert-info-title)",
  danger: "text-(--component-alert-danger-title)",
};
const LIVE_ROLE: Record<AlertTone, "status" | "alert"> = { info: "status", danger: "alert" };

/**
 * Inline message in the page flow (design-system C24). Static guidance is not announced; live
 * feedback uses `role=status` (info) or `role=alert` (danger) and can take focus (AC-AUTH-023).
 * @param props - tone, title, optional body, and whether it is live feedback
 * @returns the alert
 */
export function Alert({ tone, title, body, live = false, className, ref }: Readonly<AlertProps>) {
  return (
    <div
      ref={ref}
      role={live ? LIVE_ROLE[tone] : undefined}
      tabIndex={-1}
      data-tone={tone}
      className={cn(
        "flex w-full items-start gap-(--component-alert-gap) rounded-(--component-alert-radius)",
        "border px-(--component-alert-padding-x) py-(--component-alert-padding-y) outline-none",
        TONE[tone],
        className,
      )}
    >
      <Icon name={tone === "info" ? "info" : "circle-alert"} className={ICON_TONE[tone]} />
      <div className="flex min-w-0 flex-col gap-(--component-alert-text-gap)">
        <p className={cn("text-(length:--font-size-body-sm) font-semibold", TITLE_TONE[tone])}>
          {title}
        </p>
        {body ? (
          <p className="text-(length:--font-size-label) text-(--component-alert-body)">{body}</p>
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run the tests to verify they pass.**

Run: `pnpm test src/ui && pnpm lint`
Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add src/ui/primitives/icon src/ui/patterns/alert docs/design-system/components/icon.md
git commit -m "feat(ui): add the Alert pattern and the info and google icons"
```

## Task 25: Auth layout and editorial panel

**Files:**
- `src/features/auth/ui/editorial-panel/editorial-panel.{tsx,copy.ts,test.tsx}`
- `src/features/auth/ui/auth-split-layout/auth-split-layout.{tsx,copy.ts,test.tsx}`
- `src/features/auth/ui/{auth-intro,auth-text-link,auth-prompt}/*`
- `src/app/(auth)/layout.tsx`
- Asset: `public/auth/editorial/mosaic.webp` (Owner export)

**Precondition: DESIGN TOKEN GAPs T1–T4.** The layout uses `--size-auth-panel` (600), `--size-auth-form` (420), `--font-size-hero` (44) and `--space-16` (64). None of them exists yet. The Owner adds them through the design-system pipeline (`/sdv:design-tokens`, then `pnpm tokens:css`; token-usage G8). Check them before starting:

```bash
for t in size-auth-panel size-auth-form font-size-hero space-16; do grep -q -- "--$t:" src/ui/theme/tokens.css && echo "ok  $t" || echo "MISSING $t"; done
```

Expected: four `ok` lines. If any is `MISSING`, stop and ask the Owner. The editorial body uses `font.size.body` (14) where Pencil shows 15; the Owner confirms this in the gap decision.

- [ ] **Step 0: Exports.** Check that `login-amp4Y.html`, `login-IOC5i.html` and `public/auth/editorial/mosaic.webp` exist. If one is missing, stop and ask the Owner. The mosaic is `Z5xhk` exported **without** its headline and body text, with its scrim, as a licensed-photo image (R-5).

- [ ] **Step 1: Write the failing tests.**

`src/features/auth/ui/editorial-panel/editorial-panel.test.tsx`

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EditorialPanel } from "./editorial-panel";
import { EDITORIAL_PANEL_COPY } from "./editorial-panel.copy";

describe("EditorialPanel (Z5xhk)", () => {
  it("AC-AUTH-023 is decorative: hidden from assistive technology, with no controls", () => {
    const { container } = render(<EditorialPanel />);
    const panel = container.querySelector("aside");
    expect(panel).toHaveAttribute("aria-hidden", "true");
    expect(panel?.querySelectorAll("a, button, input")).toHaveLength(0);
    expect(panel?.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("AC-AUTH-023 keeps the headline as text", () => {
    const { container } = render(<EditorialPanel />);
    expect(container.textContent).toContain(EDITORIAL_PANEL_COPY.body);
  });
});
```

`src/features/auth/ui/auth-split-layout/auth-split-layout.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthSplitLayout } from "./auth-split-layout";
import { AUTH_SPLIT_LAYOUT_COPY } from "./auth-split-layout.copy";

describe("AuthSplitLayout", () => {
  it("AC-AUTH-023 puts the screen in a main landmark with the brand and footer", () => {
    render(
      <AuthSplitLayout>
        <h1>Heading</h1>
      </AuthSplitLayout>,
    );
    expect(screen.getByRole("main")).toHaveTextContent("Heading");
    expect(screen.getByText(AUTH_SPLIT_LAYOUT_COPY.brand)).toBeInTheDocument();
    expect(screen.getByText(AUTH_SPLIT_LAYOUT_COPY.footer)).toBeInTheDocument();
  });

  it("AC-AUTH-023 hides the editorial panel below the desktop breakpoint", () => {
    const { container } = render(<AuthSplitLayout>x</AuthSplitLayout>);
    expect(container.querySelector('[data-slot="editorial"]')).toHaveClass("hidden", "lg:block");
  });
});
```

`src/features/auth/ui/auth-prompt/auth-prompt.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthPrompt } from "./auth-prompt";

describe("AuthIntro and AuthPrompt", () => {
  it("AC-AUTH-023 renders one level-1 heading and a named link", () => {
    render(
      <>
        <AuthIntro title="Title" lead="Lead" />
        <AuthPrompt prompt="Prompt" href="/login" link="Link" />
      </>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Title" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Link" })).toHaveAttribute("href", "/login");
  });
});
```

- [ ] **Step 2: Run them to verify they fail.**

Run: `pnpm test src/features/auth/ui`
Expected: FAIL, missing modules.

- [ ] **Step 3: Write the components.**

`src/features/auth/ui/editorial-panel/editorial-panel.copy.ts`

```ts
// Translated from auth.pen Z5xhk (English); UI language is Indonesian (CONFLICT-1, 2026-09-27).
export const EDITORIAL_PANEL_COPY = {
  headline: "Setiap foto yang Anda ambil,\ntepat di tempatnya.",
  body: "Booking, galeri, seleksi, dan invoice untuk fotografer.",
} as const;
```

`src/features/auth/ui/editorial-panel/editorial-panel.tsx`

```tsx
import Image from "next/image";

import { EDITORIAL_PANEL_COPY } from "./editorial-panel.copy";

// The tilted mosaic (auth.pen Z5xhk) is a decorative image exported from Pencil with its scrim
// (Owner 2026-09-27): licensed photos only (R-5). The headline stays live text.
const MOSAIC_SRC = "/auth/editorial/mosaic.webp";

/**
 * The desktop editorial panel beside every auth form. Decorative: hidden from assistive
 * technology and free of controls (design.md › Copy and behavior).
 * @returns the panel
 */
export function EditorialPanel() {
  return (
    <aside
      aria-hidden="true"
      className="relative h-full min-h-dvh overflow-hidden bg-(--color-semantic-surface-inverse)"
    >
      <Image src={MOSAIC_SRC} alt="" fill sizes="100vw" unoptimized className="object-cover" />
      <div className="absolute inset-x-(--space-16) bottom-(--space-16) flex flex-col gap-(--space-4)">
        <p className="text-(length:--font-size-hero) leading-(--font-line-height-tight) font-bold whitespace-pre-line text-(--color-semantic-text-inverse)">
          {EDITORIAL_PANEL_COPY.headline}
        </p>
        <p className="text-(length:--font-size-body) text-(--color-semantic-text-muted)">
          {EDITORIAL_PANEL_COPY.body}
        </p>
      </div>
    </aside>
  );
}
```

`src/features/auth/ui/auth-split-layout/auth-split-layout.copy.ts`

```ts
// From auth.pen amp4Y: the brand is not translated.
export const AUTH_SPLIT_LAYOUT_COPY = {
  brand: "shutrly.",
  footer: "© 2026 Shutrly",
} as const;
```

`src/features/auth/ui/auth-split-layout/auth-split-layout.tsx`

```tsx
import type { PropsWithChildren } from "react";

import { EditorialPanel } from "../editorial-panel/editorial-panel";
import { AUTH_SPLIT_LAYOUT_COPY } from "./auth-split-layout.copy";

/**
 * The auth screens' frame (auth.pen amp4Y / IOC5i): brand, form column and footer; the
 * editorial panel only from the desktop breakpoint.
 * @param props - the screen content
 * @returns the layout
 */
export function AuthSplitLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <div className="grid min-h-dvh bg-(--color-semantic-surface-panel) lg:grid-cols-[var(--size-auth-panel)_minmax(0,1fr)]">
      <main className="flex min-h-dvh flex-col p-(--space-6) lg:p-(--space-12)">
        <p className="flex items-center gap-(--space-2)">
          <span
            aria-hidden="true"
            className="size-(--space-4) rounded-(--radius-xs) bg-(--color-semantic-accent-highlight)"
          />
          <span className="text-(length:--font-size-title) font-bold text-(--color-semantic-text-primary)">
            {AUTH_SPLIT_LAYOUT_COPY.brand}
          </span>
        </p>
        <div className="flex flex-1 flex-col items-center justify-center py-(--space-8)">
          <div className="flex w-full flex-col gap-(--space-6) lg:w-(--size-auth-form)">
            {children}
          </div>
        </div>
        <p className="text-(length:--font-size-label) text-(--color-semantic-text-muted)">
          {AUTH_SPLIT_LAYOUT_COPY.footer}
        </p>
      </main>
      <div data-slot="editorial" className="hidden lg:block">
        <EditorialPanel />
      </div>
    </div>
  );
}
```

`src/features/auth/ui/auth-intro/auth-intro.types.ts`

```ts
export interface AuthIntroProps {
  title: string;
  lead: string;
}
```

`src/features/auth/ui/auth-intro/auth-intro.tsx`

```tsx
import type { AuthIntroProps } from "./auth-intro.types";

/**
 * A screen's heading and lead paragraph (auth.pen intro group, gap `space.2`).
 * @param props - the translated title and lead
 * @returns the intro block
 */
export function AuthIntro({ title, lead }: Readonly<AuthIntroProps>) {
  return (
    <div className="flex flex-col gap-(--space-2)">
      <h1 className="text-(length:--font-size-display) font-bold text-(--color-semantic-text-primary)">
        {title}
      </h1>
      <p className="text-(length:--font-size-body) text-(--color-semantic-text-secondary)">
        {lead}
      </p>
    </div>
  );
}
```

`src/features/auth/ui/auth-text-link/auth-text-link.types.ts`

```ts
import type { ReactNode } from "react";

export interface AuthTextLinkProps {
  href: string;
  children: ReactNode;
}
```

`src/features/auth/ui/auth-text-link/auth-text-link.tsx`

```tsx
import Link from "next/link";

import type { AuthTextLinkProps } from "./auth-text-link.types";

/**
 * An inline auth link (body-sm, semibold, `status.info.fg`) with a visible focus ring.
 * @param props - the target and the link text
 * @returns the link
 */
export function AuthTextLink({ href, children }: Readonly<AuthTextLinkProps>) {
  return (
    <Link
      href={href}
      className="rounded-(--radius-xs) text-(length:--font-size-body-sm) font-semibold text-(--color-semantic-status-info-fg) underline-offset-2 outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-semantic-focus-ring)"
    >
      {children}
    </Link>
  );
}
```

`src/features/auth/ui/auth-prompt/auth-prompt.types.ts`

```ts
export interface AuthPromptProps {
  prompt: string;
  href: string;
  link: string;
}
```

`src/features/auth/ui/auth-prompt/auth-prompt.tsx`

```tsx
import { AuthTextLink } from "../auth-text-link/auth-text-link";
import type { AuthPromptProps } from "./auth-prompt.types";

/**
 * The centred "question + link" line under a form, e.g. switching between sign-in and sign-up.
 * @param props - the translated prompt, the link target and the link text
 * @returns the prompt line
 */
export function AuthPrompt({ prompt, href, link }: Readonly<AuthPromptProps>) {
  return (
    <p className="flex justify-center gap-(--space-1) text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
      <span>{prompt}</span>
      <AuthTextLink href={href}>{link}</AuthTextLink>
    </p>
  );
}
```

`src/app/(auth)/layout.tsx`

```tsx
import type { PropsWithChildren } from "react";

import { AuthSplitLayout } from "@/features/auth/ui/auth-split-layout/auth-split-layout";

export default function AuthLayout({ children }: Readonly<PropsWithChildren>) {
  return <AuthSplitLayout>{children}</AuthSplitLayout>;
}
```

- [ ] **Step 4: Run them to verify they pass.**

Run: `pnpm test src/features/auth/ui && pnpm lint`
Expected: PASS (5 tests).

- [ ] **Step 5: Fidelity pass.** Run `pnpm dev`. Add a temporary `src/app/(auth)/login/page.tsx` that renders `<AuthIntro title="x" lead="y" />`, and delete it before committing; Task 28 adds the real one. Compare `/login` with `login-amp4Y.html` at 1440 × 900, and with `login-IOC5i.html` at 390 × 844. Check the form column and form widths, the paddings, the brand, the footer, the mosaic's crop and position, and the headline position. Adjust `className` values only (see *Pixel-perfect UI*).

- [ ] **Step 6: Commit.**

```bash
git add src/features/auth/ui "src/app/(auth)/layout.tsx" public/auth/editorial
git commit -m "feat(auth): add the auth split layout and editorial panel"
```

## Task 26: Form plumbing

**Files:**
- `src/features/auth/ui/use-server-failure/use-server-failure.{ts,types.ts}`
- `src/features/auth/ui/use-auth-form/use-auth-form.{ts,types.ts}`
- `src/features/auth/ui/controlled-text-field/controlled-text-field.{tsx,copy.ts,types.ts}`
- `src/features/auth/ui/auth-error-alert/auth-error-alert.{tsx,copy.ts,types.ts}`

Shared by every auth form:
- `useAuthForm` wires React Hook Form to the **use case's own schema** (coding rules › Validation).
- `useServerFailure` routes server field errors to `setError` and anything else to a form-level Alert.
- `ControlledTextField` binds the design-system `TextField` through `useController`, so there is no inline render prop.
- `AuthErrorAlert` takes focus when it appears (AC-AUTH-023). It holds its own ref, so no ref is read during render (React Compiler lint).

An unexpected submit error is re-thrown during render, so the route's error boundary shows the generic retry state (C-007). It is never swallowed. These hooks are tested through the forms in Tasks 27–30.

- [ ] **Step 1: Write the units.**

`src/features/auth/ui/use-server-failure/use-server-failure.types.ts`

```ts
import type { FieldValues, UseFormSetError } from "react-hook-form";

import type {
  AuthErrorCode,
  AuthFailure,
} from "@/features/auth/application/errors/auth-errors/auth-errors.types";

export interface ServerFailure<T extends FieldValues> {
  formError: AuthErrorCode | null;
  apply: (failure: AuthFailure, setError: UseFormSetError<T>) => void;
  clear: () => void;
}
```

`src/features/auth/ui/use-server-failure/use-server-failure.ts`

```ts
"use client";

import { useCallback, useState } from "react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import type {
  AuthErrorCode,
  AuthFailure,
} from "@/features/auth/application/errors/auth-errors/auth-errors.types";

import type { ServerFailure } from "./use-server-failure.types";

/**
 * Route a server-action failure: field errors go to their fields (the first one focused) with
 * `setError`; anything else becomes the form-level error (AC-AUTH-023).
 * @returns the current form error, and `apply` / `clear`
 */
export function useServerFailure<T extends FieldValues>(): ServerFailure<T> {
  const [formError, setFormError] = useState<AuthErrorCode | null>(null);

  const apply = useCallback((failure: AuthFailure, setError: UseFormSetError<T>) => {
    const entries = Object.entries(failure.fieldErrors ?? {});
    if (failure.code !== "VALIDATION_FAILED" || entries.length === 0) {
      setFormError(failure.code);
      return;
    }
    for (const [index, [field, key]] of entries.entries()) {
      const options = { shouldFocus: index === 0 };
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- server field names come from the form's own shared schema
      setError(field as Path<T>, { type: "server", message: key }, options);
    }
  }, []);

  const clear = useCallback(() => {
    setFormError(null);
  }, []);

  return { formError, apply, clear };
}
```

`src/features/auth/ui/use-auth-form/use-auth-form.types.ts`

```ts
import type { BaseSyntheticEvent } from "react";
import type { DefaultValues, FieldValues, UseFormReturn } from "react-hook-form";
import type { z } from "zod";

import type { AuthFailure } from "@/features/auth/application/errors/auth-errors/auth-errors.types";

import type { ServerFailure } from "../use-server-failure/use-server-failure.types";

/** A server action behind a form: nothing on success (it redirects or the form resets). */
export type FormAction<T> = (values: T) => Promise<AuthFailure | undefined>;

export interface AuthFormOptions<T extends FieldValues> {
  schema: z.ZodType<T, T>;
  defaultValues: DefaultValues<T>;
  action: FormAction<T>;
  onSuccess?: () => void;
}

export interface AuthForm<T extends FieldValues> {
  form: UseFormReturn<T, unknown, T>;
  server: ServerFailure<T>;
  onSubmit: (event?: BaseSyntheticEvent) => void;
  isSubmitting: boolean;
}
```

`src/features/auth/ui/use-auth-form/use-auth-form.ts`

```ts
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { BaseSyntheticEvent } from "react";
import { useState } from "react";
import type { FieldValues } from "react-hook-form";
import { useForm } from "react-hook-form";

import { useServerFailure } from "../use-server-failure/use-server-failure";
import type { AuthForm, AuthFormOptions } from "./use-auth-form.types";

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error("Auth form submit failed");
}

/**
 * React Hook Form wired the same way for every auth form: the shared use-case schema through
 * `zodResolver` (UX only; the server re-validates, C-004), focus on the first invalid field,
 * and server failures routed by `useServerFailure`. An unexpected error is rethrown during
 * render so the route's error boundary shows the generic retry state (C-007).
 * @param options - the shared schema, default values, server action and optional success hook
 * @returns the form, the server-failure state, the submit handler and the submitting flag
 */
export function useAuthForm<T extends FieldValues>(options: AuthFormOptions<T>): AuthForm<T> {
  const { schema, defaultValues, action, onSuccess } = options;
  const [crash, setCrash] = useState<Error | null>(null);
  const form = useForm<T, unknown, T>({
    resolver: zodResolver(schema),
    defaultValues,
    shouldFocusError: true,
  });
  const server = useServerFailure<T>();
  if (crash) throw crash;

  async function submit(values: T): Promise<void> {
    server.clear();
    const failure = await action(values);
    if (failure) server.apply(failure, form.setError);
    else onSuccess?.();
  }

  function fail(error: unknown): void {
    setCrash(toError(error));
  }

  const handle = form.handleSubmit(submit);
  function onSubmit(event?: BaseSyntheticEvent): void {
    handle(event).catch(fail);
  }

  return { form, server, onSubmit, isSubmitting: form.formState.isSubmitting };
}
```

`src/features/auth/ui/controlled-text-field/controlled-text-field.copy.ts`

```ts
import type { FieldErrorKey } from "@/features/auth/application/errors/auth-errors/auth-errors.types";

// Indonesian (CONFLICT-1). email.invalid and password.length are auth.pen hTP6i; the rest
// are // not in Pencil.
export const FIELD_ERROR_COPY: Record<FieldErrorKey, string> = {
  "name.required": "Masukkan nama Anda.", // not in Pencil
  "name.tooLong": "Gunakan paling banyak 100 karakter.", // not in Pencil
  "email.invalid": "Masukkan alamat email yang valid.",
  "password.required": "Masukkan kata sandi Anda.", // not in Pencil
  "password.length": "Gunakan 8–128 karakter.",
  "password.mismatch": "Kata sandi tidak cocok.", // not in Pencil
  "password.wrongCurrent": "Kata sandi saat ini salah.", // not in Pencil
};
```

`src/features/auth/ui/controlled-text-field/controlled-text-field.types.ts`

```ts
import type { Control, FieldValues, Path } from "react-hook-form";

export interface ControlledTextFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  placeholder?: string;
}
```

`src/features/auth/ui/controlled-text-field/controlled-text-field.tsx`

```tsx
"use client";

import type { FieldValues } from "react-hook-form";
import { useController } from "react-hook-form";

import { fieldErrorKeySchema } from "@/features/auth/application/errors/auth-errors/auth-errors.schema";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { FIELD_ERROR_COPY } from "./controlled-text-field.copy";
import type { ControlledTextFieldProps } from "./controlled-text-field.types";

function errorText(message: string | undefined): string | undefined {
  const key = fieldErrorKeySchema.safeParse(message);
  return key.success ? FIELD_ERROR_COPY[key.data] : undefined;
}

/**
 * A design-system TextField bound to React Hook Form. The field error is a FieldErrorKey from
 * the shared schema or the server, shown in the UI language (coding rules › Validation).
 * @param props - the form control, field name, and the translated label and placeholder
 * @returns the bound text field
 */
export function ControlledTextField<T extends FieldValues>({
  control,
  name,
  ...field
}: Readonly<ControlledTextFieldProps<T>>) {
  const { field: bound, fieldState } = useController({ control, name });
  return (
    <TextField
      {...field}
      name={bound.name}
      value={typeof bound.value === "string" ? bound.value : ""}
      onChange={bound.onChange}
      onBlur={bound.onBlur}
      inputRef={bound.ref}
      errorMessage={errorText(fieldState.error?.message)}
    />
  );
}
```

`src/features/auth/ui/auth-error-alert/auth-error-alert.copy.ts`

```ts
import type { AuthErrorCode } from "@/features/auth/application/errors/auth-errors/auth-errors.types";

// Indonesian (CONFLICT-1, 2026-09-27). INVALID_CREDENTIALS is auth.pen DjUek; the rest is
// spec wording or // not in Pencil, listed for Owner review in design.md.
export const AUTH_ERROR_COPY: Record<AuthErrorCode, string> = {
  VALIDATION_FAILED: "Periksa kolom yang ditandai.", // not in Pencil
  INVALID_CREDENTIALS: "Email atau kata sandi salah.",
  RATE_LIMITED: "Terlalu banyak percobaan. Coba lagi nanti.",
  EMAIL_UNVERIFIED: "Verifikasi email Anda untuk melanjutkan.", // not in Pencil
  ACCOUNT_UNAVAILABLE: "Akun ini tidak bisa mengakses Shutrly saat ini.",
  AUTH_REQUIRED: "Masuk untuk melanjutkan.", // not in Pencil
  INVALID_LINK: "Tautan mungkin sudah kedaluwarsa atau sudah dipakai.",
  WRONG_CURRENT_PASSWORD: "Kata sandi saat ini salah.", // not in Pencil
  GOOGLE_CANCELLED: "Masuk dengan Google dibatalkan.",
  GOOGLE_FAILED: "Kami tidak bisa memasukkan Anda dengan Google.",
  EMAIL_DELIVERY_FAILED: "Email tidak bisa dikirim. Coba lagi sebentar lagi.", // not in Pencil
};
```

`src/features/auth/ui/auth-error-alert/auth-error-alert.types.ts`

```ts
import type { AuthErrorCode } from "@/features/auth/application/errors/auth-errors/auth-errors.types";

export interface AuthErrorAlertProps {
  code: AuthErrorCode;
}
```

`src/features/auth/ui/auth-error-alert/auth-error-alert.tsx`

```tsx
"use client";

import { useEffect, useRef } from "react";

import { Alert } from "@/ui/patterns/alert/alert";

import { AUTH_ERROR_COPY } from "./auth-error-alert.copy";
import type { AuthErrorAlertProps } from "./auth-error-alert.types";

/**
 * A form-level error as a live, title-only Danger Alert (auth.pen DjUek) that takes focus when
 * it appears (AC-AUTH-023). It never names the account or which field was wrong (A-5).
 * @param props - the error code
 * @returns the alert
 */
export function AuthErrorAlert({ code }: Readonly<AuthErrorAlertProps>) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, [code]);
  return <Alert ref={ref} tone="danger" title={AUTH_ERROR_COPY[code]} live />;
}
```

- [ ] **Step 2: Run the gate.**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 3: Commit.**

```bash
git add src/features/auth/ui
git commit -m "feat(auth): add the shared auth form hooks, field and error alert"
```

---

# Iteration 7 — Screens

## Task 27: Register and verification screens

**Files:**
- `src/features/auth/ui/register-form/*`, `src/features/auth/ui/resend-verification/*`, `src/features/auth/ui/google-button/*`
- `src/features/auth/ui/{register-screen,verify-pending-screen,invalid-verify-link-screen}/*`
- `src/app/actions/auth/{register,google}.ts`
- `src/app/(auth)/register/page.tsx`, `src/app/(auth)/verify/page.tsx`, `src/app/(auth)/verify/confirm/route.ts`

- [ ] **Step 0: Exports.** Check that `register-*`, `register-errors-*`, `verify-pending-*` and `invalid-verify-link-*` exist. If one is missing, stop and ask the Owner.

- [ ] **Step 1: Write the failing tests.**

`src/features/auth/ui/register-form/register-form.test.tsx`

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AUTH_ERROR_COPY } from "../auth-error-alert/auth-error-alert.copy";
import { FIELD_ERROR_COPY } from "../controlled-text-field/controlled-text-field.copy";
import { RegisterForm } from "./register-form";
import { REGISTER_FORM_COPY as COPY } from "./register-form.copy";

async function fill(values: { name: string; email: string; password: string }) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(COPY.name), values.name);
  await user.type(screen.getByLabelText(COPY.email), values.email);
  await user.type(screen.getByLabelText(COPY.password), values.password);
  await user.click(screen.getByRole("button", { name: COPY.submit }));
}

const good = { name: "Alya", email: "a@b.co", password: "correct-horse" };

describe("RegisterForm", () => {
  it("AC-AUTH-023 labels every field", () => {
    render(<RegisterForm action={vi.fn()} />);
    for (const label of [COPY.name, COPY.email, COPY.password]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it("AC-AUTH-002 AC-AUTH-023 validates on the client and focuses the first invalid field", async () => {
    const action = vi.fn();
    render(<RegisterForm action={action} />);
    await fill({ ...good, email: "not-an-email", password: "short" });
    expect(await screen.findByText(FIELD_ERROR_COPY["email.invalid"])).toBeInTheDocument();
    expect(screen.getByText(FIELD_ERROR_COPY["password.length"])).toBeInTheDocument();
    expect(screen.getByLabelText(COPY.email)).toHaveFocus();
    expect(action).not.toHaveBeenCalled();
  });

  it("AC-AUTH-002 shows server field errors on their field", async () => {
    const fieldErrors = { email: "email.invalid" } as const;
    const action = vi.fn(() =>
      Promise.resolve({ ok: false, code: "VALIDATION_FAILED", fieldErrors } as const),
    );
    render(<RegisterForm action={action} />);
    await fill(good);
    expect(await screen.findByText(FIELD_ERROR_COPY["email.invalid"])).toBeInTheDocument();
  });

  it("AC-AUTH-010 AC-AUTH-023 announces and focuses a form-level error", async () => {
    const action = vi.fn(() => Promise.resolve({ ok: false, code: "RATE_LIMITED" } as const));
    render(<RegisterForm action={action} />);
    await fill(good);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(AUTH_ERROR_COPY.RATE_LIMITED);
    await waitFor(() => {
      expect(alert).toHaveFocus();
    });
  });
});
```

`src/features/auth/ui/resend-verification/resend-verification.test.tsx`

```tsx
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_ERROR_COPY } from "../auth-error-alert/auth-error-alert.copy";
import { ResendVerification } from "./resend-verification";
import { RESEND_VERIFICATION_COPY as COPY } from "./resend-verification.copy";

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => {
  vi.useRealTimers();
});

async function press() {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  await user.click(screen.getByRole("button", { name: COPY.resend }));
}

describe("ResendVerification", () => {
  it("AC-AUTH-006 disables the button for 60 seconds after a resend (A-6)", async () => {
    render(<ResendVerification action={vi.fn(() => Promise.resolve({ ok: true } as const))} />);
    await press();
    expect(await screen.findByText(/60/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: COPY.resend })).toBeDisabled();
    // The countdown re-arms a one-second timer after each render.
    for (let second = 0; second < 60; second++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1_000);
      });
    }
    expect(screen.getByRole("button", { name: COPY.resend })).toBeEnabled();
  });

  it("AC-AUTH-022 shows a retryable delivery failure", async () => {
    const failed = { ok: false, code: "EMAIL_DELIVERY_FAILED" } as const;
    render(<ResendVerification action={vi.fn(() => Promise.resolve(failed))} />);
    await press();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      AUTH_ERROR_COPY.EMAIL_DELIVERY_FAILED,
    );
    expect(screen.getByRole("button", { name: COPY.resend })).toBeEnabled();
  });
});
```

`src/features/auth/ui/invalid-verify-link-screen/invalid-verify-link-screen.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { VerifyPendingScreen } from "../verify-pending-screen/verify-pending-screen";
import { VERIFY_PENDING_SCREEN_COPY } from "../verify-pending-screen/verify-pending-screen.copy";
import { InvalidVerifyLinkScreen } from "./invalid-verify-link-screen";
import { INVALID_VERIFY_LINK_SCREEN_COPY as COPY } from "./invalid-verify-link-screen.copy";

const resend = vi.fn();

describe("verification screens", () => {
  it("AC-AUTH-003 the pending screen shows static guidance, not a live announcement", () => {
    render(<VerifyPendingScreen canResend resendAction={resend} />);
    expect(screen.getByText(VERIFY_PENDING_SCREEN_COPY.alertTitle)).toBeInTheDocument();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("AC-AUTH-005 the invalid-link screen offers resend when an email is known", () => {
    render(<InvalidVerifyLinkScreen canResend resendAction={resend} />);
    expect(screen.getByRole("button", { name: COPY.action })).toBeInTheDocument();
  });

  it("AC-AUTH-005 without a known email it sends the visitor to sign in", () => {
    render(<InvalidVerifyLinkScreen canResend={false} resendAction={resend} />);
    expect(screen.getByRole("link", { name: COPY.action })).toHaveAttribute("href", "/login");
  });
});
```

- [ ] **Step 2: Run them to verify they fail.**

Run: `pnpm test src/features/auth/ui`
Expected: FAIL, missing modules.

- [ ] **Step 3: Write the forms and controls.**

`src/features/auth/ui/register-form/register-form.copy.ts`

```ts
// Translated from auth.pen m3QGM / hTP6i (English); Indonesian per CONFLICT-1 (2026-09-27).
export const REGISTER_FORM_COPY = {
  name: "Nama Anda",
  namePlaceholder: "Nama lengkap Anda",
  email: "Email",
  emailPlaceholder: "anda@studio.com",
  password: "Kata sandi",
  passwordPlaceholder: "Minimal 8 karakter",
  submit: "Buat akun",
  submitting: "Membuat akun…", // not in Pencil
} as const;
```

`src/features/auth/ui/register-form/register-form.types.ts`

```ts
import type { ReactNode } from "react";

import type { RegisterOwnerInput } from "@/features/auth/application/use-cases/register-owner/register-owner.types";

import type { FormAction } from "../use-auth-form/use-auth-form.types";

export interface RegisterFormProps {
  action: FormAction<RegisterOwnerInput>;
  /** Rendered under the form, outside it: the Google button (a form of its own). */
  secondaryAction?: ReactNode;
}
```

`src/features/auth/ui/register-form/register-form.tsx`

```tsx
"use client";

import { registerOwnerSchema } from "@/features/auth/application/use-cases/register-owner/register-owner.schema";
import { Button } from "@/ui/primitives/button/button";

import { AuthErrorAlert } from "../auth-error-alert/auth-error-alert";
import { ControlledTextField } from "../controlled-text-field/controlled-text-field";
import { useAuthForm } from "../use-auth-form/use-auth-form";
import { REGISTER_FORM_COPY as COPY } from "./register-form.copy";
import type { RegisterFormProps } from "./register-form.types";

const DEFAULTS = { name: "", email: "", password: "" };

/**
 * The Register form (auth.pen m3QGM; field errors hTP6i). The schema is the use case's own
 * (UX only; the server re-validates).
 * @param props - the register server action and the optional Google button
 * @returns the form
 */
export function RegisterForm({ action, secondaryAction }: Readonly<RegisterFormProps>) {
  const { form, server, onSubmit, isSubmitting } = useAuthForm({
    schema: registerOwnerSchema,
    defaultValues: DEFAULTS,
    action,
  });
  const { control } = form;
  return (
    <div className="flex flex-col gap-(--space-3)">
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-(--space-6)">
        {server.formError ? <AuthErrorAlert code={server.formError} /> : null}
        <div className="flex flex-col gap-(--space-4)">
          <ControlledTextField
            control={control}
            name="name"
            label={COPY.name}
            placeholder={COPY.namePlaceholder}
            autoComplete="name"
          />
          <ControlledTextField
            control={control}
            name="email"
            type="email"
            label={COPY.email}
            placeholder={COPY.emailPlaceholder}
            autoComplete="email"
          />
          <ControlledTextField
            control={control}
            name="password"
            type="password"
            label={COPY.password}
            placeholder={COPY.passwordPlaceholder}
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" size="lg" isDisabled={isSubmitting}>
          {isSubmitting ? COPY.submitting : COPY.submit}
        </Button>
      </form>
      {secondaryAction}
    </div>
  );
}
```

`src/features/auth/ui/resend-verification/resend-verification.copy.ts`

```ts
// Translated from auth.pen p3NbDB (English); Indonesian per CONFLICT-1 (2026-09-27).
export const RESEND_VERIFICATION_COPY = {
  resend: "Kirim ulang email verifikasi",
  cooldownPrefix: "Anda bisa meminta email lagi dalam",
  cooldownSuffix: "detik.",
  sent: "Kami sudah mengirim tautan baru.", // not in Pencil
} as const;
```

`src/features/auth/ui/resend-verification/resend-verification.types.ts`

```ts
import type { ResendVerificationResult } from "@/features/auth/application/use-cases/resend-verification/resend-verification.types";

export interface ResendVerificationProps {
  action: () => Promise<ResendVerificationResult>;
  /** The button text; the invalid-link screen reuses the control with its own label. */
  label?: string;
}

export interface CooldownProps {
  secondsLeft: number;
}
```

`src/features/auth/ui/resend-verification/resend-verification.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";

import type { AuthErrorCode } from "@/features/auth/application/errors/auth-errors/auth-errors.types";
import { Alert } from "@/ui/patterns/alert/alert";
import { Button } from "@/ui/primitives/button/button";

import { AuthErrorAlert } from "../auth-error-alert/auth-error-alert";
import { RESEND_VERIFICATION_COPY as COPY } from "./resend-verification.copy";
import type { CooldownProps, ResendVerificationProps } from "./resend-verification.types";

/** A-6: the resend button's cooldown. UX only; the server rate limit is the authority. */
const COOLDOWN_SECONDS = 60;
const SECOND_MS = 1000;

function Cooldown({ secondsLeft }: Readonly<CooldownProps>) {
  return (
    <p className="text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
      {COPY.cooldownPrefix} {secondsLeft} {COPY.cooldownSuffix}
    </p>
  );
}

/**
 * The resend-verification control with its 60 s cooldown (AC-AUTH-006) and a retryable
 * delivery failure (AC-AUTH-022).
 * @param props - the resend server action and an optional button label
 * @returns the control
 */
export function ResendVerification({
  action,
  label = COPY.resend,
}: Readonly<ResendVerificationProps>) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState<AuthErrorCode | null>(null);
  const [busy, setBusy] = useState(false);
  const [crash, setCrash] = useState<Error | null>(null);
  // An unexpected failure goes to the route's error boundary (C-007), never swallowed.
  if (crash) throw crash;

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => {
      setSecondsLeft((seconds) => seconds - 1);
    }, SECOND_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [secondsLeft]);

  async function resend(): Promise<void> {
    setBusy(true);
    setError(null);
    const result = await action();
    setBusy(false);
    if (result.ok) setSecondsLeft(COOLDOWN_SECONDS);
    else setError(result.code);
  }

  function fail(caught: unknown): void {
    setCrash(caught instanceof Error ? caught : new Error("Resend failed"));
  }

  function handlePress(): void {
    resend().catch(fail);
  }

  return (
    <div className="flex flex-col gap-(--space-3)">
      {error ? <AuthErrorAlert code={error} /> : null}
      {secondsLeft > 0 ? <Alert tone="info" title={COPY.sent} live /> : null}
      <Button
        variant="secondary"
        size="lg"
        isDisabled={busy || secondsLeft > 0}
        onPress={handlePress}
      >
        {label}
      </Button>
      {secondsLeft > 0 ? <Cooldown secondsLeft={secondsLeft} /> : null}
    </div>
  );
}
```

`src/features/auth/ui/google-button/google-button.copy.ts`

```ts
// Translated from auth.pen amp4Y (English); Indonesian per CONFLICT-1 (2026-09-27).
export const GOOGLE_BUTTON_COPY = {
  label: "Lanjutkan dengan Google",
} as const;
```

`src/features/auth/ui/google-button/google-button.types.ts`

```ts
export interface GoogleButtonProps {
  action: () => Promise<void>;
}
```

`src/features/auth/ui/google-button/google-button.tsx`

```tsx
import { Button } from "@/ui/primitives/button/button";
import { Icon } from "@/ui/primitives/icon/icon";

import { GOOGLE_BUTTON_COPY } from "./google-button.copy";
import type { GoogleButtonProps } from "./google-button.types";

/**
 * "Continue with Google" as its own form, so it works without client JS and the OAuth state
 * cookie is set by the server (ADR-012).
 * @param props - the server action that starts Google sign-in
 * @returns the form with one secondary button
 */
export function GoogleButton({ action }: Readonly<GoogleButtonProps>) {
  return (
    <form action={action}>
      <Button type="submit" variant="secondary" size="lg" className="w-full">
        <Icon name="google" />
        {GOOGLE_BUTTON_COPY.label}
      </Button>
    </form>
  );
}
```

- [ ] **Step 4: Write the screens.**

`src/features/auth/ui/register-screen/register-screen.copy.ts`

```ts
// Translated from auth.pen m3QGM / UryLp (English); Indonesian per CONFLICT-1 (2026-09-27).
export const REGISTER_SCREEN_COPY = {
  title: "Buat akun Anda",
  lead: "Cara yang lebih rapi untuk mengelola setiap pemotretan, dari pertanyaan pertama hingga pengiriman akhir.",
  switchPrompt: "Sudah punya akun?",
  switchLink: "Masuk",
} as const;
```

`src/features/auth/ui/register-screen/register-screen.types.ts`

```ts
import type { RegisterOwnerInput } from "@/features/auth/application/use-cases/register-owner/register-owner.types";

import type { FormAction } from "../use-auth-form/use-auth-form.types";

export interface RegisterScreenProps {
  action: FormAction<RegisterOwnerInput>;
  googleAction: () => Promise<void>;
}
```

`src/features/auth/ui/register-screen/register-screen.tsx`

```tsx
import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthPrompt } from "../auth-prompt/auth-prompt";
import { GoogleButton } from "../google-button/google-button";
import { RegisterForm } from "../register-form/register-form";
import { REGISTER_SCREEN_COPY as COPY } from "./register-screen.copy";
import type { RegisterScreenProps } from "./register-screen.types";

/**
 * Register (auth.pen m3QGM / UryLp; field errors hTP6i / aIY0r).
 * @param props - the register and Google actions
 * @returns the screen content inside `AuthSplitLayout`
 */
export function RegisterScreen({ action, googleAction }: Readonly<RegisterScreenProps>) {
  return (
    <>
      <AuthIntro title={COPY.title} lead={COPY.lead} />
      <RegisterForm action={action} secondaryAction={<GoogleButton action={googleAction} />} />
      <AuthPrompt prompt={COPY.switchPrompt} href="/login" link={COPY.switchLink} />
    </>
  );
}
```

`src/features/auth/ui/verify-pending-screen/verify-pending-screen.copy.ts`

```ts
// Translated from auth.pen p3NbDB / TXoQI, Alert tbePZ (English); Indonesian per CONFLICT-1.
export const VERIFY_PENDING_SCREEN_COPY = {
  title: "Periksa email Anda",
  lead: "Jika alamat ini perlu diverifikasi, tautannya sedang dikirim. Buka tautan itu untuk melanjutkan.",
  alertTitle: "Tautan berlaku 24 jam",
  alertBody: "Periksa folder spam jika email tidak masuk.",
  back: "Kembali ke halaman masuk",
} as const;
```

`src/features/auth/ui/verify-pending-screen/verify-pending-screen.types.ts`

```ts
import type { ResendVerificationResult } from "@/features/auth/application/use-cases/resend-verification/resend-verification.types";

export interface VerifyScreenProps {
  /** A restricted session or a valid pending-email cookie identifies whom to resend to. */
  canResend: boolean;
  resendAction: () => Promise<ResendVerificationResult>;
}
```

`src/features/auth/ui/verify-pending-screen/verify-pending-screen.tsx`

```tsx
import { Alert } from "@/ui/patterns/alert/alert";

import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthTextLink } from "../auth-text-link/auth-text-link";
import { ResendVerification } from "../resend-verification/resend-verification";
import { VERIFY_PENDING_SCREEN_COPY as COPY } from "./verify-pending-screen.copy";
import type { VerifyScreenProps } from "./verify-pending-screen.types";

/**
 * Verification pending (auth.pen p3NbDB / TXoQI): the same text for every email (A-5),
 * with resend when the request identifies an email (SPEC GAP-3).
 * @param props - whether resend can work, and the resend action
 * @returns the screen content inside `AuthSplitLayout`
 */
export function VerifyPendingScreen({ canResend, resendAction }: Readonly<VerifyScreenProps>) {
  return (
    <>
      <AuthIntro title={COPY.title} lead={COPY.lead} />
      <Alert tone="info" title={COPY.alertTitle} body={COPY.alertBody} />
      {canResend ? <ResendVerification action={resendAction} /> : null}
      <AuthTextLink href="/login">{COPY.back}</AuthTextLink>
    </>
  );
}
```

`src/features/auth/ui/invalid-verify-link-screen/invalid-verify-link-screen.copy.ts`

```ts
// Translated from auth.pen TIvfA / ifV1Z, Alert lwMnR (English); Indonesian per CONFLICT-1.
export const INVALID_VERIFY_LINK_SCREEN_COPY = {
  title: "Tautan ini sudah tidak berlaku",
  lead: "Tautan mungkin sudah kedaluwarsa atau sudah dipakai. Minta tautan baru untuk melanjutkan.",
  alertTitle: "Tautan hanya bisa dipakai sekali",
  alertBody: "Demi keamanan, setiap tautan verifikasi dan atur ulang hanya bisa dipakai satu kali.",
  action: "Minta tautan baru",
  back: "Kembali ke halaman masuk",
} as const;
```

`src/features/auth/ui/invalid-verify-link-screen/invalid-verify-link-screen.tsx`

```tsx
import { Alert } from "@/ui/patterns/alert/alert";

import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthTextLink } from "../auth-text-link/auth-text-link";
import { ResendVerification } from "../resend-verification/resend-verification";
import type { VerifyScreenProps } from "../verify-pending-screen/verify-pending-screen.types";
import { INVALID_VERIFY_LINK_SCREEN_COPY as COPY } from "./invalid-verify-link-screen.copy";

/**
 * Invalid verification link (auth.pen TIvfA / ifV1Z). Without a session or pending cookie,
 * "request a new link" goes to login: an unverified sign-in gets a restricted session that can
 * resend.
 * @param props - whether resend can work, and the resend action
 * @returns the screen content inside `AuthSplitLayout`
 */
export function InvalidVerifyLinkScreen({ canResend, resendAction }: Readonly<VerifyScreenProps>) {
  return (
    <>
      <AuthIntro title={COPY.title} lead={COPY.lead} />
      <Alert tone="danger" title={COPY.alertTitle} body={COPY.alertBody} />
      {canResend ? (
        <ResendVerification action={resendAction} label={COPY.action} />
      ) : (
        <AuthTextLink href="/login">{COPY.action}</AuthTextLink>
      )}
      <AuthTextLink href="/login">{COPY.back}</AuthTextLink>
    </>
  );
}
```

- [ ] **Step 5: Write the actions, pages and link route.** Actions and pages stay thin: they call one composition entry point and map the result.

`src/app/actions/auth/register.ts`

```ts
"use server";

import { redirect } from "next/navigation";

import { register, resendVerificationEmail } from "@/composition/auth/register-flow/register-flow";
import type { AuthFailure } from "@/features/auth/application/errors/auth-errors/auth-errors.types";
import type { RegisterOwnerInput } from "@/features/auth/application/use-cases/register-owner/register-owner.types";
import type { ResendVerificationResult } from "@/features/auth/application/use-cases/resend-verification/resend-verification.types";

export async function registerAction(values: RegisterOwnerInput): Promise<AuthFailure | undefined> {
  const result = await register(values);
  if (result.ok) redirect("/verify");
  return result;
}

export async function resendVerificationAction(): Promise<ResendVerificationResult> {
  const result = await resendVerificationEmail();
  if (!result) redirect("/login");
  return result;
}
```

`src/app/actions/auth/google.ts`

```ts
"use server";

import { redirect } from "next/navigation";

import { startGoogle } from "@/composition/auth/google-flow/google-flow";

export async function startGoogleAction(): Promise<void> {
  redirect(await startGoogle());
}
```

`src/app/(auth)/register/page.tsx`

```tsx
import { startGoogleAction } from "@/app/actions/auth/google";
import { registerAction } from "@/app/actions/auth/register";
import { redirectIfSignedIn } from "@/composition/auth/owner-guard/owner-guard";
import { RegisterScreen } from "@/features/auth/ui/register-screen/register-screen";

export default async function RegisterPage() {
  await redirectIfSignedIn();
  return <RegisterScreen action={registerAction} googleAction={startGoogleAction} />;
}
```

`src/app/(auth)/verify/page.tsx`

```tsx
import { redirect } from "next/navigation";

import { resendVerificationAction } from "@/app/actions/auth/register";
import { loadVerifyPage } from "@/composition/auth/verify-flow/verify-flow";
import { InvalidVerifyLinkScreen } from "@/features/auth/ui/invalid-verify-link-screen/invalid-verify-link-screen";
import { VerifyPendingScreen } from "@/features/auth/ui/verify-pending-screen/verify-pending-screen";

// p3NbDB (pending) and TIvfA (invalid link, ?state=invalid).
export default async function VerifyPage({ searchParams }: Readonly<PageProps<"/verify">>) {
  const [{ state }, page] = await Promise.all([searchParams, loadVerifyPage()]);
  if (page.kind === "REDIRECT") redirect(page.path);
  if (state === "invalid") {
    return (
      <InvalidVerifyLinkScreen canResend={page.canResend} resendAction={resendVerificationAction} />
    );
  }
  if (!page.canResend) redirect("/login");
  return <VerifyPendingScreen canResend resendAction={resendVerificationAction} />;
}
```

`src/app/(auth)/verify/confirm/route.ts`

```ts
import { verifyEmailLinkResponse } from "@/composition/auth/verify-flow/verify-flow";

export const dynamic = "force-dynamic";

export function GET(request: Request): Promise<Response> {
  return verifyEmailLinkResponse(request);
}
```

- [ ] **Step 6: Run the gate.**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: PASS.

- [ ] **Step 7: Fidelity pass.** With `pnpm dev` (and `E2E_EMAIL_CAPTURE=1` in `.dev.vars`), compare `/register`, `/register` after an invalid submit, `/verify` and `/verify?state=invalid` with their exports at 1440 and 390. Adjust `className` values only. "Request a new link" is a text link here. If the export draws it as a button, record a deviation (a link-styled `Button` needs a design-system change), and do not hand-build one.

- [ ] **Step 8: Check it by hand.** Register an address. You land on `/verify` (`p3NbDB`). Open the link from `/api/test/auth-emails?to=<email>`: you reach `/onboarding/workspace` (F-02 may not exist yet, so a 404 there is expected). Open the same link again: you see `/verify?state=invalid` (`TIvfA`).

- [ ] **Step 9: Commit.**

```bash
git add src/features/auth/ui src/app/actions/auth "src/app/(auth)/register" "src/app/(auth)/verify"
git commit -m "feat(auth): add the register, verification pending and invalid link screens"
```

## Task 28: Login, Google errors and account unavailable

**Files:**
- `src/features/auth/ui/login-form/*`, `src/features/auth/ui/google-error/*`
- `src/features/auth/ui/{login-screen,account-unavailable-screen}/*`
- `src/app/actions/auth/login.ts`
- `src/app/(auth)/login/page.tsx`, `src/app/(auth)/account-unavailable/page.tsx`, `src/app/(auth)/auth/continue/route.ts`

- [ ] **Step 0: Exports.** Check that `login-*`, `login-invalid-*`, `login-processing-*`, `login-focus-*` and `account-unavailable-*` exist. If one is missing, stop and ask the Owner.

- [ ] **Step 1: Write the failing tests.**

`src/features/auth/ui/login-form/login-form.test.tsx`

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AUTH_ERROR_COPY } from "../auth-error-alert/auth-error-alert.copy";
import { LoginForm } from "./login-form";
import { LOGIN_FORM_COPY as COPY } from "./login-form.copy";

async function submit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(COPY.email), "owner@example.com");
  await user.type(screen.getByLabelText(COPY.password), "correct-horse");
  await user.click(screen.getByRole("button", { name: COPY.submit }));
}

describe("LoginForm", () => {
  it("AC-AUTH-008 AC-AUTH-023 shows the generic error as a focused, title-only alert", async () => {
    const action = vi.fn(() =>
      Promise.resolve({ ok: false, code: "INVALID_CREDENTIALS" } as const),
    );
    render(<LoginForm action={action} />);
    await submit();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(AUTH_ERROR_COPY.INVALID_CREDENTIALS);
    expect(alert.querySelectorAll("p")).toHaveLength(1);
    await waitFor(() => {
      expect(alert).toHaveFocus();
    });
  });

  it("AC-AUTH-008 shows the processing label and disables submit while signing in (U9laqq)", async () => {
    const action = vi.fn(() => new Promise<undefined>(() => undefined));
    render(<LoginForm action={action} />);
    await submit();
    expect(await screen.findByRole("button", { name: COPY.submitting })).toBeDisabled();
  });

  it("AC-AUTH-029 shows a Google error from the redirect", () => {
    render(<LoginForm action={vi.fn()} initialError="GOOGLE_CANCELLED" />);
    expect(screen.getByRole("alert")).toHaveTextContent(AUTH_ERROR_COPY.GOOGLE_CANCELLED);
  });

  it("AC-AUTH-016 links to password recovery", () => {
    render(<LoginForm action={vi.fn()} />);
    expect(screen.getByRole("link", { name: COPY.forgot })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });
});
```

`src/features/auth/ui/google-error/google-error.test.ts`

```ts
import { describe, expect, it } from "vitest";

import { googleErrorCode } from "./google-error";

describe("googleErrorCode", () => {
  it("AC-AUTH-029 maps a cancelled consent", () => {
    expect(googleErrorCode("access_denied")).toBe("GOOGLE_CANCELLED");
  });

  it("AC-AUTH-028 maps any other provider error to the generic message", () => {
    expect(googleErrorCode("state_mismatch")).toBe("GOOGLE_FAILED");
    expect(googleErrorCode("account not linked")).toBe("GOOGLE_FAILED");
  });

  it("AC-AUTH-029 returns null without an error", () => {
    expect(googleErrorCode(undefined)).toBeNull();
  });
});
```

- [ ] **Step 2: Run them to verify they fail.**

Run: `pnpm test src/features/auth/ui/login-form src/features/auth/ui/google-error`
Expected: FAIL, missing modules.

- [ ] **Step 3: Write the form, the Google error mapping and the screens.**

`src/features/auth/ui/login-form/login-form.copy.ts`

```ts
// Translated from auth.pen amp4Y / U9laqq (English); Indonesian per CONFLICT-1 (2026-09-27).
export const LOGIN_FORM_COPY = {
  email: "Email",
  emailPlaceholder: "anda@studio.com",
  password: "Kata sandi",
  passwordPlaceholder: "Masukkan kata sandi Anda",
  forgot: "Lupa kata sandi?",
  submit: "Masuk",
  submitting: "Sedang masuk…",
} as const;
```

`src/features/auth/ui/login-form/login-form.types.ts`

```ts
import type { ReactNode } from "react";

import type { AuthErrorCode } from "@/features/auth/application/errors/auth-errors/auth-errors.types";
import type { LoginOwnerInput } from "@/features/auth/application/use-cases/login-owner/login-owner.types";

import type { FormAction } from "../use-auth-form/use-auth-form.types";

export interface LoginFormProps {
  action: FormAction<LoginOwnerInput>;
  /** A Google error from the `?error=` redirect, shown until the next submit. */
  initialError?: AuthErrorCode | null;
  secondaryAction?: ReactNode;
}
```

`src/features/auth/ui/login-form/login-form.tsx`

```tsx
"use client";

import { loginOwnerSchema } from "@/features/auth/application/use-cases/login-owner/login-owner.schema";
import { Button } from "@/ui/primitives/button/button";

import { AuthErrorAlert } from "../auth-error-alert/auth-error-alert";
import { AuthTextLink } from "../auth-text-link/auth-text-link";
import { ControlledTextField } from "../controlled-text-field/controlled-text-field";
import { useAuthForm } from "../use-auth-form/use-auth-form";
import { LOGIN_FORM_COPY as COPY } from "./login-form.copy";
import type { LoginFormProps } from "./login-form.types";

const DEFAULTS = { email: "", password: "" };

/**
 * The Login form (auth.pen amp4Y; invalid credentials q8b0R9; processing U9laqq; focus u9HFU).
 * @param props - the login server action, an initial Google error and the Google button
 * @returns the form
 */
export function LoginForm({
  action,
  initialError = null,
  secondaryAction,
}: Readonly<LoginFormProps>) {
  const { form, server, onSubmit, isSubmitting } = useAuthForm({
    schema: loginOwnerSchema,
    defaultValues: DEFAULTS,
    action,
  });
  const shownError = server.formError ?? (form.formState.isSubmitted ? null : initialError);
  const { control } = form;
  return (
    <div className="flex flex-col gap-(--space-3)">
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-(--space-6)">
        {shownError ? <AuthErrorAlert code={shownError} /> : null}
        <div className="flex flex-col gap-(--space-4)">
          <ControlledTextField
            control={control}
            name="email"
            type="email"
            label={COPY.email}
            placeholder={COPY.emailPlaceholder}
            autoComplete="email"
          />
          <ControlledTextField
            control={control}
            name="password"
            type="password"
            label={COPY.password}
            placeholder={COPY.passwordPlaceholder}
            autoComplete="current-password"
          />
          <div className="flex justify-end">
            <AuthTextLink href="/forgot-password">{COPY.forgot}</AuthTextLink>
          </div>
        </div>
        <Button type="submit" size="lg" isDisabled={isSubmitting}>
          {isSubmitting ? COPY.submitting : COPY.submit}
        </Button>
      </form>
      {secondaryAction}
    </div>
  );
}
```

`src/features/auth/ui/google-error/google-error.ts`

```ts
import type { AuthErrorCode } from "@/features/auth/application/errors/auth-errors/auth-errors.types";

/**
 * Map Better Auth's `?error=` after a failed Google sign-in to a message code. Only a cancelled
 * consent is told apart; everything else is the generic Google failure (AC-AUTH-028/029).
 * @param error - the `error` query parameter, if any
 * @returns `GOOGLE_CANCELLED`, `GOOGLE_FAILED`, or null without an error
 */
export function googleErrorCode(error: string | undefined): AuthErrorCode | null {
  if (!error) return null;
  return error === "access_denied" ? "GOOGLE_CANCELLED" : "GOOGLE_FAILED";
}
```

`src/features/auth/ui/login-screen/login-screen.copy.ts`

```ts
// Translated from auth.pen amp4Y / IOC5i (English); Indonesian per CONFLICT-1 (2026-09-27).
export const LOGIN_SCREEN_COPY = {
  title: "Selamat datang kembali",
  lead: "Masuk untuk menjaga bisnis fotografi Anda tetap berjalan.",
  switchPrompt: "Baru di Shutrly?",
  switchLink: "Buat akun",
} as const;
```

`src/features/auth/ui/login-screen/login-screen.types.ts`

```ts
import type { AuthErrorCode } from "@/features/auth/application/errors/auth-errors/auth-errors.types";
import type { LoginOwnerInput } from "@/features/auth/application/use-cases/login-owner/login-owner.types";

import type { FormAction } from "../use-auth-form/use-auth-form.types";

export interface LoginScreenProps {
  action: FormAction<LoginOwnerInput>;
  googleAction: () => Promise<void>;
  initialError: AuthErrorCode | null;
}
```

`src/features/auth/ui/login-screen/login-screen.tsx`

```tsx
import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthPrompt } from "../auth-prompt/auth-prompt";
import { GoogleButton } from "../google-button/google-button";
import { LoginForm } from "../login-form/login-form";
import { LOGIN_SCREEN_COPY as COPY } from "./login-screen.copy";
import type { LoginScreenProps } from "./login-screen.types";

/**
 * Login (auth.pen amp4Y / IOC5i; error states q8b0R9, U9laqq, u9HFU).
 * @param props - the login and Google actions, and a Google error from the redirect
 * @returns the screen content inside `AuthSplitLayout`
 */
export function LoginScreen({ action, googleAction, initialError }: Readonly<LoginScreenProps>) {
  return (
    <>
      <AuthIntro title={COPY.title} lead={COPY.lead} />
      <LoginForm
        action={action}
        initialError={initialError}
        secondaryAction={<GoogleButton action={googleAction} />}
      />
      <AuthPrompt prompt={COPY.switchPrompt} href="/register" link={COPY.switchLink} />
    </>
  );
}
```

`src/features/auth/ui/account-unavailable-screen/account-unavailable-screen.copy.ts`

```ts
// Translated from auth.pen kXr5x / FFue5, Alert L7qHA (English); Indonesian per CONFLICT-1.
export const ACCOUNT_UNAVAILABLE_SCREEN_COPY = {
  title: "Akun tidak tersedia",
  lead: "Akun ini tidak bisa mengakses Shutrly saat ini. Hubungi dukungan jika menurut Anda ini keliru.",
  alertTitle: "Data workspace disembunyikan",
  alertBody: "Workspace dan data pribadi Anda tidak ditampilkan selama akses tidak tersedia.",
  signOut: "Keluar",
} as const;
```

`src/features/auth/ui/account-unavailable-screen/account-unavailable-screen.types.ts`

```ts
export interface AccountUnavailableScreenProps {
  signOutAction: () => Promise<void>;
}
```

`src/features/auth/ui/account-unavailable-screen/account-unavailable-screen.tsx`

```tsx
import { Alert } from "@/ui/patterns/alert/alert";
import { Button } from "@/ui/primitives/button/button";

import { AuthIntro } from "../auth-intro/auth-intro";
import { ACCOUNT_UNAVAILABLE_SCREEN_COPY as COPY } from "./account-unavailable-screen.copy";
import type { AccountUnavailableScreenProps } from "./account-unavailable-screen.types";

/**
 * Account unavailable (auth.pen kXr5x / FFue5). Static on purpose: no owner data is rendered
 * (BR-AUTH-005, AC-AUTH-013).
 * @param props - the sign-out action
 * @returns the screen content inside `AuthSplitLayout`
 */
export function AccountUnavailableScreen({
  signOutAction,
}: Readonly<AccountUnavailableScreenProps>) {
  return (
    <>
      <AuthIntro title={COPY.title} lead={COPY.lead} />
      <Alert tone="danger" title={COPY.alertTitle} body={COPY.alertBody} />
      <form action={signOutAction}>
        <Button type="submit" variant="secondary" size="lg" className="w-full">
          {COPY.signOut}
        </Button>
      </form>
    </>
  );
}
```

- [ ] **Step 4: Write the actions, pages and the Google landing route.**

`src/app/actions/auth/login.ts`

```ts
"use server";

import { redirect } from "next/navigation";

import { login, logout } from "@/composition/auth/login-flow/login-flow";
import type { AuthFailure } from "@/features/auth/application/errors/auth-errors/auth-errors.types";
import type { LoginOwnerInput } from "@/features/auth/application/use-cases/login-owner/login-owner.types";

export async function loginAction(values: LoginOwnerInput): Promise<AuthFailure | undefined> {
  const result = await login(values);
  if (result.ok) redirect(result.outcome.path);
  if (result.code === "ACCOUNT_UNAVAILABLE") redirect("/account-unavailable");
  return result;
}

export async function logoutAction(): Promise<void> {
  await logout();
  redirect("/login");
}
```

`src/app/(auth)/login/page.tsx`

```tsx
import { startGoogleAction } from "@/app/actions/auth/google";
import { loginAction } from "@/app/actions/auth/login";
import { redirectIfSignedIn } from "@/composition/auth/owner-guard/owner-guard";
import { googleErrorCode } from "@/features/auth/ui/google-error/google-error";
import { LoginScreen } from "@/features/auth/ui/login-screen/login-screen";

export default async function LoginPage({ searchParams }: Readonly<PageProps<"/login">>) {
  await redirectIfSignedIn();
  const { error } = await searchParams;
  const initialError = googleErrorCode(typeof error === "string" ? error : undefined);
  return (
    <LoginScreen
      action={loginAction}
      googleAction={startGoogleAction}
      initialError={initialError}
    />
  );
}
```

`src/app/(auth)/account-unavailable/page.tsx`

```tsx
import { logoutAction } from "@/app/actions/auth/login";
import { AccountUnavailableScreen } from "@/features/auth/ui/account-unavailable-screen/account-unavailable-screen";

// kXr5x. Static: no owner data (BR-AUTH-005).
export default function AccountUnavailablePage() {
  return <AccountUnavailableScreen signOutAction={logoutAction} />;
}
```

`src/app/(auth)/auth/continue/route.ts`

```ts
import { continueAfterGoogleResponse } from "@/composition/auth/google-flow/google-flow";

export const dynamic = "force-dynamic";

export function GET(request: Request): Promise<Response> {
  return continueAfterGoogleResponse(request);
}
```

- [ ] **Step 5: Run the gate.**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: PASS.

- [ ] **Step 6: Fidelity pass.** Compare `/login` in each of its four states (`amp4Y`, `q8b0R9`, `U9laqq`, `u9HFU`) and `/account-unavailable` (`kXr5x`) with their exports, at 1440 and 390. For the Google button, compare the Hugeicons `GoogleIcon` with the export's mark. If the design uses the multicolour Google "G", record a deviation: the brand mark needs an asset or an icon-registry change, never hex colours in a component.

- [ ] **Step 7: Commit.**

```bash
git add src/features/auth/ui src/app/actions/auth/login.ts "src/app/(auth)/login" "src/app/(auth)/account-unavailable" "src/app/(auth)/auth"
git commit -m "feat(auth): add the login and account unavailable screens"
```

## Task 29: Recovery screens

**Files:**
- `src/features/auth/ui/{forgot-password-form,reset-password-form}/*`
- `src/features/auth/ui/{forgot-password-screen,reset-sent-screen,reset-password-screen,invalid-reset-link-screen}/*`
- `src/app/actions/auth/recovery.ts`
- `src/app/(auth)/forgot-password/page.tsx`, `src/app/(auth)/reset-password/page.tsx`

- [ ] **Step 0: Exports.** Check that `forgot-password-*`, `reset-sent-*`, `reset-password-*` and `invalid-reset-link-*` exist. If one is missing, stop and ask the Owner.

- [ ] **Step 1: Write the failing test.**

`src/features/auth/ui/reset-password-form/reset-password-form.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FIELD_ERROR_COPY } from "../controlled-text-field/controlled-text-field.copy";
import { ResetPasswordForm } from "./reset-password-form";
import { RESET_PASSWORD_FORM_COPY as COPY } from "./reset-password-form.copy";

async function submit(password: string, confirm: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(COPY.password), password);
  await user.type(screen.getByLabelText(COPY.confirm), confirm);
  await user.click(screen.getByRole("button", { name: COPY.submit }));
}

describe("ResetPasswordForm (RFaNT)", () => {
  it("AC-AUTH-002 AC-AUTH-023 reports a mismatch on the confirmation", async () => {
    const action = vi.fn();
    render(<ResetPasswordForm token="t" action={action} />);
    await submit("new-horse-1", "new-horse-2");
    expect(await screen.findByText(FIELD_ERROR_COPY["password.mismatch"])).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });

  it("AC-AUTH-017 sends the link token with the new password", async () => {
    const action = vi.fn(() => Promise.resolve(undefined));
    render(<ResetPasswordForm token="tok" action={action} />);
    await submit("new-horse-1", "new-horse-1");
    expect(action).toHaveBeenCalledWith({
      token: "tok",
      password: "new-horse-1",
      confirm: "new-horse-1",
    });
  });
});
```

- [ ] **Step 2: Run it to verify it fails.**

Run: `pnpm test src/features/auth/ui/reset-password-form`
Expected: FAIL, `Cannot find module './reset-password-form'`.

- [ ] **Step 3: Write the forms and screens.**

`src/features/auth/ui/forgot-password-form/forgot-password-form.copy.ts`

```ts
// Translated from auth.pen o9WtCo (English); Indonesian per CONFLICT-1 (2026-09-27).
export const FORGOT_PASSWORD_FORM_COPY = {
  email: "Email",
  emailPlaceholder: "anda@studio.com",
  submit: "Kirim tautan atur ulang",
  submitting: "Mengirim…", // not in Pencil
} as const;
```

`src/features/auth/ui/forgot-password-form/forgot-password-form.types.ts`

```ts
import type { RequestPasswordResetInput } from "@/features/auth/application/use-cases/request-password-reset/request-password-reset.types";

import type { FormAction } from "../use-auth-form/use-auth-form.types";

export interface ForgotPasswordFormProps {
  action: FormAction<RequestPasswordResetInput>;
}
```

`src/features/auth/ui/forgot-password-form/forgot-password-form.tsx`

```tsx
"use client";

import { requestPasswordResetSchema } from "@/features/auth/application/use-cases/request-password-reset/request-password-reset.schema";
import { Button } from "@/ui/primitives/button/button";

import { AuthErrorAlert } from "../auth-error-alert/auth-error-alert";
import { ControlledTextField } from "../controlled-text-field/controlled-text-field";
import { useAuthForm } from "../use-auth-form/use-auth-form";
import { FORGOT_PASSWORD_FORM_COPY as COPY } from "./forgot-password-form.copy";
import type { ForgotPasswordFormProps } from "./forgot-password-form.types";

/**
 * The Forgot password form (auth.pen o9WtCo). Every email gets the same next screen (A-5).
 * @param props - the forgot-password server action
 * @returns the form
 */
export function ForgotPasswordForm({ action }: Readonly<ForgotPasswordFormProps>) {
  const { form, server, onSubmit, isSubmitting } = useAuthForm({
    schema: requestPasswordResetSchema,
    defaultValues: { email: "" },
    action,
  });
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-(--space-6)">
      {server.formError ? <AuthErrorAlert code={server.formError} /> : null}
      <ControlledTextField
        control={form.control}
        name="email"
        type="email"
        label={COPY.email}
        placeholder={COPY.emailPlaceholder}
        autoComplete="email"
      />
      <Button type="submit" size="lg" isDisabled={isSubmitting}>
        {isSubmitting ? COPY.submitting : COPY.submit}
      </Button>
    </form>
  );
}
```

`src/features/auth/ui/reset-password-form/reset-password-form.copy.ts`

```ts
// Translated from auth.pen RFaNT (English); Indonesian per CONFLICT-1 (2026-09-27).
export const RESET_PASSWORD_FORM_COPY = {
  password: "Kata sandi baru",
  passwordPlaceholder: "Masukkan kata sandi baru",
  confirm: "Konfirmasi kata sandi baru",
  confirmPlaceholder: "Masukkan sekali lagi",
  submit: "Simpan kata sandi baru",
  submitting: "Menyimpan…", // not in Pencil
} as const;
```

`src/features/auth/ui/reset-password-form/reset-password-form.types.ts`

```ts
import type { ResetPasswordInput } from "@/features/auth/application/use-cases/reset-password/reset-password.types";

import type { FormAction } from "../use-auth-form/use-auth-form.types";

export interface ResetPasswordFormProps {
  token: string;
  action: FormAction<ResetPasswordInput>;
}
```

`src/features/auth/ui/reset-password-form/reset-password-form.tsx`

```tsx
"use client";

import { resetPasswordSchema } from "@/features/auth/application/use-cases/reset-password/reset-password.schema";
import { Button } from "@/ui/primitives/button/button";

import { AuthErrorAlert } from "../auth-error-alert/auth-error-alert";
import { ControlledTextField } from "../controlled-text-field/controlled-text-field";
import { useAuthForm } from "../use-auth-form/use-auth-form";
import { RESET_PASSWORD_FORM_COPY as COPY } from "./reset-password-form.copy";
import type { ResetPasswordFormProps } from "./reset-password-form.types";

/**
 * The Set new password form (auth.pen RFaNT); the link token travels as a form value.
 * @param props - the reset token and the reset server action
 * @returns the form
 */
export function ResetPasswordForm({ token, action }: Readonly<ResetPasswordFormProps>) {
  const { form, server, onSubmit, isSubmitting } = useAuthForm({
    schema: resetPasswordSchema,
    defaultValues: { token, password: "", confirm: "" },
    action,
  });
  const { control } = form;
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-(--space-6)">
      {server.formError ? <AuthErrorAlert code={server.formError} /> : null}
      <div className="flex flex-col gap-(--space-4)">
        <ControlledTextField
          control={control}
          name="password"
          type="password"
          label={COPY.password}
          placeholder={COPY.passwordPlaceholder}
          autoComplete="new-password"
        />
        <ControlledTextField
          control={control}
          name="confirm"
          type="password"
          label={COPY.confirm}
          placeholder={COPY.confirmPlaceholder}
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" size="lg" isDisabled={isSubmitting}>
        {isSubmitting ? COPY.submitting : COPY.submit}
      </Button>
    </form>
  );
}
```

`src/features/auth/ui/forgot-password-screen/forgot-password-screen.copy.ts`

```ts
// Translated from auth.pen o9WtCo / e091S (English); Indonesian per CONFLICT-1 (2026-09-27).
export const FORGOT_PASSWORD_SCREEN_COPY = {
  title: "Atur ulang kata sandi",
  lead: "Masukkan email Anda. Kami akan mengirim tautan atur ulang jika akun itu memakai kata sandi.",
  switchPrompt: "Ingat kata sandi Anda?",
  back: "Kembali ke halaman masuk",
} as const;
```

`src/features/auth/ui/forgot-password-screen/forgot-password-screen.types.ts`

```ts
import type { RequestPasswordResetInput } from "@/features/auth/application/use-cases/request-password-reset/request-password-reset.types";

import type { FormAction } from "../use-auth-form/use-auth-form.types";

export interface ForgotPasswordScreenProps {
  action: FormAction<RequestPasswordResetInput>;
}
```

`src/features/auth/ui/forgot-password-screen/forgot-password-screen.tsx`

```tsx
import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthPrompt } from "../auth-prompt/auth-prompt";
import { ForgotPasswordForm } from "../forgot-password-form/forgot-password-form";
import { FORGOT_PASSWORD_SCREEN_COPY as COPY } from "./forgot-password-screen.copy";
import type { ForgotPasswordScreenProps } from "./forgot-password-screen.types";

/**
 * Forgot password (auth.pen o9WtCo / e091S).
 * @param props - the forgot-password action
 * @returns the screen content inside `AuthSplitLayout`
 */
export function ForgotPasswordScreen({ action }: Readonly<ForgotPasswordScreenProps>) {
  return (
    <>
      <AuthIntro title={COPY.title} lead={COPY.lead} />
      <ForgotPasswordForm action={action} />
      <AuthPrompt prompt={COPY.switchPrompt} href="/login" link={COPY.back} />
    </>
  );
}
```

`src/features/auth/ui/reset-sent-screen/reset-sent-screen.copy.ts`

```ts
// Translated from auth.pen DccPx / NkvJG, Alert pxkZH (English); Indonesian per CONFLICT-1.
export const RESET_SENT_SCREEN_COPY = {
  title: "Periksa kotak masuk Anda",
  lead: "Jika atur ulang kata sandi tersedia untuk alamat ini, kami akan mengirimkan tautannya.",
  alertTitle: "Tautan berlaku satu jam",
  alertBody: "Periksa folder spam jika email tidak masuk.",
  back: "Kembali ke halaman masuk",
} as const;
```

`src/features/auth/ui/reset-sent-screen/reset-sent-screen.tsx`

```tsx
import { Alert } from "@/ui/patterns/alert/alert";

import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthTextLink } from "../auth-text-link/auth-text-link";
import { RESET_SENT_SCREEN_COPY as COPY } from "./reset-sent-screen.copy";

/**
 * Reset request sent (auth.pen DccPx / NkvJG): the same confirmation for every email (A-5).
 * @returns the screen content inside `AuthSplitLayout`
 */
export function ResetSentScreen() {
  return (
    <>
      <AuthIntro title={COPY.title} lead={COPY.lead} />
      <Alert tone="info" title={COPY.alertTitle} body={COPY.alertBody} />
      <AuthTextLink href="/login">{COPY.back}</AuthTextLink>
    </>
  );
}
```

`src/features/auth/ui/reset-password-screen/reset-password-screen.copy.ts`

```ts
// Translated from auth.pen RFaNT / vHZGg (English); Indonesian per CONFLICT-1 (2026-09-27).
export const RESET_PASSWORD_SCREEN_COPY = {
  title: "Buat kata sandi baru",
  lead: "Gunakan 8–128 karakter. Setelah diatur ulang, masuk lagi di setiap perangkat.",
  switchPrompt: "Ingat kata sandi Anda?",
  back: "Kembali ke halaman masuk",
} as const;
```

`src/features/auth/ui/reset-password-screen/reset-password-screen.types.ts`

```ts
import type { ResetPasswordFormProps } from "../reset-password-form/reset-password-form.types";

export type ResetPasswordScreenProps = ResetPasswordFormProps;
```

`src/features/auth/ui/reset-password-screen/reset-password-screen.tsx`

```tsx
import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthPrompt } from "../auth-prompt/auth-prompt";
import { ResetPasswordForm } from "../reset-password-form/reset-password-form";
import { RESET_PASSWORD_SCREEN_COPY as COPY } from "./reset-password-screen.copy";
import type { ResetPasswordScreenProps } from "./reset-password-screen.types";

/**
 * Set new password (auth.pen RFaNT / vHZGg).
 * @param props - the link token and the reset action
 * @returns the screen content inside `AuthSplitLayout`
 */
export function ResetPasswordScreen({ token, action }: Readonly<ResetPasswordScreenProps>) {
  return (
    <>
      <AuthIntro title={COPY.title} lead={COPY.lead} />
      <ResetPasswordForm token={token} action={action} />
      <AuthPrompt prompt={COPY.switchPrompt} href="/login" link={COPY.back} />
    </>
  );
}
```

`src/features/auth/ui/invalid-reset-link-screen/invalid-reset-link-screen.copy.ts`

```ts
// Translated from auth.pen x5ds7 / Hf3VK, Alert yQnyb (English); Indonesian per CONFLICT-1.
export const INVALID_RESET_LINK_SCREEN_COPY = {
  title: "Tautan atur ulang kedaluwarsa",
  lead: "Minta tautan atur ulang kata sandi yang baru untuk melanjutkan dengan aman.",
  alertTitle: "Tautan hanya bisa dipakai sekali",
  alertBody: "Demi keamanan, setiap tautan verifikasi dan atur ulang hanya bisa dipakai satu kali.",
  action: "Minta tautan atur ulang",
  back: "Kembali ke halaman masuk",
} as const;
```

`src/features/auth/ui/invalid-reset-link-screen/invalid-reset-link-screen.tsx`

```tsx
import { Alert } from "@/ui/patterns/alert/alert";

import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthTextLink } from "../auth-text-link/auth-text-link";
import { INVALID_RESET_LINK_SCREEN_COPY as COPY } from "./invalid-reset-link-screen.copy";

/**
 * Invalid reset link (auth.pen x5ds7 / Hf3VK): expired, used or superseded (AC-AUTH-018).
 * @returns the screen content inside `AuthSplitLayout`
 */
export function InvalidResetLinkScreen() {
  return (
    <>
      <AuthIntro title={COPY.title} lead={COPY.lead} />
      <Alert tone="danger" title={COPY.alertTitle} body={COPY.alertBody} />
      <AuthTextLink href="/forgot-password">{COPY.action}</AuthTextLink>
      <AuthTextLink href="/login">{COPY.back}</AuthTextLink>
    </>
  );
}
```

- [ ] **Step 4: Write the actions and pages.** The reset page checks the link when it opens, so a used or superseded link shows `x5ds7` straight away (AC-AUTH-018, "opened").

`src/app/actions/auth/recovery.ts`

```ts
"use server";

import { redirect } from "next/navigation";

import { requestReset, resetWithLink } from "@/composition/auth/recovery-flow/recovery-flow";
import type { AuthFailure } from "@/features/auth/application/errors/auth-errors/auth-errors.types";
import type { RequestPasswordResetInput } from "@/features/auth/application/use-cases/request-password-reset/request-password-reset.types";
import type { ResetPasswordInput } from "@/features/auth/application/use-cases/reset-password/reset-password.types";

export async function forgotPasswordAction(
  values: RequestPasswordResetInput,
): Promise<AuthFailure | undefined> {
  const result = await requestReset(values);
  if (result.ok) redirect("/forgot-password?state=sent");
  return result;
}

export async function resetPasswordAction(
  values: ResetPasswordInput,
): Promise<AuthFailure | undefined> {
  const result = await resetWithLink(values);
  if (result.ok) redirect("/login");
  if (result.code === "INVALID_LINK") redirect("/reset-password?state=invalid");
  return result;
}
```

`src/app/(auth)/forgot-password/page.tsx`

```tsx
import { forgotPasswordAction } from "@/app/actions/auth/recovery";
import { redirectIfSignedIn } from "@/composition/auth/owner-guard/owner-guard";
import { ForgotPasswordScreen } from "@/features/auth/ui/forgot-password-screen/forgot-password-screen";
import { ResetSentScreen } from "@/features/auth/ui/reset-sent-screen/reset-sent-screen";

// o9WtCo (entry) and DccPx (?state=sent).
export default async function ForgotPasswordPage({
  searchParams,
}: Readonly<PageProps<"/forgot-password">>) {
  await redirectIfSignedIn();
  const { state } = await searchParams;
  if (state === "sent") return <ResetSentScreen />;
  return <ForgotPasswordScreen action={forgotPasswordAction} />;
}
```

`src/app/(auth)/reset-password/page.tsx`

```tsx
import { resetPasswordAction } from "@/app/actions/auth/recovery";
import { isResetLinkUsable } from "@/composition/auth/recovery-flow/recovery-flow";
import { InvalidResetLinkScreen } from "@/features/auth/ui/invalid-reset-link-screen/invalid-reset-link-screen";
import { ResetPasswordScreen } from "@/features/auth/ui/reset-password-screen/reset-password-screen";

// RFaNT (form) and x5ds7 (invalid). Checking on open answers AC-AUTH-018 "opened".
export default async function ResetPasswordPage({
  searchParams,
}: Readonly<PageProps<"/reset-password">>) {
  const { token, state } = await searchParams;
  const linkToken = typeof token === "string" && state !== "invalid" ? token : "";
  if (!(await isResetLinkUsable(linkToken))) return <InvalidResetLinkScreen />;
  return <ResetPasswordScreen token={linkToken} action={resetPasswordAction} />;
}
```

- [ ] **Step 5: Run the gate.**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: PASS.

- [ ] **Step 6: Fidelity pass.** Compare `o9WtCo`, `DccPx`, `RFaNT` and `x5ds7` (and their mobile pairs) with their routes. Adjust `className` values only.

- [ ] **Step 7: Commit.**

```bash
git add src/features/auth/ui src/app/actions/auth/recovery.ts "src/app/(auth)/forgot-password" "src/app/(auth)/reset-password"
git commit -m "feat(auth): add the forgot password, reset and invalid reset link screens"
```

## Task 30: Profile and change password

**Files:**
- `src/features/auth/ui/{profile-form,change-password-form,account-section,account-sections}/*`
- `src/app/actions/auth/profile.ts`
- `src/app/(owner)/profile/page.tsx`

**R-6:** F-02 owns `src/app/(owner)/layout.tsx` with the App Shell (design-system C30); this page renders only its content. Until F-02 ships, the page renders without the shell, and that is expected. Do not hand-build a shell here (C-010).

- [ ] **Step 0: Exports.** Check that `profile-*` and `profile-google-*` exist. If one is missing, stop and ask the Owner.

- [ ] **Step 1: Write the failing test.**

`src/features/auth/ui/account-sections/account-sections.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CHANGE_PASSWORD_FORM_COPY } from "../change-password-form/change-password-form.copy";
import { PROFILE_FORM_COPY } from "../profile-form/profile-form.copy";
import { AccountSections } from "./account-sections";
import { ACCOUNT_SECTIONS_COPY } from "./account-sections.copy";

const base = { email: "alya@asterwedding.id", name: "Alya Pratama" };

function renderSections(hasPassword: boolean) {
  render(
    <AccountSections
      account={{ ...base, hasPassword }}
      updateName={vi.fn()}
      changePassword={vi.fn()}
    />,
  );
}

describe("AccountSections (t7CXVK / TInkk)", () => {
  it("AC-AUTH-020 shows the email read-only and the name editable", () => {
    renderSections(true);
    expect(screen.getByLabelText(PROFILE_FORM_COPY.email)).toHaveAttribute("readonly");
    expect(screen.getByLabelText(PROFILE_FORM_COPY.name)).toHaveValue("Alya Pratama");
  });

  it("AC-AUTH-019 shows the password section for password accounts", () => {
    renderSections(true);
    expect(screen.getByLabelText(CHANGE_PASSWORD_FORM_COPY.current)).toBeInTheDocument();
  });

  it("AC-AUTH-030 BR-AUTH-008 hides it for Google-only accounts", () => {
    renderSections(false);
    expect(screen.queryByLabelText(CHANGE_PASSWORD_FORM_COPY.current)).toBeNull();
    expect(screen.getByText(ACCOUNT_SECTIONS_COPY.googleOnlyTitle)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails.**

Run: `pnpm test src/features/auth/ui/account-sections`
Expected: FAIL, `Cannot find module './account-sections'`.

- [ ] **Step 3: Write the forms and sections.**

`src/features/auth/ui/profile-form/profile-form.copy.ts`

```ts
// Translated from auth.pen t7CXVK (English); Indonesian per CONFLICT-1 (2026-09-27).
export const PROFILE_FORM_COPY = {
  email: "Alamat email",
  name: "Nama tampilan",
  save: "Simpan perubahan",
  saving: "Menyimpan…", // not in Pencil
  saved: "Perubahan disimpan.", // not in Pencil
} as const;
```

`src/features/auth/ui/profile-form/profile-form.types.ts`

```ts
import type { UpdateDisplayNameInput } from "@/features/auth/application/use-cases/update-display-name/update-display-name.types";

import type { FormAction } from "../use-auth-form/use-auth-form.types";

export interface ProfileFormProps {
  email: string;
  name: string;
  action: FormAction<UpdateDisplayNameInput>;
}
```

`src/features/auth/ui/profile-form/profile-form.tsx`

```tsx
"use client";

import { useState } from "react";

import { updateDisplayNameSchema } from "@/features/auth/application/use-cases/update-display-name/update-display-name.schema";
import { Alert } from "@/ui/patterns/alert/alert";
import { Button } from "@/ui/primitives/button/button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { AuthErrorAlert } from "../auth-error-alert/auth-error-alert";
import { ControlledTextField } from "../controlled-text-field/controlled-text-field";
import { useAuthForm } from "../use-auth-form/use-auth-form";
import { PROFILE_FORM_COPY as COPY } from "./profile-form.copy";
import type { ProfileFormProps } from "./profile-form.types";

// The email is shown, never submitted (AC-AUTH-020); the read-only field ignores edits.
function ignoreEdit(): void {
  // Read-only: there is nothing to update.
}

/**
 * The Profile form (auth.pen t7CXVK): read-only email and an editable display name.
 * @param props - the owner's email and name, and the update server action
 * @returns the form
 */
export function ProfileForm({ email, name, action }: Readonly<ProfileFormProps>) {
  const [saved, setSaved] = useState(false);
  function markSaved(): void {
    setSaved(true);
  }
  const { form, server, onSubmit, isSubmitting } = useAuthForm({
    schema: updateDisplayNameSchema,
    defaultValues: { name },
    action,
    onSuccess: markSaved,
  });
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-(--space-4)">
      {server.formError ? <AuthErrorAlert code={server.formError} /> : null}
      {saved && !isSubmitting ? <Alert tone="info" title={COPY.saved} live /> : null}
      <TextField
        label={COPY.email}
        name="email"
        type="email"
        value={email}
        isReadOnly
        onChange={ignoreEdit}
        onBlur={ignoreEdit}
      />
      <ControlledTextField
        control={form.control}
        name="name"
        label={COPY.name}
        autoComplete="name"
      />
      <div>
        <Button type="submit" isDisabled={isSubmitting}>
          {isSubmitting ? COPY.saving : COPY.save}
        </Button>
      </div>
    </form>
  );
}
```

`src/features/auth/ui/change-password-form/change-password-form.copy.ts`

```ts
// Translated from auth.pen t7CXVK (English); Indonesian per CONFLICT-1 (2026-09-27).
export const CHANGE_PASSWORD_FORM_COPY = {
  current: "Kata sandi saat ini",
  currentPlaceholder: "Masukkan kata sandi saat ini",
  next: "Kata sandi baru",
  nextPlaceholder: "8–128 karakter",
  confirm: "Konfirmasi kata sandi baru",
  confirmPlaceholder: "Masukkan sekali lagi",
  submit: "Ganti kata sandi",
  submitting: "Mengganti…", // not in Pencil
  done: "Kata sandi diganti. Sesi lain sudah dikeluarkan.", // not in Pencil
} as const;
```

`src/features/auth/ui/change-password-form/change-password-form.types.ts`

```ts
import type { ChangePasswordInput } from "@/features/auth/application/use-cases/change-password/change-password.types";

import type { FormAction } from "../use-auth-form/use-auth-form.types";

export interface ChangePasswordFormProps {
  action: FormAction<ChangePasswordInput>;
}
```

`src/features/auth/ui/change-password-form/change-password-form.tsx`

```tsx
"use client";

import { useState } from "react";

import { changePasswordSchema } from "@/features/auth/application/use-cases/change-password/change-password.schema";
import { Alert } from "@/ui/patterns/alert/alert";
import { Button } from "@/ui/primitives/button/button";

import { AuthErrorAlert } from "../auth-error-alert/auth-error-alert";
import { ControlledTextField } from "../controlled-text-field/controlled-text-field";
import { useAuthForm } from "../use-auth-form/use-auth-form";
import { CHANGE_PASSWORD_FORM_COPY as COPY } from "./change-password-form.copy";
import type { ChangePasswordFormProps } from "./change-password-form.types";

const DEFAULTS = { currentPassword: "", newPassword: "", confirm: "" };

/**
 * The Change password form (auth.pen t7CXVK); other sessions are signed out (A-4).
 * @param props - the change-password server action
 * @returns the form
 */
export function ChangePasswordForm({ action }: Readonly<ChangePasswordFormProps>) {
  const [done, setDone] = useState(false);
  function afterChange(): void {
    setDone(true);
    form.reset();
  }
  const { form, server, onSubmit, isSubmitting } = useAuthForm({
    schema: changePasswordSchema,
    defaultValues: DEFAULTS,
    action,
    onSuccess: afterChange,
  });
  const { control } = form;
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-(--space-4)">
      {server.formError ? <AuthErrorAlert code={server.formError} /> : null}
      {done && !isSubmitting ? <Alert tone="info" title={COPY.done} live /> : null}
      <ControlledTextField
        control={control}
        name="currentPassword"
        type="password"
        label={COPY.current}
        placeholder={COPY.currentPlaceholder}
        autoComplete="current-password"
      />
      <ControlledTextField
        control={control}
        name="newPassword"
        type="password"
        label={COPY.next}
        placeholder={COPY.nextPlaceholder}
        autoComplete="new-password"
      />
      <ControlledTextField
        control={control}
        name="confirm"
        type="password"
        label={COPY.confirm}
        placeholder={COPY.confirmPlaceholder}
        autoComplete="new-password"
      />
      <div>
        <Button type="submit" isDisabled={isSubmitting}>
          {isSubmitting ? COPY.submitting : COPY.submit}
        </Button>
      </div>
    </form>
  );
}
```

`src/features/auth/ui/account-section/account-section.types.ts`

```ts
import type { ReactNode } from "react";

export interface AccountSectionProps {
  title: string;
  lead: string;
  children: ReactNode;
}
```

`src/features/auth/ui/account-section/account-section.tsx`

```tsx
import type { AccountSectionProps } from "./account-section.types";

/**
 * One titled section of the Profile page (auth.pen t7CXVK: Profile, Password).
 * @param props - the translated title and lead, and the section's form
 * @returns the section
 */
export function AccountSection({ title, lead, children }: Readonly<AccountSectionProps>) {
  return (
    <section className="flex flex-col gap-(--space-4) rounded-(--radius-lg) border border-(--color-semantic-border-default) bg-(--color-semantic-surface-panel) p-(--space-6)">
      <div className="flex flex-col gap-(--space-1)">
        <h2 className="text-(length:--font-size-subtitle) font-semibold text-(--color-semantic-text-primary)">
          {title}
        </h2>
        <p className="text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
          {lead}
        </p>
      </div>
      {children}
    </section>
  );
}
```

`src/features/auth/ui/account-sections/account-sections.copy.ts`

```ts
// Translated from auth.pen t7CXVK / TInkk (English); Indonesian per CONFLICT-1 (2026-09-27).
export const ACCOUNT_SECTIONS_COPY = {
  profileTitle: "Profil",
  profileLead: "Perbarui nama yang tampil di seluruh workspace Anda.",
  passwordTitle: "Kata sandi",
  passwordLead: "Ganti kata sandi Anda. Sesi lain akan dikeluarkan.",
  googleOnlyTitle: "Anda masuk dengan Google",
  googleOnlyBody: "Akun ini tidak memiliki kata sandi. Gunakan Lanjutkan dengan Google saat masuk.",
} as const;
```

`src/features/auth/ui/account-sections/account-sections.types.ts`

```ts
import type { ChangePasswordInput } from "@/features/auth/application/use-cases/change-password/change-password.types";
import type { UpdateDisplayNameInput } from "@/features/auth/application/use-cases/update-display-name/update-display-name.types";

import type { FormAction } from "../use-auth-form/use-auth-form.types";

export interface AccountView {
  email: string;
  name: string;
  hasPassword: boolean;
}

export interface AccountSectionsProps {
  account: AccountView;
  updateName: FormAction<UpdateDisplayNameInput>;
  changePassword: FormAction<ChangePasswordInput>;
}
```

`src/features/auth/ui/account-sections/account-sections.tsx`

```tsx
import { Alert } from "@/ui/patterns/alert/alert";

import { AccountSection } from "../account-section/account-section";
import { ChangePasswordForm } from "../change-password-form/change-password-form";
import { ProfileForm } from "../profile-form/profile-form";
import { ACCOUNT_SECTIONS_COPY as COPY } from "./account-sections.copy";
import type { AccountSectionsProps } from "./account-sections.types";

/**
 * The Profile page content (auth.pen t7CXVK; Google-only TInkk) in the 720 px centred column
 * (`size.content-narrow`). The password section exists only for password accounts (BR-AUTH-008).
 * @param props - the owner's view and the two server actions
 * @returns the sections
 */
export function AccountSections({
  account,
  updateName,
  changePassword,
}: Readonly<AccountSectionsProps>) {
  return (
    <div className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-6)">
      <AccountSection title={COPY.profileTitle} lead={COPY.profileLead}>
        <ProfileForm email={account.email} name={account.name} action={updateName} />
      </AccountSection>
      {account.hasPassword ? (
        <AccountSection title={COPY.passwordTitle} lead={COPY.passwordLead}>
          <ChangePasswordForm action={changePassword} />
        </AccountSection>
      ) : (
        <Alert tone="info" title={COPY.googleOnlyTitle} body={COPY.googleOnlyBody} />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Write the actions and page.**

`src/app/actions/auth/profile.ts`

```ts
"use server";

import { changeOwnPassword, updateProfileName } from "@/composition/auth/profile-flow/profile-flow";
import type { AuthFailure } from "@/features/auth/application/errors/auth-errors/auth-errors.types";
import type { ChangePasswordInput } from "@/features/auth/application/use-cases/change-password/change-password.types";
import type { UpdateDisplayNameInput } from "@/features/auth/application/use-cases/update-display-name/update-display-name.types";

export async function updateDisplayNameAction(
  values: UpdateDisplayNameInput,
): Promise<AuthFailure | undefined> {
  const result = await updateProfileName(values);
  return result.ok ? undefined : result;
}

export async function changePasswordAction(
  values: ChangePasswordInput,
): Promise<AuthFailure | undefined> {
  const result = await changeOwnPassword(values);
  return result.ok ? undefined : result;
}
```

`src/app/(owner)/profile/page.tsx`

```tsx
import { changePasswordAction, updateDisplayNameAction } from "@/app/actions/auth/profile";
import { loadProfile } from "@/composition/auth/profile-flow/profile-flow";
import { AccountSections } from "@/features/auth/ui/account-sections/account-sections";

// t7CXVK / TInkk. The (owner) layout from F-02 supplies the App Shell (R-6).
export default async function ProfilePage() {
  const account = await loadProfile();
  return (
    <AccountSections
      account={account}
      updateName={updateDisplayNameAction}
      changePassword={changePasswordAction}
    />
  );
}
```

- [ ] **Step 5: Run the gate.**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
Expected: PASS.

- [ ] **Step 6: Fidelity pass.** Compare `/profile` for a password account (`t7CXVK` / `vEZsy`) and a Google-only account (`TInkk` / `Vygzt`) with their exports. The section frame (radius, border, padding) and the Google-only note (an Info Alert here) must match the export. Adjust them, and record any change.

- [ ] **Step 7: Commit.**

```bash
git add src/features/auth/ui src/app/actions/auth/profile.ts "src/app/(owner)"
git commit -m "feat(auth): add the profile and change password screen"
```

---

# Iteration 8 — Journey verification

## Task 31: E2E journeys, accessibility and design fidelity

**Files:** `tests/e2e/auth/{auth-e2e.ts,auth-password.spec.ts,auth-recovery.spec.ts,auth-profile.spec.ts,auth-a11y.spec.ts,auth-fidelity.spec.ts}`

Precondition: `.dev.vars` has `E2E_EMAIL_CAPTURE=1` (Task 0). Playwright's `webServer` runs `pnpm dev`, which reads `.dev.vars`, so auth emails stay in memory and the specs read their links from `/api/test/auth-emails`. That route answers 404 unless the flag is set **and** `BETTER_AUTH_URL` is localhost.

`auth-fidelity.spec.ts` renders each HTML export, stores its screenshot as the baseline, and compares the route with it (`maxDiffPixelRatio: 0.01`). A missing export fails the test on purpose.

- [ ] **Step 1: Write the specs.**

`tests/e2e/auth/auth-e2e.ts`

```ts
import { expect, type Page } from "@playwright/test";

import { REGISTER_FORM_COPY } from "@/features/auth/ui/register-form/register-form.copy";

export const PASSWORD = "correct-horse";

export const uniqueEmail = (tag = "e2e") => `${tag}+${crypto.randomUUID()}@test.shutrly.dev`;

interface CapturedLink {
  kind: string;
  url: string;
}

/** The newest captured link of a kind for a recipient (E2E_EMAIL_CAPTURE=1 in .dev.vars). */
export async function lastLink(page: Page, to: string, kind: string): Promise<string> {
  let url: string | undefined;
  await expect
    .poll(async () => {
      const response = await page.request.get(`/api/test/auth-emails?to=${encodeURIComponent(to)}`);
      const links = (await response.json()) as CapturedLink[];
      url = links.filter((link) => link.kind === kind).at(-1)?.url;
      return url;
    })
    .toBeTruthy();
  return url ?? "";
}

export async function register(page: Page, email: string): Promise<void> {
  await page.goto("/register");
  await page.getByLabel(REGISTER_FORM_COPY.name).fill("Alya Pratama");
  await page.getByLabel(REGISTER_FORM_COPY.email).fill(email);
  await page.getByLabel(REGISTER_FORM_COPY.password).fill(PASSWORD);
  await page.getByRole("button", { name: REGISTER_FORM_COPY.submit }).click();
  await expect(page).toHaveURL(/\/verify$/);
}

export async function registerAndVerify(page: Page, email: string): Promise<void> {
  await register(page, email);
  await page.goto(await lastLink(page, email, "VERIFY_EMAIL"));
  await expect(page).toHaveURL(/\/onboarding\/workspace$/);
}
```

`tests/e2e/auth/auth-password.spec.ts`

```ts
import { expect, test } from "@playwright/test";

import { AUTH_ERROR_COPY } from "@/features/auth/ui/auth-error-alert/auth-error-alert.copy";
import { INVALID_VERIFY_LINK_SCREEN_COPY } from "@/features/auth/ui/invalid-verify-link-screen/invalid-verify-link-screen.copy";
import { LOGIN_FORM_COPY } from "@/features/auth/ui/login-form/login-form.copy";
import { VERIFY_PENDING_SCREEN_COPY } from "@/features/auth/ui/verify-pending-screen/verify-pending-screen.copy";

import { lastLink, PASSWORD, register, registerAndVerify, uniqueEmail } from "./auth-e2e";

test("J-01 AC-AUTH-001 AC-AUTH-004 register → verify → first-workspace hand-off", async ({
  page,
}) => {
  const email = uniqueEmail();
  await register(page, email);
  await expect(page.getByRole("heading", { name: VERIFY_PENDING_SCREEN_COPY.title })).toBeVisible();
  await page.goto(await lastLink(page, email, "VERIFY_EMAIL"));
  await expect(page).toHaveURL(/\/onboarding\/workspace$/);
});

test("AC-AUTH-005 a used verification link shows the invalid-link screen", async ({ page }) => {
  const email = uniqueEmail();
  await register(page, email);
  const link = await lastLink(page, email, "VERIFY_EMAIL");
  await page.goto(link);
  await page.context().clearCookies();
  await page.goto(link);
  const heading = page.getByRole("heading", { name: INVALID_VERIFY_LINK_SCREEN_COPY.title });
  await expect(heading).toBeVisible();
});

test("AC-AUTH-008 AC-AUTH-011 login errors, then a signed-in owner skips /login", async ({
  page,
}) => {
  const email = uniqueEmail();
  await registerAndVerify(page, email);
  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel(LOGIN_FORM_COPY.email).fill(email);
  await page.getByLabel(LOGIN_FORM_COPY.password).fill("wrong-horse");
  await page.getByRole("button", { name: LOGIN_FORM_COPY.submit }).click();
  await expect(page.getByRole("alert")).toHaveText(AUTH_ERROR_COPY.INVALID_CREDENTIALS);
  await expect(page.getByRole("alert")).toBeFocused();
  await page.getByLabel(LOGIN_FORM_COPY.password).fill(PASSWORD);
  await page.getByRole("button", { name: LOGIN_FORM_COPY.submit }).click();
  await expect(page).toHaveURL(/\/onboarding\/workspace$/);
  await page.goto("/login");
  await expect(page).toHaveURL(/\/onboarding\/workspace$/);
});

test("AC-AUTH-009 an unverified session is confined to verification", async ({ page }) => {
  await register(page, uniqueEmail());
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/(verify|login)$/);
});

test("AC-AUTH-029 a cancelled Google sign-in explains itself on login", async ({ page }) => {
  await page.goto("/login?error=access_denied");
  await expect(page.getByRole("alert")).toHaveText(AUTH_ERROR_COPY.GOOGLE_CANCELLED);
});
```

`tests/e2e/auth/auth-recovery.spec.ts`

```ts
import { expect, test } from "@playwright/test";

import { FORGOT_PASSWORD_FORM_COPY } from "@/features/auth/ui/forgot-password-form/forgot-password-form.copy";
import { INVALID_RESET_LINK_SCREEN_COPY } from "@/features/auth/ui/invalid-reset-link-screen/invalid-reset-link-screen.copy";
import { LOGIN_FORM_COPY } from "@/features/auth/ui/login-form/login-form.copy";
import { RESET_PASSWORD_FORM_COPY } from "@/features/auth/ui/reset-password-form/reset-password-form.copy";
import { RESET_SENT_SCREEN_COPY } from "@/features/auth/ui/reset-sent-screen/reset-sent-screen.copy";

import { lastLink, registerAndVerify, uniqueEmail } from "./auth-e2e";

const NEW_PASSWORD = "new-horse-1";

test("AC-AUTH-016 AC-AUTH-017 forgot → reset → sign in with the new password", async ({ page }) => {
  const email = uniqueEmail();
  await registerAndVerify(page, email);
  await page.context().clearCookies();
  await page.goto("/forgot-password");
  await page.getByLabel(FORGOT_PASSWORD_FORM_COPY.email).fill(email);
  await page.getByRole("button", { name: FORGOT_PASSWORD_FORM_COPY.submit }).click();
  await expect(page.getByRole("heading", { name: RESET_SENT_SCREEN_COPY.title })).toBeVisible();

  const link = await lastLink(page, email, "RESET_PASSWORD");
  await page.goto(link);
  await page.getByLabel(RESET_PASSWORD_FORM_COPY.password).fill(NEW_PASSWORD);
  await page.getByLabel(RESET_PASSWORD_FORM_COPY.confirm).fill(NEW_PASSWORD);
  await page.getByRole("button", { name: RESET_PASSWORD_FORM_COPY.submit }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto(link);
  const expired = page.getByRole("heading", { name: INVALID_RESET_LINK_SCREEN_COPY.title });
  await expect(expired).toBeVisible();

  await page.goto("/login");
  await page.getByLabel(LOGIN_FORM_COPY.email).fill(email);
  await page.getByLabel(LOGIN_FORM_COPY.password).fill(NEW_PASSWORD);
  await page.getByRole("button", { name: LOGIN_FORM_COPY.submit }).click();
  await expect(page).toHaveURL(/\/onboarding\/workspace$/);
});

test("AC-AUTH-016 an unknown email sees the same confirmation", async ({ page }) => {
  await page.goto("/forgot-password");
  await page.getByLabel(FORGOT_PASSWORD_FORM_COPY.email).fill(uniqueEmail("nobody"));
  await page.getByRole("button", { name: FORGOT_PASSWORD_FORM_COPY.submit }).click();
  await expect(page.getByRole("heading", { name: RESET_SENT_SCREEN_COPY.title })).toBeVisible();
});
```

`tests/e2e/auth/auth-profile.spec.ts`

```ts
import { expect, test } from "@playwright/test";

import { CHANGE_PASSWORD_FORM_COPY } from "@/features/auth/ui/change-password-form/change-password-form.copy";
import { FIELD_ERROR_COPY } from "@/features/auth/ui/controlled-text-field/controlled-text-field.copy";
import { PROFILE_FORM_COPY } from "@/features/auth/ui/profile-form/profile-form.copy";

import { PASSWORD, registerAndVerify, uniqueEmail } from "./auth-e2e";

test("AC-AUTH-019 AC-AUTH-020 update the name and change the password", async ({ page }) => {
  const email = uniqueEmail();
  await registerAndVerify(page, email);
  await page.goto("/profile");
  await expect(page.getByLabel(PROFILE_FORM_COPY.email)).toHaveValue(email);

  await page.getByLabel(PROFILE_FORM_COPY.name).fill("Alya P.");
  await page.getByRole("button", { name: PROFILE_FORM_COPY.save }).click();
  await expect(page.getByRole("status")).toHaveText(PROFILE_FORM_COPY.saved);

  const copy = CHANGE_PASSWORD_FORM_COPY;
  await page.getByLabel(copy.current).fill("wrong-horse");
  await page.getByLabel(copy.next).fill("new-horse-1");
  await page.getByLabel(copy.confirm).fill("new-horse-1");
  await page.getByRole("button", { name: copy.submit }).click();
  await expect(page.getByText(FIELD_ERROR_COPY["password.wrongCurrent"])).toBeVisible();

  await page.getByLabel(copy.current).fill(PASSWORD);
  await page.getByRole("button", { name: copy.submit }).click();
  await expect(page.getByRole("status")).toHaveText(copy.done);
});
```

`tests/e2e/auth/auth-a11y.spec.ts`

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const SCREENS = [
  "/login",
  "/register",
  "/forgot-password",
  "/forgot-password?state=sent",
  "/reset-password",
  "/account-unavailable",
];
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];

for (const viewport of VIEWPORTS) {
  for (const path of SCREENS) {
    test(`AC-AUTH-023 C-008 ${path} has no WCAG 2.1 AA violations at ${String(viewport.width)} px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto(path);
      const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
      const results = await new AxeBuilder({ page }).withTags(tags).analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test("AC-AUTH-023 the email field is reachable by keyboard with a visible focus (u9HFU)", async ({
  page,
}) => {
  await page.goto("/login");
  const email = page.locator('input[type="email"]');
  for (let press = 0; press < 10; press++) {
    if (await email.evaluate((element) => element === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(email).toBeFocused();
  const ring = await email.evaluate((element) => getComputedStyle(element).boxShadow);
  expect(ring).not.toBe("none");
});
```

`tests/e2e/auth/auth-fidelity.spec.ts`

```ts
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";

// Pixel fidelity against the Owner's HTML exports of auth.pen (docs/features/auth/exports/).
// The export is rendered first and stored as this test's baseline; the app route must match it.
const EXPORTS = "docs/features/auth/exports";
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const PAIRS = [
  { route: "/login", desktop: "login-amp4Y", mobile: "login-IOC5i" },
  { route: "/register", desktop: "register-m3QGM", mobile: "register-UryLp" },
  { route: "/forgot-password", desktop: "forgot-password-o9WtCo", mobile: "forgot-password-e091S" },
  { route: "/forgot-password?state=sent", desktop: "reset-sent-DccPx", mobile: "reset-sent-NkvJG" },
  {
    route: "/reset-password",
    desktop: "invalid-reset-link-x5ds7",
    mobile: "invalid-reset-link-Hf3VK",
  },
  {
    route: "/account-unavailable",
    desktop: "account-unavailable-kXr5x",
    mobile: "account-unavailable-FFue5",
  },
] as const;

for (const pair of PAIRS) {
  for (const [viewport, name] of [
    [DESKTOP, pair.desktop],
    [MOBILE, pair.mobile],
  ] as const) {
    test(`design fidelity ${name} matches ${pair.route}`, async ({ page }, testInfo) => {
      const file = resolve(EXPORTS, `${name}.html`);
      // A missing export blocks the iteration: ask the Owner to export the frame (plan › exports).
      expect(existsSync(file), `${name}.html is missing from ${EXPORTS}`).toBe(true);
      await page.setViewportSize(viewport);
      await page.goto(pathToFileURL(file).href);
      const snapshot = `${name}.png`;
      await page.screenshot({ path: testInfo.snapshotPath(snapshot), fullPage: true });
      await page.goto(pair.route);
      await expect(page).toHaveScreenshot(snapshot, { fullPage: true, maxDiffPixelRatio: 0.01 });
    });
  }
}
```

- [ ] **Step 2: Run the suite.**

Run: `pnpm e2e tests/e2e/auth`
Expected: all specs PASS.
- For an axe violation, fix the component, not the test, and put the rule ID in the commit message.
- For a fidelity failure, open the diff under `test-results/` and fix the `className` values. If the difference is a font-rendering artefact that you cannot fix in code, **ask the Owner** before loosening `maxDiffPixelRatio`, and record the decision.

- [ ] **Step 3: Commit.**

```bash
git add tests/e2e/auth
git commit -m "test(auth): add J-01 journeys, accessibility and design fidelity checks"
```

## Task 32: Verification, deviations and documentation

**Files:** `docs/features/auth/technical-design.md`, `docs/features/auth/design.md`, `docs/product/feature-map.md`, `docs/HANDOFF.md`

- [ ] **Step 1: Run the full quality gate.**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:integration && pnpm e2e && pnpm build`
Expected: all pass.

- [ ] **Step 2: Check that every acceptance criterion has a test.**

```bash
for n in $(seq 1 31); do id=$(printf "AC-AUTH-%03d" "$n"); grep -rqs "$id" src tests || echo "NO TEST: $id"; done
```

Expected: no output. A `NO TEST` line blocks release (C-009).

- [ ] **Step 3: Audit logging (AC-AUTH-021, C-103).**

```bash
grep -rnE "console\.|logger\.(info|warn|error)" src/features/auth src/adapters/auth src/adapters/email src/composition/auth "src/app/(auth)" src/app/actions/auth | grep -v "logging/auth-log/auth-log.ts"
```

Expected: no output. The only logger call in auth code is inside `authLog`.

- [ ] **Step 4: Check the Google scopes on a real client (AC-AUTH-025).** On the fixed non-production environment, which has the real OAuth client (not previews, per ADR-012), click "Lanjutkan dengan Google". In the network panel, the `accounts.google.com` request's `scope` must be exactly `openid email profile`. Sign in with a real Google account and confirm you land on the F-02 destination.

- [ ] **Step 5: Record the deviations** in technical-design.md › *Deviations*. Include at least:
  - **ADR-002 augmentation:** `auth_latest_link` adds single use and supersession on top of Better Auth's tokens (R-2).
  - Every difference recorded in a fidelity pass (Tasks 25, 27–30).
  - R-2, R-3 and R-4 marked resolved, with the measured numbers.

- [ ] **Step 6: Update design.md › Review items.** Add *"Confirm copy not drawn in Pencil"*, listing every `// not in Pencil` string from `src/features/auth/ui/**/*.copy.ts` and `auth-email-templates.copy.ts`.

- [ ] **Step 7: Update the status.** Set feature-map.md F-01 to IN PROGRESS, and write in HANDOFF.md that F-01 is implemented and the next step is `/sdv:verify-feature auth`.

- [ ] **Step 8: Commit.**

```bash
git add docs
git commit -m "docs(auth): record implementation deviations and review items"
```

**Done check:** every command in Step 1 passes, Steps 2–3 print nothing, and the deviations are recorded. The feature is ready for `/sdv:verify-feature auth`.

---

## Self-review

- **AC coverage.** Unit tests are marked (u), integration (i), E2E (e).

| AC | Where |
|---|---|
| 001–003 | register-owner (u), auth-flows (i), better-auth-contract (i), auth-password (e) |
| 004–006 | verify-email, resend-verification, pending-email (u); identity-adapter (i); auth-password (e) |
| 007–010 | login-owner, continue-after-sign-in, owner-access, auth-rate-limits (u); auth-flows (i); auth-password (e) |
| 011 | proxy (u), redirectIfSignedIn in owner-guard, auth-password (e) |
| 012 | logout-owner (u), session-cookies (u) |
| 013–014 | continue-after-sign-in, owner-access, login-owner (u); auth-flows (i) |
| 015 | set-owner-status (u), db-adapters (i), operator script |
| 016–018 | request-password-reset, reset-password (u); db-adapters, identity-adapter, auth-flows (i); auth-recovery (e) |
| 019–020 | change-password, update-display-name, account-sections (u); auth-flows (i); auth-profile (e) |
| 021 | auth-log, link-outbox, email-delivery-error, resend sender (u); logging audit (Task 32) |
| 022 | register-owner, resend-verification, resend control (u) |
| 023 | every form and screen test (u), auth-a11y (e) |
| 024–029, 031 | google-guard, google-error, start-google-sign-in (u); google-sign-in (i); auth-password (e, cancel) |
| 030 | login-owner, request-password-reset, account-sections (u) |

- **Coding rules v2.0.** The lint config enforces every rule marked (lint). Beyond that:
  - every unit has its own folder;
  - `app/` reaches behaviour only through `composition/auth/*`;
  - no adapter imports another adapter;
  - copy lives in `*.copy.ts`, in Indonesian;
  - the only `as` is the justified one in `use-server-failure.ts`;
  - rule values are named constants (`AUTH_RATE_RULES`, `AUTH_TTL`, `PASSWORD_*`, `PENDING_EMAIL_TTL_SECONDS`, `COOLDOWN_SECONDS`).
- **Decisions:** all answered on 2026-09-27. Task 0 re-checks the records, and Task 25 checks that the approved tokens exist.
- **Not verified here:** the integration and E2E suites, which need the migrated database and the exports, and the R-3 CPU measurement.
