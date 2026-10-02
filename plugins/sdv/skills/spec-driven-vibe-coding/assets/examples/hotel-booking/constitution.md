# Project Constitution

Version: 1.0

## C-001 — Product Intent Is Authoritative
Implementation must preserve approved product intent, domain rules, feature behavior, and acceptance criteria.

## C-002 — No Invented Requirements
When requirements are materially missing, ambiguous, or contradictory, report `SPEC GAP`. Do not silently invent business behavior.

## C-003 — Domain Integrity
Critical business rules must be enforced at the authoritative layer, not only in the UI.

## C-004 — Server Authority
Security- and integrity-sensitive operations must be validated server-side.

## C-005 — Data Consistency
Use appropriate transactions, constraints, locking, idempotency, or concurrency controls when inconsistent state is possible.

## C-006 — Security by Default
Validate untrusted input, apply least privilege, protect secrets, and do not bypass controls for convenience.

## C-007 — Explicit User-Facing States
Handle relevant loading, empty, validation error, domain/server error, success, disabled, and retry states.

## C-008 — Accessibility
Use semantic, keyboard-accessible interfaces with appropriate labels and feedback.

## C-009 — Verify Critical Behavior
Critical business rules and acceptance criteria must be testable/verifiable.

## C-010 — No Silent Scope Expansion
Do not add unrelated features, dependencies, abstractions, or refactors without justification/approval.

## C-011 — Preserve Source-of-Truth Alignment
When behavior changes, update the owning artifact and affected downstream artifacts.

## C-012 — Report Deviations
Do not silently accept drift from approved spec, UML, architecture, or design.
