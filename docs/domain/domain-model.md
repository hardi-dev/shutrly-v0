# Domain Model

Status: ACCEPTED (migrated from `_source/` on 2026-09-25). Business-oriented; persistence details live in [architecture/overview.md](../architecture/overview.md). Full attribute lists: `_source/photographer_management_platform_blueprint.md` §3 (reference only).

## Concepts

**Identity & tenancy**
- **User (Owner)** — authenticated internal account; owns workspaces.
- **Workspace** — one brand/business; the tenant boundary. Holds branding, invoice prefix, default currency.
- **MessageTemplate** — reusable, typed WhatsApp message with `{{variables}}`.
- **WorkspaceSourceConfig** — provider configuration (MVP: Google Drive public links).

**Catalog (templates)**
- **ServiceCategory** — grouping of services (Wedding, Family…).
- **ServiceItemDefinition** — reusable *what* a package benefit is (Edited Photos, Person), with value type, unit, and whether it creates a selection entitlement.
- **Service** — a sellable package with base price.
- **ServiceItem** — *how much* of a definition a service includes (`{value}` or `{min,max}`).
- **ServiceFieldDefinition** — extra booking input a service needs (Campus Name, Graduation Date).

**Engagement**
- **Client** — customer record; never logs in.
- **Project** — one engagement for one client; operational aggregate; owns the client access token and agreed price.
- **ProjectItem** — frozen snapshot of an agreed package benefit.
- **ProjectFieldValue** — frozen booking input with field metadata snapshot.
- **Session** — a shoot within a project.
- **TeamMember** — freelancer resource; **ProjectAssignment** — their role/fee on a project.

**Gallery & selection**
- **Gallery** — client-facing access boundary for a project's photos; password-protected; also the final delivery point.
- **GallerySource** — a concrete external folder feeding a gallery.
- **Photo** — metadata for one external file with role `PROOF` | `EDITED` | `PRINT`.
- **SelectionGroup** — an entitlement bucket ("Edited Photos 12 / 25") with base + extra limit and its own lifecycle.
- **PhotoSelection** — a client's choice of a proof photo in a group, with quantity.
- **ProjectAddOn** — purchased extra (entitlement and/or billing).

**Billing**
- **Invoice** — billing document for a project; totals and derived status.
- **InvoiceItem** — immutable line snapshot.
- **Payment** — manually recorded money received; voidable.

## Relationships

```mermaid
classDiagram
    User "1" --> "0..*" Workspace : owns
    Workspace "1" *-- "0..*" MessageTemplate
    Workspace "1" *-- "0..*" WorkspaceSourceConfig
    Workspace "1" *-- "0..*" ServiceItemDefinition
    Workspace "1" *-- "0..*" ServiceCategory
    Workspace "1" *-- "0..*" Client
    Workspace "1" *-- "0..*" TeamMember
    ServiceCategory "1" --> "0..*" Service
    Service "1" *-- "0..*" ServiceItem
    ServiceItemDefinition "1" --> "0..*" ServiceItem
    Service "1" *-- "0..*" ServiceFieldDefinition
    Client "1" --> "0..*" Project
    Service "1" ..> "0..*" Project : template origin
    Project "1" *-- "0..*" ProjectItem
    Project "1" *-- "0..*" ProjectFieldValue
    Project "1" *-- "0..*" Session
    Project "1" *-- "0..*" ProjectAssignment
    TeamMember "1" --> "0..*" ProjectAssignment
    Project "1" *-- "0..1" Gallery
    Gallery "1" *-- "0..*" GallerySource
    WorkspaceSourceConfig "1" --> "0..*" GallerySource
    GallerySource "1" --> "0..*" Photo
    Gallery "1" *-- "0..*" Photo
    Session "0..1" --> "0..*" Photo
    Project "1" *-- "0..*" SelectionGroup
    ProjectItem "0..1" --> "0..*" SelectionGroup : source
    SelectionGroup "1" *-- "0..*" PhotoSelection
    Photo "1" --> "0..*" PhotoSelection
    Project "1" *-- "0..*" ProjectAddOn
    SelectionGroup "0..1" --> "0..*" ProjectAddOn : target
    Project "1" *-- "0..*" Invoice
    Invoice "1" *-- "0..*" InvoiceItem
    ProjectAddOn "0..1" --> "0..*" InvoiceItem
    Invoice "1" *-- "0..*" Payment
```

`0..*` covers draft/onboarding states; minimums apply at transitions (publish gallery ≥1 source — BR-GAL-004; issue invoice ≥1 line — BR-INV-003).

## Lifecycles

```mermaid
stateDiagram-v2
    state Project {
      [*] --> DRAFT
      DRAFT --> BOOKED
      BOOKED --> SHOOTING
      SHOOTING --> POST_PROCESSING
      POST_PROCESSING --> DELIVERED : publish final delivery
      DELIVERED --> COMPLETED : Owner
      DRAFT --> CANCELLED
      BOOKED --> CANCELLED
      SHOOTING --> CANCELLED : with reason
    }
```

```mermaid
stateDiagram-v2
    state SelectionGroup {
      [*] --> OPEN
      OPEN --> SUBMITTED : client submits
      SUBMITTED --> LOCKED : Owner
      OPEN --> LOCKED : Owner closes
    }
    state Gallery {
      [*] --> G_DRAFT
      G_DRAFT --> PUBLISHED
      PUBLISHED --> EXPIRED
      PUBLISHED --> ARCHIVED
      EXPIRED --> ARCHIVED
    }
```

```mermaid
stateDiagram-v2
    state Invoice {
      [*] --> DRAFT
      DRAFT --> UNPAID : issue
      UNPAID --> PARTIALLY_PAID
      UNPAID --> PAID
      PARTIALLY_PAID --> PAID
      PARTIALLY_PAID --> UNPAID : void
      PAID --> PARTIALLY_PAID : void
      PAID --> UNPAID : void
      DRAFT --> CANCELLED
      UNPAID --> CANCELLED
    }
    state ProjectAddOn {
      [*] --> A_DRAFT
      A_DRAFT --> APPROVED
      A_DRAFT --> A_CANCELLED
      APPROVED --> A_CANCELLED : if safe (BR-ADD-005)
    }
```

## Aggregate responsibilities
- **Workspace** — tenant boundary and brand context.
- **Service** (+ items, fields) — reusable configuration, not history.
- **Project** — deal snapshot, token, status, sessions, assignments, add-ons.
- **Gallery** — access control for client media; final delivery publication.
- **SelectionGroup** — entitlement and selection lifecycle; **PhotoSelection** — individual choices.
- **Invoice** — totals and derived status; **Payment** — money received.

## Notes
Better Auth, Drizzle, Neon, Next.js, Cloudflare, and Google Drive are not domain concepts.
