# ADR-003: Workspace isolation via workspace_id on every tenant row + composite FKs

Status: Accepted
Date: 2026-09-25

## Context
Several entities reach their workspace only indirectly (through parent rows). Cross-workspace references would leak data between brands.

## Decision
- Persist `workspace_id` on every tenant-owned table, including children (`service_item`, `project_item`, `gallery_source`, `photo_selection`, `invoice_item`, `payment`, …).
- Declare unique `(workspace_id, id)` on tenant parents; child references use composite FKs `(workspace_id, x_id) → x(workspace_id, id)`.
- Relations that must share a project (add-on → selection group, selection → photo) are verified in the transaction and backed by composite project keys or triggers where possible.
- Application code still authorizes every request; DB constraints are defense in depth.
- No Postgres RLS in MVP (single Owner per workspace; app-level scoping + constraints suffice). Revisit with staff access.

## Alternatives Considered
- Scoping by parent joins only — easy to forget, no DB guarantee.
- Postgres RLS — extra complexity with pooled serverless connections; deferred.

## Consequences
### Positive
- Cross-tenant references are impossible at the DB level.
### Negative / Trade-offs
- Wider keys and redundant columns; every insert must carry `workspace_id`.

## Related
- Constitution: C-004, C-006
- Business rules: BR-WS-002, BR-WS-003
