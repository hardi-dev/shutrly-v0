# ADR-001: Drizzle ORM for schema, queries, and migrations

Status: Accepted
Date: 2026-09-25

## Context
The domain relies on composite foreign keys, check constraints, partial unique indexes, JSONB validation, and explicit transactions with row locks. Better Auth needs a database adapter against the same database.

## Decision
Use Drizzle ORM for PostgreSQL schema, indexes, checks, composite FKs, queries, transactions, and migrations. Better Auth uses its Drizzle adapter on the same Neon database. Review generated auth schema before the first application migration.

## Alternatives Considered
- Prisma — weaker support for composite FKs/partial indexes and raw transaction control.
- Raw SQL / Kysely — more control, more boilerplate, no shared schema with Better Auth.

## Consequences
### Positive
- SQL-close schema expresses tenant-isolation constraints directly.
- One schema source for auth and domain tables.
### Negative / Trade-offs
- Some constraints (project-path checks) still need custom SQL/triggers in migrations.

## Related
- Constitution: C-003, C-005
- Business rules: BR-WS-002
