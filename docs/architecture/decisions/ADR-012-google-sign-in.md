# ADR-012: Google sign-in via Better Auth, identity scopes only

Status: Accepted (amended 2026-09-27)
Date: 2026-09-25

## Context
The Owner wants Google sign-in alongside email + password (F-01). ADR-005 and BR-SRC-001 exclude Owner Google OAuth **for Drive access** to avoid Google app verification of restricted scopes and token storage. Sign-in needs only identity.

## Decision
- Use Better Auth's Google social provider with scopes `openid email profile` only. Never request Drive or other Google API scopes; do not store or use Google access tokens for anything beyond sign-in.
- Enable Better Auth account linking, but keep Google **out of** `trustedProviders`. Better Auth then always requires Google's `email_verified = true` before it links by email, and refuses to create an account from an unverified Google email (BR-AUTH-006). *Amended 2026-09-27:* the original wording said "Google as a trusted provider". In Better Auth 1.7.6, a trusted provider **skips** the `email_verified` check, so the stricter setting was chosen; the outcome is unchanged.
- Pre-account-takeover guard (BR-AUTH-007): when linking to an **unverified** local account, mark it verified, delete its credential (password) account and revoke its sessions in one transaction, before the link.
  - It runs in Google's `mapProfileToUser`, which Better Auth 1.7.6 calls with the ID-token claims before it looks up the local user.
  - It is covered by integration tests against Better Auth's real callback endpoint.
- No Google tokens are persisted: an account-create hook nulls them, and `updateAccountOnSignIn` is false.
- OAuth client ID/secret are server secrets; callback URL per environment (production + shared non-production/previews).
- ADR-005 remains unchanged: Drive stays public-link + API key.

## Alternatives Considered
- Refuse sign-in when the email exists (no linking) — safer by default but confusing for Owners; rejected by Owner.
- Link from profile only — extra UI; rejected by Owner.
- Owner OAuth with Drive scopes now — reopens ADR-005; out of scope.

## Consequences
### Positive
- Faster onboarding; Google-verified emails skip the verification step.
- Identity-only scopes avoid Google restricted-scope verification.
### Negative / Trade-offs
- Needs a Google OAuth consent screen (app name, logo, privacy policy URL) before production.
- Previews on changing URLs need allowed redirect URIs; use a stable preview callback host or test Google sign-in only on fixed environments.
- The linking guard is custom logic on top of Better Auth and must be re-verified on Better Auth upgrades.

## Related
- Business rules: BR-AUTH-002, BR-AUTH-003, BR-AUTH-006..008, BR-SRC-001
- ADR-002, ADR-005
- Feature: F-01
