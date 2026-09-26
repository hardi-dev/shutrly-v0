# F-01 Auth & Account — Technical Design

Status: MODELED + PLANNED (2026-09-26)

## Scope

This design implements the behavior in [spec.md](spec.md) and [acceptance-criteria.md](acceptance-criteria.md). It covers Owner registration, email verification, password and Google sign-in, session/status enforcement, logout, password recovery/change, and display-name updates. Workspace resolution remains owned by F-02.

The design does not add client/freelancer accounts, 2FA/passkeys, magic links, email changes, account deletion, Drive OAuth, or an admin UI.

## Authority and constraints

- Better Auth is the only identity, credential, session, verification, and reset authority (ADR-002).
- The Better Auth `user` row is the single identity row; extend it with `status` and `emailVerifiedAt` as supported by Better Auth's schema extension mechanism.
- Drizzle owns schema, migrations, and application queries (ADR-001).
- Neon access uses a per-request WebSocket `Pool` closed through `ctx.waitUntil` (ADR-009).
- Resend is behind `AuthEmailSender`; URLs and secrets are never logged (ADR-011, C-103).
- Google requests only `openid email profile`; Google tokens are not persisted or used for Drive (ADR-012).
- All trust boundaries use Zod; server-side validation is authoritative.
- UI copy remains a `SPEC GAP`: default locale is Indonesian with English fallback, but final strings belong to `/sdv:design-feature auth`.

## Proposed file boundaries

```text
src/
  app/(auth)/login/page.tsx
  app/(auth)/register/page.tsx
  app/(auth)/verify/page.tsx
  app/(auth)/forgot-password/page.tsx
  app/(auth)/reset-password/page.tsx
  app/(owner)/profile/page.tsx
  app/(owner)/account-unavailable/page.tsx
  app/api/auth/[...all]/route.ts
  app/actions/auth.ts
  features/auth/
    domain/account/
      account.ts             # status and provider invariants; framework-free
      account.test.ts
      account.types.ts
    application/
      schemas/register-owner/
      schemas/login-owner/
      errors/auth-errors/
      policy/owner-access/
      ports/auth/
      ports/auth-email/
      ports/rate-limiter/
      use-cases/register-owner/
      use-cases/login-owner/
      use-cases/reset-password/
    ui/register-form/
    ui/login-form/
  adapters/auth/better-auth/
    better-auth.ts         # Better Auth instance and hooks
    better-auth.test.ts
    better-auth-schema.ts  # generated/extended schema integration
  adapters/email/auth-email-sender/
    resend-auth-email-sender.ts
    resend-auth-email-sender.test.ts
  adapters/db/
    schema/auth.ts         # Drizzle auth extensions if not generated here
    migrations/            # generated migration plus reviewed SQL
  composition/identity.ts  # wires auth ports to concrete adapters
  middleware.ts            # coarse route gate; no business-rule authority
tests/integration/auth/
tests/e2e/auth.spec.ts
```

The exact Better Auth-generated schema location must follow the installed adapter output; the migration is reviewed before application migration. Do not create a second `owner`/`user` table.

## Data model and invariants

Better Auth tables remain the source of truth:

- `user`: opaque `id`, `name`, normalized `email`, nullable `emailVerifiedAt`, and `status` (`ACTIVE`, `SUSPENDED`, `DISABLED`).
- `account`: password credential and Google provider linkage. Google-only users have no password account.
- `session`: Better Auth session records with seven-day sliding lifetime.
- verification/reset records: single-use tokens, newest token supersedes older tokens; verification lifetime 24 hours, reset lifetime one hour.

Required database/application invariants:

1. Email lookup is normalized case-insensitively and creates at most one identity.
2. `SUSPENDED` and `DISABLED` users cannot receive owner data, even if a session remains technically valid.
3. A request can reach workspace resolution only after active status and verified email checks.
4. Google linking to an unverified local account is one transaction/hook flow: verify email, remove the password account, revoke prior sessions, then create the Google session.
5. Reset password revokes every session. Change password revokes every other session and preserves the current session.
6. Rate-limit keys are scoped to operation + normalized email and operation + client IP; responses never disclose account existence.

## Application interfaces

```ts
export type AuthStatus = "ACTIVE" | "SUSPENDED" | "DISABLED";

export interface AuthEmailSender {
  sendVerification(input: { to: string; name: string; url: string }): Promise<void>;
  sendPasswordReset(input: { to: string; name: string; url: string }): Promise<void>;
}

export interface RateLimiter {
  check(input: {
    operation: "login" | "register" | "forgotPassword" | "resendVerification";
    email?: string;
    ip: string;
  }): Promise<{ allowed: boolean; retryAfterSeconds?: number }>;
}

export interface AuthPolicy {
  requireOwner(input: Request): Promise<{
    userId: string;
    status: AuthStatus;
    emailVerified: boolean;
  }>;
  postLoginDestination(userId: string): Promise<"/onboarding/workspace" | "/workspace">;
}
```

