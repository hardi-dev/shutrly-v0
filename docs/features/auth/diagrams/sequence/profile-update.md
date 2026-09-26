# Display-name update

```mermaid
sequenceDiagram
    actor Owner
    participant UI as Profile UI
    participant App as App action
    participant Policy as Owner access policy
    participant BA as Better Auth adapter
    participant DB as Neon/Drizzle

    Owner->>UI: Submit display name
    UI->>App: updateDisplayName(name, currentSession)
    App->>Policy: Require verified ACTIVE Owner
    App->>BA: Update the single Better Auth user row
    BA->>DB: Save display name; leave email read-only
    App-->>UI: Show updated profile
```
