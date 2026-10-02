# Sequence — [Feature]

```mermaid
sequenceDiagram
    actor User
    participant UI
    participant Service
    participant Repository
    participant DB

    User->>UI: Action
    UI->>Service: Request
    Service->>Repository: Operation
    Repository->>DB: Query/Command
    DB-->>Repository: Result
    Repository-->>Service: Result
    Service-->>UI: Response
    UI-->>User: Feedback
```
