# F-01 Auth — Interaction Sequences

## Password registration and verification

```mermaid
sequenceDiagram
    actor Owner
    participant UI as Auth UI
    participant App as App action
    participant Policy as Auth application policy
    participant BA as Better Auth adapter
    participant DB as Neon/Drizzle
    participant Email as AuthEmailSender
    participant F2 as F-02 destination resolver

    Owner->>UI: Submit name, email, password
    UI->>App: registerOwner(input, requestContext)
    App->>Policy: Validate + normalize + rate-limit
    Policy-->>App: Accepted or generic/field error
    App->>BA: Create password identity
    BA->>DB: Insert single user + password account
    BA->>Email: Send verification URL
    Email-->>BA: Delivered or retryable failure
    App-->>UI: Verification pending (same outcome for existing email)
    Owner->>UI: Open verification link
    UI->>BA: Verify token
    BA->>DB: Mark email verified + consume token
    BA-->>UI: Create signed-in session
    UI->>F2: Resolve workspace destination
    F2-->>UI: First-workspace creation or workspace dashboard/selection
```

## Password login and request gate

```mermaid
sequenceDiagram
    actor Owner
    participant UI as Login UI
    participant App as App action/route
    participant Policy as Auth policy
    participant BA as Better Auth adapter
    participant DB as Neon/Drizzle
    participant F2 as F-02 destination resolver

    Owner->>UI: Submit email + password
    UI->>App: loginOwner(input, requestContext)
    App->>Policy: Validate + rate-limit
    App->>BA: Authenticate credentials
    BA->>DB: Read user/account
    DB-->>BA: Credential result
    alt Invalid credentials or rate limited
        BA-->>App: Generic public error
        App-->>UI: Incorrect credentials / too many attempts
    else Credentials valid
        App->>Policy: Check ACTIVE status + verified email
        alt Suspended or disabled
            Policy-->>App: Account unavailable
            App-->>UI: Account unavailable; no owner data
        else Unverified
            BA-->>App: Restricted session
            App-->>UI: Verification pending
        else Verified and active
            BA-->>App: Owner session
            App->>F2: Resolve workspace destination
            F2-->>App: Onboarding or dashboard/selection
            App-->>UI: Redirect
        end
    end
```

## Google linking guard

```mermaid
sequenceDiagram
    actor Owner
    participant UI as Auth UI
    participant BA as Better Auth adapter
    participant Google
    participant DB as Neon/Drizzle
    participant F2 as F-02 destination resolver

    Owner->>UI: Continue with Google
    UI->>BA: Start OAuth
    BA->>Google: Request openid email profile
    Google-->>BA: Callback + verified email + valid state
    BA->>DB: Find user by normalized email
    alt No matching user
        BA->>DB: Create verified ACTIVE user + Google account
    else Existing verified user
        BA->>DB: Link Google account to same user
    else Existing unverified user
        BA->>DB: Verify email, remove password, revoke old sessions, link Google
    end
    BA->>DB: Check status and create only the new session
    BA->>F2: Resolve workspace destination
    F2-->>UI: Redirect to onboarding or workspace destination
```

Invalid state, cancelled consent, or an unverified Google email exits before any user/account/session mutation.
