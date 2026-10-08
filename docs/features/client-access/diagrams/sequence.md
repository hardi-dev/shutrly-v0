# Sequence — Client access

Order matters in four places: signing in (limits before hash), a concurrent pick (lock then check), final delivery (one transaction across features, ADR-016) and link rotation (every session ends).

## 1. Sign in

```mermaid
sequenceDiagram
    actor Client
    participant Page as /g/{token}
    participant Limiter as RateLimiter
    participant Access as Access use case
    participant DB

    Client->>Page: GET /g/token
    Page->>Limiter: check unknown-token limit (address)
    Limiter-->>Page: ok
    Page->>Access: resolve(token)
    Access->>DB: project by token + gallery status + expiry
    DB-->>Access: PUBLISHED, passwordVersion v
    Access-->>Page: password required
    Page-->>Client: password screen
    Client->>Page: POST password
    Page->>Limiter: check and count attempt (token + address, token)
    Limiter-->>Page: ok
    Page->>Access: verify(token, password)
    Access->>DB: password hash
    Access->>Access: slow hash compare
    Access-->>Page: session bound to token + v
    Page-->>Client: Set-Cookie (http-only, 30 days), redirect to gallery
```

## 2. Two devices pick at the same time

```mermaid
sequenceDiagram
    actor A as Client device A
    actor B as Client device B
    participant Pick as Pick use case
    participant DB

    A->>Pick: pick IMG_004 (group Foto edit, usage 2 of 3)
    B->>Pick: pick IMG_005 (same group)
    Pick->>DB: BEGIN, SELECT group FOR UPDATE (A)
    Note over Pick,DB: B waits for the lock
    Pick->>DB: usage 2, +1 = 3 <= 3, insert pick, COMMIT (A)
    Pick-->>A: stored, usage 3 of 3
    Pick->>DB: BEGIN, lock acquired (B)
    Pick->>DB: usage 3, +1 = 4 > 3, ROLLBACK
    Pick-->>B: Batas pilihan tercapai, group refreshed 3 of 3
```

## 3. Publish final delivery and complete

```mermaid
sequenceDiagram
    actor Owner
    participant Action as Server action
    participant Scope as Composition scope (ADR-016)
    participant Gallery as Gallery repo
    participant Project as Project repo
    participant Audit

    Owner->>Action: Publish final delivery
    Action->>Scope: open transaction
    Scope->>Gallery: gallery PUBLISHED? finished file synced?
    Scope->>Project: status in BOOKED, SHOOTING, POST_PROCESSING?
    alt any check fails
        Scope-->>Action: refused with reason, rollback
    else all pass
        Scope->>Gallery: set finalDeliveryPublishedAt, bump contentVersion
        Scope->>Project: status = DELIVERED
        Scope-->>Action: commit
    end
    Action-->>Owner: delivered
    Owner->>Action: Mark complete (later, confirmed)
    Action->>Project: DELIVERED to COMPLETED
    Action->>Audit: actor + time
```

## 4. Rotate the link

```mermaid
sequenceDiagram
    actor Owner
    participant Action as Server action
    participant Project as Project repo
    participant Audit
    actor Client

    Owner->>Action: Ganti link, confirm warning
    Action->>Project: replace clientAccessToken (new random, unique)
    Action->>Audit: actor + time
    Action-->>Owner: new link
    Client->>Action: any request with the old token or its session
    Action-->>Client: neutral unavailable page, session cleared
```

## Notes
- Sessions carry the token and `passwordVersion`; a request is valid only if both still match, so token rotation and password rotation end sessions without a session table (a technical-design choice).
- Downloads are not diagrammed: they are a single authorised read per file (token + session, visible finished photo, then Google's host or the media route, ADR-019) with no ordering risk. The design runs *several* and *all* as sequential per-file downloads with progress (A-33, activity flow 4); whether that fits the budget is technical-design risk R-1.
