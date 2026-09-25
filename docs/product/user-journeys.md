# User Journeys

## J-01 — Owner onboarding

**Actor:** Owner · **Entry:** no account · **Goal:** reach the dashboard of a first workspace.

```mermaid
flowchart LR
    A[Register] --> B[Verify email] --> C[Create first Workspace] --> D[Dashboard]
    R[Returning: Login] --> S[Select Workspace] --> D
```

**Alternate:** verification pending → resend; "Continue with Google" skips email verification (Google-verified email, BR-AUTH-006); verified user with zero workspaces is always redirected to onboarding.
**Success:** verified Owner with ≥1 workspace sees its dashboard.

## J-02 — Catalog setup

**Actor:** Owner · **Goal:** a sellable service with package items and booking fields.

```mermaid
flowchart LR
    A[Create item definitions] --> B[Create category] --> C[Create service + price] --> D[Attach items + values] --> E[Add booking fields]
```

## J-03 — Booking a project

**Actor:** Owner · **Goal:** a project whose agreed deal is frozen.

```mermaid
flowchart LR
    A[Create / pick client] --> B[Pick service] --> C[Fill booking fields] --> D[Snapshot items + fields] --> E[Customize deal & price] --> F[Sessions] --> G[Assign team] --> H[Confirm → BOOKED]
```

## J-04 — Proofing and selection

**Actors:** Owner, Client · **Goal:** client submits selections within entitlement.

```mermaid
flowchart LR
    A[Owner shares Drive folder publicly] --> B[Paste link, sync PROOF photos] --> C[Selection groups from items] --> D[Set password, publish gallery] --> E[Share via WhatsApp]
    E --> F[Client opens /g/token + password] --> G[Select per group within limit] --> H[Submit once]
    H --> I[Owner reviews, locks]
```

**Alternate:** limit exceeded / concurrent change → client revises; wrong password → rate-limited retry; Owner rotates password → old sessions invalidated.

## J-05 — Add-on

**Actors:** Client (asks), Owner · **Goal:** extra entitlement billed consistently.

```mermaid
flowchart LR
    A[Client requests extra] --> B[Owner creates add-on] --> C[Approve] --> D[Group extraLimit ↑] --> E[Line on draft invoice]
```

## J-06 — Final delivery and completion

**Actors:** Owner, Client · **Goal:** client downloads finished files; project closed.

```mermaid
flowchart LR
    A[Owner creates edited/print folders in Drive + uploads] --> B[Sync] --> C[Review] --> D[Publish final delivery → DELIVERED] --> E[Share] --> F[Client downloads via same link] --> G[Owner marks COMPLETED]
```

## J-07 — Billing

**Actors:** Owner, Client · **Goal:** invoice issued, paid, status correct.

```mermaid
flowchart LR
    A[Draft invoice + items + discount] --> B[Issue] --> C[Share /i/token/invoiceId] --> D[Record manual payments] --> E[Status derived: UNPAID → PARTIALLY_PAID → PAID]
```

**Alternate:** mistaken payment → void with audit, status recalculated.
