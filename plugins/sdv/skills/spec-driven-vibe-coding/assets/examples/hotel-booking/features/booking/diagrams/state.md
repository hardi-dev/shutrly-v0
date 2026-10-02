# State — Booking

```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> CONFIRMED
    PENDING --> FAILED
    CONFIRMED --> CANCELLED
    FAILED --> [*]
    CANCELLED --> [*]
```
