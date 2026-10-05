# Acceptance Criteria — Auth & Account (F-01)

> Localization amendment (Owner 2026-10-06): [product policy](../../product/localization.md), BR-L10N-* and [ADR-021](../../architecture/decisions/ADR-021-next-intl-bilingual-localization.md) supersede language-only instructions in this document. English is the default; EN/ID switching and complete localized copy are required. Earlier Indonesian labels/defaults remain reference examples, not an approved single-language implementation. Feature business behavior is unchanged. Update reviewed copy and approved Pencil exports before implementation; legacy data and recipient-language policies remain pending.

Assumption references (A-n) point to [spec.md](spec.md#assumptions-low-risk-reversible--confirm-or-change-anytime).

## Registration & verification

## AC-AUTH-001 — Register creates one unverified active identity
Covers: BR-AUTH-001, BR-AUTH-002

**Given** no account exists for `owner@example.com`
**When** a visitor registers with name, that email, and a valid password
**Then** exactly one user record exists with `status = ACTIVE` and no `emailVerifiedAt`, no separate domain user row is created, a verification email is sent, and the visitor sees the Verification pending screen.

## AC-AUTH-002 — Registration input is validated on the server
Covers: C-004 (A-1)

**Given** a registration request with an invalid email, empty name, or a password shorter than 8 or longer than 128 characters
**When** it reaches the server (even bypassing client validation)
**Then** no user is created and field-level errors are returned.

## AC-AUTH-003 — Register with an existing email does not reveal the account
Covers: BR-AUTH-002 (A-5)

**Given** an account already exists for the email
**When** someone registers with that email
**Then** the response is identical to a new registration, no second user is created, a fresh verification link is sent only if the existing account is unverified, and the existing password is unchanged.

## AC-AUTH-004 — Verification link verifies and signs in
Covers: BR-AUTH-003, BR-AUTH-004 (A-7)

**Given** an unverified Owner with a valid, unused verification link and zero workspaces
**When** they open the link
**Then** `emailVerifiedAt` is set, they are signed in, and they are redirected to first-workspace creation.

## AC-AUTH-005 — Invalid verification link
Covers: BR-AUTH-003 (A-3)

**Given** a verification link that is expired (> 24 h), already used, superseded by a newer link, or tampered
**When** it is opened
**Then** the email is not verified and an "invalid or expired" message offers to resend.

## AC-AUTH-006 — Resend verification
Covers: BR-AUTH-003 (A-3, A-6)

**Given** an Owner on the Verification pending screen
**When** they press resend
**Then** a new link is emailed, previous links stop working, and the button is disabled for 60 s.

## Login & session

## AC-AUTH-007 — Verified active Owner logs in
Covers: BR-AUTH-003, BR-AUTH-004, BR-AUTH-005

**Given** a verified `ACTIVE` Owner
**When** they log in with correct credentials
**Then** a session is created and they are handed to workspace resolution: zero workspaces → first-workspace creation; otherwise → workspace dashboard/selection.

## AC-AUTH-008 — Wrong credentials give one generic error
Covers: C-006 (A-5)

**Given** an unknown email, or a known email with a wrong password
**When** login is submitted
**Then** the same "email or password is incorrect" message is shown and no session is created.

## AC-AUTH-009 — Unverified Owner is confined to Verification pending
Covers: BR-AUTH-003

**Given** an unverified Owner with correct credentials
**When** they log in and then request any owner route or server action (including workspace creation)
**Then** the server redirects/refuses to the Verification pending screen; only resend, logout, and the verification link work.

## AC-AUTH-010 — Login rate limit
Covers: C-006 (A-6)

**Given** 5 failed login attempts for an email (or from an IP) within 15 minutes
**When** another attempt is made, even with the correct password
**Then** it is refused with "too many attempts, try again later" and no account information.

## AC-AUTH-011 — Signed-in Owner cannot reach auth pages
Covers: —

**Given** a signed-in verified Owner
**When** they open Register or Login
**Then** they are redirected to their post-login destination.

## AC-AUTH-012 — Logout ends the current session
Covers: —

**Given** a signed-in Owner with sessions on two devices
**When** they log out on one device
**Then** that session is invalid and the other device stays signed in.

## User status

## AC-AUTH-013 — Non-active Owner is blocked at login
Covers: BR-AUTH-005

**Given** an Owner with status `SUSPENDED` or `DISABLED`
**When** they log in with correct credentials
**Then** no owner data is shown and they see the "account unavailable" page.

## AC-AUTH-014 — Status is enforced on every owner request
Covers: BR-AUTH-005, C-004

**Given** an Owner whose status changes to `SUSPENDED` while a session exists that was not revoked
**When** that session requests any owner page, server action, or route handler
**Then** the request is refused with the "account unavailable" outcome.

## AC-AUTH-015 — Operator status change revokes sessions
Covers: BR-AUTH-005

**Given** a signed-in `ACTIVE` Owner
**When** the operator script sets the status to `SUSPENDED` or `DISABLED`
**Then** all of that Owner's sessions are revoked; setting it back to `ACTIVE` lets them log in again.

## Password recovery & change

## AC-AUTH-016 — Forgot password never reveals accounts
Covers: C-006 (A-5, A-6)

**Given** any email address, registered or not
**When** forgot password is submitted
**Then** the same confirmation message is shown; a reset link is emailed only if an account exists; requests beyond 3 / hour per email are silently not sent.

## AC-AUTH-017 — Reset password revokes all sessions
Covers: C-006 (A-3, A-4)

**Given** a valid reset link (< 1 h, unused) and an Owner signed in on another device
**When** a valid new password is submitted
**Then** the password changes, the link cannot be reused, all sessions are revoked, and the Owner must log in with the new password.

## AC-AUTH-018 — Invalid reset link
Covers: (A-3)

**Given** a reset link that is expired, used, superseded, or tampered
**When** it is opened or submitted
**Then** the password is unchanged and the Owner can request a new link.

## AC-AUTH-019 — Change password requires the current password
Covers: C-004, BR-AUTH-008 (A-1, A-4)

**Given** a signed-in Owner with another active session
**When** they change password with the correct current password and a valid new one
**Then** the password changes, the current session remains, and other sessions are revoked; with a wrong current password nothing changes and a field error is shown.

## Profile

## AC-AUTH-020 — Update display name
Covers: BR-AUTH-002

**Given** a signed-in verified Owner
**When** they save a new non-empty display name
**Then** the name is updated on the single user record and shown throughout the app; email is displayed read-only and cannot be changed by any request.

## Google sign-in

## AC-AUTH-024 — Google sign-up creates a verified account
Covers: BR-AUTH-002, BR-AUTH-003, BR-AUTH-004, BR-AUTH-006

**Given** no account exists for the Google account's verified email
**When** the visitor completes "Continue with Google"
**Then** exactly one user is created with `emailVerifiedAt` set, `status = ACTIVE`, name from Google, Google linked, no password; they are signed in and redirected to first-workspace creation.

## AC-AUTH-025 — Google sign-in requests identity scopes only
Covers: BR-AUTH-006, BR-SRC-001

**Given** the Google authorization request
**When** it is inspected
**Then** it requests only `openid email profile`, and no Google access token is used for any Drive or other API call.

## AC-AUTH-026 — Google links to an existing verified account
Covers: BR-AUTH-007

**Given** a verified password account for `owner@example.com`
**When** the Owner signs in with Google using that verified email
**Then** Google is linked to the same user (no new user), the password still works, and the Owner is signed in.

## AC-AUTH-027 — Linking to an unverified account removes the pre-registered password
Covers: BR-AUTH-003, BR-AUTH-007

**Given** an **unverified** password account for `owner@example.com` with an active session elsewhere
**When** the real owner of that address signs in with Google
**Then** the account becomes verified, its password no longer works, every previous session is revoked, and only the new Google session is active.

## AC-AUTH-028 — Unverified Google email is refused
Covers: BR-AUTH-006

**Given** Google reports `email_verified = false`
**When** the callback is processed
**Then** no user is created or linked, no session is created, and a generic "couldn't sign in with Google" message is shown.

## AC-AUTH-029 — Cancelled or invalid Google callback
Covers: C-006

**Given** the Owner cancels consent, or the callback has an invalid/missing OAuth state
**When** the callback returns
**Then** nothing is created or linked and the Owner is back on Login with a message.

## AC-AUTH-030 — Google-only account has no password paths
Covers: BR-AUTH-008 (A-5)

**Given** an account with only Google linked
**When** its email is used for password login or forgot password, and the Owner opens Profile
**Then** password login shows the generic incorrect-credentials error, forgot password shows the usual confirmation but sends no email, and Profile shows no change-password section.

## AC-AUTH-031 — Non-active Owner is blocked via Google too
Covers: BR-AUTH-005

**Given** a `SUSPENDED` or `DISABLED` Owner with Google linked
**When** they complete Google sign-in
**Then** no session grants owner access and the "account unavailable" page is shown.

## Security & quality

## AC-AUTH-021 — Secrets never logged
Covers: C-103

**Given** any auth flow, including provider failures and Google callbacks
**When** logs are inspected
**Then** they contain no passwords, session tokens, cookies, verification/reset URLs, OAuth codes, or Google tokens.

## AC-AUTH-022 — Email provider failure is recoverable
Covers: C-007

**Given** Resend fails when sending a verification or reset email
**When** the Owner registers, resends, or requests a reset
**Then** the account state or request is saved, and the failure is logged without the link.
**And** register and forgot password still show their generic screen: the email is sent in the background, and the screen must not reveal whether an account exists (A-5). The Verification pending screen offers resend.
**And** resend waits for the provider and shows a retryable message when the send fails.

*Amended 2026-09-27 (Owner, SPEC GAP-4):* the retryable message appears on resend only.

## AC-AUTH-023 — Accessible auth forms
Covers: C-008

**Given** any auth screen
**When** used with keyboard only and a screen reader
**Then** every field has a label, errors are announced and linked to their field, and focus moves to the first error on submit.
