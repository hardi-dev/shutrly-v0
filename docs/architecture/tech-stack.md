# Technology Stack

Status: ACCEPTED (confirmed by Owner 2026-09-25).

## Fixed Constraints (supplied by Owner — do not reopen)
- **Next.js** — application framework (pages, server actions, route handlers).
- **Better Auth** — authentication authority ([ADR-002](decisions/ADR-002-better-auth-owns-identity.md)).
- **Drizzle ORM** — schema, queries, transactions, migrations ([ADR-001](decisions/ADR-001-drizzle-orm.md)).
- **Neon PostgreSQL** — system of record.
- **Cloudflare** — DNS, TLS, CDN, WAF/rate limiting, deployment/runtime.
- **Google Drive** (public folder links, API key) — first photo source ([ADR-005](decisions/ADR-005-google-drive-public-links.md)).
- **WhatsApp deep links** — client communication ([ADR-006](decisions/ADR-006-whatsapp-deep-links.md)).
- **Pencil** — visual design source of truth.

## Application
- Framework: Next.js (App Router)
- Language: TypeScript, `strict`

## UI
- Styling: Tailwind CSS v4, tokens as CSS variables mirrored from Pencil ([ADR-010](decisions/ADR-010-tailwind-react-aria.md))
- Components: React Aria Components, wrapped in `src/ui/primitives/*` and `src/ui/patterns/*` ([ADR-010](decisions/ADR-010-tailwind-react-aria.md))
- Design source: Pencil

## Backend
- Runtime / application layer: Next.js server actions + route handlers → composition root → application services in `src/features/*/application`
- Database: Neon PostgreSQL via Drizzle
- DB driver: `@neondatabase/serverless` WebSocket `Pool`, per request ([ADR-009](decisions/ADR-009-neon-serverless-driver.md))
- Authentication: Better Auth with Drizzle adapter; email + password and Google sign-in ([ADR-012](decisions/ADR-012-google-sign-in.md))
- Storage: none owned; photos stay in Google Drive
- Transactional email (auth only): Resend ([ADR-011](decisions/ADR-011-resend-transactional-email.md))
- Hosting runtime: Cloudflare Workers via OpenNext adapter (`@opennextjs/cloudflare`) ([ADR-008](decisions/ADR-008-cloudflare-runtime.md))

## Validation
- Zod schemas at every trust boundary (forms, server actions, route handlers, provider responses, JSONB values)
- Forms: React Hook Form + `@hookform/resolvers/zod`, sharing the same Zod schema the server action re-validates with

## Testing
- Unit: Vitest
- Integration: Vitest against the single shared non-production Neon database ([ADR-009](decisions/ADR-009-neon-serverless-driver.md))
- E2E: Playwright

## Deployment
- Cloudflare; preview deployment per git branch, all previews share the non-production Neon database
- Two Neon databases only: **production** and one shared **non-production** (dev, CI, previews)
- Migrations run from `main` via CI only; preview deploys never migrate the shared database
  - **Interim (Owner 2026-09-26, until CI exists):** the Owner runs `pnpm db:migrate` by hand from a clean, up-to-date `main` checkout. Never from a feature branch.

## Architecture Principles
- Domain logic is framework-free and unit-testable.
- Server is the only authority for integrity/security rules.
- Workspace isolation is enforced in both queries and schema ([ADR-003](decisions/ADR-003-workspace-isolation.md)).
- Provider integrations sit behind interfaces.
