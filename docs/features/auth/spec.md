# Feature: Auth & Account

ID: F-01 · Slug: `auth`
Status: MODELED (2026-09-26)
Journey: [J-01 Owner onboarding](../../product/user-journeys.md) · Paired with: F-02 `workspace`

## Goal
An Owner can create an account with email + password or Google, prove ownership of their email, sign in and out safely, recover access, and manage their own name and password. The session and user status gate every owner feature.

## User Story
As a photographer (Owner), I want a secure account that only I can access, so that my workspaces, clients, and invoices stay private to me.

## Preconditions
- F-00 foundation: Better Auth wired to Neon via Drizzle (ADR-001, ADR-002, ADR-009), error model, rate limiting available.
- Resend configured with a verified sending domain (ADR-011).
- Google OAuth client (identity scopes only) configured per environment (ADR-012).
- Actor is an Owner; clients and freelancers never reach these screens (BR-AUTH-001).

## Inputs
| Screen | Fields |
|---|---|
| Register | name, email, password · or "Continue with Google" |
| Login | email, password · or "Continue with Google" |
| Verification pending | — (resend action) |
| Forgot password | email |
| Reset password | new password (+ confirm) — reached via emailed link |
| Profile | display name |
| Change password | current password, new password (+ confirm) — only for accounts that have a password |

Email is trimmed and compared case-insensitively. Password rules: see A-1.

## Main Flow — new Owner
1. Owner submits Register with name, email, password.
2. System creates the single user identity (BR-AUTH-002) with `status = ACTIVE`, unverified, and sends a verification link by email.
3. Owner sees the **Verification pending** screen ("check your email", resend).
4. Owner opens the link. System marks the email verified (`emailVerifiedAt`) and signs the Owner in.
5. Owner has zero workspaces → redirected to first-workspace creation (BR-AUTH-004, owned by F-02).

## Main Flow — Google sign-in (new or returning)
1. Owner chooses "Continue with Google" on Register or Login and consents to `openid email profile`.
2. Google returns a verified email (BR-AUTH-006).
3. No account with that email → system creates the user as verified (`emailVerifiedAt` set), name from Google, `status = ACTIVE`, Google linked.
   Account exists → Google is linked to it (BR-AUTH-007); if it was unverified, it becomes verified, its password is removed, and all its sessions are revoked first.
4. Status check (BR-AUTH-005) → session created → hand-off to F-02 workspace resolution (zero workspaces → onboarding).

## Main Flow — returning Owner
1. Owner submits Login with email + password.
2. System checks credentials, then status (BR-AUTH-005), then verification (BR-AUTH-003).
3. Verified + active → session created → hand-off to F-02 workspace resolution (zero workspaces → onboarding; otherwise workspace dashboard/selection).

## Alternative Flows
- **Unverified login:** valid credentials but unverified → session is created but restricted: every owner route redirects to Verification pending; only resend, logout, and the verification link work (BR-AUTH-003).
- **Resend verification:** from Verification pending; invalidates previous links; cooldown A-6.
- **Forgot / reset password:** Owner submits email → always sees the same "if an account exists, we sent a link" message. Google-only accounts receive nothing (BR-AUTH-008). Link opens Reset; new password saved → **all** sessions revoked → Owner signs in again (A-4).
- **Change password:** from Profile, shown only when the account has a password (hidden for Google-only accounts, BR-AUTH-008); requires current password; on success other sessions are revoked, current session stays (A-4).
- **Update profile:** Owner edits display name; saved immediately. Email is read-only.
- **Logout:** ends the current session only.
- **Google-only Owner tries password login:** gets the same generic "email or password is incorrect" message; the login page always offers "Continue with Google".
- **Suspended / disabled Owner:** login (password or Google) or any request with an existing session shows an "account unavailable" page; no owner data is rendered (BR-AUTH-005). Status changes happen only via the operator script, which revokes sessions.
- **Register with an existing email:** same "check your email" outcome as a new registration; if that account is still unverified, a fresh verification link is sent; if verified, nothing is sent (A-5).
- **Already signed-in Owner** visiting Register/Login → redirected to their post-login destination.

## Error Cases
- Wrong email or password → one generic message "email or password is incorrect" (no hint which).
- Validation errors (empty fields, invalid email, password rule) → field-level messages; same schema re-validated on the server.
- Expired, used, or tampered verification/reset link → "link invalid or expired" with a way to request a new one.
- Google consent cancelled or denied → back to Login with "Google sign-in was cancelled"; nothing created.
- Google reports the email as unverified, or the OAuth state/callback is invalid → sign-in refused with a generic "couldn't sign in with Google" message; nothing created or linked.
- Rate limit exceeded → "too many attempts, try again later" with no account information (A-6).
- Email provider failure → account/request still recorded; user sees a retryable message on the pending/forgot screen; failure logged without the link.
- Unexpected server error → generic error state with retry (C-007).

## Business Rules
- BR-AUTH-001 — only Owners authenticate
- BR-AUTH-002 — single identity record (Better Auth `user`, ADR-002)
- BR-AUTH-003 — verified email before workspace
- BR-AUTH-004 — zero workspaces → onboarding redirect
- BR-AUTH-005 — non-active users blocked; operator-only status change revokes sessions
- BR-AUTH-006 — sign-in methods (password, Google identity-only)
- BR-AUTH-007 — automatic, safe account linking
- BR-AUTH-008 — Google-only accounts have no password
- Constitution: C-004, C-006, C-007, C-008, C-103 (never log passwords, tokens, reset/verification URLs)

## Assumptions (low-risk, reversible — confirm or change anytime)
- **A-1 Password policy:** 8–128 characters, no composition rules.
- **A-2 Session lifetime:** 7 days, sliding (refreshed on use, at most daily); no "remember me" option.
- **A-3 Link lifetime:** verification link 24 h; reset link 1 h; both single-use; newest link supersedes older ones.
- **A-4 Session revocation:** reset password revokes all sessions; change password revokes all other sessions.
- **A-5 No account enumeration:** login errors, forgot-password, and register-with-existing-email responses do not reveal whether an account exists.
- **A-6 Rate limits:** login 5 failed attempts / 15 min per email + per IP; register, forgot-password, resend-verification 3 / hour per email and 20 / hour per IP; resend button cooldown 60 s.
- **A-7 Auto sign-in after verification:** opening a valid verification link signs the Owner in.

## Dependencies
- F-00 Foundation (auth wiring, rate limiter, error model, `components/ui` form primitives).
- F-02 Workspace — owns first-workspace creation and post-login workspace resolution.
- Resend (ADR-011); Better Auth (ADR-002); Google sign-in (ADR-012); Cloudflare Workers runtime (ADR-008).

## Out of Scope
- Social providers other than Google; Google Drive scopes; magic-link login; 2FA/passkeys.
- Adding a password to a Google-only account; unlinking Google; linking Google from the profile page.
- Email change, avatar, account deletion, data export.
- Admin UI or any in-app status management (operator script only).
- Session/device list UI ("sign out other devices" beyond A-4).
- Client or freelancer login (BR-AUTH-001).

## Open Questions / SPEC GAPS
- UI and email copy language(s) — existing gap in coding rules, deferred to `/sdv:design-feature auth` (default Indonesian with English fallback).
