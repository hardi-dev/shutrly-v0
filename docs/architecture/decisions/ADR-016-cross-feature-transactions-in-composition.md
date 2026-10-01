# ADR-016: Cross-feature writes share one transaction, opened in composition

Status: Accepted (Owner approved the F-03 plan, 2026-10-01: "commit the design and plan docs and /sdv:build-feature message-templates 1").
Date: 2026-10-01

## Context

F-03 (message templates) must create a workspace's five default templates **in the same transaction** as the workspace (BR-MSG-005, AC-MSG-001: "If creating the workspace fails, no templates exist either"). The two writes belong to different features:

- the `workspace` row is owned by `features/workspace` (its port and use cases);
- the `message_template` rows are owned by `features/communications` (F-03).

Two rules constrain the design:

- a feature never imports another feature (coding rules › Import boundaries);
- `composition/` is the only place that wires concrete adapters to ports, and it holds no business rules.

Until now every repository was built over the request's `Db` (ADR-009), so it had no way to join a transaction another repository started.

## Decision

1. **The transaction is opened in `composition/`.** A composition scope such as `withWorkspaceCreationScope` calls `db.transaction(tx => …)` and builds *both* repositories over `tx`. Then it runs the workspace use case and the communications use case in order. Neither feature knows about the other or about the transaction.
2. **Repositories accept a `DbExecutor`**, the common Drizzle base type of `Db` and a transaction (`PgDatabase<NeonQueryResultHKT, typeof schema, …>` in `adapters/db/client/client.types.ts`). A repository never opens or commits a transaction itself.
3. **Order and failure:**
   - An expected failure (e.g. `WorkspaceError("DUPLICATE_NAME")`) or an unexpected one throws out of the callback, and Drizzle rolls back every write.
   - A use case never catches another feature's failure.
4. **Use sparingly.** A cross-feature transaction exists only where a business rule requires atomicity across features. Record the rule ID beside the scope. Everything else stays in its feature's single-repository scope.

## Consequences

- F-02's `createOwnerFirstWorkspace` / `createOwnerWorkspace` switch to the new scope. Their use cases are unchanged.
- The Neon serverless `Pool` supports interactive transactions over WebSockets (ADR-009), so the Worker runtime needs no change.
- Integration tests cover the rollback (a failing second write leaves no workspace and no templates) against the shared test database.
- Later features that must write atomically across features (e.g. F-14 invoice creation touching projects) reuse this pattern instead of inventing one.

## Alternatives considered

- **Seeding from the workspace use case through a `WorkspaceCreatedHook` port.** Rejected: the workspace feature would own a port whose only purpose is another feature's rule, and it would still need the shared transaction.
- **A database trigger on `workspace` insert.** Rejected: the default copy would live in SQL, outside the domain and its tests, and every copy change would need a migration.
- **Seeding lazily on first read.** Rejected: it breaks AC-MSG-001, and it turns a read into a write.
