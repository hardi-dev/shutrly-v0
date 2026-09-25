# Architecture Overview

Status: ACCEPTED (migrated from blueprint §8–§10 on 2026-09-25)

## Context

```mermaid
flowchart TB
    Browser[Owner browser / Client browser]
    Edge[Cloudflare: DNS, TLS, CDN, WAF, rate limits]
    Next[Next.js app]
    Auth[Better Auth]
    App[Application services + domain policies]
    ORM[Drizzle]
    DB[(Neon PostgreSQL)]
    Drive[Google Drive API — public folder metadata]
    WA[wa.me deep link]

    Browser --> Edge --> Next
    Next --> Auth --> ORM
    Next --> App --> ORM --> DB
    App --> Drive
    Next -. builds link .-> WA
```

## Boundaries

```text
src/
  app/                 UI: routes, pages, layouts, server actions, route handlers (thin)
  modules/<context>/   Application: use cases, authorization, transactions, DTOs
      auth, workspace, catalog, projects, galleries, selection, billing, messaging
  domain/              Domain: entities, value objects, invariants, state transitions (no framework imports)
  infrastructure/      Adapters: better-auth, db (drizzle schema/migrations), google-drive, whatsapp, cloudflare
```

Dependency direction: `app → modules → domain`; `modules → infrastructure` only through interfaces defined in `modules`/`domain` (e.g. `GallerySourceProvider`). `domain` imports nothing from the other layers.

## Responsibilities
### UI (`app/`)
Rendering, form UX, client-side validation for feedback, calling server actions. No business rules, no direct DB access.
### Application (`modules/`)
Resolve session + workspace context, authorize, validate input (Zod), run use cases inside transactions, map domain errors to responses.
### Domain (`domain/`)
Invariants and transitions from [business-rules.md](../domain/business-rules.md): value shapes, limits, lifecycle guards, totals.
### Infrastructure (`infrastructure/`)
Drizzle schema + repositories, Better Auth config, Drive adapter, WhatsApp link builder, secrets access.

## Cross-Cutting Concerns

### Authentication / authorization
- Better Auth: credentials, sessions (secure, httpOnly, same-site cookies), verification, reset.
- Every owner request resolves an active workspace owned by the session user (BR-WS-003).
- Every repository query is scoped by `workspaceId` or reached through an authorized aggregate.
- Client endpoints authorize only by project token (+ gallery password session), then verify the requested gallery/invoice belongs to that project (BR-ACC-*).

### Data mapping rules (see [ADR-003](decisions/ADR-003-workspace-isolation.md), [ADR-007](decisions/ADR-007-money-and-currency.md))
- UUID for domain IDs; Better Auth user ID treated as opaque `AuthUserId`.
- `workspace_id` on every tenant-owned table including children; unique `(workspace_id, id)` on parents; composite FKs for cross-table references.
- Project-path relations (add-on → group, selection → photo) verified in the transaction; add composite project keys or triggers where FKs can't express them.
- Money: `numeric(18,3)`, never floats. JSONB for provider config, package values, booking values — always schema-validated.
- `timestamptz` for audit fields; `date`/`time` for schedule semantics.
- Enums as checked strings unless migration flexibility is irrelevant.
- Key uniqueness: `gallery.project_id`; `photo(gallery_source_id, external_file_id)`; `photo_selection(selection_group_id, photo_id)`; `invoice(workspace_id, invoice_number)`; partial unique `invoice(project_id) WHERE status='DRAFT'`; `service_item(service_id, definition_id)`; `service_field_definition(service_id, key)`; `project_field_value(project_id, field_key)`.
- Table-level constraint reference: `_source/photographer_management_platform_blueprint.md` §9.

### Consistency
Transactions (with row locks where contention exists) for: project creation snapshot, selection change/submit, add-on approve/cancel + invoice, invoice recalculation, payment record/void. Idempotency keys for sync and payment recording.

### Validation
Zod at trust boundaries; domain functions re-check invariants; DB constraints as last line of defense.

### Error handling
Expected failures are typed domain errors (e.g. `SelectionLimitExceeded`, `InvoiceNotDraft`) mapped to user-facing messages; unexpected errors are logged and shown generically.

### Logging / observability
Structured logs with workspace/project IDs; never log passwords, tokens, WhatsApp links, API keys, Drive links, or client PII.

### Security
- Rate limits: login, gallery password, public gallery access, selection submit, sync, WhatsApp link generation.
- Private gallery/invoice responses: `Cache-Control: private, no-store`; never edge-cached.
- Media served via controlled proxy/short-lived URLs; no provider credentials to the browser.
- Audit fields on sensitive owner actions (BR-AUD-001).
- Backup/restore and retention policy for Neon defined before production.
