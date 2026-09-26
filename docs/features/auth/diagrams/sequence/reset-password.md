# Reset password

```mermaid
sequenceDiagram
    actor Owner
    participant UI as Reset password UI
    participant App as App action
    participant Policy as Auth policy
    participant BA as Better Auth adapter
    participant DB as Neon and Drizzle

    Owner->>UI: Submit reset token and new password
    UI->>App: Reset password
    App->>Policy: Validate password and token outcome
    Policy-->>App: Valid or invalid-link outcome
    App->>BA: Consume token and update password
    BA->>DB: Save credential and revoke all sessions
    App-->>UI: Reset complete; require login again
```
