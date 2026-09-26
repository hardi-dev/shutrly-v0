# ADR-009: Neon serverless driver (WebSocket Pool) for database access

Status: Accepted
Date: 2026-09-25

## Context
The app runs on Cloudflare Workers ([ADR-008](ADR-008-cloudflare-runtime.md)) against Neon PostgreSQL through Drizzle ([ADR-001](ADR-001-drizzle-orm.md)). Selection changes/submits (BR-SEL-006), add-on approval, invoice recalculation, and payment record/void need **interactive transactions with `SELECT … FOR UPDATE`**. Neon's HTTP query mode cannot hold a transaction across round trips. Workers cannot reuse sockets across requests.

## Decision
- Use `@neondatabase/serverless` **`Pool` (WebSocket)** with `drizzle-orm/neon-serverless` for all application database access.
- Create the `Pool` **per request** and close it with `ctx.waitUntil(pool.end())`; never hold a module-level pool.
- App runtime uses Neon's **pooled** connection string; Drizzle migrations use the **direct** (unpooled) connection string.
- Neon's HTTP mode (`neon-http`) is not used in MVP. It may be added later only for single-statement reads after measurement; never where a transaction or row lock is needed.
- Two Neon databases: **production** and a single shared **non-production** branch used by local dev, integration tests, and all preview deploys. No per-developer / per-CI / per-preview branches.
- Because the non-production database is shared: tests create their own workspace/user with unique IDs and assert only on that data (no table truncation); CI integration runs are serialized; schema migrations are applied only from `main` via CI, never by a preview deploy.

## Alternatives Considered
- Cloudflare Hyperdrive + `pg`: warm pooled connections and a standard driver, but adds Cloudflare config and default query caching that must be disabled. Owner chose to stay on Neon's own driver.
- Neon HTTP only: no interactive transactions; fails BR-SEL-006 and payment flows.

## Consequences
### Positive
- One Neon-native driver; full transaction + row-lock support.
- One non-production database is simple to operate and cheap.
### Negative / Trade-offs
- WebSocket + Postgres handshake on every request adds latency; keep queries per request low and revisit (HTTP reads or Hyperdrive) if p95 suffers.
- Integration tests need network access to Neon; a local container would require Neon's WebSocket proxy.
- Shared non-production data: a preview whose code expects an unmerged migration can break or be broken by others; migration-bearing branches must be merged (or previewed locally) before relying on their preview. Test leftovers accumulate; add a periodic cleanup of test workspaces.
- Revisit per-branch Neon databases if collisions become frequent.
- Per-request pool lifecycle must be centralized in `adapters/db` so it can't leak.

## Related
- Constitution: C-005
- Business rules: BR-SEL-006, BR-INV-*, BR-PAY-*
- Supersedes the driver choice left open in ADR-008.
