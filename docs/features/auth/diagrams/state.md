# F-01 Auth — State Model

## Identity lifecycle

```mermaid
stateDiagram-v2
    [*] --> ActiveUnverified: Password registration
    [*] --> ActiveVerifiedGoogle: Google sign-up with verified email

    ActiveUnverified --> ActiveVerifiedPassword: Valid verification link
    ActiveUnverified --> ActiveVerifiedGoogle: Verified Google links
    ActiveUnverified --> ActiveUnverified: Resend verification

    ActiveVerifiedPassword --> ActiveVerifiedPassword: Change password / update name
    ActiveVerifiedPassword --> ActiveVerifiedPassword: Link verified Google
    ActiveVerifiedPassword --> ActiveSuspended: Operator status change
    ActiveVerifiedPassword --> ActiveDisabled: Operator status change

    ActiveVerifiedGoogle --> ActiveVerifiedGoogle: Update name
    ActiveVerifiedGoogle --> ActiveSuspended: Operator status change
    ActiveVerifiedGoogle --> ActiveDisabled: Operator status change

    ActiveSuspended --> ActiveVerifiedPassword: Operator reactivates password account
    ActiveSuspended --> ActiveVerifiedGoogle: Operator reactivates Google-only account
    ActiveDisabled --> ActiveVerifiedPassword: Operator reactivates password account
    ActiveDisabled --> ActiveVerifiedGoogle: Operator reactivates Google-only account
```

`ActiveVerifiedPassword` and `ActiveVerifiedGoogle` are both `status = ACTIVE` and `emailVerifiedAt != null`; the difference is whether a password account exists. Reset password keeps the password-backed identity in the same state and revokes all sessions. Linking Google to an unverified password registration removes the password account as part of the transition.

## Request access state

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    Unauthenticated --> AuthenticatedRestricted: Valid login, email unverified
    Unauthenticated --> AuthenticatedOwner: Valid login, verified + ACTIVE
    Unauthenticated --> AccountUnavailable: Valid credentials, SUSPENDED/DISABLED
    Unauthenticated --> Unauthenticated: Invalid credentials / cancelled provider

    AuthenticatedRestricted --> AuthenticatedOwner: Valid verification link
    AuthenticatedRestricted --> Unauthenticated: Logout
    AuthenticatedRestricted --> AccountUnavailable: Status becomes non-active

    AuthenticatedOwner --> Unauthenticated: Logout current session
    AuthenticatedOwner --> Unauthenticated: Reset password revokes all sessions
    AuthenticatedOwner --> AccountUnavailable: Status becomes non-active

    AccountUnavailable --> Unauthenticated: Session ends or is revoked
    AccountUnavailable --> AuthenticatedOwner: Operator reactivates + new valid login
```

Every owner page, server action, and route handler re-checks the current status and verification gate. Middleware may provide an early redirect but cannot replace this transition guard.