Use cases exposed to App Router actions/handlers:

- `registerOwner(input, requestContext)` — validate, rate-limit, call Better Auth, send verification, return a generic pending result.
- `resendVerification(sessionOrEmail, requestContext)` — invalidate older links through Better Auth, rate-limit, send newest link.
- `loginOwner(input, requestContext)` — validate, rate-limit, authenticate, enforce status/verification, return destination or typed restricted outcome.
- `logoutOwner(request)` — revoke only the current session.
- `requestPasswordReset(email, requestContext)` — always return the same confirmation result; send only for password-backed accounts.
- `resetPassword(token, input)` — validate token/new password, update credential, revoke all sessions.
- `changePassword(userId, currentPassword, newPassword)` — validate current credential, update, revoke other sessions.
- `updateDisplayName(userId, name)` — validate non-empty name and update the single Better Auth user row.
- `startGoogleSignIn(returnTo)` / `completeGoogleSignIn(callback)` — provider flow, verified-email guard, safe linking hook, status check, destination.

Expected errors are typed internally (`InvalidCredentials`, `RateLimited`, `EmailUnverified`, `AccountUnavailable`, `InvalidLink`, `ProviderRejected`, `EmailDeliveryFailed`, `ValidationFailed`) and mapped at the App boundary to stable UI outcomes. Error objects must not contain passwords, tokens, URLs, cookies, OAuth codes, or provider access tokens.

## Request and route behavior

- Better Auth's catch-all route handles provider callbacks and its protocol endpoints.
- Server actions handle registration, login, resend, forgot/reset, logout, profile, and password change.
- `middleware.ts` may redirect obvious unauthenticated/auth-page cases, but every owner page, server action, and route handler calls `requireOwner`; middleware is never the only authorization layer.
- Auth pages redirect already-signed-in Owners to the destination returned by `postLoginDestination`.
- Unverified sessions redirect to `/verify` for every owner request; only resend, logout, and verification-link handling are allowed.
- Non-active sessions redirect to `/account-unavailable` without rendering owner data.
- Successful verification and Google sign-in call F-02's destination resolver; they do not create a workspace themselves.

## Rate limiting and privacy

The implementation uses the project rate-limiter port so local/unit tests can use an in-memory fake and production can use the Cloudflare-backed adapter. Enforce:

- Login: five failed attempts per 15 minutes by normalized email and by IP.
- Register, forgot password, resend verification: three per hour by normalized email and 20 per hour by IP.
- Resend UI cooldown: 60 seconds; server rate limit remains authoritative.

All enumeration-sensitive operations use the same response shape and comparable control flow for existing and missing accounts. Logs contain operation name, outcome category, and safe correlation data only; never record link URLs or raw provider payloads.

## Email behavior

`AuthEmailSender` receives a fully constructed URL only inside the call boundary. The Resend adapter sends verification/reset templates and redacts the URL from errors and logs. Provider failure does not roll back a created account/request; the action returns a retryable pending/confirmation outcome.

## Testing strategy

- Domain/unit: status gates, normalized email, password policy, destination decisions, generic error mapping, rate-limit decisions.
- Adapter/integration against shared non-production Neon: Better Auth schema, registration uniqueness, token expiry/supersession, session revocation, Google linking transaction, and operator status script.
- E2E with mocked email/provider boundaries: registration → verification → onboarding hand-off, password login/logout, forgot/reset, profile/change password, Google success/rejection, unavailable account, and keyboard/error focus behavior.
- Security assertions: no secret values appear in structured logs; Google authorization URL contains exactly `openid email profile`; Google access tokens are not stored.

## Build order and dependency gates

1. F-00 foundation: scaffold, environment/secrets, Drizzle/Neon pool, Better Auth adapter, Resend port, rate limiter, error model, UI primitives, and test harness.
2. Auth flow diagrams are modeled in `diagrams/activity.md`, `diagrams/sequence.md`, and `diagrams/state.md`; approve Pencil auth screens/states next.
3. Implement identity schema/config and core email/password flow.
4. Add request policy gates, status operator script, and workspace destination port.
5. Add recovery/profile flows.
6. Add Google provider and safe linking hook.
7. Run cross-artifact verification and E2E smoke tests.

## Open gaps / deviations

- `SPEC GAP`: final Indonesian/English UI and email copy is deferred to design.
- `SPEC GAP`: F-02 destination resolver contract must be finalized before wiring redirects; this design uses the two literal outcomes above as the smallest interim port.
- No implementation files exist yet, so paths above are planned boundaries rather than existing files.
