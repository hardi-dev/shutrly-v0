# ADR-002: Better Auth owns identity; single user table

Status: Accepted
Date: 2026-09-25

## Context
The domain draft had `User.passwordHash`, which conflicts with using Better Auth as the credential authority.

## Decision
Map the conceptual `User` to Better Auth's single `user` table, extended with domain `status` and `emailVerifiedAt`. Better Auth owns credentials, sessions, verification, and reset. Domain tables reference the user by its actual Better Auth ID type (opaque `AuthUserId`, not assumed UUID). No second domain user table. No `WorkspaceMember` in MVP; if staff access arrives, choose between Better Auth Organizations and a domain membership model after roles are specified.

## Alternatives Considered
- Separate domain `owner` table linked 1:1 to auth user — duplication and drift.

## Consequences
### Positive
- No credential handling in domain code.
### Negative / Trade-offs
- Domain extensions must follow Better Auth's schema extension mechanism and upgrade path.

## Related
- Business rules: BR-AUTH-001..008
- Feature: F-01
