# Project Constitution

Version: 1.2 · Adopted: 2026-09-25 · Amended: 2026-10-05 (C-103, see the amendment log)

Non-negotiable principles. They outrank every other artifact. Changing one requires an explicit Owner decision recorded here with a version bump.

## General

### C-001 — Product intent is authoritative
Implementation preserves approved product intent, business rules, feature behavior, and acceptance criteria.

### C-002 — No invented requirements
When requirements are missing, ambiguous, or contradictory, report `SPEC GAP` (or `CONFLICT`). Do not silently invent business behavior.

### C-003 — Domain integrity
Business rules (`BR-*`) are enforced in the domain/application layer and, where expressible, by database constraints — never only in the UI.

### C-004 — Server authority
Security- and integrity-sensitive operations (authorization, prices, totals, limits, statuses, tokens, passwords) are decided server-side. Client-provided workspace IDs, ownership, prices, totals, limits, or statuses are never trusted.

### C-005 — Data consistency
Use transactions, constraints, row locks, and idempotency where concurrent or partial writes could break an invariant — at minimum: project snapshot, selection changes/submission, add-on approval/cancellation with invoice, invoice recalculation, payment record/void, sync.

### C-006 — Security by default
Validate all untrusted input, apply least privilege, keep secrets server-side, and never bypass a control for convenience.

### C-007 — Explicit user-facing states
Handle loading, empty, validation error, domain/server error, success, disabled, and retry states where relevant.

### C-008 — Accessibility
Semantic, keyboard-accessible UI with labels and feedback; WCAG 2.1 AA as the target.

### C-009 — Verify critical behavior
Every critical business rule and acceptance criterion has an automated test or documented verification.

### C-010 — No silent scope expansion
No unrelated features, dependencies, abstractions, or refactors without justification and approval.

### C-011 — Source-of-truth alignment
Behavior changes update the owning artifact first, then downstream artifacts and code.

### C-012 — Report deviations
Drift from approved spec, diagrams, architecture, or Pencil design is reported, never silently accepted.

## Project-specific

### C-101 — Tenant isolation is absolute
No read or write may cross workspaces. Every owner request verifies workspace ownership; every tenant row carries `workspace_id` (BR-WS-002/003, ADR-003).

### C-102 — History is immutable
Project snapshots (items, booking fields) and issued invoice lines/discounts never change because a template changed. Corrections are explicit, audited actions — not silent edits (BR-PRJ-001, BR-INV-003, BR-CAT-003).

### C-103 — Client secrets stay secret
Gallery passwords are stored encrypted with a server-side key, next to a hash used for verification; only the workspace Owner can see them, and only server-side code decrypts them (ADR-017). Client access tokens, gallery passwords, WhatsApp links containing them, Drive folder links and folder IDs, and API keys are never logged, never placed in analytics, never sent to a browser (folder links and IDs, API keys) and never publicly cached (ADR-004, ADR-005, ADR-017). A photo's file ID, and the Google image URL built from it, are not secrets: the file is already link-shared on Drive (BR-SRC-004), so a photo the reader may see can load from Google's image host (ADR-019).

### C-104 — Client access is token-scoped
Client endpoints authorize only through the project token (+ current gallery password), and only ever return data belonging to that project (BR-ACC-*).

### C-105 — Money is exact
Money is decimal, computed server-side, currency-consistent (ADR-007).

### C-106 — The platform never sends on the Owner's behalf
In MVP the system only builds messages; the Owner sends them (BR-MSG-001).

## Amendment log

| Version | Date | Change | Owner decision |
|---|---|---|---|
| 1.2 | 2026-10-05 | C-103: Drive *folder* links and IDs stay server-side; photo file IDs and the Google image URLs built from them may reach a browser, so images load straight from Google on the free tier (ADR-019). | Free-tier decision: the Owner accepted ADR-018 and ADR-019 and the trade-off that a client can keep an image URL after the gallery expires or its password changes. |
| 1.1 | 2026-10-04 | C-103: gallery passwords are stored encrypted (plus a hash) instead of hash-only, so the Owner can see them and messages can include them without re-entry (ADR-017). | F-09 design review: the Owner can't remember a password per project; store it encrypted, generate an easy-to-type one, fill it into the WhatsApp message automatically. |
